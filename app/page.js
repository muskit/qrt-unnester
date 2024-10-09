import Timeline from "./(components)/Timeline";
import Body from "./(components)/Body";

function checkURL(url) {
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
  let err = checkURL(props.url)
  if (err != null) {
    return <p className="text-red-500"><strong>Error: </strong>{err}</p>
  }

  return <Timeline url={props.url} />
}

const Page = ({ searchParams }) => {
  // nesting server-comp inside client-comp: https://www.youtube.com/shorts/fmubeX_z2ik
  return (
    <Body>
      {searchParams != null && searchParams.hasOwnProperty('url') &&
        // <TryTimeline url={searchParams.url} />
        <Timeline url={searchParams.url} />
      }
    </Body>
  )
}

export default Page