
import { Browser } from "puppeteer";

export function getTweetId(urlStr) {
    const url = new URL(urlStr)
    let split = url.pathname.split("/");
    return split[3];
}

export function removeURLParams(url) {
    const urlTmp = new URL(url)
    urlTmp.search = ""
    return urlTmp.href
}

/**
 * Return HTML of tweet with quoted tweet hidden, and url of quoted tweet
 * @param {string} html The HTMl returned by Twitter's oEmbed for a Tweet.
 * @param {Browser} browser 
 * @returns { { html: string, next_qrt: string } }
 */
export async function createCleanEmbed(html, browser) {
    const page = await browser.newPage()
    await page.setContent(html, {
        waitUntil: "networkidle0"
    })

    // get iframe
    let iframeHandle = await page.$("iframe[id=twitter-widget-0]")
    let iframe
    try {
        iframe = await iframeHandle.contentFrame()
    } catch {
        return null
    }

    // work inside iframe
    let nextQRT = await iframe.evaluate(() => {
        let result = document.getElementsByTagName("article")
        let nextQRT

        // FIXME: the quoted tweet isn't always found, leaving nextQRT erroneously unpopulated
        if (result.length >= 2) {
            const qrtElem = result.item(1)
            // get next qrt link
            const qrtSearch = qrtElem.getElementsByTagName('a')
            console.log(`search results: ${qrtSearch.length}`)
            nextQRT = qrtSearch[0].getAttribute("href")

            if (nextQRT == null) {
                console.log(`nextQRT wasn\'t found; leaving page intact`)
            } else {

                // remove quoted tweet from view
                qrtElem.parentElement.remove()
            }
        }
        return nextQRT
    })

    const qrtHTML = await iframe.content()
    await page.close()

    const res = { html: qrtHTML, next_qrt: nextQRT }
    return res

}

/**
 * Returns a Tweet embed with unnested URL in "body".
 * @param {string} url 
 * @param {Browser} browser 
 * @returns {{status: string, body: any}}
 */
export async function embedAndUnnest(url, browser) {
    // remove URL tracking that interferes with oEmbed API call
    url = removeURLParams(url)

    // get oEmbed for curTweetURL
    const response = await fetch(`https://publish.twitter.com/oembed?url=${url}&dnt=true&hide_thread=true`)
    if (!response.ok) {
        return { status: "error", body: `From Twitter: ${response.status} ${response.statusText}` }
    }

    const txt = await response.text()
    let json
    try {
        json = JSON.parse(txt)
    } catch (err) {
        return { status: "error", body: `couldn't parse oEmbed JSON: ${err}` }
    }

    // modify embed
    const data = await createCleanEmbed(json.html, browser)
    data.id = getTweetId(url)
    return {
        status: "success",
        body: data
    }
}
