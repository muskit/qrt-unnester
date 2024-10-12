'use server';
import puppeteer from "puppeteer";

import { embedAndUnnest, } from "@/app/(utils)/utils";
import { iteratorToStream } from "@/app/(utils)/stream";

async function* tweetStreamIterator(url) {
    let curURL = url

    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: { width: 1366, height: 768 }
    })

    try {
        while (curURL != null) {
            const data = await embedAndUnnest(curURL, browser)
            if (data.status == "success") {
                data.status = "success"
                yield JSON.stringify(data)
            }
            else {
                // error -- stop
                yield JSON.stringify(data)
                return
            }
            curURL = data.body.next_qrt
        }
    } catch (err) {
        await browser.close()
        throw err
    }
}

export async function GET(req) {
    let url = req.nextUrl.searchParams.get('url')
    if (url == null) {
        return new Response("missing url parameter", { status: 400 })
    }

    const stream = iteratorToStream(tweetStreamIterator(url))
    return new Response(stream)
}