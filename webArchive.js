const { corsProxy, createButton, root } = window.bookmarklet;

const createUrl = url => `https://web.archive.org/cdx/search/cdx?url=${url}`

function resultToObject(data) {
  /* eslint-disable no-unused-vars */
  const [
    match,
    timestamp,
    original,
    mimetype,
    statuscode,
    digest,
    length,
  ] = data.split(' ')
  /* eslint-enable no-unused-vars */
  return {
    // match,
    timestamp,
    original,
    // mimetype,
    // statuscode,
    // digest,
    // length,
  }
}

async function webArchiveLatest(url) {
  const response = await fetch(corsProxy(createUrl(url)))
  const data = await response.text()
  const lines = data.split('\n').filter(el => !!el).map(resultToObject)

  const latest = lines[lines.length - 1]

  return latest
}

root.append(createButton('Web Archive\'s Latest', async () => {
  const { original, timestamp } = await webArchiveLatest(location.href)
  console.log(`https://web.archive.org/web/${timestamp}/${original}`);
  window.open(`https://web.archive.org/web/${timestamp}/${original}`)
}))