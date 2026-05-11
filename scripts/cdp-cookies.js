#!/usr/bin/env node
/**
 * Dump ALL cookies (HttpOnly inclusive) from the active stealth-browse session
 * via CDP Network.getAllCookies. Writes JSON array to stdout.
 */
const fs = require('fs'), http = require('http');
// Bypass any HTTP proxy (OneCLI agent-vault gateway). Node 22's
// EnvHttpProxyAgent honors HTTP_PROXY/HTTPS_PROXY for localhost too — that
// would route the CDP call through the gateway and fail with "Empty reply".
process.env.NO_PROXY = (process.env.NO_PROXY ? process.env.NO_PROXY + ',' : '') + 'localhost,127.0.0.1,::1';
process.env.no_proxy = process.env.NO_PROXY;
const state = JSON.parse(fs.readFileSync('/tmp/stealth-browser-state.json', 'utf8'));
function getJSON(port, path_) {
  return new Promise((res, rej) => {
    const req = http.get({ hostname: '127.0.0.1', port, path: path_, agent: false }, r => {
      let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
    });
    req.on('error', rej);
  });
}
(async () => {
  // Port resolution priority: explicit env var → state file (where stealth-browse
  // records the actual ephemeral port Chrome picked) → legacy fallback.
  // The state file is the canonical source post Chrome 136+ migration to
  // --remote-debugging-port=0 + DevToolsActivePort.
  const port = process.env.CDP_PORT || state.cdpPort || '9333';
  const tabs = await getJSON(port, '/json');
  const tab = tabs.find(t => t.id === state.pageId);
  if (!tab) { console.error('page not found'); process.exit(1); }
  const ws = new WebSocket(tab.webSocketDebuggerUrl);
  let id = 1; const pending = new Map();
  ws.onmessage = (ev) => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { pending.get(m.id)(m); pending.delete(m.id); }
  };
  function send(method, params) {
    return new Promise(r => { const i = id++; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));
  const res = await send('Network.getAllCookies', {});
  console.log(JSON.stringify(res.result.cookies, null, 2));
  ws.close();
  process.exit(0);
})().catch(e => { console.error(e); process.exit(1); });
