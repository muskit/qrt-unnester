import puppeteer from "puppeteer";

import { getTweetId, embedAndUnnest } from "@/app/(utils)/utils"

export async function GET(req) {
    let url = req.nextUrl.searchParams.get('url')
    if (url == null) {
        return new Response("missing url parameter", { status: 400 })
    }

    const browser = await puppeteer.launch({
        // headless: false,
        defaultViewport: { width: 1366, height: 768 }
    })

    const data = await embedAndUnnest(url, browser)
    browser.close()

    if (data.status == "success") {
        data.body.id = getTweetId(url)
        return Response.json(data.body)
    } else {
        return Response.json(data.body, { status: 400 })
    }
}