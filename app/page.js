'use client';

import { useSearchParams } from 'next/navigation'

import Timeline from "./(components)/Timeline";
import Body from "./(components)/Body";
import { Error } from "./(components)/Error";

function checkURL(url) {
  console.log(url)
  try {
    url = new URL(url);

    if (!["http:", "https:"].includes(url.protocol)) {
      return "URL isn't even a web link!"
    }
    if (
      !["twitter.com", "x.com"].includes(url.hostname.replace("www.", ""))
    ) {
      // TODO: show error on page
      return "URL is not Twitter/X!"
    }

    let split = url.pathname.split("/");
    try {
      if (split[2] != "status")
        return "URL is not of a post!"
      Number(split[3])
    } catch (_) {
      return "URL is not of a post!"
    }
  } catch (ex) {
    return "Input is not a URL!"
  }
  return null
}

function TryTimeline(props) {
  console.log(props)
  let err = checkURL(props.url)
  if (err != null) {
    return <Error msg={err} />
  }

  return (
    <Timeline url={props.url} />
  )
}

const Page = () => {
  const searchParams = useSearchParams()

  // nesting server-comp inside client-comp: https://www.youtube.com/shorts/fmubeX_z2ik
  return (
    <Body>
      {searchParams.has('url') &&
        <TryTimeline url={searchParams.get('url')} />
      }
    </Body>
  )
}

export default Page