#!/usr/bin/env node
/**
 * CDP coord-based click. Uses Node 22 built-in WebSocket. Works through shadow DOM.
 *
 *   cdp-click.js <x> <y>
 */
const fs = require('fs');
const http = require('http');

const x = Number(process.argv[2]);
const y = Number(process.argv[3]);
if (!Number.isFinite(x) || !Number.isFinite(y)) {
  console.error('Usage: cdp-click.js <x> <y>');
  process.exit(2);
}

const state = JSON.parse(fs.readFileSync('/tmp/stealth-browser-state.json', 'utf8'));
const pageId = state.pageId;
if (!pageId) { console.error('No pageId in state'); process.exit(1); }

function getJSON(url) {
  return new Promise((resolve, reject) => {
    http.get(url, res => {
      let data = '';
      res.on('data', c => data += c);
      res.on('end', () => resolve(JSON.parse(data)));
    }).on('error', reject);
  });
}

(async () => {
  const port = process.env.CDP_PORT || '9333';
  const tabs = await getJSON(`http://127.0.0.1:${port}/json`);
  const tab = tabs.find(t => t.id === pageId);
  if (!tab) { console.error('Page not found:', pageId); process.exit(1); }
  const wsUrl = tab.webSocketDebuggerUrl;

  const ws = new WebSocket(wsUrl);
  let id = 1;
  const pending = new Map();
  ws.onmessage = (ev) => {
    const msg = JSON.parse(ev.data);
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  };
  function send(method, params) {
    return new Promise((resolve) => {
      const myId = id++;
      pending.set(myId, resolve);
      ws.send(JSON.stringify({ id: myId, method, params }));
    });
  }
  await new Promise(r => ws.addEventListener('open', r, { once: true }));

  // Slow human-like move
  const startX = x - 30 - Math.random() * 20;
  const startY = y - 30 - Math.random() * 20;
  for (let i = 0; i <= 20; i++) {
    const t = i / 20;
    const px = startX + (x - startX) * t;
    const py = startY + (y - startY) * t;
    await send('Input.dispatchMouseEvent', { type: 'mouseMoved', x: Math.round(px), y: Math.round(py), button: 'none' });
    await new Promise(r => setTimeout(r, 8 + Math.random() * 12));
  }
  await new Promise(r => setTimeout(r, 150 + Math.random() * 150));
  await send('Input.dispatchMouseEvent', { type: 'mousePressed', x, y, button: 'left', clickCount: 1 });
  await new Promise(r => setTimeout(r, 50 + Math.random() * 40));
  await send('Input.dispatchMouseEvent', { type: 'mouseReleased', x, y, button: 'left', clickCount: 1 });
  console.log(`OK clicked (${x}, ${y})`);
  ws.close();
  process.exit(0);
})().catch(err => { console.error(err); process.exit(1); });
