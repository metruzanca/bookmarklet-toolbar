# Bookmarklet toolbar

![reddit](reddit.png)

Just a bookmarklet toolbar that I've made for myself. That gives me access to userscripts pretty easily, conveniently and is easy to extend!

The way it works is `bookmarklet.js` is the bookmarklet that you copy to the browser. Click that, will use github's api to get a gist (which returns all the files!) and we eval those files to populate the toolbar. The first one to execute is `main.js` which prepares everything and even creates a "bookmarklet api" that is provided to the other scripts. Main will then run all remaining js files in the gist which should add buttons and sections to the toolbar.

The benefit of keeping it in a gist is that you can easily get all code via github's api, meaning we can make a loader (`bookmarklet.js`) that never needs to be changed (the browser bookmark I mean) between updates. Its essetially an auto-updating bookmarklet.

> NOTE! If a site has a Content Security Policy directive that disables unsafe-eval, this toolbar will not work. e.g. github.com does this. Reddit does not and most other sites don't either.

This was in a gist but decided to put it on github to make it public. So rip commits.

## Usage
Copy all files into a gist and replace `GIST ID GOES HERE` with your gist's id (you'll have to edit your gist after you initially create it). You then need to copy and paste the content of `bookmarklet.js` into the "url" field of a bookmark. Make sure it starts with `javascript:` that part is important!

Heres an example [gist](https://gist.github.com/metruzanca/2ce301f639c8005896305a9927b1825f)

You can then add files to the gist to add buttons and such to your toolbar. `example.js` has an example for creating a button using the api exposed for bookmarklets.

The script `webArchive.js` is one that I actually use and I'm okay with sharing as another example.
