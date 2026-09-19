import { execSync, spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import net from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { SERVER_DIR } from './env.js';

// End-to-end helpers: the real website (Vite dev server) in a real Chrome, driven
// through the DevTools protocol with Node's built-in WebSocket — no extra package.
// The site talks to an API instance started by the test (temporary database).

const CLIENT_DIR = path.resolve(SERVER_DIR, '../client');
export const SHOTS_DIR = path.join(SERVER_DIR, 'tests/e2e/screenshots');
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// CHROME_PATH overrides; otherwise the usual install locations of Chrome / Chromium / Edge.
export function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  ].filter(Boolean);
  return candidates.find((p) => existsSync(p)) ?? null;
}

const freePort = () =>
  new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(0, '127.0.0.1', () => {
      const { port } = server.address();
      server.close(() => resolve(port));
    });
    server.on('error', reject);
  });

const killTree = (child) => {
  if (!child?.pid) return;
  try {
    if (process.platform === 'win32') execSync(`taskkill /pid ${child.pid} /T /F`, { stdio: 'ignore' });
    else child.kill('SIGTERM');
  } catch {
    /* already gone */
  }
};

// Starts the website (Vite) pointing at `apiUrl`. Returns { url, stop }.
export async function startSite(apiUrl) {
  const port = await freePort();
  const child = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'dev', '--', '--port', String(port), '--strictPort', '--host', '127.0.0.1'], {
    cwd: CLIENT_DIR,
    // VITE_API_URL is emptied on purpose: a developer's local client/.env may point the site
    // at the development API, the test must talk to its own (through the proxy).
    env: { ...process.env, VITE_API_PROXY: apiUrl, VITE_API_URL: '', BROWSER: 'none' },
    stdio: 'ignore',
    shell: true,
  });
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i += 1) {
    try {
      if ((await fetch(url)).ok) return { url, stop: () => killTree(child) };
    } catch {
      /* not ready */
    }
    await sleep(250);
  }
  killTree(child);
  throw new Error('The website (Vite) did not start');
}

export class Browser {
  constructor(chrome, ws, port) {
    this.chrome = chrome;
    this.ws = ws;
    this.port = port;
    this.id = 0;
    this.pending = new Map();
    this.jsErrors = [];
    this.badResponses = [];
    this.responses = [];
  }

  static async launch({ lang = 'fr', width = 1280, height = 1000 } = {}) {
    const exe = findChrome();
    if (!exe) throw new Error('No Chrome/Chromium found (set CHROME_PATH)');
    const port = await freePort();
    const child = spawn(exe, ['--headless=new', '--disable-gpu', '--hide-scrollbars', '--no-first-run', `--lang=${lang}`, `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(path.join(tmpdir(), 'larbi-e2e-'))}`, `--window-size=${width},${height}`, 'about:blank'], { stdio: 'ignore' });
    let wsUrl;
    for (let i = 0; i < 100 && !wsUrl; i += 1) {
      try {
        wsUrl = (await (await fetch(`http://127.0.0.1:${port}/json`)).json()).find((t) => t.type === 'page')?.webSocketDebuggerUrl;
      } catch {
        /* not ready */
      }
      await sleep(150);
    }
    if (!wsUrl) throw new Error('Chrome did not start');
    const ws = new WebSocket(wsUrl);
    await new Promise((resolve) => ws.addEventListener('open', resolve, { once: true }));
    const b = new Browser(child, ws, port);
    ws.addEventListener('message', (m) => b.onMessage(JSON.parse(m.data)));
    for (const domain of ['Page', 'Runtime', 'Network', 'DOM']) await b.send(`${domain}.enable`);
    mkdirSync(SHOTS_DIR, { recursive: true });
    return b;
  }

  onMessage(msg) {
    if (msg.id && this.pending.has(msg.id)) {
      const p = this.pending.get(msg.id);
      this.pending.delete(msg.id);
      if (msg.error) p.reject(new Error(JSON.stringify(msg.error)));
      else p.resolve(msg.result);
    } else if (msg.method === 'Runtime.exceptionThrown') {
      this.jsErrors.push(msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text);
    } else if (msg.method === 'Runtime.consoleAPICalled' && msg.params.type === 'error') {
      this.jsErrors.push(`console.error: ${msg.params.args.map((a) => a.value ?? a.description).join(' ').slice(0, 200)}`);
    } else if (msg.method === 'Network.responseReceived') {
      const { status, url } = msg.params.response;
      const entry = `${status} ${url.replace(/^https?:\/\/[^/]+/, '')}`;
      this.responses.push(entry);
      if (status >= 400) this.badResponses.push(entry);
    }
  }

