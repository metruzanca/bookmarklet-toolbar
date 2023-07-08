const { createButton, root, siteIs } = window.bookmarklet;

if (siteIs('reddit.com')) {
  root.append(
    createButton('RSS Feed', () => {
      window.open(location.href + '.rss')
    })
  )
}