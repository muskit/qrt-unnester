'use server';
import puppeteer from "puppeteer";

import { embedAndUnnest, } from "@/app/(utils)/utils";
import { iteratorToStream } from "@/app/(utils)/stream";

async function* tweetUnnestIterator(url) {
    // TODO: detect recursion
    let curURL = url

    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: { width: 1366, height: 768 }
    })

    try {
        while (curURL != null) {
            const data = await embedAndUnnest(curURL, browser)
            if (data.status == "success") {
                yield JSON.stringify(data)
            }
            else {
                // error -- stop
                yield JSON.stringify(data)
                break
            }
            curURL = data.body.next_qrt
        }
    } catch (err) {
        await browser.close()
        throw err
    }

    browser.close()
}

export async function GET(req) {
    let url = req.nextUrl.searchParams.get('url')
    if (url == null) {
        return new Response("missing url parameter", { status: 400 })
    }

    const stream = iteratorToStream(tweetUnnestIterator(url))
    return new Response(stream)
}