  send(method, params = {}) {
    return new Promise((resolve, reject) => {
      this.id += 1;
      this.pending.set(this.id, { resolve, reject });
      this.ws.send(JSON.stringify({ id: this.id, method, params }));
    });
  }

  async ev(expression) {
    const res = await this.send('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.exceptionDetails) throw new Error(`evaluation failed: ${expression.slice(0, 160)}\n${JSON.stringify(res.exceptionDetails).slice(0, 300)}`);
    return res.result.value;
  }

  async waitFor(expression, label = expression, timeout = 10_000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      try {
        if (await this.ev(expression)) return true;
      } catch {
        /* the page is navigating */
      }
      await sleep(120);
    }
    return false;
  }

  hasText = (s) => `document.body.innerText.includes(${JSON.stringify(s)})`;
  text = () => this.ev('document.body.innerText');
  async waitText(s, timeout) {
    return this.waitFor(this.hasText(s), `text "${s}"`, timeout);
  }

  async goto(url) {
    await this.send('Page.navigate', { url });
    await sleep(250);
    await this.waitFor("document.readyState === 'complete'");
  }

  // Waits (up to 4 s) for an ENABLED matching control, like a person would, then clicks it.
  click(text, timeout) {
    return this.clickWhere(`e => e.textContent.trim() === ${JSON.stringify(text)} && !e.disabled`, timeout);
  }

  // `finder` is the SOURCE of a predicate over the page's buttons, links and tabs, e.g. 'e => e.id === "x"'.
  async clickWhere(finder, timeout = 4000) {
    const t0 = Date.now();
    while (Date.now() - t0 < timeout) {
      const ok = await this.ev(`(() => { const el = [...document.querySelectorAll('button, a, [role=tab]')].find(${finder}); if (!el) return false; el.click(); return true; })()`);
      if (ok) return true;
      await sleep(150);
    }
    return false;
  }

  clickContaining = (text) => this.clickWhere(`e => e.textContent.trim().includes(${JSON.stringify(text)}) && !e.disabled`);
  clickTab = (label) => this.clickWhere(`e => e.getAttribute('role') === 'tab' && e.textContent.trim().endsWith(${JSON.stringify(label)})`);

  async type(selector, text) {
    const ok = await this.ev(`(() => { const e = document.querySelector(${JSON.stringify(selector)}); if (!e) return false; e.focus(); if (e.select) e.select(); return true; })()`);
    if (!ok) throw new Error(`no element ${selector}`);
    await this.send('Input.insertText', { text });
  }

  // Chooses a file in the `index`-th file input matching `selector` (inputs are hidden: no dialog opens).
  async setFiles(selector, file, index = 0) {
    const doc = await this.send('DOM.getDocument', { depth: 0 });
    const { nodeIds } = await this.send('DOM.querySelectorAll', { nodeId: doc.root.nodeId, selector });
    if (!nodeIds[index]) throw new Error(`no element ${selector} #${index}`);
    await this.send('DOM.setFileInputFiles', { nodeId: nodeIds[index], files: [path.resolve(file)] });
  }

  // fetch() from INSIDE the page (its cookies, its origin).
  fetch(url, init = {}) {
    return this.ev(`(async () => { const r = await fetch(${JSON.stringify(url)}, { credentials: 'include', ...${JSON.stringify(init)} }); const b = new Uint8Array(await r.arrayBuffer()); return { status: r.status, type: r.headers.get('content-type'), disposition: r.headers.get('content-disposition'), length: b.length, head: Array.from(b.slice(0, 8)) }; })()`);
  }

  clearCookies = () => this.send('Network.clearBrowserCookies');
  setViewport = (width, height = 900) => this.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: width < 600 });

  async shot(name) {
    const { data } = await this.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(path.join(SHOTS_DIR, `${name}.png`), Buffer.from(data, 'base64'));
  }

  async close() {
    try {
      this.ws.close();
    } catch {
      /* ignore */
    }
    killTree(this.chrome);
  }
}
