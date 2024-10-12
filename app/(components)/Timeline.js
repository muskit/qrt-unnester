'use client';

import { useContext, useEffect, useState, } from "react";

// https://stackoverflow.com/a/73800613
import "../embed_tweet.css"
import { Error } from "./Error";

// TODO: add pizzazz
const Loading = () => {
    return <div>Loading...</div>
}

function ApiTimeline({ url }) {
    const [done, setDone] = useState(false)
    const [curURL, setCurURL] = useState(url)
    const [twtHTMLs, setTwtHTMLs] = useState([])
    const [errMsg, setErrMsg] = useState()

    useEffect(() => {
        async function populateTweets() {
            if (done) return

            if (curURL == null) {
                console.log(`finished unnesting! there are ${twtHTMLs.length} tweets (including start).`)
                setDone(true)
                return
            }

            let res = await fetch(`/api/unnest_embed?url=${curURL}`)

            if (!res.ok) {
                const msg = await res.text()
                setErrMsg(msg)
                setDone(true)
                return
            }

            const json = await res.json()
            setTwtHTMLs([...twtHTMLs, { html: json.html, id: json.id }])
            setCurURL(json.next_qrt)
        }

        populateTweets()
    }, [done, curURL, twtHTMLs, setTwtHTMLs])

    return (
        <div className="tweet-listing space-y-4">
            {twtHTMLs.map((x) => {
                return <div dangerouslySetInnerHTML={{ __html: x.html }} key={x.id} />
            })}
            {!done && <Loading />}
            {errMsg && <Error msg={errMsg} />}
        </div>
    )
}

function StreamingTimeline({ url }) {
    const [done, setDone] = useState(false)
    const [twtHTMLs, setTwtHTMLs] = useState([])
    const [initialized, setInitialized] = useState(false)
    const [reader, setReader] = useState()
    const [lastResp, setLastResp] = useState({ done: false, value: null })
    const [errMsg, setErrMsg] = useState()

    useEffect(() => {
        async function consumeTweetStream() {
            if (!initialized) {
                const resp = await fetch(`/api/unnest_embed_stream?url=${url}`)
                const newReader = resp.body.getReader()
                setReader(newReader)
                setInitialized(true)
                return
            }

            if (lastResp.done) {
                if (!done) // avoid triggering unnecessary re-render
                    setDone(true)
                return
            }

            // wait for next encoded chunk
            // const { done, value } = await reader.read();
            const resp = await reader.read()
            setLastResp(resp)

            // check if stream is now done
            if (resp.done) return

            const str = new TextDecoder().decode(resp.value)
            const data = JSON.parse(str)
            if (data.status != "success") {
                setErrMsg(data.body)
            } else {
                console.log(data.body.id)
                setTwtHTMLs([...twtHTMLs, data.body])
            }
        }

        consumeTweetStream()
    }, [initialized, lastResp, reader, twtHTMLs, url, done])

    return (
        <div className="tweet-listing space-y-4">
            {twtHTMLs.map((x) => {
                return <div dangerouslySetInnerHTML={{ __html: x.html }} key={x.id} />
            })}
            {!done && <Loading />}
            {errMsg && <Error msg={errMsg} />}
        </div>
    )
}

export default function Timeline({ url }) {
    return (
        <div className="my-6">
            <h4 className="text-left text-2xl font-semibold mb-3">Timeline</h4>
            {/* <StreamingTimeline url={url} /> */}
            <ApiTimeline url={url} />
        </div>
    )
}