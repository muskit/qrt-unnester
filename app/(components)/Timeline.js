'use client';

import { useRef, useEffect, useState, } from "react";
var Mutex = require("async-mutex").Mutex

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

    const mutex = useRef(new Mutex())

    useEffect(() => {
        async function consumeTweetStream() {
            console.log("CALLED CONSUME!")
            if (!initialized) {
                // const resp = await fetch(`/api/unnest_embed_stream?url=${url}`)
                const resp = await fetch("https://owtxh3s67y27i5o2wnofmdkfna0xtben.lambda-url.us-east-1.on.aws/", {
                    body: JSON.stringify({ "url": url }),
                    method: "POST"
                })
                const newReader = resp.body.getReader()
                setReader(newReader)
                setInitialized(true)
                return
            }

            // stream had finished
            if (lastResp.done) {
                console.log("last response was final")
                if (!done) // avoid triggering unnecessary re-render
                    setDone(true)
                return
            }

            let chunkStr = ""
            while (chunkStr.charAt(chunkStr.length - 1) != "\n") {
                const resp = await reader.read()
                const respStr = new TextDecoder().decode(resp.value)
                console.log(`got chunk: ${respStr}`)
                setLastResp(resp)
                chunkStr += respStr

                if (resp.done) {
                    console.log("chunk part has done=true!")
                    break
                }
            }
            chunkStr.trim()

            if (chunkStr == "") {
                console.log("stream has ended!")
                return
            }

            // console.log(`-------str(data)-------\n${chunkStr}`)

            const data = JSON.parse(chunkStr)
            if (data.status != "success") {
                setErrMsg(data.body)
            } else {
                console.log(data.body.id)
                setTwtHTMLs([...twtHTMLs, data.body])
            }
        }

        if (!mutex.current.isLocked())
            mutex.current.runExclusive(async () => consumeTweetStream())
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
            <StreamingTimeline url={url} />
            {/* <ApiTimeline url={url} /> */}
        </div>
    )
}