'use server';
import puppeteer from "puppeteer";

import { embedAndUnnest, } from "@/app/(utils)/utils";
import { iteratorToStream } from "@/app/(utils)/stream";

async function* tweetUnnestIterator(url) {
    let visited = new Set()
    let curURL = url

    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: { width: 1366, height: 768 },
        executablePath: '/usr/bin/chromium-browser', // use with sys-installed Chromium
        args: ["--no-sandbox"],
    })

    try {
        while (curURL != null) {
            const data = await embedAndUnnest(curURL, browser)
            if (data.status == "success") {
                yield JSON.stringify(data)

                // recursion prevention
                // TODO: TEST
                if (visited.has(data.body.id)) {
                    yield JSON.stringify({
                        status: "error",
                        body: "unnested a post that we've already unnested!"
                    })
                    break
                }
                visited.add(data.body.id)
                curURL = data.body.next_qrt
            }
            else {
                // error -- stop
                yield JSON.stringify(data)
                break
            }
        }
    } catch (err) {
        await browser.close()
        throw err
    }

    await browser.close()
}

export async function GET(req) {
    let url = req.nextUrl.searchParams.get('url')
    if (url == null) {
        return new Response("missing url parameter", { status: 400 })
    }

    const stream = iteratorToStream(tweetUnnestIterator(url))
    return new Response(stream)
}