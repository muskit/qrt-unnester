import puppeteer, { Browser } from "puppeteer";

function getTweetId(urlStr) {
    const url = new URL(urlStr)
    let split = url.pathname.split("/");
    return split[3];
}

/**
 * Return HTML of tweet with quoted tweet hidden, and url of quoted tweet
 * @param {string} html The HTMl returned by Twitter's oEmbed for a Tweet.
 * @param {Browser} browser 
 * @returns { { html: string, next_quote: string } }
 */
async function createCleanEmbed(html, browser) {
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
    if (nextQRT != null)
        await page.close()

    const res = { html: qrtHTML, next_qrt: nextQRT }
    return res

}

export async function GET(req) {
    let url = req.nextUrl.searchParams.get('url')
    if (url == null) {
        return new Response("missing url parameter", { status: 400 })
    }

    const id = getTweetId(url)
    // TODO: cache return by id
    console.log(`Processing ${id}`)

    // remove URL tracking that interferes with oEmbed API call
    const urlTmp = new URL(url)
    urlTmp.search = ""
    url = urlTmp.href

    // get oEmbed for curTweetURL
    const response = await fetch(`https://publish.twitter.com/oembed?url=${url}&dnt=true&hide_thread=true`)
    const restxt = await response.text()
    let json
    try {
        // json = await response.json()
        json = JSON.parse(restxt)
    } catch (err) {
        // TODO: appropriate error handling
        console.log(`err: ${restxt}`)
        return new Response(`bad tweet URL: ${err}`, { status: 400 })
    }

    // modify embed
    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: { width: 1366, height: 768 }
    })

    const data = await createCleanEmbed(json.html, browser)

    // if (data.next_qrt != null)
    browser.close()

    data.id = id
    return Response.json(data)
}