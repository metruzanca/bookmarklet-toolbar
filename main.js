function createEl(name, props) {
  const el = document.createElement(name);
  Object.assign(el, props);
  return el;
}

function createButton(textContent, onclick, props) {
  return createEl('button', { textContent, onclick, ...props });
}

function typeOf(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

/** Create div and add childre with optional props as first element */
function createDiv(props, ...children) {
  const div = createEl('div', {
    ...(typeOf(props) === 'Object' && props)
  });
  if (typeOf(props).startsWith('HTML')) {
    div.append(props);
  }
  div.append(...children);
  return div;
}

function globalStyle(textContent) {
  const rootStyle = createEl('style', {
    textContent,
    id: 'bookmarklet-global-style',
  });
  document.head.append(rootStyle)
  return rootStyle
}

function siteIs(hosts) {
  if (!Array.isArray(hosts)) {
    hosts = [hosts];
  }
  return hosts.some(host => location.host.indexOf(host) > -1);
}

const corsProxy = url => `https://corsproxy.io/?${encodeURIComponent(url)}`

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

function runOtherFiles(files, api) {
  window.bookmarklet = api
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
  delete window.bookmarklet;
  console.groupEnd();

  if (api.root.children.length === 0) {
    api.root.append(createEl('p', {
      textContent: 'No features available for this site.',
      style: `padding: 0 4px;`,
    }))
  }
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

  runOtherFiles(files, {
    createEl,
    createButton,
    createDiv,
    globalStyle,
    siteIs,
    corsProxy,
    closeToolbar,
    classes: {
      container: 'bookmarklet-container',
    },
    root: featureContainer,
    version,
  })

  const versionLabel = createEl('span', {
    textContent: `v${version}`,
    style: `
      margin: 0 4px;
    `,
  })

  toolbar.append(featureContainer, createDiv(versionLabel, closeButton))
  document.body.append(toolbar);
}
