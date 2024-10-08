import puppeteer from "puppeteer";

import "../embed_tweet.css"
import { Suspense } from "react";

// remove quoted tweet, return cleaned HTML of tweet and url of quoted tweet
async function createCleanedEmbedHTML(html) {
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
    let iframe
    try {
        iframe = await iframeHandle.contentFrame()
    } catch {
        return null
    }

    // work inside iframe
    let nextQRT = await iframe.evaluate(() => {
        document.bgColor = 'red'

        let result = document.getElementsByTagName("article")
        let nextQRT

        if (result.length >= 2) {
            const qrtElem = result.item(1)
            // get next qrt link
            nextQRT = qrtElem.getElementsByTagName('a')[0].getAttribute("href")

            // remove quoted tweet from view
            qrtElem.parentElement.remove()
        }
        return nextQRT
    })

    const qrtHTML = await iframe.content()
    browser.close()

    return { html: qrtHTML, next_quote: nextQRT }

}

async function TweetEmbed({ url }) {

    const response = await fetch(`https://publish.twitter.com/oembed?url=${url}&dnt=true&hide_thread=true`)
    let json
    try {
        json = await response.json()
    } catch {
        return <div>Invalid Tweet!</div>
    }

    const qrt = await createCleanedEmbedHTML(json.html)

    if (qrt == null) {
        return <div>Error: Could not get post!</div>
    }

    return <div dangerouslySetInnerHTML={{ __html: qrt.html }} />
}

function StreamingTimeline({ url }) {
    return (
        <Suspense>

        </Suspense>
    )
}

export default function Timeline({ url }) {

    return (
        <div>
            <h4 className="text-left text-2xl font-semibold mb-3">Timeline</h4>
            {/* <StreamingTimeline url={url} /> */}
            <div id='timeline'>
                <TweetEmbed url={url} />
            </div>
        </div>
    )
}