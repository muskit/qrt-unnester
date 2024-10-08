import puppeteer from "puppeteer";

// remove quoted tweet, return cleaned HTML of tweet and url of quoted tweet
async function createCleanedPost(html) {
    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: null
    })
    const page = await browser.newPage()
    await page.setContent(html, {
        waitUntil: "networkidle2"
    })

    // get iframe
    let iframeHandle = await page.$("iframe[id=twitter-widget-0]")
    let iframe = await iframeHandle.contentFrame()

    // search for element in iframe
    let search = await iframe.evaluate(() => {
        document.bgColor = 'red'

        let result = document.getElementsByTagName("article")

        if (result.length < 2) {
            return document.querySelector('*').outerHTML // no quote tweet found
        }

        // TODO: get quote tweet url

        result.item(1).parentElement.remove()
        return document.querySelector('*').outerHTML
    })

    await browser.close()
}

async function getEmbedQuoted(url) {

    const response = await fetch(`https://publish.twitter.com/oembed?url=${url}&dnt=true&hide_thread=true`)
    const json = await response.json()

    return createCleanedPost(json.html)
}

export default async function Timeline(props) {

    let url = props.url

    // while (url != null) {

    // }

    let html = await getEmbedQuoted(url)

    return (
        <div>
            <h4 className="text-left text-2xl font-semibold">Timeline</h4>
            <div id='timeline'>
            </div>
        </div>
    )
}