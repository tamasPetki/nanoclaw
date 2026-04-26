#!/usr/bin/env node
/**
 * Dump ALL cookies (HttpOnly inclusive) from the active stealth-browse session
 * via CDP Network.getAllCookies. Writes JSON array to stdout.
 */
const fs = require('fs'), http = require('http');
const state = JSON.parse(fs.readFileSync('/tmp/stealth-browser-state.json', 'utf8'));
function getJSON(u) {
  return new Promise((res, rej) => http.get(u, r => {
    let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d)));
  }).on('error', rej));
}
(async () => {
  const port = process.env.CDP_PORT || '9333';
  const tabs = await getJSON(`http://127.0.0.1:${port}/json`);
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
