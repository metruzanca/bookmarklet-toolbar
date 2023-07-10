/** Better createElement API */
function createEl(name, props, ...children) {
  const el = document.createElement(name);
  Object.assign(el, props);
  if (children.length > 0) {
    el.append(...children);
  }
  return el;
}

/** Shorthand for creating buttons */
function createButton(textContent, onclick, props) {
  return createEl('button', { textContent, onclick, ...props });
}

/** Unlike typeof this function gives you the actual prototype name */
function typeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

/** Create div and add childre with optional props as first element */
function createDiv(props, ...children) {
  const div = createEl('div', {
    style: 'display: inline-block;',
    ...(typeOf(props) === 'Object' && props)
  });
  if (typeOf(props).startsWith('HTML')) {
    div.append(props);
  }
  div.append(...children);
  return div;
}

/** Add global style, allows you to write normal css with
 * selectors and such from within javascript */
function globalStyle(textContent) {
  const rootStyle = createEl('style', {
    textContent,
    id: 'bookmarklet-global-style',
  });
  document.head.append(rootStyle)
  return rootStyle
}

/** Shorthand to check if we're on the right site */
function siteIs(matches) {
  if (!Array.isArray(matches)) {
    matches = [matches];
  }
  return matches.some(host => location.href.indexOf(host) > -1);
}

const cleanup = [];
/** Functions to be called when bookmarklet gets removed */
function registerCleanup(callback) {
  cleanup.push(callback);
}

/** Allows calling APIs that normally give cors errors */
const corsProxy = url => `https://corsproxy.io/?${encodeURIComponent(url)}`

// TODO add a way to observe the dom for new elements
// const NODE_TYPE = {
//   ELEMENT_NODE: 1,
//   TEXT_NODE: 3,
// }

// function observe(callback) {
//   const observer = new MutationObserver(mutations => {
//     for (let mutation of mutations) {
//       for (let i = 0; i < mutation.addedNodes.length; i++) {
//         if (mutation.addedNodes[i].nodeType == NODE_TYPE.ELEMENT_NODE) {
//           callback(mutation.addedNodes[i]);
//         }
//       }
//     }
//   });

//   /** @type {MutationObserverInit} */
//   const config = {
//     childList: true,
//     subtree: true,
//   };

//   return observer.observe(document.body, config);
// }

const STYLES = /*css*/`
  #bookmarklet-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 32px;
    background: #363446;

    position: fixed;
    top: 0;
    left: 0;
    z-index: ${2_147_483_647};

    /* font */
    color: #bfbfbf;
    font-size: 12px;
    font-family: sans-serif;
  }
  #bookmarklet-toolbar button {
    background: #201f2a;
    color: #fff;
    border: none;
    padding: 4px 8px;
    cursor: pointer;
    margin: 0 4px;
  }
  .bookmarklet-container {
    background: #24232e;
    margin: 2px;
  }
`;

function runScripts(files) {
  console.groupCollapsed('Bookmarklet Toolbar');
  for (const filename of Object.keys(files)) {
    if (filename === 'main.js' || filename === 'bookmarklet.js') continue;

    const file = files[filename];
    if (file.language !== 'JavaScript') continue;

    console.groupCollapsed(filename);
    console.log(file.content);
    console.groupEnd();

    eval(file.content)
  }
  console.groupEnd();
}

// eslint-disable-next-line no-unused-vars
async function main(files) {
  // Just a nice to have dev feature
  const previousToolbar = document.querySelector('#bookmarklet-toolbar');
  if (previousToolbar) previousToolbar.remove();
  const previousStyle = document.querySelector('#bookmarklet-global-style');
  if (previousStyle) previousStyle.remove();

  const rootStyle = globalStyle(STYLES);

  const toolbar = createEl('div', { id: 'bookmarklet-toolbar' });

  const closeToolbar = () => {
    toolbar.remove();
    rootStyle.remove();
    delete window.bookmarklet;
  }

  const closeButton = createEl('button', {
    onclick: closeToolbar,
    textContent: 'Close',
    style: `
      background: #ff5252;
    `,
  });

  const featureContainer = createEl('div', { style: `display: flex;` })

  const packageJson = JSON.parse(files['package.json']?.content || null);
  const version = packageJson?.version || '0.0.0';

  window.bookmarklet = {
    createEl,
    createButton,
    createDiv,
    globalStyle,
    siteIs,
    corsProxy,
    closeToolbar,
    registerCleanup,
    classes: {
      container: 'bookmarklet-container',
    },
    root: featureContainer,
    version,
  }

  runScripts(files)
  // if the above functon doesn't add any features, add this message
  if (featureContainer.children.length === 0) {
    featureContainer.append(createEl('p', {
      textContent: 'No features available for this site.',
      style: `padding: 0 4px;`,
    }))
  }

  const versionLabel = createEl('span', {
    textContent: `v${version}`,
    style: `
      margin: 0 4px;
    `,
  })

  toolbar.append(featureContainer, createDiv(versionLabel, closeButton))
  document.body.append(toolbar);
}
