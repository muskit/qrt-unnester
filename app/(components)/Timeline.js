'use client';

import { useEffect, useState, } from "react";

// https://stackoverflow.com/a/73800613
import "../embed_tweet.css"

// TODO: add pizzazz
const Loading = () => {
    return <div>Loading...</div>
}

function StreamingTimeline({ url }) {
    const [done, setDone] = useState(false)
    const [curURL, setCurURL] = useState(url)
    const [twtHTMLs, setTwtHTMLs] = useState([])

    useEffect(() => {
        async function populateTweets() {
            if (done) return

            if (curURL == null) {
                console.log(`finished unnesting! there are ${twtHTMLs.length} tweets (including start).`)
                setDone(true)
                return
            }

            let res = await fetch(`/api/get_qrt_embed?url=${curURL}`)

            if (!res.ok) {
                const msg = await res.text()
                // TODO: make error visible
                console.log(`response from backend not ok: ${msg}`)
                setDone(true)
                return
            }

            const json = await res.json()
            setTwtHTMLs([...twtHTMLs, { html: json.html, id: json.id }])
            setCurURL(json.next_qrt)
        }

        if (!done)
            populateTweets()
    }, [done, curURL, twtHTMLs])

    return (
        <div className="tweet-listing">
            {twtHTMLs.map((x) => {
                return <div className="mb-4" dangerouslySetInnerHTML={{ __html: x.html }} key={x.id} />
            })}
            {!done && <Loading />}
        </div>
    )
}

export default function Timeline({ url }) {
    return (
        <div>
            <h4 className="text-left text-2xl font-semibold mb-3">Timeline</h4>
            <StreamingTimeline url={url} />
        </div>
    )
}