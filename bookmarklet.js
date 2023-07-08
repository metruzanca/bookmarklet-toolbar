javascript: (async (script) => {
  /** copy paste this file as the "url" field */
  const GIST_ID = 'GIST ID GOES HERE';
  const res = await fetch(`https://api.github.com/gists/${GIST_ID}`);
  const json = await res.json();
  const js = json.files['main.js'].content;
  /** adds main()*/
  eval(js);
  main(json.files);
})()