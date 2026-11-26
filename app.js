// OMEGA — a personal AI that runs entirely on your device.
// Brain: open-source models via WebLLM (WebGPU). Live info: free public APIs, no keys.
// Two engines:
//  • CPU brain (wllama = llama.cpp in WebAssembly): runs on the processor. Reliable on iPhone. Default.
//  • GPU brain (WebLLM, WebGPU): faster on computers. Optional; iPhone Safari's graphics process crashes easily.
const WEBLLM_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.89';
const WLLAMA_URL = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@4.0.0/esm/index.js';
const WLLAMA_WASM = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@4.0.0/esm/wasm/wllama.wasm';
const PROXY = 'https://proxy.cors.dev/';
const VERSION = '3.1.0';

const MODELS = [
  { key: 'cpu-qwen3-0.6b', engine: 'cpu', name: 'Qwen3 0.6B', repo: 'unsloth/Qwen3-0.6B-GGUF', file: 'Qwen3-0.6B-Q4_K_M.gguf', sizeMB: 400, memMB: 650, thinking: true, desc: 'Recommended for phones and tablets. Runs on the processor, so it does not crash.' },
  { key: 'cpu-qwen3.5-0.8b', engine: 'cpu', name: 'Qwen3.5 0.8B', repo: 'unsloth/Qwen3.5-0.8B-GGUF', file: 'Qwen3.5-0.8B-Q4_K_M.gguf', sizeMB: 533, memMB: 800, thinking: true, desc: 'Newer and smarter than Qwen3 0.6B, still light enough for phones.' },
  { key: 'cpu-lfm2.5-1.2b', engine: 'cpu', name: 'LFM2.5 1.2B', repo: 'LiquidAI/LFM2.5-1.2B-Instruct-GGUF', file: 'LFM2.5-1.2B-Instruct-Q4_K_M.gguf', sizeMB: 731, memMB: 1000, desc: 'Fast and sharp, built for phones by Liquid AI.' },
  { key: 'cpu-llama-1b', engine: 'cpu', name: 'Llama 3.2 1B', repo: 'unsloth/Llama-3.2-1B-Instruct-GGUF', file: 'Llama-3.2-1B-Instruct-Q4_K_M.gguf', sizeMB: 810, memMB: 1050, desc: 'Smarter, more natural chat. A little slower.' },
  { key: 'cpu-qwen3-1.7b', engine: 'cpu', name: 'Qwen3 1.7B', repo: 'unsloth/Qwen3-1.7B-GGUF', file: 'Qwen3-1.7B-Q4_K_M.gguf', sizeMB: 1110, memMB: 1400, thinking: true, experimentalIOS: true, desc: 'Much smarter. Great on computers and strong phones. On iPhone it is experimental: if it runs out of memory, OMEGA goes back to your smaller brain.' },
  { key: 'cpu-qwen3-4b', engine: 'cpu', name: 'Qwen3 4B', repo: 'unsloth/Qwen3-4B-Instruct-2507-GGUF', file: 'Qwen3-4B-Instruct-2507-Q4_K_M.gguf', sizeMB: 2500, memMB: 3200, desc: 'Smartest processor brain. For computers with 8+ cores and plenty of memory.' },
  { key: 'cpu-qwen2.5-0.5b', engine: 'cpu', name: 'Qwen2.5 0.5B', repo: 'Qwen/Qwen2.5-0.5B-Instruct-GGUF', file: 'qwen2.5-0.5b-instruct-q4_k_m.gguf', sizeMB: 490, memMB: 700, desc: 'Backup brain.' },
  { key: 'gpu-qwen3-1.7b', engine: 'gpu', name: 'Qwen3 1.7B (fast mode)', f16: 'Qwen3-1.7B-q4f16_1-MLC', f32: 'Qwen3-1.7B-q4f32_1-MLC', sizeMB: 1100, memMB: 2040, thinking: true, desc: 'Uses the graphics chip. Fast and smart on computers.' },
  { key: 'gpu-llama-3b', engine: 'gpu', name: 'Llama 3.2 3B (fast mode)', f16: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', f32: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', sizeMB: 1800, memMB: 2260, desc: 'Graphics chip. Very natural conversation.' },
  { key: 'gpu-coder-3b', engine: 'gpu', name: 'Qwen2.5 Coder 3B (fast mode)', f16: 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC', f32: 'Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC', sizeMB: 1800, memMB: 2500, desc: 'Graphics chip. Best for code.' },
  { key: 'gpu-qwen3-4b', engine: 'gpu', name: 'Qwen3 4B (fast mode)', f16: 'Qwen3-4B-q4f16_1-MLC', f32: 'Qwen3-4B-q4f32_1-MLC', sizeMB: 2300, memMB: 3430, thinking: true, desc: 'Graphics chip. Smartest; needs a good computer.' },
];
// vision brains ("eyes"): see photos and videos. Loaded only when you attach one.
const VISION = [
  { key: 'vis-lfm2-450m', engine: 'cpu', vision: true, name: 'LFM2-VL 450M (vision)', repo: 'LiquidAI/LFM2-VL-450M-GGUF', file: 'LFM2-VL-450M-Q8_0.gguf', mmproj: 'mmproj-LFM2-VL-450M-Q8_0.gguf', sizeMB: 483, memMB: 900, desc: 'Sees photos and videos. Light enough for phones.' },
  { key: 'vis-lfm2-1.6b', engine: 'cpu', vision: true, name: 'LFM2-VL 1.6B (vision)', repo: 'LiquidAI/LFM2-VL-1.6B-GGUF', file: 'LFM2-VL-1.6B-Q4_0.gguf', mmproj: 'mmproj-LFM2-VL-1.6B-Q8_0.gguf', sizeMB: 1260, memMB: 2200, desc: 'Sharper eyes for computers.' },
];
const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const IS_PHONE = IS_IOS || /Android/i.test(navigator.userAgent);
const IS_IPAD = /iPad/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const DEVICE = IS_IPAD ? 'iPad' : IS_IOS ? 'iPhone' : IS_PHONE ? 'phone' : 'device';
const STANDALONE = (window.matchMedia && matchMedia('(display-mode: standalone)').matches) || navigator.standalone === true;
const CTX = IS_PHONE ? 2048 : 4096; // smaller working memory on phones = far less RAM
const PHONE_DEFAULT = 'cpu-lfm2.5-1.2b';
const DESKTOP_DEFAULT = 'gpu-qwen3-1.7b';
// iPhone: processor brains only (Safari kills tabs over ~1.5 GB and its graphics process crashes easily)
const fitsDevice = m => !IS_IOS || (m.engine === 'cpu' && (m.memMB <= 1100 || m.experimentalIOS));
// if a brain crashes or cannot start, OMEGA moves down this list
const LIGHTER = { 'gpu-qwen3-4b': 'gpu-qwen3-1.7b', 'gpu-llama-3b': 'gpu-qwen3-1.7b', 'gpu-coder-3b': 'gpu-qwen3-1.7b', 'gpu-qwen3-1.7b': 'cpu-qwen3-1.7b', 'cpu-qwen3-4b': 'cpu-qwen3-1.7b', 'cpu-qwen3-1.7b': 'cpu-qwen3-0.6b', 'cpu-llama-1b': 'cpu-qwen3-0.6b', 'cpu-lfm2.5-1.2b': 'cpu-qwen3-0.6b', 'cpu-qwen3.5-0.8b': 'cpu-qwen3-0.6b', 'cpu-qwen3-0.6b': 'cpu-qwen2.5-0.5b' };
// how smart each brain is (for "a better brain is available" suggestions)
const RANK = { 'cpu-qwen2.5-0.5b': 1, 'cpu-qwen3-0.6b': 2, 'cpu-llama-1b': 3, 'cpu-qwen3.5-0.8b': 3, 'cpu-qwen3-1.7b': 4, 'cpu-lfm2.5-1.2b': 4.5, 'gpu-qwen3-1.7b': 5, 'gpu-llama-3b': 5, 'gpu-coder-3b': 5, 'cpu-qwen3-4b': 6, 'gpu-qwen3-4b': 7 };
const isGpuCrash = e => /device (was )?lost|disposed|external instance|mapAsync|GPUDevice|out of memory|OOM|allocation|WebGPU|Instance reference|graphics adapter|memory access out of bounds|RuntimeError|Aborted\(/i.test(String((e && e.message) || e));

// ---------------- small helpers ----------------
const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sleep = ms => new Promise(r => setTimeout(r, ms));
const clip = (s, n) => { s = String(s || ''); return s.length > n ? s.slice(0, n) + '…' : s; };
const store = {
  get(k, d) { try { const v = localStorage.getItem('omega.' + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem('omega.' + k, JSON.stringify(v)); return true; } catch (e) { return false; } },
};

// ---------------- state ----------------
let profile = store.get('profile', { name: '', city: 'Los Angeles', about: '', style: '' });
let facts = store.get('facts', []);
let lessons = store.get('lessons', []);
let liked = store.get('liked', []);
let chats = store.get('chats', []);
let settings = store.get('settings', { model: IS_PHONE ? PHONE_DEFAULT : DESKTOP_DEFAULT, live: true, auto: true, fresh: true });
if (settings.auto === undefined) settings.auto = true;
if (!MODELS.some(m => m.key === settings.model)) settings.model = IS_PHONE ? PHONE_DEFAULT : DESKTOP_DEFAULT; // upgrade from older versions
if (!fitsDevice(MODELS.find(m => m.key === settings.model))) settings.model = PHONE_DEFAULT;
let crashNote = '';
// crash protection: if the page died while a brain was loading or answering, retry the same saved brain;
// only after it dies twice in a row, move to a lighter brain, and only to one that's already saved (never force a new download)
let crashFrom = null, crashBlocked = false;
(() => {
  const f = store.get('inflight', null); store.set('inflight', null);
  if (!f || Date.now() - f.t > 10 * 60 * 1000) return;
  const c = store.get('crashes', null), n = c && c.model === f.model ? c.n + 1 : 1;
  store.set('crashes', { model: f.model, n });
  if (n >= 2) crashFrom = f.model;
})();
store.set('settings', settings); // keep the migrated setting
// the page going into the background (switching apps, locking the phone) is not a crash
let inflightRec = null;
const setInflight = rec => { inflightRec = rec; store.set('inflight', document.visibilityState === 'hidden' ? null : rec); };
document.addEventListener('visibilitychange', () => store.set('inflight', document.visibilityState === 'hidden' ? null : inflightRec));
addEventListener('pagehide', () => store.set('inflight', null));
// choose a brain that is already saved on this device, so OMEGA never asks to download again when one is there
async function pickSavedBrain() {
  if (crashFrom) {
    let k = LIGHTER[crashFrom];
    while (k) { if (fitsDevice(modelOf(k)) && await isCached(modelOf(k)).catch(() => false)) { settings.model = k; crashNote = 'Your device ran low on memory twice, so OMEGA switched to a lighter brain that was already saved.'; break; } k = LIGHTER[k]; }
    if (settings.model === crashFrom) crashBlocked = true; // nothing lighter is saved: ask before trying again
    else store.set('crashes', null);
    crashFrom = null; store.set('settings', settings);
  }
  if (await isCached(modelOf(settings.model)).catch(() => false)) return;
  const order = MODELS.filter(fitsDevice).sort((a, b) => (a.engine === 'cpu' ? 0 : 1) - (b.engine === 'cpu' ? 0 : 1) || (RANK[b.key] || 0) - (RANK[a.key] || 0));
  for (const m of order) if (await isCached(m).catch(() => false)) { settings.model = m.key; store.set('settings', settings); return; }
  // nothing downloaded yet: suggest the best brain for this device
  if (settings.auto) { const d = await detectDevice(); if (d.rec !== settings.model) { settings.model = d.rec; store.set('settings', settings); } }
}
let chat = null, busy = false, stopFlag = false, voiceAsk = false; // voiceAsk: the question was spoken, so read the answer aloud
let webllm = null, wllamaMod = null, engine = null, loadedKey = null, loading = null, hasF16 = null;
const codes = {}; let seq = 0;

// ---------------- markdown + code blocks ----------------
function inline(t) {
  return esc(t).replace(/`([^`\n]+)`/g, '<code>$1</code>').replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/(^|[\s(])\*([^*\s][^*]*?)\*(?=[\s.,!?)]|$)/g, '$1<i>$2</i>').replace(/(^|[\s(])_([^_\s][^_]*?)_(?=[\s.,!?)]|$)/g, '$1<i>$2</i>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (m, a, u) => `<a href="${u}" target="_blank" rel="noopener">${a}</a>`)
    .replace(/(^|[\s(])(https:\/\/[^\s<)"]+[^\s<)".,!?])/g, (m, pre, u) => `${pre}<a href="${u}" target="_blank" rel="noopener">${u.replace(/^https:\/\/(www\.)?/, '').slice(0, 48)}</a>`);
}
const cells = l => l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
function mdBlock(t) {
  let h = '', list = null, para = [];
  const flushP = () => { if (para.length) { h += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; } };
  const flushL = () => { if (list) { h += `<${list.t}>` + list.items.map(x => '<li>' + inline(x) + '</li>').join('') + `</${list.t}>`; list = null; } };
  const lines = t.split('\n');
  for (let li = 0; li < lines.length; li++) {
    const raw = lines[li]; const l = raw.trimEnd(); let m;
    if (!l.trim()) { flushP(); flushL(); continue; }
    if ((m = l.match(/^\s*!\[([^\]]*)\]\((https:\/\/image\.pollinations\.ai\/[^)\s]+)\)\s*$/))) { flushP(); flushL(); h += `<div class="genimg" data-src="${esc(m[2])}" data-alt="${esc(m[1])}"><div class="ph"><span class="spinner"></span> Making your picture…</div></div>`; continue; }
    if (/^\s*\|.*\|\s*$/.test(l) && li + 1 < lines.length && /^\s*\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?\s*$/.test(lines[li + 1])) {
      flushP(); flushL(); const head = cells(l); li += 2; const rows = [];
      while (li < lines.length && /^\s*\|.*\|\s*$/.test(lines[li])) rows.push(cells(lines[li++]));
      li--; h += `<div class="tablewrap"><table><thead><tr>${head.map(c => '<th>' + inline(c) + '</th>').join('')}</tr></thead><tbody>${rows.map(r => '<tr>' + r.map(c => '<td>' + inline(c) + '</td>').join('') + '</tr>').join('')}</tbody></table></div>`; continue;
    }
    if (/^\s*(-{3,}|\*{3,}|_{3,})\s*$/.test(l)) { flushP(); flushL(); h += '<hr>'; continue; }
    if ((m = l.match(/^\s*>\s?(.*)/))) { flushP(); flushL(); h += '<blockquote>' + inline(m[1]) + '</blockquote>'; continue; }
    if ((m = l.match(/^#{1,6}\s+(.*)/))) { flushP(); flushL(); h += '<h3>' + inline(m[1]) + '</h3>'; continue; }
    if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    flushL(); para.push(l);
  }
  flushP(); flushL(); return h;
}
const isWebLang = (lang, code) => /^(html|htm)$/.test(lang) || (!lang && /^\s*<(!doctype|html)/i.test(code));
function appKind(code, text) { return /\b(game|flappy|snake|tetris|pong|score|jump|player|enemy)\b/i.test(code + ' ' + text) ? 'game' : 'app'; }
function appTitle(code, kind) { const m = code.match(/<title>([^<]{1,60})<\/title>/i) || code.match(/<h1[^>]*>([^<]{1,60})<\/h1>/i); return m ? m[1].trim() : (kind === 'game' ? 'Your game' : 'Your app'); }
function render(el, text, live) {
  if (!el.id) el.id = 'x' + (++seq);
  text = String(text || '');
  const parts = text.split(/```([\w+#.-]*)[^\n]*\n?([\s\S]*?)(?:```|$)/);
  const openFence = live && ((text.match(/```/g) || []).length % 2 === 1); // a code block is still being written
  let h = '', k = 0;
  for (let i = 0; i < parts.length; i += 3) {
    h += mdBlock(parts[i] || '');
    if (i + 2 < parts.length) {
      const lang = (parts[i + 1] || '').toLowerCase(), code = parts[i + 2] || '', id = el.id + '-' + (k++);
      codes[id] = { lang, code };
      const run = /^(js|javascript)$/.test(lang) ? 'Run' : /^(html|htm|svg)$/.test(lang) ? 'Preview' : /^(py|python)$/.test(lang) ? 'Run' : '';
      const codeBox = (hidden) => `<div class="code"${hidden ? ` hidden id="c-${id}"` : ''}><div class="cbar"><span>${esc(lang || 'code')}</span><button data-copy="${id}">Copy</button>${run && !hidden ? `<button data-run="${id}">${run}</button>` : ''}</div><pre><code>${esc(code)}</code></pre><div class="runout" id="r-${id}"></div></div>`;
      if (isWebLang(lang, code)) {
        const kind = appKind(code, text), building = openFence && i + 3 >= parts.length - 1;
        if (building) {
          const lines = code.split('\n').length;
          h += `<div class="appcard building"><div class="appicon"><span class="spinner"></span></div><div class="appinfo"><b>Building your ${kind}<span class="dots"></span></b><div class="sub">${lines < 3 ? 'Planning it out' : `Writing the code · ${lines} lines so far`}</div><div class="bar"><div class="fill indet"></div></div></div></div>`;
        } else {
          h += `<div class="appcard"><div class="appicon">${kind === 'game' ? '🎮' : '✨'}</div><div class="appinfo"><b>${esc(appTitle(code, kind))}</b><div class="sub">Ready to ${kind === 'game' ? 'play' : 'use'} · made by OMEGA</div><div class="appbtns"><button class="primary" data-play="${id}">▶ ${kind === 'game' ? 'Play' : 'Open'}</button><a class="btn" data-linkfor="${id}" target="_blank" rel="noopener">🔗 Link</a><button data-showcode="${id}">Code</button></div></div></div>` + codeBox(true);
          makeLink(code).then(u => { const a = document.querySelector(`[data-linkfor="${id}"]`); if (a) a.href = u; }).catch(() => { });
        }
        continue;
      }
      h += codeBox(false);
    }
  }
  if (live && !h.trim()) h = '<div class="thinking">Thinking<span class="dots"></span></div>';
  el.innerHTML = h;
  if (!live) hydratePics(el);
}
// a real link to the app: the code is packed (compressed) into the address of play.html
const linkCache = new Map();
async function makeLink(code) {
  if (linkCache.has(code)) return linkCache.get(code);
  const b64u = bytes => { let s = ''; for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000)); return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, ''); };
  const raw = new TextEncoder().encode(code);
  let hash;
  try { const z = new Uint8Array(await new Response(new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()); hash = 'z' + b64u(z); }
  catch (e) { hash = 'r' + b64u(raw); }
  const u = new URL('play.html', location.href).href + '#' + hash;
  linkCache.set(code, u); return u;
}
function openPlayer(code) {
  closePlayer();
  const kind = appKind(code, '');
  const p = document.createElement('div'); p.className = 'player'; p.id = 'player';
  p.innerHTML = `<div class="pbar"><button class="pclose" aria-label="Close">✕ Close</button><span class="ptitle">${esc(appTitle(code, kind))}</span><button class="pcopy">🔗 Copy link</button></div>`;
  const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-pointer-lock'); f.setAttribute('allow', 'autoplay; fullscreen'); f.srcdoc = code; p.appendChild(f);
  document.body.appendChild(p);
  p.querySelector('.pclose').onclick = closePlayer;
  p.querySelector('.pcopy').onclick = async e => { const b = e.currentTarget, u = await makeLink(code); if (navigator.share) { navigator.share({ title: appTitle(code, kind), url: u }).catch(() => { }); } else copyText(u, b); };
  setTimeout(() => { try { f.focus(); } catch (e) { } }, 300);
}
function closePlayer() { const p = document.getElementById('player'); if (p) p.remove(); }
function copyText(text, b) {
  const done = ok => { if (!b) return; const o = b.textContent; b.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(() => { b.textContent = o; }, 1400); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
  else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { } t.remove(); done(ok); }
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-copy],[data-run],[data-play],[data-showcode],[data-linkfor]'); if (!b) return;
  if (b.dataset.play && codes[b.dataset.play]) { openPlayer(codes[b.dataset.play].code); return; }
  if (b.dataset.showcode) { const c = document.getElementById('c-' + b.dataset.showcode); if (c) { c.hidden = !c.hidden; b.textContent = c.hidden ? 'Code' : 'Hide code'; } return; }
  if (b.dataset.linkfor) { if (!b.getAttribute('href')) { e.preventDefault(); const c = codes[b.dataset.linkfor]; if (c) makeLink(c.code).then(u => { b.href = u; location.href = u; }); } return; }
  if (b.dataset.copy && codes[b.dataset.copy]) copyText(codes[b.dataset.copy].code, b);
  if (b.dataset.run && codes[b.dataset.run]) runCode(codes[b.dataset.run], document.getElementById('r-' + b.dataset.run));
});

// ---------------- code runner ----------------
function runCode({ lang, code }, out) {
  out.innerHTML = '';
  if (/^(html|htm|svg)$/.test(lang)) { const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals'); f.srcdoc = code; out.appendChild(f); return; }
  const line = (t, bad) => { const d = document.createElement('div'); if (bad) d.className = 'e'; d.textContent = t; out.appendChild(d); };
  runBoxed(/^(py|python)$/.test(lang) ? 'py' : 'js', code, line);
}
// Runs code inside a sandboxed frame (its own locked-down origin, so it can't read chats, memory or saved brains),
// in a worker so an endless loop can't freeze OMEGA. Stops after 20 seconds (60 the first time Python loads).
function runBoxed(kind, code, line) {
  const id = 'b' + Math.random().toString(36).slice(2);
  const workerSrc = kind === 'py'
    ? `importScripts('https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js');(async()=>{try{const py=await loadPyodide();postMessage({v:'Python ready.'});py.setStdout({batched:t=>postMessage({v:t})});py.setStderr({batched:t=>postMessage({e:1,v:t})});const r=await py.runPythonAsync(CODE);if(r!==undefined&&r!==null)postMessage({v:'→ '+r})}catch(e){postMessage({e:1,v:String(e.message||e)})}postMessage({end:1})})();`
    : `const f=a=>a.map(x=>{try{return typeof x==='string'?x:JSON.stringify(x)}catch(e){return String(x)}}).join(' ');console.log=console.info=(...a)=>postMessage({v:f(a)});console.error=console.warn=(...a)=>postMessage({e:1,v:f(a)});(async()=>{try{await (0,eval)('(async()=>{'+CODE+'\\n})()')}catch(e){console.error(String(e))}postMessage({end:1})})();`;
  const html = `<!DOCTYPE html><script>const id=${JSON.stringify(id)},src=${JSON.stringify(workerSrc.replace('CODE', () => JSON.stringify(code))).replace(/<\/(script)/gi, '<\\/$1')};const send=m=>parent.postMessage(Object.assign({box:id},m),'*');try{const w=new Worker(URL.createObjectURL(new Blob([src],{type:'text/javascript'})));w.onmessage=e=>send(e.data);w.onerror=e=>{e.preventDefault();send({e:1,v:'Error: '+(e.message||'script error')});send({end:1})}}catch(e){send({e:1,v:"Code can't run here: "+e.message});send({end:1})}<\/script>`;
  const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts'); f.style.display = 'none'; f.srcdoc = html;
  const done = msg => { clearTimeout(t); removeEventListener('message', on); f.remove(); if (msg) line(msg[0], msg[1]); };
  const on = e => { const d = e.data; if (!d || d.box !== id || e.source !== f.contentWindow) return; if (d.end) done(['Done.']); else line(String(d.v), d.e); };
  addEventListener('message', on);
  const t = setTimeout(() => done(['Stopped after ' + (kind === 'py' && !pyLoadedOnce ? 60 : 20) + ' seconds.', 1]), (kind === 'py' && !pyLoadedOnce ? 60 : 20) * 1000);
  if (kind === 'py') { line(pyLoadedOnce ? 'Running…' : 'Loading Python (first time takes ~10 seconds)…'); pyLoadedOnce = true; } else line('Running…');
  document.body.appendChild(f);
}
let pyLoadedOnce = false;

// ---------------- time ----------------
function nowLine() {
  const d = new Date(); let tz = '', full = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { }
  try { full = d.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }); } catch (e) { full = d.toString(); }
  return `Right now it is ${full}${tz ? ' (' + tz + ')' : ''}.`;
}

// ---------------- live info (free, no keys) ----------------
// one automatic retry when a source is slow or the connection blips (not when it answers with an error)
async function fetchT(url, o = {}) {
  try { return await fetchOnce(url, o); }
  catch (e) { if (/^HTTP 4/.test(e.message) || navigator.onLine === false) throw e; return await fetchOnce(url, o); }
}
async function fetchOnce(url, { ms = 9000, type = 'json' } = {}) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return type === 'json' ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}
const WMO = { 0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'fog', 48: 'freezing fog', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle', 61: 'light rain', 63: 'rain', 65: 'heavy rain', 66: 'freezing rain', 67: 'heavy freezing rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow', 80: 'rain showers', 81: 'rain showers', 82: 'violent rain showers', 95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'thunderstorm with hail' };
const NOT_PLACE = /^(today|tonight|tomorrow|now|right now|this|next|the|my|a|an|it|me|here|there|work|school|home|night|morning|evening|afternoon|weekend|week|all|least|most|first|last|once|times?)\b/i;
const FILLER = /\s+\b(like|tho|though|bro|rn|please|pls|at all|outside|area|today|tonight|tomorrow|this weekend|this week)\b.*$/i;
function placeFrom(text) {
  const p = rawPlace(text).replace(FILLER, '').trim();
  if (p && PLACE_ALIASES[p.toLowerCase()]) return p;
  return !p || NOT_PLACE.test(p) ? (profile.city || 'Los Angeles') : p;
}
function rawPlace(text) {
  const m = text.match(/\b(?:in|for|at|near)\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?:,\s*[A-Za-z .]+)?\s*(?:\?|!|\.|$|\b(?:today|tonight|tomorrow|right now|now|this week|this weekend|later)\b)/i);
  return m ? m[0].replace(/^\s*(in|for|at|near)\s+/i, '').replace(/\s*(\?|!|\.|\b(today|tonight|tomorrow|right now|now|this week|this weekend|later)\b).*$/i, '').trim() : '';
}
const PLACE_ALIASES = { la: 'Los Angeles', 'l.a.': 'Los Angeles', nyc: 'New York', ny: 'New York', sf: 'San Francisco', dc: 'Washington', vegas: 'Las Vegas', philly: 'Philadelphia', 'the bay': 'San Francisco', oc: 'Santa Ana', sd: 'San Diego', chi: 'Chicago', atl: 'Atlanta', nola: 'New Orleans', cdmx: 'Mexico City', 'mexico city': 'Mexico City' };
async function geocode(place) {
  const raw = place.trim().replace(/[.!?]+$/, ''); const key = raw.toLowerCase();
  const name = PLACE_ALIASES[key] || raw.split(',')[0];
  // try the full name, then drop extra words from the end ("san diego california" -> "san diego")
  let rs = [], words = name.trim().split(/\s+/);
  for (let n = words.length; n >= 1 && !rs.length && n > words.length - 3; n--) {
    const g = await fetchT(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(words.slice(0, n).join(' '))}&count=8&language=en&format=json`);
    rs = (g && g.results) || [];
  }
  if (!rs.length) throw new Error('Place not found: ' + raw);
  const wantState = (raw.split(',')[1] || '').trim().toLowerCase();
  // prefer: matching state/country if given, then the biggest city (US cities get a 5x boost)
  const score = r => (wantState && ((r.admin1 || '').toLowerCase().startsWith(wantState) || (r.country_code || '').toLowerCase() === wantState) ? 1e12 : 0) + (r.population || 1000) * (r.country_code === 'US' ? 5 : 1);
  return rs.slice().sort((a, b) => score(b) - score(a))[0];
}
async function weatherData(p) {
  try {
    const w = await fetchT(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=7`);
    const c = w.current, d = w.daily;
    return { src: 'Open-Meteo', url: 'https://open-meteo.com/', now: { t: c.temperature_2m, feels: c.apparent_temperature, desc: WMO[c.weather_code] || 'mixed', wind: c.wind_speed_10m },
      days: d.time.map((date, i) => ({ date, desc: WMO[d.weather_code[i]] || 'mixed', hi: d.temperature_2m_max[i], lo: d.temperature_2m_min[i], rain: d.precipitation_probability_max[i] ?? 0 })) };
  } catch (e) {
    // backup source (3 days) when Open-Meteo is busy
    const w = await fetchT(`https://wttr.in/${p.latitude.toFixed(3)},${p.longitude.toFixed(3)}?format=j1`, { ms: 12000 });
    const c = w.current_condition[0];
    return { src: 'wttr.in', url: 'https://wttr.in/', now: { t: +c.temp_F, feels: +c.FeelsLikeF, desc: (c.weatherDesc[0].value || 'mixed').toLowerCase().trim(), wind: +c.windspeedMiles },
      days: w.weather.map(x => ({ date: x.date, desc: ((x.hourly[4] || x.hourly[0]).weatherDesc[0].value || 'mixed').toLowerCase().trim(), hi: +x.maxtempF, lo: +x.mintempF, rain: Math.max(...x.hourly.map(h => +h.chanceofrain || 0)) })) };
  }
}
async function toolWeather(text) {
  const p = await geocode(placeFrom(text));
  const w = await weatherData(p), where = [p.name, p.admin1, p.country_code].filter(Boolean).join(', ');
  const lt = text.toLowerCase(), D = w.days, idx = D.map((_, i) => i);
  const dow = i => new Date(D[i].date + 'T12:00').getDay(); // 0 = Sunday, 6 = Saturday
  const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const named = DAYS.map((n, k) => new RegExp('\\b' + n).test(lt) ? k : -1).filter(k => k >= 0);
  let want = /weekend/.test(lt) ? idx.filter(i => dow(i) === 0 || dow(i) === 6)
    : named.length ? idx.filter(i => named.includes(dow(i)))
    : /week|days|next few|forecast/.test(lt) ? idx
    : /tomorrow/.test(lt) ? [1] : [0];
  let note = '';
  if (!want.length) { want = [0]; if (/weekend/.test(lt) || named.length) note = `(The forecast from ${w.src} only goes ${D.length} days ahead, so that day isn't available yet.)`; }
  const dayName = i => i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(D[i].date + 'T12:00').toLocaleDateString('en-US', { weekday: 'long' });
  const dayLine = i => `${dayName(i)}: ${D[i].desc}, high ${Math.round(D[i].hi)}°F, low ${Math.round(D[i].lo)}°F, ${D[i].rain}% chance of rain`;
  const nowLine = `Right now: ${Math.round(w.now.t)}°F (feels like ${Math.round(w.now.feels)}°F), ${w.now.desc}, wind ${Math.round(w.now.wind)} mph`;
  const lines = [nowLine, ...want.map(dayLine), note].filter(Boolean);
  return { label: 'Weather', text: `WEATHER in ${where} (${w.src}, live). Use these exact numbers:\n` + lines.join('\n'), plain: `🌤 ${where}\n` + lines.join('\n'), sources: [{ title: w.src, url: w.url }] };
}
function parseRSS(xml, n) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.querySelectorAll('item')].slice(0, n).map(it => {
    const g = s => (it.querySelector(s) || {}).textContent || '';
    return { title: g('title').trim(), link: g('link').trim(), date: g('pubDate').trim(), source: g('source').trim() };
  }).filter(x => x.title);
}
// "Wed, 25 Nov 2026 05:01:00 GMT" -> "Nov 25" (no clock time, so the brain can't mistake it for an event time)
function shortDate(d) { const t = new Date(d); return isNaN(t) ? '' : t.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }); }
function bingLink(l) { const m = l.match(/[?&]url=([^&]+)/); return m ? decodeURIComponent(m[1]) : l; }
async function toolNews(text) {
  const q = text.replace(/\b(news|latest|headlines?|what'?s|whats|happening|give me|show me|tell me|the|a|an|about|on|any|today|tonight|yesterday|last night|right now|update|updates|in the|who|what|when|where|did|does|do|is|was|were|are|won|win|score|of|for|with|going on|please|bro|hey|yo|omega|time|start|starts|what time|tonight'?s|how|go|going|went)\b/gi, ' ').replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();
  let items = [];
  if (q.length > 2) {
    try { items = parseRSS(await fetchT(PROXY + 'https://www.bing.com/news/search?q=' + encodeURIComponent(q) + '&format=rss', { type: 'text', ms: 12000 }), 8).map(x => ({ ...x, link: bingLink(x.link) })); } catch (e) { }
    if (!items.length) { try { items = parseRSS(await fetchT(PROXY + `https://news.google.com/rss/search?q=${encodeURIComponent(q + ' when:7d')}&hl=en-US&gl=US&ceid=US:en`, { type: 'text' }), 8); } catch (e) { } }
  }
  if (!items.length && q.length > 2) throw new Error('No news found about ' + q);
  if (!items.length) { try { items = parseRSS(await fetchT('https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml', { type: 'text' }), 8).map(x => ({ ...x, source: x.source || 'New York Times' })); } catch (e) { } }
  if (!items.length) { try { items = parseRSS(await fetchT(PROXY + 'https://www.bing.com/news/search?q=' + encodeURIComponent('top stories today') + '&format=rss', { type: 'text', ms: 12000 }), 8).map(x => ({ ...x, link: bingLink(x.link) })); } catch (e) { } }
  if (!items.length) throw new Error('No news sources answered');
  const srcName = x => x.source || (() => { try { return new URL(x.link).hostname.replace(/^www\./, ''); } catch (e) { return ''; } })();
  const plain = '📰 ' + (q.length > 2 ? 'News about ' + q : 'Top headlines') + ':\n' + items.slice(0, 5).map(x => '• ' + x.title + (srcName(x) && !x.title.includes(srcName(x)) ? ' — ' + srcName(x) : '')).join('\n');
  return { label: 'News', plain, text: `NEWS${q.length > 2 ? ' about "' + q + '"' : ' (top headlines)'} (live):\n` + items.map((x, i) => `${i + 1}. ${x.title}${srcName(x) && !x.title.includes(srcName(x)) ? ' — ' + srcName(x) : ''}${x.date ? ' (published ' + shortDate(x.date) + ')' : ''}`).join('\n'), sources: items.filter(x => /^https:\/\//.test(x.link)).slice(0, 5).map(x => ({ title: srcName(x) || x.title, url: x.link })) };
}
// Pull clean results out of a search page that Jina Reader turned into markdown (works for DuckDuckGo, Yahoo and others).
const ENGINE_HOSTS = /(^|\.)(duckduckgo\.com|yahoo\.com|yimg\.com|bing\.com|google\.com|jina\.ai|startpage\.com|brave\.com|msn\.com\/search)$/i;
function unwrapUrl(u) {
  let m = u.match(/[?&]uddg=([^&]+)/); if (m) return decodeURIComponent(m[1]);
  m = u.match(/\/RU=([^/]+)\/R[KS]=/); if (m) return decodeURIComponent(m[1]);
  m = u.match(/[?&]u=a1([^&]+)/); if (m) { try { return atob(m[1].replace(/-/g, '+').replace(/_/g, '/')); } catch (e) { } }
  return u;
}
function parseSearchMarkdown(md) {
  const body = md.includes('Markdown Content:') ? md.split('Markdown Content:').pop() : md;
  const re = /\[((?:[^\[\]]|\[[^\]]*\])*)\]\((https?:\/\/[^)\s]+)\)/g;
  const res = [], seen = new Set(); let m;
  while ((m = re.exec(body)) && res.length < 6) {
    let url = unwrapUrl(m[2]); let host = '';
    try { const U = new URL(url); host = U.hostname; if (ENGINE_HOSTS.test(host) || /\.(png|jpe?g|gif|webp|ico)(\?|$)/i.test(U.pathname)) continue; } catch (e) { continue; }
    let title = m[1].replace(/!\[[^\]]*\]\([^)]*\)/g, ' ').replace(/Image \d+:?/g, ' ');
    if (title.includes('###')) title = title.split('###').pop();
    title = title.replace(/https?:\/\/\S+(\s›\s\S+)*/g, ' ').replace(/\*\*/g, '').replace(/\s+/g, ' ').trim();
    if (title.length < 12) continue;
    const key = url.replace(/[?#].*$/, '').replace(/\/$/, '');
    if (seen.has(key)) continue; seen.add(key);
    const after = body.slice(re.lastIndex, re.lastIndex + 600).split(/\n\s*\n|\[!\[|\n\s*\*\s+\[|\n\d+\.\s*\[/)[0];
    const snip = after.replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/\*\*/g, '').replace(/^\s*www\.\S+\s*$/gm, '').replace(/\s+/g, ' ').trim();
    res.push({ title, url, snip: snip.slice(0, 300) });
  }
  return res;
}
function cleanQuery(text) {
  return text.replace(/^(hey|yo|omega|bro|please|can you|could you|search( for| up)?|look up|google)\b[, ]*/gi, '').replace(/\s+/g, ' ').trim().slice(0, 200);
}
async function toolWeb(text) {
  const q = cleanQuery(text);
  const out = [], sources = [];
  const tasks = [
    (async () => { // DuckDuckGo instant answer
      const d = await fetchT(`https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1&t=omega`);
      const a = d.Answer || d.AbstractText || d.Definition;
      if (a) { out.push(`Quick answer (DuckDuckGo): ${clip(a, 700)}`); if (d.AbstractURL) sources.push({ title: d.AbstractSource || 'DuckDuckGo', url: d.AbstractURL }); }
    })(),
    (async () => { // web results: several engines read through Jina Reader, then a CORS proxy as backup
      const enc = encodeURIComponent(q);
      const engines = [
        ['DuckDuckGo', 'https://r.jina.ai/https://lite.duckduckgo.com/lite/?q=' + enc],
        ['Yahoo', 'https://r.jina.ai/https://search.yahoo.com/search?p=' + enc],
        ['DuckDuckGo', 'https://r.jina.ai/https://html.duckduckgo.com/html/?q=' + enc],
        ['DuckDuckGo', PROXY + 'https://lite.duckduckgo.com/lite/?q=' + enc, 'html'],
      ];
      let res = [], used = '';
      // race the first two, then fall back one by one
      const tryOne = async ([name, url, kind]) => {
        const t = await fetchT(url, { type: 'text', ms: 14000 });
        let r;
        if (kind === 'html') { const doc = new DOMParser().parseFromString(t, 'text/html'); r = [...doc.querySelectorAll('a.result-link, a.result__a')].slice(0, 6).map(a => { const row = a.closest('tr'); const sn = row && row.nextElementSibling ? row.nextElementSibling.textContent : ''; return { title: a.textContent.trim(), url: unwrapUrl(a.getAttribute('href') || '').replace(/^\/\//, 'https://'), snip: sn.trim() }; }).filter(x => x.title); }
        else r = parseSearchMarkdown(t);
        if (r.length < 2) throw new Error(name + ' gave no results');
        return [name, r];
      };
      try { [used, res] = await Promise.any(engines.slice(0, 2).map(tryOne)); }
      catch (e) { for (const eng of engines.slice(2)) { try { [used, res] = await tryOne(eng); break; } catch (_) { } } }
      if (!res.length) throw new Error('no results');
      out.push(`Web results (${used}):\n` + res.map((x, i) => `[${i + 1}] ${x.title} — ${clip(x.snip, 300)}`).join('\n'));
      res.forEach(x => { if (/^https:\/\//.test(x.url)) sources.push({ title: x.title, url: x.url }); });
    })(),
    (async () => { // Wikipedia
      const s = await fetchT(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(q)}&format=json&origin=*&srlimit=1`);
      const hit = s.query && s.query.search && s.query.search[0]; if (!hit) return;
      const p = await fetchT('https://en.wikipedia.org/api/rest_v1/page/summary/' + encodeURIComponent(hit.title.replace(/ /g, '_')));
      if (p.extract) { out.push(`Wikipedia — ${p.title}: ${clip(p.extract, 900)}`); sources.push({ title: 'Wikipedia: ' + p.title, url: (p.content_urls && p.content_urls.desktop && p.content_urls.desktop.page) || 'https://en.wikipedia.org/wiki/' + encodeURIComponent(p.title) }); }
    })(),
  ];
  await Promise.allSettled(tasks);
  if (!out.length) throw new Error('No web sources answered');
  return { label: 'Web', text: `WEB SEARCH for "${q}" (live):\n` + out.join('\n\n'), sources };
}
async function toolRead(url) {
  const t = await fetchT('https://r.jina.ai/' + url, { type: 'text', ms: 20000 });
  return { label: 'Page', text: `PAGE CONTENT of ${url} (read just now):\n` + clip(t.split('Markdown Content:').pop(), 4500), sources: [{ title: url.replace(/^https?:\/\/(www\.)?/, '').slice(0, 40), url }] };
}
const COINS = { bitcoin: 'bitcoin', btc: 'bitcoin', ethereum: 'ethereum', eth: 'ethereum', solana: 'solana', sol: 'solana', dogecoin: 'dogecoin', doge: 'dogecoin', xrp: 'ripple', ripple: 'ripple', cardano: 'cardano', ada: 'cardano', litecoin: 'litecoin', ltc: 'litecoin', bnb: 'binancecoin', shiba: 'shiba-inu', pepe: 'pepe' };
const TICKER = { bitcoin: 'BTC', ethereum: 'ETH', solana: 'SOL', dogecoin: 'DOGE', ripple: 'XRP', cardano: 'ADA', litecoin: 'LTC', 'shiba-inu': 'SHIB', polkadot: 'DOT', chainlink: 'LINK', avalanche: 'AVAX', 'avalanche-2': 'AVAX', tron: 'TRX', binancecoin: 'BNB', 'matic-network': 'POL', polygon: 'POL', pepe: 'PEPE', stellar: 'XLM', 'bitcoin-cash': 'BCH', uniswap: 'UNI', tether: 'USDT', 'usd-coin': 'USDC', sui: 'SUI', toncoin: 'TON', 'the-open-network': 'TON' };
async function toolCrypto(text) {
  const ids = [...new Set((text.toLowerCase().match(/\b[a-z]+\b/g) || []).map(w => COINS[w]).filter(Boolean))];
  if (!ids.length) ids.push('bitcoin', 'ethereum');
  const money = n => '$' + n.toLocaleString('en-US', { maximumFractionDigits: n < 1 ? 6 : 2 });
  let lines, src;
  try {
    const d = await fetchT(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
    lines = ids.filter(i => d[i]).map(i => `${i}: ${money(d[i].usd)} (${d[i].usd_24h_change >= 0 ? '+' : ''}${(d[i].usd_24h_change || 0).toFixed(2)}% in 24h)`);
    if (!lines.length) throw new Error('no prices');
    src = { name: 'CoinGecko', url: 'https://www.coingecko.com/' };
  } catch (e) {
    // backup when CoinGecko is busy (it limits how often it can be asked): Coinbase's public price feed
    const got = await Promise.all(ids.filter(i => TICKER[i]).map(i => fetchT(`https://api.coinbase.com/v2/prices/${TICKER[i]}-USD/spot`).then(d => `${i}: ${money(+d.data.amount)}`).catch(() => null)));
    lines = got.filter(Boolean);
    if (!lines.length) throw e;
    src = { name: 'Coinbase', url: 'https://www.coinbase.com/price' };
  }
  return { label: 'Crypto', plain: '💰 ' + lines.join('\n'), text: `CRYPTO PRICES (${src.name}, live):\n` + lines.join('\n'), sources: [{ title: src.name, url: src.url }] };
}
const CUR = ['usd', 'eur', 'gbp', 'mxn', 'cad', 'jpy', 'cny', 'inr', 'aud', 'chf', 'krw', 'brl', 'php', 'gtq', 'cop', 'nzd', 'sek', 'hkd', 'sgd', 'zar', 'pln'];
const CURNAMES = { dollar: 'usd', dollars: 'usd', euro: 'eur', euros: 'eur', pound: 'gbp', pounds: 'gbp', peso: 'mxn', pesos: 'mxn', yen: 'jpy', rupee: 'inr', rupees: 'inr', quetzal: 'gtq', quetzales: 'gtq' };
function currencyPair(text) {
  const t = text.toLowerCase().replace(/\b(dollars?|euros?|pounds?|pesos?|yen|rupees?|quetzal(?:es)?)\b/g, m => CURNAMES[m]);
  const m = t.match(/(\d[\d,]*(?:\.\d+)?)?\s*\b([a-z]{3})\b\s*(?:to|in|into|->|=)\s*\b([a-z]{3})\b/);
  if (m && CUR.includes(m[2]) && CUR.includes(m[3])) return { amt: parseFloat((m[1] || '1').replace(/,/g, '')), from: m[2].toUpperCase(), to: m[3].toUpperCase() };
  return null;
}
async function toolCurrency(text) {
  const p = currencyPair(text);
  const frank = fetchT(`https://api.frankfurter.dev/v1/latest?amount=${p.amt}&base=${p.from}&symbols=${p.to}`, { ms: 15000 }).then(d => {
    const v = d.rates && d.rates[p.to]; if (v == null) throw new Error('no rate');
    return { label: 'Currency', plain: `💱 ${p.amt} ${p.from} = ${v} ${p.to} (${d.date})`, text: `EXCHANGE RATE (Frankfurter / European Central Bank, ${d.date}): ${p.amt} ${p.from} = ${v} ${p.to}`, sources: [{ title: 'Frankfurter', url: 'https://frankfurter.dev/' }] };
  });
  const er = fetchT(`https://open.er-api.com/v6/latest/${p.from}`, { ms: 15000 }).then(d => {
    const r = d.rates && d.rates[p.to]; if (r == null) throw new Error('no rate');
    const v = Math.round(p.amt * r * 100) / 100;
    return { label: 'Currency', plain: `💱 ${p.amt} ${p.from} = ${v} ${p.to}`, text: `EXCHANGE RATE (ExchangeRate-API, ${(d.time_last_update_utc || '').slice(0, 16)}): ${p.amt} ${p.from} = ${v} ${p.to} (1 ${p.from} = ${r} ${p.to})`, sources: [{ title: 'ExchangeRate-API', url: 'https://www.exchangerate-api.com/' }] };
  });
  return Promise.any([frank, er]);
}
async function toolTime(text) {
  const m = text.match(/\b(?:in|at|for)\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?:,\s*[A-Za-z .]+)?\s*(?:\?|!|\.|$|\b(?:right now|now|today|currently)\b)/i);
  const now = new Date();
  if (!m) {
    const local = now.toLocaleString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
    return { label: 'Time', text: `TIME (this device's clock): ${local}`, plain: `🕒 It's ${local}.`, answer: `It's ${local}.`, sources: [] };
  }
  const place = m[0].replace(/^\s*(in|at|for)\s+/i, '').replace(/\s*\b(right now|now|today|currently)\b.*$/i, '').replace(/[?!.]+$/, '').replace(FILLER, '').trim();
  if (!place || (NOT_PLACE.test(place) && !PLACE_ALIASES[place.toLowerCase()])) return toolTime('what time is it');
  const p = await geocode(place);
  if (!p.timezone) throw new Error('No time zone for ' + p.name);
  const t = now.toLocaleString('en-US', { timeZone: p.timezone, weekday: 'long', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const where = [p.name, p.admin1, p.country_code].filter(Boolean).join(', ');
  return { label: 'Time', text: `TIME in ${where} right now (time zone ${p.timezone}): ${t}`, plain: `🕒 In ${where} it's ${t}.`, answer: `In ${where}, it's ${t}.`, sources: [] };
}
// only real "what's the time/date" questions — not "what time does the game start" or "what day does GTA 6 come out"
function isClockQuestion(t) {
  t = t.replace(/[?!.]+/g, ' ').replace(/\s+/g, ' ').trim();
  if (/\b(what time|what day|which day|what date)\s+(does|do|did|is the|are|will|should|can|was|were|starts?|opens?|closes?)\b/.test(t) && !/\b(what time is it|what day is it|what day is today)\b/.test(t)) return false;
  return /\b(what time is it|what'?s the time|whats the time|what is the time|what time it is|time is it|current time|time right now|what'?s the time now|what day is it|what day is today|what'?s today'?s date|what is today'?s date|what'?s the date|whats the date|what is the date|today'?s date|date today|what date is it|what'?s today|what is today|what year is it|what month is it)\b/.test(t)
    || /^(what time|time|clock|current time|local time|what'?s the time) (in|at) [a-z]/.test(t) || /^(what time|the time|time)$/.test(t);
}
// ---------------- pictures (free online image maker, Pollinations) ----------------
function pictureRequest(text) {
  const t = text.trim();
  if (!/\b(draw|paint|sketch|illustrate|picture|image|photo|pic|wallpaper|logo|drawing|artwork|poster)\b/i.test(t)) return null;
  if (!/^(?:yo |hey |bro |omega |ok |please )*(?:can you |could you |please |i want you to |i want |i need )?(?:make|create|generate|draw|paint|sketch|design|give|show|illustrate|do)\b|^(?:a |an )?(?:picture|image|photo|drawing|wallpaper|logo|poster) of\b|^draw\b/i.test(t)) return null;
  if (/\b(code|html|website|app|game|svg|css|python|javascript)\b/i.test(t)) return null;
  const d = t.replace(/^(?:yo |hey |bro |omega |ok |please )*(?:can you |could you |please |i want you to |i want |i need )?(?:make|create|generate|draw|paint|sketch|design|give|show|illustrate|do)(?: me| us)?\s*/i, '')
    .replace(/^(?:a |an |some )?(?:picture|image|photo|pic|drawing|painting|sketch|illustration|artwork|wallpaper|poster)s?\s*(?:of|showing|with)?\s*/i, '').replace(/[?!.]+$/, '').trim();
  return d.length >= 2 ? d : null;
}
const BLOCKED_PIC = /\b(nude|naked|nsfw|porn|sex|sexy|explicit|lingerie|gore|blood|dead body|kill|child|kid|minor|teen)\b/i;
const picCache = new Map();
async function picBlob(url) {
  if (picCache.has(url)) return picCache.get(url);
  for (let i = 0; i < 4; i++) {
    try {
      const c = new AbortController(), t = setTimeout(() => c.abort(), 90000);
      const r = await fetch(url, { signal: c.signal }).finally(() => clearTimeout(t));
      if (r.ok && /^image\//.test(r.headers.get('content-type') || '')) { const u = URL.createObjectURL(await r.blob()); picCache.set(url, u); return u; }
      if (r.status !== 503 && r.status !== 429 && r.status < 500) throw new Error('HTTP ' + r.status);
    } catch (e) { if (i === 3 || /HTTP 4/.test(e.message)) throw e; }
    await sleep(10000); // the free service is busy: wait and try again
  }
  throw new Error('the picture service is busy');
}
async function makePicture(desc, ui, turn) {
  if (BLOCKED_PIC.test(desc)) { turn.text = "I can't make that kind of picture. Try something else, like a car, a city at night, or a logo idea."; render(ui.ans, turn.text); return; }
  if (navigator.onLine === false) { turn.text = 'Making pictures needs the internet. Connect and ask again.'; render(ui.ans, turn.text); return; }
  const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(desc.slice(0, 300))}?width=768&height=768&nologo=true&safe=true&seed=${Math.floor(Math.random() * 1e9)}`;
  ui.work.hidden = false; ui.wt.textContent = 'Making your picture… (the free image service can take up to a minute)';
  turn.text = `Here's your picture: **${desc}**\n\n![${desc.replace(/[\[\]]/g, '')}](${url})`;
  render(ui.ans, turn.text); toBottom();
  try { await picBlob(url); ui.wt.textContent = 'Made with Pollinations (free online image service)'; hydratePics(ui.ans); turn.sources.push({ title: 'Pollinations', url: 'https://pollinations.ai/' }); }
  catch (e) { ui.work.hidden = true; turn.text = `I couldn't make the picture right now (${e.message}). The free image service is busy. Tap ↻ to try again in a minute.`; render(ui.ans, turn.text); }
}
// pictures are fetched (not linked) so they also work in the multi-core page mode
function hydratePics(root) {
  root.querySelectorAll('.genimg:not([data-done])').forEach(g => {
    g.dataset.done = '1';
    picBlob(g.dataset.src).then(u => { g.innerHTML = `<img src="${u}" alt="${esc(g.dataset.alt)}"><div class="picbtns"><a class="btn" href="${u}" download="omega-picture.jpg">⤓ Save</a></div>`; })
      .catch(() => { g.innerHTML = '<div class="ph">The picture could not load. Tap ↻ to make a new one.</div>'; });
  });
}
// exact math for simple calculations ("what's 15% of 240", "347 times 29", "(12+8)/4")
const UNITS = { mi: ['km', 1.609344, 'miles', 'kilometers'], km: ['mi', 1 / 1.609344, 'kilometers', 'miles'], lb: ['kg', 0.45359237, 'pounds', 'kilograms'], kg: ['lb', 1 / 0.45359237, 'kilograms', 'pounds'], ft: ['m', 0.3048, 'feet', 'meters'], m: ['ft', 1 / 0.3048, 'meters', 'feet'], in: ['cm', 2.54, 'inches', 'centimeters'], cm: ['in', 1 / 2.54, 'centimeters', 'inches'], oz: ['g', 28.349523125, 'ounces', 'grams'], g: ['oz', 1 / 28.349523125, 'grams', 'ounces'], gal: ['l', 3.785411784, 'gallons', 'liters'], l: ['gal', 1 / 3.785411784, 'liters', 'gallons'], yd: ['m', 0.9144, 'yards', 'meters'], mph: ['kmh', 1.609344, 'mph', 'km/h'], kmh: ['mph', 1 / 1.609344, 'km/h', 'mph'] };
const UNIT_WORDS = [[/\b(miles?|mi)\b/, 'mi'], [/\b(kilometers?|kilometres?|kms?)\b/, 'km'], [/\b(pounds?|lbs?)\b/, 'lb'], [/\b(kilograms?|kilos?|kgs?)\b/, 'kg'], [/\b(feet|foot|ft)\b/, 'ft'], [/\b(meters?|metres?)\b/, 'm'], [/\b(inches|inch|in)\b/, 'in'], [/\b(centimeters?|centimetres?|cm)\b/, 'cm'], [/\b(ounces?|oz)\b/, 'oz'], [/\b(grams?|g)\b/, 'g'], [/\b(gallons?|gal)\b/, 'gal'], [/\b(liters?|litres?|l)\b/, 'l'], [/\b(yards?|yd)\b/, 'yd'], [/\bmph\b/, 'mph'], [/\b(km\/h|kph|kmh)\b/, 'kmh']];
function unitOf(w) { for (const [re, u] of UNIT_WORDS) if (re.test(w)) return u; return null; }
function quickConvert(text) {
  const t = text.toLowerCase().replace(/,(?=\d{3})/g, '');
  let m = t.match(/(-?\d+(?:\.\d+)?)\s*(?:°|degrees?)?\s*(f|fahrenheit|c|celsius|centigrade)\b.*?\b(?:to|in|into)\s*(?:°|degrees?)?\s*(f|fahrenheit|c|celsius)\b/);
  if (m) { const v = +m[1], from = m[2][0], to = m[3][0]; if (from === to) return null; const r = from === 'f' ? (v - 32) * 5 / 9 : v * 9 / 5 + 32; return `${v}°${from.toUpperCase()} = ${fmtNum(Math.round(r * 10) / 10)}°${to.toUpperCase()}`; }
  m = t.match(/(-?\d+(?:\.\d+)?)\s*([a-z\/]+(?:\s[a-z]+)?)\s+(?:to|in|into|=)\s+([a-z\/]+)/);
  if (!m) return null;
  const a = unitOf(m[2]), b = unitOf(m[3]); if (!a || !b || UNITS[a][0] !== b) return null;
  const [, k, an, bn] = UNITS[a]; return `${fmtNum(+m[1])} ${an} = ${fmtNum(Math.round(+m[1] * k * 100) / 100)} ${bn}`;
}
function quickMath(text) {
  const conv = quickConvert(text); if (conv) return conv;
  let t = text.toLowerCase().replace(/,(?=\d{3})/g, '').replace(/[?!=]+/g, ' ').trim();
  t = t.replace(/^(yo|hey|bro|omega|ok|okay)[, ]+/g, '').replace(/^(what'?s|whats|what is|how much is|calculate|calc|compute|solve)\s+/, '').replace(/\s+(equal|equals|be)$/, '');
  const pct = t.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+(\d+(?:\.\d+)?)$/);
  if (pct) { const v = +pct[1] / 100 * +pct[2]; return `${pct[1]}% of ${pct[2]} is ${fmtNum(v)}.`; }
  const e = t.replace(/\b(times|multiplied by|x)\b|×/g, '*').replace(/\b(divided by|over)\b|÷/g, '/').replace(/\bplus\b/g, '+').replace(/\bminus\b/g, '-').replace(/\bsquared\b/g, '**2').replace(/\bcubed\b/g, '**3').replace(/\^/g, '**').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(e) || !/\d[+\-*/]+[\d(]|\*\*\d/.test(e) || e.length > 60) return null;
  try { const v = Function('"use strict";return (' + e + ')')(); if (typeof v !== 'number' || !isFinite(v)) return null; return `${e.replace(/\*\*/g, '^').replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/(\d)-/g, '$1 - ')} = ${fmtNum(v)}`; } catch (_) { return null; }
}
const fmtNum = v => Math.abs(v) >= 1e15 ? v.toExponential(4) : (+v.toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 6 });
function decideTools(text) {
  const t = text.toLowerCase(), tools = [];
  const url = ((text.match(/https?:\/\/[^\s)<>"']+/) || [])[0] || '').replace(/[.,!?;:]+$/, '');
  if (url) tools.push(['read', () => toolRead(url)]);
  if (isClockQuestion(t)) tools.push(['time', () => toolTime(text)]);
  if (/\b(weather|temperature|forecast|rain(ing|y)?|snow(ing|y)?|humid|humidity|how hot|how cold|degrees outside|sunny|cloudy|windy|thunderstorms?|umbrella|jacket)\b/.test(t) && !/\b(song|album|lyrics|movie|film|band|rapper|track)\b/.test(t) || /\b(outside|outdoors?|beach|park|hike|bbq|barbecue|pour concrete|roofing|paint the)\b/.test(t) && /\b(today|tomorrow|tonight|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this week)\b/.test(t)) tools.push(['weather', () => toolWeather(text)]);
  if (/\b(bitcoin|btc|ethereum|eth|crypto|solana|dogecoin|doge|xrp|cardano|litecoin|shiba|pepe)\b/.test(t) && /\b(price|worth|cost|how much|value|at|today|now|up|down)\b/.test(t)) tools.push(['crypto', () => toolCrypto(text)]);
  if (currencyPair(text)) tools.push(['currency', () => toolCurrency(text)]);
  if (/\b(news|headlines?|what'?s happening|what happened)\b/.test(t)) tools.push(['news', () => toolNews(text)]);
  // asking OMEGA to make/build/write something: answer with its own work, don't search the web (unless asked to search)
  const build = /\b(make|build|write|create|code|program|generate|design|draw|develop)\b/.test(t) && !/\b(search|look up|google|news|latest|price)\b/.test(t);
  // questions about the user themselves are answered from memory, not the web
  const personal = /\b(my name|my city|my business|my job|my age|my birthday|about me|who am i|do you (know|remember) (me|my)|what do you know about me|my favorite|my girlfriend|my boyfriend|my wife|my husband|my mom|my dad|my kids?)\b/.test(t) || /\b(when|what|where|how|who) (do|did|am|was|should) i\b.*\bmy\b/.test(t);
  if (!tools.length && !url && !build && !personal) {
    const words = t.split(/\s+/).filter(Boolean).length;
    const live = /\b(today|tonight|yesterday|tomorrow|this (week|weekend|month|year)|right now|currently|current|latest|recent|newest|new|upcoming|202[4-9]|price|prices|cost|how much|who won|score|scores|how did|game (last night|tonight|today|yesterday)|release date|released|open now|hours|near me|stock|search|look up|google|out yet|is .+ out|when do|when are|when'?s|next game|play next|plays next|playing next|schedule|tonight'?s game|come out|comes out|coming out|release|drops?|launch(es|ing)?|premieres?|what day|what time|who is|who's|what is|what's|when is|when does|when did|where is|is .+ still|did .+ (die|win|lose)|ceo of|president|election|update|who (wrote|painted|invented|discovered|founded|directed|sang|created|built|made|starred|plays|played)|plot of|summary of|history of|biography|tell me about (?!yourself|you\b|me\b))\b/.test(t);
    const casual = /^(hi|hey|yo|sup|wassup|thanks|thank you|ok|okay|lol|lmao|bet|cool|nice|good (morning|night|afternoon))\b/.test(t) && words <= 5;
    const sports = /\b(won|win|score|scores|beat|lost|game|games|match|fight|final|play|plays|playing|schedule)\b/.test(t) && !/\b(video ?games?|ps5|xbox|switch|steam|gta|coming out|come out|release|released)\b/.test(t);
    // sports: latest news only (web results often show older games); web search only if no news is found
    const schedule = sports && /\b(what time|when|start|starts|kick ?off|tip ?off|tonight|schedule|next|channel|watch)\b/.test(t);
    if (live && !casual && words >= 2) {
      if (schedule) { tools.push(['news', () => toolNews(text)]); tools.push(['web', () => toolWeb(text)]); } // game times are often only on the web
      else tools.push(sports ? ['news', () => toolNews(text).catch(() => toolWeb(text))] : ['web', () => toolWeb(text)]);
    }
  }
  return tools;
}

// ---------------- brain ----------------
const modelOf = key => MODELS.find(m => m.key === key) || VISION.find(m => m.key === key) || MODELS[0];
async function gpuCheck() {
  if (!('gpu' in navigator) || !navigator.gpu) return { ok: false, why: 'No WebGPU in this browser.' };
  try {
    const a = await navigator.gpu.requestAdapter();
    if (!a) return { ok: false, why: 'The graphics chip is not available right now.' };
    hasF16 = a.features && a.features.has('shader-f16');
    return { ok: true, f16: hasF16 };
  } catch (e) { return { ok: false, why: 'WebGPU error: ' + e.message }; }
}
function wasmCheck() { try { return typeof WebAssembly === 'object' && WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0])); } catch (e) { return false; } }
async function getWebLLM() { if (!webllm) webllm = await import(WEBLLM_URL); return webllm; }
async function getWllama() { if (!wllamaMod) wllamaMod = await import(WLLAMA_URL); return wllamaMod; }
function modelId(m) { return hasF16 === false ? m.f32 : m.f16; }
async function isCached(m) {
  try {
    if (m.engine === 'cpu') { const { Wllama } = await getWllama(); const w = new Wllama({ default: WLLAMA_WASM }, { suppressNativeLog: true, allowOffline: true }); const list = await w.cacheManager.list(); const has = f => list.some(e => (e.metadata && e.metadata.originalURL || e.name || '').includes(f)); return has(m.file) && (!m.mmproj || has(m.mmproj)); }
    const g = await gpuCheck(); if (!g.ok) return false; const w = await getWebLLM(); return await w.hasModelInCache(modelId(m));
  } catch (e) { return false; }
}
function setStatus(t) { const s = $('#brainStatus'); s.textContent = t || ''; s.hidden = !t; }

// Each engine is wrapped in the same small interface: chat(), stop(), unload()
// ---------------- device detection: pick the best brain and settings for this phone / tablet / computer ----------------
let deviceCache = null;
const sizeText = mb => mb >= 1000 ? (mb / 1000).toFixed(1) + ' GB' : mb + ' MB';
const kindWord = k => k === 'Computer' ? 'computer' : k.replace(/^Android /, 'Android ');
async function detectDevice() {
  if (deviceCache) return deviceCache;
  const cores = navigator.hardwareConcurrency || 1, memGB = navigator.deviceMemory || null;
  const kind = IS_IPAD ? 'iPad' : IS_IOS ? 'iPhone' : /Android/i.test(navigator.userAgent) ? (/Mobile/i.test(navigator.userAgent) ? 'Android phone' : 'Android tablet') : 'Computer';
  const gpu = IS_IOS ? { ok: false, why: 'Not used on iPhone/iPad (Safari would crash)' } : await gpuCheck();
  let rec, why;
  if (IS_PHONE) { rec = 'cpu-lfm2.5-1.2b'; why = `LFM2.5 1.2B is built for phones: it scored best in OMEGA's tests and fits ${IS_IOS ? "Safari's memory limit" : 'phone memory'} comfortably.`; }
  else if (gpu.ok) { rec = 'gpu-qwen3-1.7b'; why = 'This computer has a graphics chip, so fast mode makes answers much quicker.'; }
  else { rec = cores >= 4 ? 'cpu-qwen3-1.7b' : 'cpu-qwen3-0.6b'; why = cores >= 4 ? `No graphics chip available, but ${cores} processor cores can run the smarter brain.` : 'A light brain fits this computer best.'; }
  deviceCache = { kind, cores, memGB, gpu, rec, why };
  return deviceCache;
}
// speed/memory tuning for llama.cpp (overridable for testing via localStorage omega.tune)
function brainTuning() { const t = store.get('tune', null); return t || { flash_attn: true }; } // flash attention: a little faster, less memory
function visionKey() { return settings.vision || (!IS_PHONE && (navigator.hardwareConcurrency || 1) >= 4 ? 'vis-lfm2-1.6b' : 'vis-lfm2-450m'); }
// how many processor cores the brain uses (only possible when the page is cross-origin isolated)
function brainThreads() {
  const c = navigator.hardwareConcurrency || 1;
  if (!window.crossOriginIsolated || c < 2) return 1;
  return IS_PHONE ? Math.min(4, Math.max(2, c - 2)) : Math.min(8, Math.max(2, c - 1));
}
async function startCpuBrain(m, cb, saved) {
  if (!wasmCheck()) throw new Error('This browser cannot run WebAssembly.');
  const { Wllama } = await getWllama();
  const w = new Wllama({ default: WLLAMA_WASM }, { suppressNativeLog: true, allowOffline: true });
  // load straight from the file address (skips Hugging Face's file-list lookup, so a saved brain opens with no internet)
  await w.loadModelFromUrl({ url: `https://huggingface.co/${m.repo}/resolve/main/${m.file}`, ...(m.mmproj ? { mmprojUrl: `https://huggingface.co/${m.repo}/resolve/main/${m.mmproj}` } : {}) }, {
    n_ctx: m.vision ? 4096 : CTX, n_gpu_layers: 0, n_batch: 512, n_threads: brainThreads(), ...brainTuning(),
    progressCallback: ({ loaded, total }) => cb({ progress: total ? loaded / total : 0, text: saved ? `Loading from this ${DEVICE}… ${total ? Math.round(loaded / total * 100) : 0}%` : total ? `Downloading ${Math.round(loaded / 1e6)} of ${Math.round(total / 1e6)} MB` : 'Downloading…' }),
  });
  cb({ progress: 1, text: 'Starting up…' });
  let abort = null;
  return {
    kind: 'cpu',
    async chat(messages, o) {
      abort = new AbortController(); let out = '';
      try {
        const it = await w.createChatCompletion({ messages, stream: true, max_tokens: o.maxTokens, temperature: o.temperature, top_p: o.think ? 0.95 : 0.9, repeat_penalty: o.think ? 1.05 : 1.12, repeat_last_n: 128, abortSignal: abort.signal, ...(m.thinking ? { chat_template_kwargs: { enable_thinking: !!o.think } } : {}) });
        let reason = '', text = '';
        for await (const c of it) {
          const d = (c.choices && c.choices[0] && c.choices[0].delta) || {};
          reason += d.reasoning_content || ''; text += d.content || '';
          out = reason ? '<think>' + reason + (text ? '</think>' : '') + text : text; // keep thoughts and answer apart
          o.onText(out); if (stopFlag) { abort.abort(); break; }
        }
      } catch (e) { if (!(abort.signal.aborted || /abort/i.test(String(e && (e.name || e.message))))) throw e; }
      return out;
    },
    stop() { try { abort && abort.abort(); } catch (e) { } },
    async unload() { try { await w.exit(); } catch (e) { } },
  };
}
async function startGpuBrain(m, cb) {
  const g = await gpuCheck(); if (!g.ok) throw new Error(g.why);
  const w = await getWebLLM(); const id = modelId(m); const chatOpts = { context_window_size: CTX };
  let e;
  try { e = await w.CreateWebWorkerMLCEngine(new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }), id, { initProgressCallback: cb }, chatOpts); }
  catch (err) { if (isGpuCrash(err)) throw err; e = await w.CreateMLCEngine(id, { initProgressCallback: cb }, chatOpts); }
  return {
    kind: 'gpu',
    async chat(messages, o) {
      let out = '';
      const stream = await e.chat.completions.create({ messages, stream: true, temperature: o.temperature, top_p: 0.9, max_tokens: o.maxTokens, ...(m.thinking ? { extra_body: { enable_thinking: !!o.think } } : {}) });
      for await (const ch of stream) { out += (ch.choices && ch.choices[0] && ch.choices[0].delta && ch.choices[0].delta.content) || ''; o.onText(out); if (stopFlag) break; }
      return out;
    },
    stop() { try { e.interruptGenerate(); } catch (_) { } },
    async unload() { try { await e.unload(); } catch (_) { } },
  };
}
let loadingKey = null;
function loadBrain(key, onProgress) {
  if (loading) return loadingKey === key || !key ? loading : Promise.reject(new Error('OMEGA is already loading a brain. Wait a moment and try again.'));
  loadingKey = key;
  loading = (async () => {
    if (!fitsDevice(modelOf(key))) key = PHONE_DEFAULT;
    let tries = 0, downloading = null;
    while (true) {
      const m = modelOf(key);
      if (downloading === null) downloading = !(await isCached(m).catch(() => false)); // the user already agreed to a download
      const cb = p => { onProgress && onProgress(p, m); setStatus(p.progress >= 1 ? `Starting ${m.name}…` : `Loading ${m.name}… ${Math.round((p.progress || 0) * 100)}%`); };
      setInflight({ model: key, t: Date.now(), what: 'load' });
      try {
        if (engine) { await engine.unload(); engine = null; loadedKey = null; }
        engine = m.engine === 'cpu' ? await startCpuBrain(m, cb, !downloading || tries > 0 && await isCached(m).catch(() => false)) : await startGpuBrain(m, cb);
        loadedKey = key; if (!m.vision) { settings.model = key; store.set('settings', settings); } setInflight(null);
        try { if (navigator.storage && navigator.storage.persist) await navigator.storage.persist(); } catch (e) { }
        setStatus(''); refreshWelcome();
        return engine;
      } catch (err) {
        setInflight(null); engine = null; loadedKey = null;
        // graphics chip missing/crashed, or out of memory: fall back to a lighter brain automatically
        const next = m.vision ? null : LIGHTER[key] || (m.engine === 'gpu' ? (IS_PHONE ? PHONE_DEFAULT : 'cpu-llama-1b') : null);
        const nextOk = next && (downloading || await isCached(modelOf(next)).catch(() => false)); // never start a surprise download
        if (nextOk && tries < 4 && (isGpuCrash(err) || m.engine === 'gpu')) { tries++; key = next; onProgress && onProgress({ progress: 0, text: `${m.name} couldn't start here, switching to ${modelOf(next).name}…` }, modelOf(next)); continue; }
        throw err;
      }
    }
  })();
  loading.catch(() => { setStatus(''); }).finally(() => { loading = null; loadingKey = null; });
  return loading;
}
async function dropEngine() { const e = engine; engine = null; loadedKey = null; try { e && await e.unload(); } catch (_) { } }
const thoughtsOf = t => { const m = String(t).match(/<think>([\s\S]*?)(?:<\/think>|$)/); return m ? m[1].trim() : ''; };
const thinkOn = () => $('#thinkChip') && $('#thinkChip').getAttribute('aria-pressed') === 'true';
function showThoughts(ui, out, t0, done) {
  const th = thoughtsOf(out); if (!th) return;
  const finished = done || /<\/think>/.test(out), secs = Math.max(1, Math.round((Date.now() - t0) / 1000));
  if (!ui.think.dataset.secs && finished) ui.think.dataset.secs = secs;
  ui.think.hidden = false;
  ui.think.innerHTML = finished ? `<details><summary>💡 Thought for ${ui.think.dataset.secs || secs}s</summary><div class="tbody"></div></details>` : `<div class="thinking">💡 Thinking<span class="dots"></span> <span class="hint">${th.split(/\s+/).length} words</span></div>`;
  const b = ui.think.querySelector('.tbody'); if (b) b.textContent = th;
}
const thinkStrip = t => t.replace(/<think>[\s\S]*?<\/think>\s*/g, '').replace(/<think>[\s\S]*$/, '');

// ---------------- prompt ----------------
function systemPrompt(codeMode, hasLive) {
  const name = profile.name || 'the user';
  const who = profile.name || 'the user';
  // facts are saved in the user's words ("my team is the Rams"); rewrite them so the brain doesn't think "my" means itself
  const third = x => String(x).replace(/\bI am\b|\bI'm\b/gi, who + ' is').replace(/\bI have\b|\bI've\b/gi, who + ' has').replace(/\bmy\b/gi, who + "'s").replace(/\bmine\b/gi, who + "'s").replace(/\bI\b/g, who).replace(/\bme\b/gi, who);
  const f = facts.slice(-30).map(x => '- ' + third(x)).join('\n');
  const l = lessons.slice(-6).map(x => `- When asked "${clip(x.q, 120)}", ${name} said: ${clip(x.fix, 300)}`).join('\n');
  return [
    `You are OMEGA, ${name}'s personal AI assistant. You are an AI, not a person, so don't pretend to have a body, a personal life or human experiences. Happily help with anything ${name} asks: questions, advice, stories, jokes, scripts, captions, plans and code. Your name is OMEGA: if asked who or what you are, say you are OMEGA, ${name}'s own AI that runs right on their device (not ChatGPT, not Claude). Talk in a casual, warm, direct way, like a helpful friend texting back. Reply to exactly what ${name} said. Short answers for simple stuff, more detail when it's needed.`,
    profile.style ? `How ${name} wants you to talk: ${profile.style}` : '',
    profile.about ? `About ${name}: ${profile.about}` : '',
    f ? `Facts about ${name} (when ${name} asks about "my ...", answer with "your ..."):\n${f}` : '',
    l ? `Feedback ${name} gave you before (follow it):\n${l}` : '',
    hasLive ? 'The message includes LIVE INFO fetched from the internet just now: answer from it, copy numbers, times and names exactly as written, and name the source.' : (store.get('promptVariant', '') === 'b' ? 'Answer common-knowledge questions directly. If you really do not know something, say so instead of making it up.' : 'If you do not know something, say so instead of making it up.'),
    codeMode ? 'CODING MODE: write complete, working code in fenced code blocks with a language tag (```html, ```javascript, ```python). For a game, app, website or anything visual: reply with ONE short sentence, then ONE complete self-contained ```html file (all CSS and JavaScript inside it, no outside files or images). It is played on a phone: fill the screen, and make taps/touches work (touchstart) as well as clicks and keys. Keep it simple so it is finished and works. Do not explain the code after it. For plain scripts, JavaScript runs in a worker (use console.log).' : '',
  ].filter(Boolean).join('\n\n');
}
function historyFor(maxChars) {
  const turns = (chat && chat.turns) || [];
  const out = []; let used = 0;
  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i]; const c = clip(String(t.text || '').replace(/```[\s\S]*?(```|$)/g, '[code]'), 2500); used += c.length;
    if (used > maxChars) break;
    out.unshift({ role: t.role === 'user' ? 'user' : 'assistant', content: c });
  }
  return out;
}

// iPhone keyboard: Safari doesn't shrink the page when the keyboard opens, so size the app to the visible area
if (window.visualViewport) {
  const vv = window.visualViewport;
  const fitVV = () => { if (vv.scale > 1.01) return; /* pinch-zoomed: leave the layout alone */ document.documentElement.style.setProperty('--vh', Math.round(vv.height) + 'px'); if (vv.offsetTop > 0 || scrollY > 0) scrollTo(0, 0); };
  vv.addEventListener('resize', fitVV); vv.addEventListener('scroll', fitVV); fitVV();
}
// ---------------- UI: chat ----------------
const col = $('#col'), scroller = $('#scroll'), inp = $('#input'), sendBtn = $('#send');
let stick = true; scroller.addEventListener('scroll', () => { stick = scroller.scrollHeight - scroller.scrollTop - scroller.clientHeight < 80; });
const toBottom = f => { if (f || stick) scroller.scrollTop = scroller.scrollHeight; };
const SUGG = [
  ['Find more customers', 'for my construction business without paying for ads'],
  ["What's the weather", 'this weekend?'],
  ['Write me a script', 'for a 30-second GTA 6 clip'],
  ["What's in the news", 'today?'],
];
function greet() { const h = new Date().getHours(); return h < 5 ? 'Up late' : h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'; }
async function refreshWelcome() {
  if (chat) return;
  const first = profile.name ? ', ' + esc(profile.name.split(' ')[0]) : '';
  let setup = '';
  if (!engine) {
    if (!loading) await pickSavedBrain();
    const m = modelOf(settings.model);
    const cached = await isCached(m);
    const lighter = (() => { let k = LIGHTER[m.key]; while (k && !fitsDevice(modelOf(k))) k = LIGHTER[k]; return k ? modelOf(k) : null; })();
    if (crashBlocked && !loading) setup = `<div class="setup"><h2>OMEGA's brain crashed twice</h2><p>Your ${DEVICE} ran out of memory while ${esc(m.name)} was running. Close other apps and tabs, then try again${lighter ? `, or switch to ${esc(lighter.name)} (smaller, about ${sizeText(lighter.sizeMB)} download)` : ''}.</p><button class="btn pri" id="crashRetry">Try again</button>${lighter ? ` <button class="btn" id="crashLighter">Use ${esc(lighter.name)}</button>` : ''}<div class="bar" id="setupBarWrap" hidden><div class="fill" id="setupBar"></div></div><p class="hint" id="setupText" style="margin-top:8px"></p></div>`;
    else if (!wasmCheck()) setup = `<div class="setup"><h2>This browser can't run OMEGA's brain</h2><p>Use Safari on iPhone or Chrome on a computer. Live info still works: ask about weather, news or the time.</p></div>`;
    else if (cached || loading) { setup = `<div class="setup"><h2>Waking up OMEGA…</h2><p>Loading ${esc(m.name)} from this device. This takes a few seconds.</p><div class="bar" id="setupBarWrap"><div class="fill" id="setupBar"></div></div><p class="hint" id="setupText" style="margin-top:8px"></p></div>`; if (!loading) loadBrain(m.key, setupProgress).catch(e => showSetupError(e)); }
    else setup = `<div class="setup"><h2>One-time setup</h2>${settings.auto && deviceCache ? `<p style="margin-bottom:6px"><b>Picked for your ${esc(kindWord(deviceCache.kind))}:</b> ${esc(m.name)}. ${esc(deviceCache.why)}</p>` : ''}<p>OMEGA's brain (${esc(m.name)}) downloads to this device once, then runs offline. It's about ${sizeText(m.sizeMB)}, so use Wi-Fi and keep this page open while it downloads.</p><button class="btn pri" id="setupGo">Download OMEGA's brain</button><div class="bar" id="setupBarWrap" hidden><div class="fill" id="setupBar"></div></div><p class="hint" id="setupText" style="margin-top:8px"></p></div>`;
  }
  let upgrade = '';
  if (engine && settings.auto && !modelOf(loadedKey).vision) {
    const d = await detectDevice(), r = modelOf(d.rec);
    const saved = await isCached(r).catch(() => false);
    if ((RANK[d.rec] || 0) > (RANK[loadedKey] || 0) && settings.skipRec !== d.rec) upgrade = `<div class="setup" style="margin-bottom:14px"><p style="margin:0 0 10px"><b>Your ${esc(kindWord(d.kind))} can run a smarter brain:</b> ${esc(r.name)} (${saved ? `already saved on this ${DEVICE}, switches in seconds` : 'about ' + sizeText(r.sizeMB)}). ${esc(d.why)}</p><button class="btn pri" id="recGo">${saved ? 'Switch' : 'Get'} ${esc(r.name)}</button> <button class="btn" id="recSkip">Not now</button><div class="bar" id="recBarWrap" hidden><div class="fill" id="recBar"></div></div><p class="hint" id="recText" style="margin-top:8px"></p></div>`;
  }
  if (chat) return;
  col.innerHTML = `${crashNote ? `<div class="err" style="max-width:520px;margin:8px auto">${esc(crashNote)}</div>` : ''}<div class="welcome"><div class="big">Ω</div><h1>${esc(greet())}${first}</h1><p>${engine ? 'What do you want to get done?' : `Your own AI, running on your ${DEVICE}.`}</p>${engine ? `<p class="hint" style="margin:-10px 0 14px">✓ ${esc(modelOf(loadedKey).name)} is saved on this ${DEVICE}, so it opens instantly next time, even offline.</p>` : ''}${engine && IS_IOS && !STANDALONE ? `<div class="setup" style="margin-bottom:14px"><p style="margin:0"><b>Tip:</b> tap Share → <b>Add to Home Screen</b>. Safari can clear saved website data after 7 days without a visit, but not for Home Screen apps. (The Home Screen app downloads the brain once more the first time you open it.)</p></div>` : ''}${setup}${upgrade}${engine ? `<div class="sugg">${SUGG.map((s, i) => `<button data-s="${i}"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></button>`).join('')}</div>` : ''}</div>`;
  col.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const s = SUGG[+b.dataset.s]; inp.value = s[0] + ' ' + s[1]; grow(); inp.focus(); });
  const cr = $('#crashRetry'), cl = $('#crashLighter');
  if (cr) cr.onclick = () => { crashBlocked = false; store.set('crashes', null); refreshWelcome(); };
  if (cl) cl.onclick = () => { let k = LIGHTER[settings.model]; while (k && !fitsDevice(modelOf(k))) k = LIGHTER[k]; crashBlocked = false; store.set('crashes', null); settings.model = k; store.set('settings', settings); cl.disabled = cr.disabled = true; $('#setupBarWrap').hidden = false; loadBrain(k, setupProgress).catch(e => showSetupError(e)); };
  const rg = $('#recGo'), rs = $('#recSkip');
  if (rs) rs.onclick = () => { settings.skipRec = deviceCache && deviceCache.rec; store.set('settings', settings); refreshWelcome(); };
  if (rg) rg.onclick = () => {
    if (busy || loading) return; rg.disabled = rs.disabled = true; $('#recBarWrap').hidden = false;
    loadBrain(deviceCache.rec, p => { $('#recBar').style.width = Math.round((p.progress || 0) * 100) + '%'; $('#recText').textContent = p.text || ''; })
      .catch(e => { const t = $('#recText'); if (t) t.textContent = 'Could not switch: ' + e.message + ' Your current brain still works.'; rg.disabled = rs.disabled = false; if (!engine) refreshWelcome(); });
  };
  const go = $('#setupGo');
  if (go) go.onclick = () => {
    go.disabled = true; $('#setupBarWrap').hidden = false;
    loadBrain(settings.model, setupProgress).catch(e => showSetupError(e));
  };
}
function setupProgress(p) { const b = $('#setupBar'), t = $('#setupText'), w = $('#setupBarWrap'); if (w) w.hidden = false; if (b) b.style.width = Math.round((p.progress || 0) * 100) + '%'; if (t) t.textContent = p.text || ''; }
function showSetupError(e) {
  const msg = String(e && e.message || e), mem = isGpuCrash(e);
  const off = navigator.onLine === false || /fetch|network|load failed/i.test(msg);
  const el = document.createElement('div'); el.className = 'err';
  el.textContent = 'Could not load the brain: ' + (off ? 'no internet connection. Connect to Wi-Fi and try again.' : msg + (mem ? ' Your device ran low on memory. Close other apps and tabs, then try again.' : ''));
  const b = document.createElement('button'); b.className = 'btn'; b.style.marginTop = '8px'; b.textContent = 'Try again';
  b.onclick = () => { el.remove(); const go = $('#setupGo'); if (go) go.disabled = false; refreshWelcome(); };
  el.appendChild(document.createElement('br')); el.appendChild(b);
  (col.querySelector('.setup') || col).appendChild(el);
}
function addUser(text, att) {
  const d = document.createElement('div'); d.className = 'msg user';
  d.innerHTML = '<div class="uwrap"><div class="bubble"></div><button class="edit" aria-label="Edit message" title="Edit">✎ Edit</button></div>';
  const bub = d.querySelector('.bubble');
  if (att && att.files) for (const f of att.files) {
    const a = document.createElement('div'); a.className = 'attchip';
    if (f.thumb) { const im = document.createElement('img'); im.src = f.thumb; im.alt = ''; a.appendChild(im); }
    a.appendChild(document.createTextNode((f.kind === 'video' ? '🎬 ' : f.kind === 'image' ? '' : f.kind === 'pdf' ? '📕 ' : '📄 ') + f.name));
    bub.appendChild(a);
  }
  bub.appendChild(document.createTextNode(text));
  d.querySelector('.edit').onclick = () => editLast(d, text);
  col.appendChild(d);
}
// edit your last message: it goes back into the box, and that question + answer are removed
function editLast(node, text) {
  if (busy || !chat) return;
  let i = chat.turns.length - 1; while (i >= 0 && chat.turns[i].role !== 'user') i--;
  if (i < 0) return;
  const att = liveAtt.get(chat.turns[i]) || chat.turns[i].att;
  chat.turns.splice(i); while (node.nextSibling) node.nextSibling.remove(); node.remove();
  if (att) { attachment = att; showAttachment(); }
  inp.value = text; grow(); inp.focus(); saveChats();
}
// ---------------- attachments: photos, videos, PDFs, text files ----------------
// limits keep the phone from running out of memory
const LIMITS = { files: 3, imageMB: 25, videoMB: 200, videoMin: 10, pdfMB: 30, pdfPages: 60, textMB: 2 };
let attachment = null; // { files: [{ kind, name, data?, blob?, thumb?, text?, loading? }] }
const liveAtt = new WeakMap(); // full attachments (with the photo data) for this session; saved chats keep previews only
const savedAtt = a => ({ files: a.files.map(f => ({ kind: f.kind, name: f.name, thumb: f.thumb, text: f.text ? clip(f.text, 20000) : undefined })) });
const attText = a => a.files.filter(f => f.text).map(f => (a.files.length > 1 ? `== ${f.name} ==\n` : '') + f.text).join('\n\n');
const TEXT_EXT = /\.(txt|md|markdown|csv|tsv|json|js|mjs|ts|tsx|jsx|py|html?|css|xml|log|ya?ml|ini|sql|java|c|cpp|h|cs|go|rs|rb|php|sh|swift|kt|srt|vtt)$/i;
function showAttachment(msg) {
  const tray = $('#attTray'); if (!tray) return;
  const files = attachment ? attachment.files : [];
  tray.hidden = !files.length && !msg;
  tray.innerHTML = files.map((f, i) => `<div class="attitem${f.loading ? ' loading' : ''}">${f.thumb ? `<img src="${f.thumb}" alt="">` : `<span class="aico">${f.kind === 'video' ? '🎬' : f.kind === 'pdf' ? '📕' : '📄'}</span>`}<span class="aname">${esc(f.loading ? 'Reading ' + f.name + '…' : f.name)}</span><button data-rm="${i}" aria-label="Remove">✕</button></div>`).join('') + (msg ? `<div class="attmsg">${esc(msg)}</div>` : '');
  tray.querySelectorAll('[data-rm]').forEach(b => b.onclick = () => { attachment.files.splice(+b.dataset.rm, 1); if (!attachment.files.length) attachment = null; showAttachment(); grow(); });
  grow();
}
function downscale(src, max, q = 0.85) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.onload = () => { const k = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight)); const c = document.createElement('canvas'); c.width = Math.max(1, Math.round(img.naturalWidth * k)); c.height = Math.max(1, Math.round(img.naturalHeight * k)); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height); res(c); };
    img.onerror = () => rej(new Error("That photo format can't be opened here. Try a JPG or PNG."));
    img.src = src;
  });
}
const canvasBuf = (c, q = 0.85) => new Promise(r => c.toBlob(b => r(b.arrayBuffer()), 'image/jpeg', q));
async function videoInfo(file) {
  const v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'metadata';
  const url = URL.createObjectURL(file); v.src = url;
  try {
    await new Promise((res, rej) => { v.onloadeddata = res; v.onerror = () => rej(new Error("That video can't be opened here. Try an MP4 or MOV.")); setTimeout(() => rej(new Error('That video took too long to open.')), 15000); });
    await new Promise(res => { v.onseeked = res; v.currentTime = Math.min(1, (v.duration || 2) / 3); setTimeout(res, 3000); }); // a frame a moment in (the very first one is often black)
    const c = document.createElement('canvas'), k = Math.min(1, 200 / Math.max(v.videoWidth, v.videoHeight)); c.width = Math.round(v.videoWidth * k) || 160; c.height = Math.round(v.videoHeight * k) || 90;
    c.getContext('2d').drawImage(v, 0, 0, c.width, c.height);
    return { duration: v.duration, thumb: c.toDataURL('image/jpeg', 0.7) };
  } finally { URL.revokeObjectURL(url); }
}
let pdfjs = null;
async function readPdf(file) {
  if (!pdfjs) { pdfjs = await import('https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.min.mjs'); pdfjs.GlobalWorkerOptions.workerSrc = 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/build/pdf.worker.min.mjs'; }
  const doc = await pdfjs.getDocument({ data: new Uint8Array(await file.arrayBuffer()), isEvalSupported: false }).promise;
  const n = Math.min(doc.numPages, LIMITS.pdfPages); let out = '';
  for (let i = 1; i <= n; i++) { const p = await doc.getPage(i); const tc = await p.getTextContent(); out += `\n[Page ${i}]\n` + tc.items.map(x => x.str + (x.hasEOL ? '\n' : ' ')).join(''); }
  return { text: out.trim() || '(This PDF has no readable text. It may be a scan.)', pages: doc.numPages };
}
async function addFiles(list) {
  const files = [...list]; if (!files.length) return;
  if (!attachment) attachment = { files: [] };
  const problems = [];
  for (const file of files) {
    if (attachment.files.length >= LIMITS.files) { problems.push(`Up to ${LIMITS.files} files per message.`); break; }
    const mb = file.size / 1e6, name = file.name || 'file';
    const kind = /^image\//.test(file.type) ? 'image' : /^video\//.test(file.type) ? 'video' : (file.type === 'application/pdf' || /\.pdf$/i.test(name)) ? 'pdf' : (/^text\//.test(file.type) || TEXT_EXT.test(name)) ? 'text' : null;
    if (!kind) { problems.push(`${name}: that file type isn't supported yet (photos, videos, PDFs and text files work).`); continue; }
    if (kind === 'video' && attachment.files.some(f => f.kind === 'video')) { problems.push('One video per message.'); continue; }
    const max = { image: LIMITS.imageMB, video: LIMITS.videoMB, pdf: LIMITS.pdfMB, text: LIMITS.textMB }[kind];
    if (mb > max) { problems.push(`${name} is ${mb.toFixed(0)} MB. The limit for ${kind === 'text' ? 'text files' : kind + 's'} is ${max} MB.`); continue; }
    const f = { kind, name, loading: true }; attachment.files.push(f); showAttachment();
    try {
      if (kind === 'image') { const url = URL.createObjectURL(file); try { const big = await downscale(url, 1024); f.data = await canvasBuf(big); const th = await downscale(url, 160); f.thumb = th.toDataURL('image/jpeg', 0.7); } finally { URL.revokeObjectURL(url); } }
      else if (kind === 'video') { const vi = await videoInfo(file); if (vi.duration > LIMITS.videoMin * 60) throw new Error(`${name} is ${Math.round(vi.duration / 60)} minutes long. Videos can be up to ${LIMITS.videoMin} minutes.`); f.blob = file; f.thumb = vi.thumb; f.duration = vi.duration; }
      else if (kind === 'pdf') { const r = await readPdf(file); f.text = r.text; if (r.pages > LIMITS.pdfPages) problems.push(`${name} has ${r.pages} pages; OMEGA read the first ${LIMITS.pdfPages}.`); }
      else f.text = await file.text();
      f.loading = false;
    } catch (e) { attachment.files.splice(attachment.files.indexOf(f), 1); problems.push(e.message || String(e)); }
  }
  if (attachment && !attachment.files.length) attachment = null;
  showAttachment(problems.join(' '));
}
// ---------------- answering about photos and videos (vision brain, on this device) ----------------
async function answerWithEyes(text, att, media, ui, turn) {
  const vk = visionKey(), vm = modelOf(vk);
  if (!(engine && loadedKey === vk)) {
    if (!(await isCached(vm))) {
      turn.text = `To look at photos and videos, OMEGA needs its eyes: the **${vm.name}** brain. It's about ${sizeText(vm.sizeMB)}, downloads once, and runs on this ${DEVICE}. Your photos never leave your ${DEVICE}.`;
      render(ui.ans, turn.text);
      const b = document.createElement('button'); b.className = 'btn pri'; b.textContent = `Download OMEGA's eyes (${sizeText(vm.sizeMB)})`; const p = document.createElement('div'); p.className = 'hint'; p.style.marginTop = '6px';
      ui.ans.appendChild(b); ui.ans.appendChild(p);
      b.onclick = () => { if (busy || loading) { p.textContent = 'Wait until OMEGA finishes, then tap again.'; return; } b.disabled = true; loadBrain(vk, x => { p.textContent = x.text || Math.round((x.progress || 0) * 100) + '%'; }).then(() => { p.textContent = 'Ready! Tap ↻ below to look again.'; b.remove(); }).catch(e => { p.textContent = 'Could not download: ' + e.message; b.disabled = false; }); };
      return;
    }
    ui.work.hidden = false; ui.wt.textContent = 'Opening OMEGA\'s eyes…';
    await loadBrain(vk, p => { ui.wt.textContent = `Opening OMEGA's eyes… ${Math.round((p.progress || 0) * 100)}%`; });
  }
  const parts = [], notes = [];
  const imgs = media.filter(f => f.kind === 'image'), vid = media.find(f => f.kind === 'video');
  if (vid) {
    // videos: look at a few moments one by one (small vision brains are much better at single pictures), then answer
    const { sampleVideoFrames } = await getWllama();
    ui.work.hidden = false; ui.wt.textContent = 'Watching your video…';
    const frames = await sampleVideoFrames(vid.blob, { maxFrames: IS_PHONE ? 4 : 6, maxEdge: 448 });
    for (const [i, fr] of frames.entries()) {
      if (stopFlag) break;
      ui.wt.textContent = `Watching your video… moment ${i + 1} of ${frames.length}`;
      const d = await engine.chat([{ role: 'user', content: [{ type: 'image', data: fr.data }, { type: 'text', text: 'In one short sentence, what is in this picture?' }] }], { maxTokens: 48, temperature: 0.1, onText: () => { } });
      notes.push(`At ${Math.round(fr.time)}s: ${d.trim()}`);
    }
    turn.think = 'What OMEGA saw in the video:\n' + notes.join('\n');
  }
  for (const im of imgs) parts.push({ type: 'image', data: im.data });
  const fileText = attText(att);
  const ask = (vid ? `Notes about moments from the user's video (${Math.round(vid.duration || 0)} seconds long), in time order:\n${notes.join('\n')}\n\n` : '') + (fileText ? `Attached text:\n${clip(fileText, 3000)}\n\n` : '') + `${imgs.length > 1 ? `There are ${imgs.length} photos. ` : ''}${text}`;
  parts.push({ type: 'text', text: ask });
  const sys = `You are OMEGA, ${profile.name || 'the user'}'s friendly AI assistant. You can see the photos the user sends. Describe what is really there, read any text exactly, and answer the question directly and casually. If you are not sure about something in the picture, say so.`;
  ui.wt.textContent = vid ? 'Watched your video' : imgs.length > 1 ? `Looked at ${imgs.length} photos` : 'Looked at your photo';
  render(ui.ans, '', true);
  const out = await engine.chat([{ role: 'system', content: sys }, { role: 'user', content: parts }], { maxTokens: 400, temperature: 0.2, onText: o => { render(ui.ans, thinkStrip(o), true); toBottom(); } });
  turn.text = thinkStrip(out).trim() || (stopFlag ? '(stopped)' : "I couldn't make that out. Try a clearer photo?");
  if (turn.think) showThoughts(ui, '<think>' + turn.think + '</think>', Date.now(), true), ui.think.querySelector('summary').textContent = '🎬 What OMEGA saw';
  render(ui.ans, turn.text);
}
// ---------------- optional cloud brain (OpenRouter, free models, your own key stays on this device) ----------------
const cloudOn = () => !!(settings.cloud && settings.cloudKey && navigator.onLine !== false);
let cloudAbort = null;
async function cloudChat(messages, o) {
  cloudAbort = new AbortController(); const sig = cloudAbort.signal;
  const t = setTimeout(() => cloudAbort.abort(), 120000);
  try {
    const r = await fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + settings.cloudKey, 'X-Title': 'OMEGA' },
      body: JSON.stringify({ model: settings.cloudModel || 'openrouter/free', messages, stream: true, max_tokens: o.maxTokens, temperature: o.temperature }) });
    if (!r.ok) { let m = 'HTTP ' + r.status; try { const j = await r.json(); m = (j.error && j.error.message) || m; } catch (_) { } if (r.status === 401) m = 'the cloud key is not valid'; if (r.status === 429) m = 'free limit reached for now'; throw new Error(m); }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', text = '', reason = '', model = '';
    while (true) {
      const { done, value } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop();
      for (const ln of lines) {
        const l = ln.trim(); if (!l.startsWith('data:')) continue; const d = l.slice(5).trim(); if (d === '[DONE]') continue;
        try { const j = JSON.parse(d); if (j.error) throw new Error(j.error.message || 'cloud error'); model = j.model || model; const dl = (j.choices && j.choices[0] && j.choices[0].delta) || {}; reason += dl.reasoning || dl.reasoning_content || ''; text += dl.content || ''; } catch (e) { if (/cloud error|error/i.test(e.message) && !/JSON/.test(e.message)) throw e; }
        o.onText(reason ? '<think>' + reason + (text ? '</think>' : '') + text : text);
        if (stopFlag) { cloudAbort.abort(); break; }
      }
      if (stopFlag) break;
    }
    o.model = model;
    if (!text.trim() && !stopFlag) throw new Error('empty answer');
    return reason ? '<think>' + reason + '</think>' + text : text;
  } catch (e) { if (sig.aborted && stopFlag) return ''; if (sig.aborted) throw new Error('took too long'); throw e; }
  finally { clearTimeout(t); }
}
const toDataURL = buf => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(new Blob([buf], { type: 'image/jpeg' })); });
async function answerInCloud(text, live, att, ui, turn, media = []) {
  ui.work.hidden = false; ui.wt.textContent = '☁️ Asking the cloud brain…';
  const codeMode = $('#codeChip').getAttribute('aria-pressed') === 'true';
  const files = att ? attText(att) : '';
  const content = (live ? 'LIVE INFO (fetched just now):\n' + clip(live, 8000) + '\n\n(Use the LIVE INFO above; it is current. Copy numbers exactly. If it does not contain the exact answer, say so.)\n---\n' : '') + (files ? `Attached file(s):\n-----\n${clip(files, 30000)}\n-----\n\n` : '') + text;
  let user = content;
  if (media.length) {
    const parts = [];
    for (const f of media) {
      if (f.kind === 'image') parts.push({ type: 'image_url', image_url: { url: await toDataURL(f.data) } });
      if (f.kind === 'video') { const { sampleVideoFrames } = await getWllama(); const fr = await sampleVideoFrames(f.blob, { maxFrames: 6, maxEdge: 512 }); for (const x of fr) { parts.push({ type: 'text', text: `Frame at ${Math.round(x.time)}s:` }); parts.push({ type: 'image_url', image_url: { url: await toDataURL(x.data) } }); } }
    }
    parts.push({ type: 'text', text: (media.some(f => f.kind === 'video') ? 'These are frames from my video, in order. ' : '') + content });
    user = parts;
  }
  const hist = historyFor(12000); if (hist.length) hist.pop();
  const messages = [{ role: 'system', content: systemPrompt(codeMode, !!live) }, ...hist, { role: 'user', content: user }];
  const t0 = Date.now(), o = { maxTokens: codeMode ? 6000 : 2000, temperature: codeMode ? 0.3 : 0.6, onText: out => { showThoughts(ui, out, t0); render(ui.ans, thinkStrip(out), true); toBottom(); } };
  render(ui.ans, '', true);
  const raw = await cloudChat(messages, o);
  const th = thoughtsOf(raw); if (th) { turn.think = clip(th, 6000); showThoughts(ui, raw, t0, true); }
  turn.text = thinkStrip(raw).trim() || '(stopped)';
  ui.wt.textContent = `☁️ Answered by the cloud brain${o.model ? ' (' + o.model.replace(/:free$/, '') + ')' : ''}`;
  render(ui.ans, turn.text);
}
// ask again: removes the last answer and gets a fresh one
function redoLast() {
  if (busy || !chat) return;
  const last = chat.turns[chat.turns.length - 1]; if (!last || last.role !== 'assistant') return;
  chat.turns.pop(); const bots = col.querySelectorAll('.msg.bot'); bots[bots.length - 1].remove();
  const u = chat.turns[chat.turns.length - 1]; if (!u || u.role !== 'user') return;
  send({ text: u.text, redo: true, att: liveAtt.get(u) || u.att });
}
// read an answer out loud (the phone's built-in voice)
function speak(text, btn) {
  if (!('speechSynthesis' in window)) return;
  if (speechSynthesis.speaking) { speechSynthesis.cancel(); if (btn.classList.contains('on')) { btn.classList.remove('on'); return; } }
  document.querySelectorAll('[data-a=read].on').forEach(b => b.classList.remove('on'));
  const plain = String(text).replace(/```[\s\S]*?```/g, ' (code) ').replace(/!\[[^\]]*\]\([^)]*\)/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1').replace(/[*_#>`|]/g, '').replace(/\s+/g, ' ').trim();
  const u = new SpeechSynthesisUtterance(plain); u.lang = 'en-US'; u.rate = 1.05;
  u.onend = u.onerror = () => btn.classList.remove('on');
  btn.classList.add('on'); speechSynthesis.speak(u);
}
function addBot() {
  const d = document.createElement('div'); d.className = 'msg bot';
  d.innerHTML = '<div class="av">Ω</div><div class="body"><div class="work" hidden><span class="spin"></span><span class="wt"></span></div><div class="live" hidden></div><div class="think" hidden></div><div class="md ans"><span class="typing"><i></i><i></i><i></i></span></div><div class="srcs"></div><div class="acts" hidden></div></div>';
  col.appendChild(d);
  return { el: d, think: d.querySelector('.think'), work: d.querySelector('.work'), wt: d.querySelector('.wt'), live: d.querySelector('.live'), ans: d.querySelector('.ans'), srcs: d.querySelector('.srcs'), acts: d.querySelector('.acts') };
}
function showSources(ui, srcs) {
  ui.srcs.innerHTML = (srcs || []).filter(s => /^https:\/\//.test(s.url)).slice(0, 8).map(s => { let h = ''; try { h = new URL(s.url).hostname.replace(/^www\./, ''); } catch (e) { } return `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title)}">${esc(h === 'news.google.com' ? s.title : h || s.title)}</a>`; }).join('');
}
function showActs(ui, turn, q) {
  ui.acts.hidden = false;
  ui.acts.innerHTML = `<button data-a="copy">Copy</button>${'speechSynthesis' in window ? '<button data-a="read" aria-label="Read out loud">🔊</button>' : ''}<button data-a="redo" aria-label="Get a new answer" title="Get a new answer">↻</button><button data-a="up" class="${turn.fb === 'up' ? 'on' : ''}" aria-label="Good answer">👍</button><button data-a="down" class="${turn.fb === 'down' ? 'on' : ''}" aria-label="Bad answer">👎</button>`;
  ui.acts.querySelector('[data-a=copy]').onclick = e => copyText(turn.text, e.target);
  const rd = ui.acts.querySelector('[data-a=read]'); if (rd) rd.onclick = e => speak(turn.text, e.currentTarget);
  ui.acts.querySelector('[data-a=redo]').onclick = redoLast;
  ui.acts.querySelector('[data-a=up]').onclick = e => {
    turn.fb = 'up'; e.target.classList.add('on'); ui.acts.querySelector('[data-a=down]').classList.remove('on');
    if (q && !liked.some(x => x.q === q && x.a === turn.text)) { liked.push({ q, a: turn.text, t: Date.now() }); liked = liked.slice(-300); store.set('liked', liked); }
    saveChats();
  };
  ui.acts.querySelector('[data-a=down]').onclick = e => { turn.fb = 'down'; e.target.classList.add('on'); ui.acts.querySelector('[data-a=up]').classList.remove('on'); saveChats(); openFeedback(q, turn.text); };
}
function staticTurns() {
  col.innerHTML = '';
  let lastQ = '';
  for (const t of chat.turns) {
    if (t.role === 'user') { addUser(t.text, t.att); lastQ = t.text; }
    else { const ui = addBot(); if (t.live) { ui.live.textContent = t.live; ui.live.hidden = false; } if (t.think) { ui.think.dataset.secs = '…'; showThoughts(ui, '<think>' + t.think + '</think>', Date.now(), true); ui.think.querySelector('summary').textContent = '💡 Show thinking'; } render(ui.ans, t.text); showSources(ui, t.sources); showActs(ui, t, lastQ); }
  }
}

function grow() { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 200) + 'px'; sendBtn.disabled = !busy && !inp.value.trim(); }
inp.addEventListener('input', grow);
const coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.isComposing) { e.preventDefault(); send(); } });
const SEND_SVG = sendBtn.innerHTML, STOP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/></svg>';
function setBusy(b) { busy = b; sendBtn.innerHTML = b ? STOP_SVG : SEND_SVG; sendBtn.setAttribute('aria-label', b ? 'Stop' : 'Send'); grow(); }
sendBtn.onclick = () => { if (busy) { stopFlag = true; try { engine && engine.stop(); } catch (e) { } try { cloudAbort && cloudAbort.abort(); } catch (e) { } } else send(); };

async function send(opts = {}) {
  if (busy) return;
  const att = opts.redo ? opts.att : attachment; // files the user attached (photos, a video, a PDF or text files)
  let text = String(opts.text ?? inp.value).trim();
  if (!text && !(att && att.files.length)) return;
  if (!text) text = att.files.some(f => f.kind === 'video') ? 'What happens in this video?' : att.files.some(f => f.kind === 'image') ? "What's in this photo?" : 'Summarize this file.';
  if (att && att.files.some(f => f.loading)) { showAttachment('Still reading your file… one sec.'); return; }
  if (!chat) { chat = { id: 'c' + Date.now(), title: clip(text, 60), turns: [], t: Date.now() }; col.innerHTML = ''; $('#title').textContent = chat.title; syncTop(); }
  const spoken = voiceAsk && !opts.redo; voiceAsk = false;
  if (!opts.redo) { inp.value = ''; attachment = null; showAttachment(); grow(); addUser(text, att); chat.turns.push(att ? { role: 'user', text, att: savedAtt(att) } : { role: 'user', text }); if (att) liveAtt.set(chat.turns[chat.turns.length - 1], att); }
  const ui = addBot(); toBottom(true);
  setBusy(true); stopFlag = false;
  const turn = { role: 'assistant', text: '', sources: [] };
  try {
    const media = att ? att.files.filter(f => (f.kind === 'image' && f.data) || (f.kind === 'video' && f.blob)) : [];
    if (att && att.files.some(f => (f.kind === 'image' || f.kind === 'video')) && !media.length) { turn.text = 'That photo/video is no longer in memory (saved chats keep only a preview). Attach it again with 📎 and ask.'; render(ui.ans, turn.text); return; }
    if (media.length) {
      if (cloudOn()) { try { await answerInCloud(text, '', att, ui, turn, media); return; } catch (e) { if (stopFlag) return; ui.work.hidden = false; ui.wt.textContent = `Cloud brain unavailable, using OMEGA's own eyes`; } }
      await answerWithEyes(text, att, media, ui, turn); return;
    }
    // memory command
    const rem = text.match(/^(?:please\s+)?(?:remember|don'?t forget)(?:\s+that)?[:,]?\s+(.{3,})$/i);
    if (rem) { const f = rem[1].replace(/[.!]+$/, ''); facts.push(f); facts = facts.slice(-100); store.set('facts', facts); renderFacts(); }
    // well-known games: use OMEGA's tested game library (the phone brain is too small to write a whole game reliably)
    // learn the basics automatically: name and city
    const nm = text.match(/\b(?:my name is|my name's|call me|i'?m called)\s+([A-Z][a-z]{1,20})\b/i), ct = text.match(/\bi (?:live|stay|'m based|am based|live out) in ([A-Za-z][A-Za-z .'-]{2,30}?)(?:[,.!?]|\s+(?:and|but|so|bro)\b|$)/i);
    if (nm && !/^(not|just|so|the|a)$/i.test(nm[1])) { profile.name = nm[1][0].toUpperCase() + nm[1].slice(1); store.set('profile', profile); fillProfile(); }
    if (ct && !NOT_PLACE.test(ct[1])) { profile.city = PLACE_ALIASES[ct[1].trim().toLowerCase()] || ct[1].trim(); store.set('profile', profile); fillProfile(); }
    if (rem) { turn.text = `Got it, I'll remember that: ${rem[1].replace(/[.!]+$/, '')}`; render(ui.ans, turn.text); return; } // saved; no brain needed
    if (/\b(make|build|create|code|write|give|gimme|want|play|game)\b/i.test(text)) {
      let game = null; try { game = (await import('./games.js?v=' + VERSION)).findGame(text); } catch (e) { }
      // "snake" alone could be the animal: only when it's clearly about a game
      if (game && game.key === 'snake' && !/\b(game|play)\b/i.test(text) && !/^(?:yo |hey |bro |omega )?(?:can you |could you |please )?(?:make|build|code|create|give)(?: me)?(?: a| the)? snake\b/i.test(text)) game = null;
      if (game && !/\b(make|build|create|code|write|give|gimme|play|game)\b/i.test(text)) game = null;
      if (!game && /\b(play|games?)\b/i.test(text) && /\b(want|wanna|let'?s|can i|could i|i'?m bored|bored|any|got|have)\b/i.test(text) && !/\b(won|win|score|tonight|lakers|rams|dodgers|nba|nfl|mlb|xbox|ps5|switch|steam)\b/i.test(text)) {
        turn.text = "I've got 5 games ready to play right here: **Flappy Bird** 🐤, **Snake** 🐍, **Pong** 🏓, **Breakout** 🧱 and **Tic-Tac-Toe** ❌. Just say which one, like \"play snake\".";
        render(ui.ans, turn.text); return;
      }
      if (game) {
        const code = game.make(), intro = `Here's your ${game.name} game ${game.emoji} It's from OMEGA's built-in game library, made for your phone.`;
        const lines = code.split('\n'), steps = 34;
        for (let i = 1; i <= steps && !stopFlag; i++) { render(ui.ans, intro + '\n\n```html\n' + lines.slice(0, Math.ceil(lines.length * i / steps)).join('\n'), true); toBottom(); await new Promise(r => setTimeout(r, 120)); }
        turn.text = intro + '\n\n```html\n' + code + '\n```';
        render(ui.ans, turn.text); toBottom();
        return;
      }
    }
    if (/^(what'?s|whats|what is|do you know|do you remember|remember)\s+my name\b|^who am i\b/i.test(text) && profile.name) { turn.text = `Your name is ${profile.name}.`; render(ui.ans, turn.text); return; }
    const pic = att ? null : pictureRequest(text);
    if (pic) { await makePicture(pic, ui, turn); return; }
    const math = att ? null : quickMath(text);
    if (math) { turn.text = math; render(ui.ans, turn.text); return; } // exact, instant, no brain needed
    // live info first, so OMEGA can still help even if the brain can't start
    let live = '', liveShown = '';
    if (settings.live && !rem) {
      const tools = navigator.onLine === false || att ? [] : decideTools(text); // no internet (or a file to read): skip live info
      if (tools.length) {
        ui.work.hidden = false; ui.wt.textContent = 'Checking live info: ' + tools.map(t => t[0]).join(', ') + '…';
        const res = await Promise.allSettled(tools.map(t => t[1]()));
        const ok = res.filter(r => r.status === 'fulfilled').map(r => r.value);
        ok.forEach(r => turn.sources.push(...r.sources));
        live = ok.map(r => r.text).join('\n\n');
        liveShown = ok.map(r => r.plain || r.text).join('\n\n');
        const cards = ok.filter(r => r.plain).map(r => r.plain);
        if (cards.length) { turn.live = cards.join('\n\n'); ui.live.textContent = turn.live; ui.live.hidden = false; }
        if (tools.length === 1 && tools[0][0] === 'time' && ok[0] && ok[0].answer && text.split(/\s+/).length <= 14) {
          ui.work.hidden = true; ui.live.hidden = true; turn.live = ''; turn.text = ok[0].answer; render(ui.ans, turn.text); return;
        }
        ui.wt.textContent = ok.length ? `Checked ${ok.map(r => r.label.toLowerCase()).join(', ')}` : 'Live info unavailable right now';
        if (!ok.length && res.length && tools.some(t => t[0] !== 'web')) live = 'LIVE INFO: the lookup failed just now (no internet or sources busy). Tell the user you could not get live info this time.';
      }
    }
    if (stopFlag) { turn.text = liveShown ? (turn.live ? 'Stopped. The live info is in the card above.' : liveShown) : '(stopped)'; render(ui.ans, turn.text); return; }
    // brain
    const fallback = why => { // answer from live info alone when no brain is available
      if (liveShown) return turn.live ? `${why} The live info is in the card above.` : `${why}\n\nHere's the live info I found:\n\n${liveShown}`;
      return why;
    };
    // optional cloud brain (free OpenRouter models): much smarter when online; the phone brain takes over if it fails
    if (cloudOn()) {
      try { await answerInCloud(text, live, att, ui, turn); return; }
      catch (e) { if (stopFlag) { turn.text = turn.text || '(stopped)'; render(ui.ans, turn.text); return; } ui.work.hidden = false; ui.wt.textContent = `Cloud brain unavailable (${clip(e.message, 60)}), using the phone brain`; }
    }
    if (engine && modelOf(loadedKey).vision && !loading) { ui.work.hidden = false; ui.wt.textContent = 'Switching back to the chat brain…'; await dropEngine(); }
    if (!engine) {
      try {
        if (loading) { ui.work.hidden = false; ui.wt.textContent = 'Waking up OMEGA…'; await loading; }
        else if (crashBlocked) throw Object.assign(new Error("OMEGA's brain crashed twice from low memory. Go to the home screen (✎ New chat) and tap Try again."), { setup: true });
        else if ((await pickSavedBrain(), !crashBlocked && await isCached(modelOf(settings.model)))) { ui.work.hidden = false; ui.wt.textContent = 'Waking up OMEGA…'; await loadBrain(settings.model, p => { ui.wt.textContent = `Waking up OMEGA… ${Math.round((p.progress || 0) * 100)}%`; }); }
        else throw Object.assign(new Error('OMEGA needs its brain first. Tap "Download OMEGA\'s brain" on the home screen.'), { setup: true });
      } catch (e) {
        if (liveShown) { turn.text = fallback(e.setup ? "My brain isn't downloaded yet, so I can't chat, but I can still look things up." : "My brain couldn't start just now."); render(ui.ans, turn.text); return; }
        throw e;
      }
    }
    if (stopFlag) { turn.text = '(stopped)'; render(ui.ans, turn.text); return; }
    // answer
    const codeMode = $('#codeChip').getAttribute('aria-pressed') === 'true';
    const wantsApp = codeMode && /\b(app|calculator|website|web ?site|page|landing|game|tool|timer|stopwatch|to-?do|todo|tracker|form|quiz|clock|counter|converter|ui|dashboard|portfolio|menu|button)\b/i.test(text) && !/\b(python|script|terminal|command line|node|java|c\+\+|swift|sql)\b/i.test(text);
    const userContent = (live ? 'LIVE INFO (fetched just now):\n' + clip(live, IS_PHONE ? 2400 : 5000) + '\n\n(Answer using the LIVE INFO above. It is real and current. If it lists headlines or results, summarize the most relevant ones, and prefer the newest dated item. If the LIVE INFO does not contain the exact answer (for example a time, score or date), say you could not find that exact detail and share what you did find. Never guess numbers, times or scores.)\n---\n' : '') + (att && attText(att) ? `Here is the file the user attached (${att.files.map(f => f.name).join(', ')}):\n-----\n${clip(attText(att), Math.max(1200, (CTX - 900) * 3))}\n-----\n\nUsing the file above, answer this: ` : '') + text + (wantsApp ? '\n\n(Make it as ONE complete, working ```html file with the CSS and JavaScript inside. No input() prompts. It must work on a phone screen.)' : '');
    const hist = codeMode && IS_PHONE ? [] : historyFor(IS_PHONE ? (live ? 1200 : 2600) : (live ? 3500 : 6000));
    if (hist.length) hist.pop(); // drop the current user turn (already added) — we send the enriched version
    const messages = [{ role: 'system', content: systemPrompt(codeMode, !!live) }, ...hist, { role: 'user', content: userContent }];
    const promptTokens = Math.ceil(messages.reduce((n, x) => n + x.content.length, 0) / 3.2) + 40;
    const want = IS_PHONE ? (codeMode ? 1400 : 500) : (codeMode ? 2000 : 800);
    const think = thinkOn() && !!modelOf(loadedKey).thinking;
    if (thinkOn() && !think) messages[messages.length - 1].content += '\n\n(Think it through step by step first, then give the final answer clearly at the end.)';
    const t0 = Date.now();
    const creative = /\b(write|story|poem|haiku|joke|caption|lyrics|rap|song|script|name ideas|ideas|brainstorm|slogan|funny|creative|imagine)\b/i.test(text);
    const opts = { think, temperature: think ? 0.6 : codeMode ? 0.3 : creative ? 0.8 : 0.35, maxTokens: Math.max(200, Math.min(think ? want * 3 : want, CTX - promptTokens - 64)), onText: out => { showThoughts(ui, out, t0); render(ui.ans, thinkStrip(out), true); toBottom(); } };
    render(ui.ans, '', true); toBottom(); // shows "Thinking…" until the first words arrive
    const run = async msgs => { const raw = await engine.chat(msgs, opts); const th = thoughtsOf(raw); if (th) turn.think = clip(th, 6000); showThoughts(ui, raw, t0, true); return thinkStrip(raw).trim(); };
    setInflight({ model: loadedKey, t: Date.now(), what: 'answer' });
    try { turn.text = await run(messages); }
    catch (e) {
      if (isGpuCrash(e)) {
        // the brain crashed: switch to a lighter one and try once more
        let to = LIGHTER[loadedKey];
        await dropEngine();
        if (to && !(await isCached(modelOf(to)).catch(() => false))) to = null; // don't start a big download without asking
        if (!to) { turn.text = fallback("I ran out of memory on this device. Close other tabs and apps, then try again."); render(ui.ans, turn.text); return; }
        ui.work.hidden = false; ui.wt.textContent = `Out of memory. Switching to ${modelOf(to).name}…`;
        await loadBrain(to, p => { ui.wt.textContent = `Out of memory. Loading ${modelOf(to).name}… ${Math.round((p.progress || 0) * 100)}%`; });
        messages[0].content = systemPrompt(codeMode, !!live);
        setInflight({ model: loadedKey, t: Date.now(), what: 'answer' });
        turn.text = await run(messages.slice(0, 1).concat([{ role: 'user', content: clip(userContent, 2000) }]));
        ui.wt.textContent = `Switched to ${modelOf(loadedKey).name} to save memory`;
      } else if (/context|too long|exceed|prompt|n_ctx/i.test(String(e.message))) { turn.text = await run([messages[0], { role: 'user', content: clip(userContent, 1800) }]); }
      else throw e;
    } finally { setInflight(null); }
    if (turn.text) store.set('crashes', null); // answered fine: reset the crash count
    // the small brain sometimes refuses or comes back empty even with good live info: show what was found instead
    if (liveShown && !stopFlag && (!turn.text || /^(i'?m sorry,? but )?i (can'?t|cannot|am unable to|'m unable to) (assist|help) with (that|this)\.?$/i.test(turn.text.trim()))) turn.text = "Here's what I found:\n\n" + liveShown;
    if (!turn.text) turn.text = stopFlag ? '(stopped)' : "Hmm, I didn't get anything there. Try asking again?";
    render(ui.ans, turn.text);
    if (!live && !ui.wt.textContent.startsWith('Checked')) ui.work.hidden = true;
  } catch (e) {
    ui.ans.innerHTML = '';
    const d = document.createElement('div'); d.className = 'err'; d.textContent = isGpuCrash(e) ? "OMEGA's brain crashed. Open Brain and settings and pick Qwen3 0.6B, then try again." : ((e && e.message) || String(e)); ui.ans.appendChild(d); if (isGpuCrash(e)) await dropEngine();
    ui.work.hidden = true;
    if (e && e.setup) {
      const b = document.createElement('button'); b.className = 'btn pri'; b.style.marginTop = '8px'; d.appendChild(document.createElement('br')); d.appendChild(b);
      const p = document.createElement('div'); p.className = 'hint'; p.style.marginTop = '6px'; d.appendChild(p);
      if (crashBlocked) { b.textContent = 'Go to the home screen'; b.onclick = () => newChat(); }
      else {
        const m = modelOf(settings.model); b.textContent = `Download OMEGA's brain (${sizeText(m.sizeMB)})`;
        b.onclick = () => { b.disabled = true; loadBrain(m.key, x => { p.textContent = x.text || Math.round((x.progress || 0) * 100) + '%'; }).then(() => { p.textContent = 'Ready! Ask me again.'; b.remove(); }).catch(err => { p.textContent = 'Could not download: ' + err.message; b.disabled = false; }); };
      }
    }
    turn.text = '';
  } finally {
    if (turn.text) { chat.turns.push(turn); showSources(ui, turn.sources); showActs(ui, turn, text); if (spoken && !stopFlag && settings.voiceReply !== false) { const rb = ui.acts.querySelector('[data-a=read]'); if (rb) speak(turn.text, rb); } }
    else chat.turns.pop();
    saveChats(); setBusy(false); toBottom();
  }
}

// ---------------- chats ----------------
function saveChats() {
  if (chat && chat.turns.length) {
    chat.u = Date.now();
    const i = chats.findIndex(c => c.id === chat.id); if (i >= 0) chats[i] = chat; else chats.unshift(chat);
  }
  chats.sort((a, b) => (b.u || 0) - (a.u || 0)); chats = chats.slice(0, 60);
  while (!store.set('chats', chats) && chats.length > 1) chats.pop();
  renderChats();
}
function renderChats() {
  const q = ($('#chatSearch') && $('#chatSearch').value || '').trim().toLowerCase();
  const list = q ? chats.filter(c => (c.title || '').toLowerCase().includes(q) || c.turns.some(t => String(t.text || '').toLowerCase().includes(q))) : chats;
  syncTop();
  $('#chats').innerHTML = list.length ? list.map(c => `<div class="chatitem ${chat && c.id === chat.id ? 'on' : ''}"><button class="open" data-open="${esc(c.id)}">${esc(c.title || 'Chat')}</button><button class="del" data-del="${esc(c.id)}" aria-label="Delete chat">✕</button></div>`).join('') : `<div class="empty">${q ? 'No chats match.' : 'Your chats show up here.'}</div>`;
}
$('#chats').onclick = e => {
  const o = e.target.closest('[data-open]'), d = e.target.closest('[data-del]');
  if (d && busy && chat && chat.id === d.dataset.del) return; // can't delete the chat that's answering right now
  if (d) { chats = chats.filter(c => c.id !== d.dataset.del); if (chat && chat.id === d.dataset.del) newChat(); store.set('chats', chats); renderChats(); return; }
  if (o && !busy) { const c = chats.find(x => x.id === o.dataset.open); if (!c) return; chat = c; $('#title').textContent = c.title; staticTurns(); renderChats(); closeSide(); toBottom(true); }
};
function newChat() { if (busy) return; chat = null; $('#title').textContent = 'OMEGA'; refreshWelcome(); renderChats(); closeSide(); }
$('#newChat').onclick = newChat; $('#newChat2').onclick = newChat;

// ---------------- sidebar + sheets ----------------
const side = $('#side'), sideVeil = $('#sideVeil'), veil = $('#veil');
const closeSide = () => { side.classList.remove('open'); sideVeil.hidden = true; };
$('#menu').onclick = () => { side.classList.add('open'); sideVeil.hidden = false; };
sideVeil.onclick = closeSide;
function openSheet(id) { closeSide(); veil.hidden = false; $(id).hidden = false; if (id === '#setSheet') renderSettings(); }
function closeSheets() { veil.hidden = true; ['#setSheet', '#memSheet', '#fbSheet'].forEach(s => $(s).hidden = true); }
veil.onclick = closeSheets; document.querySelectorAll('[data-close]').forEach(b => b.onclick = closeSheets);
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closePlayer(); closeSheets(); closeSide(); } });
$('#openMem').onclick = () => openSheet('#memSheet'); $('#openSet').onclick = () => openSheet('#setSheet');

// chips
function syncChips() { $('#webChip').setAttribute('aria-pressed', String(!!settings.live)); }
$('#webChip').onclick = () => { settings.live = !settings.live; store.set('settings', settings); syncChips(); };
$('#codeChip').onclick = () => { const on = $('#codeChip').getAttribute('aria-pressed') !== 'true'; $('#codeChip').setAttribute('aria-pressed', String(on)); inp.placeholder = on ? 'What should OMEGA build?' : 'Message OMEGA'; };

// settings sheet
let pick = settings.model;
async function renderSettings() {
  detectDevice().then(d => {
    const th = brainThreads(), r = modelOf(d.rec);
    $('#devInfo').innerHTML = `<b>${esc(d.kind)}</b> · ${d.cores} processor cores${d.memGB ? ` · ${d.memGB}+ GB memory` : ''} · graphics chip: ${d.gpu.ok ? 'yes (fast mode available)' : 'not used'} · multi-core brain: ${th > 1 ? `on (${th} cores)` : 'off'}<br>Best brain for this ${esc(kindWord(d.kind))}: <b>${esc(r.name)}</b>. ${esc(d.why)}`;
  });
  $('#autoPick').checked = !!settings.auto; syncCloud();
  $('#gpuInfo').textContent = engine ? `Running ${modelOf(loadedKey).name} on this device's ${engine.kind === 'cpu' ? 'processor' : 'graphics chip'}.` : (wasmCheck() ? 'Pick a brain and load it. It downloads once.' : "This browser can't run OMEGA's brain.");
  if (!fitsDevice(modelOf(pick))) pick = settings.model;
  const rows = await Promise.all(MODELS.map(async m => ({ m, cached: fitsDevice(m) && await isCached(m) })));
  $('#models').innerHTML = rows.map(({ m, cached }) => { const ok = fitsDevice(m); return `<label class="model ${pick === m.key ? 'on' : ''}" ${ok ? '' : 'style="opacity:.5"'}><input type="radio" name="model" value="${m.key}" ${pick === m.key ? 'checked' : ''} ${ok ? '' : 'disabled'}><div><b>${esc(m.name)}${loadedKey === m.key ? ' · running' : cached ? ' · downloaded' : ''}</b><span>${esc(m.desc)} About ${sizeText(m.sizeMB)}.${ok ? '' : ` Not available on ${DEVICE} (Safari would crash).`}</span></div></label>`; }).join('');
  $('#models').querySelectorAll('input').forEach(i => i.onchange = () => { pick = i.value; renderSettings(); });
  $('#loadBtn').disabled = loadedKey === pick || !!loading || busy;
  $('#loadHint').textContent = loadedKey === pick ? 'Already running.' : '';
}
$('#cloudOn').onchange = e => { settings.cloud = e.target.checked; store.set('settings', settings); syncCloud(); };
$('#cloudKey').onchange = e => { settings.cloudKey = e.target.value.trim(); store.set('settings', settings); syncCloud(); };
function syncCloud() {
  $('#cloudOn').checked = !!settings.cloud; $('#cloudKey').value = settings.cloudKey || '';
  $('#cloudState').textContent = settings.cloud ? (settings.cloudKey ? (navigator.onLine === false ? 'On, but you are offline: the phone brain answers.' : 'On: answers come from free cloud models when you are online. Your messages go to OpenRouter.') : 'Paste your free key to turn it on.') : 'Off: everything stays on this device.';
}
$('#autoPick').onchange = e => { settings.auto = e.target.checked; settings.skipRec = null; store.set('settings', settings); if (!chat) refreshWelcome(); };
$('#loadBtn').onclick = () => {
  if (busy || loading) { $('#loadText').textContent = busy ? 'Wait until OMEGA finishes answering.' : 'Already loading…'; return; }
  $('#loadBtn').disabled = true; $('#loadBarWrap').hidden = false; $('#loadText').textContent = 'Starting…';
  loadBrain(pick, p => { $('#loadBar').style.width = Math.round((p.progress || 0) * 100) + '%'; $('#loadText').textContent = p.text || ''; })
    .then(() => { $('#loadText').textContent = 'Ready! ' + modelOf(loadedKey).name + ' is running.'; pick = loadedKey; renderSettings(); })
    .catch(e => { $('#loadText').textContent = 'Could not load: ' + e.message + (/memory|OOM|lost/i.test(e.message) ? ' Try a smaller brain.' : ''); $('#loadBtn').disabled = false; });
};
$('#testSrc').onclick = async () => {
  const ul = $('#srcResults'); ul.innerHTML = ''; $('#testSrc').disabled = true;
  const row = (n, ok, d) => { const li = document.createElement('li'); li.innerHTML = `<span><b>${esc(n)}</b><br><span class="hint">${esc(clip(d, 120))}</span></span><span class="${ok ? 'ok' : 'bad'}">${ok ? 'Works' : 'Failed'}</span>`; ul.appendChild(li); };
  const tests = [['Weather', () => toolWeather('weather')], ['News', () => toolNews('news')], ['Web search', () => toolWeb('Los Angeles population')], ['Crypto', () => toolCrypto('bitcoin price')], ['Currency', () => toolCurrency('1 usd to mxn')], ['Read a web page', () => toolRead('https://example.com')]];
  for (const [n, f] of tests) { try { const r = await f(); row(n, true, r.text.split('\n').slice(0, 2).join(' ')); } catch (e) { row(n, false, e.message); } }
  $('#testSrc').disabled = false;
};
$('#clearChats').onclick = () => { if (busy) { $('#dataHint').textContent = 'Wait until OMEGA finishes answering.'; return; } if ($('#clearChats').dataset.sure) { chats = []; store.set('chats', chats); newChat(); $('#dataHint').textContent = 'All chats deleted.'; delete $('#clearChats').dataset.sure; $('#clearChats').textContent = 'Delete all chats'; } else { $('#clearChats').dataset.sure = '1'; $('#clearChats').textContent = 'Tap again to delete all chats'; } };
$('#clearCache').onclick = async () => {
  if (loading || busy) { $('#dataHint').textContent = 'Wait until OMEGA finishes loading or answering.'; return; }
  let n = 0;
  try { const { Wllama } = await getWllama(); const w = new Wllama({ default: WLLAMA_WASM }, { suppressNativeLog: true, allowOffline: true }); const keep = loadedKey && modelOf(loadedKey).engine === 'cpu' ? modelOf(loadedKey).file : '\u0000'; await w.cacheManager.deleteMany(e => { const hit = !(e.metadata && e.metadata.originalURL || e.name || '').includes(keep); if (hit) n++; return hit; }); } catch (e) { }
  try { if ('gpu' in navigator && !IS_IOS) { const w = await getWebLLM(); for (const m of MODELS.filter(m => m.engine === 'gpu' && m.key !== loadedKey)) for (const id of [m.f16, m.f32]) { try { await w.deleteModelAllInfoInCache(id); } catch (e) { } } } } catch (e) { }
  $('#dataHint').textContent = 'Removed downloaded brains that are not running right now.'; renderSettings();
};

// memory sheet
function fillProfile() { $('#pName').value = profile.name || ''; $('#pCity').value = profile.city || ''; $('#pAbout').value = profile.about || ''; $('#pStyle').value = profile.style || ''; }
$('#saveP').onclick = () => { profile = { name: $('#pName').value.trim(), city: $('#pCity').value.trim(), about: $('#pAbout').value.trim(), style: $('#pStyle').value.trim() }; store.set('profile', profile); $('#pSaved').textContent = 'Saved'; if (!chat) refreshWelcome(); };
function renderFacts() {
  $('#facts').innerHTML = facts.length ? facts.map((f, i) => `<li><span>${esc(f)}</span><button data-f="${i}">Forget</button></li>`).join('') : '<li class="hint">Nothing yet.</li>';
  $('#lessons').innerHTML = lessons.length ? lessons.map((l, i) => `<li><span><b>${esc(clip(l.q, 80))}</b><br>${esc(clip(l.fix, 200))}</span><button data-l="${i}">Remove</button></li>`).join('') : '<li class="hint">No lessons yet. Use 👎 on an answer to teach OMEGA.</li>';
}
$('#facts').onclick = e => { const i = e.target.dataset.f; if (i == null) return; facts.splice(+i, 1); store.set('facts', facts); renderFacts(); };
$('#lessons').onclick = e => { const i = e.target.dataset.l; if (i == null) return; lessons.splice(+i, 1); store.set('lessons', lessons); renderFacts(); };
$('#addFact').onclick = () => { const v = $('#newFact').value.trim(); if (!v) return; facts.push(v); store.set('facts', facts); $('#newFact').value = ''; renderFacts(); };
$('#newFact').addEventListener('keydown', e => { if (e.key === 'Enter') $('#addFact').click(); });

// feedback
let fbCtx = null;
function openFeedback(q, a) { fbCtx = { q, a }; $('#fbText').value = ''; openSheet('#fbSheet'); setTimeout(() => $('#fbText').focus(), 50); }
$('#fbSave').onclick = () => { const v = $('#fbText').value.trim(); if (!v || !fbCtx) return closeSheets(); lessons.push({ q: fbCtx.q, a: fbCtx.a, fix: v, t: Date.now() }); lessons = lessons.slice(-100); store.set('lessons', lessons); renderFacts(); closeSheets(); };

// export training data (for the Kaggle notebook)
$('#exportTrain').onclick = () => {
  const sys = systemPrompt(false).split('\n\n')[0];
  const rows = [
    ...liked.map(x => ({ messages: [{ role: 'system', content: sys }, { role: 'user', content: x.q }, { role: 'assistant', content: x.a }] })),
    ...lessons.filter(x => x.fix.length > 20).map(x => ({ messages: [{ role: 'system', content: sys }, { role: 'user', content: x.q }, { role: 'assistant', content: x.fix }] })),
  ];
  const blob = new Blob([rows.map(r => JSON.stringify(r)).join('\n')], { type: 'application/jsonl' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'omega_training.jsonl'; document.body.appendChild(a); a.click(); a.remove();
};

// voice input (Safari / Chrome speech recognition)
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
if (SR) {
  const mic = $('#mic'); mic.hidden = false; let rec = null;
  mic.onclick = () => {
    if (rec) { rec.stop(); return; }
    rec = new SR(); rec.lang = 'en-US'; rec.interimResults = true; rec.continuous = false;
    const base = inp.value ? inp.value + ' ' : '';
    rec.onresult = ev => { inp.value = base + [...ev.results].map(r => r[0].transcript).join(''); grow(); voiceAsk = true; };
    rec.onend = () => { rec = null; mic.style.color = ''; };
    rec.onerror = () => { rec = null; mic.style.color = ''; };
    mic.style.color = 'var(--acc)'; try { rec.start(); } catch (e) { rec = null; mic.style.color = ''; }
  };
}

// pressing Stop cancels the brain mid-sentence; that cancel isn't an error
addEventListener('unhandledrejection', e => { if (/abort/i.test(String(e.reason && (e.reason.name || e.reason.message) || e.reason))) e.preventDefault(); });
// ---------------- composer extras: attach, think, chat search, share, theme ----------------
$('#attachBtn').onclick = () => { if (!busy) $('#fileIn').click(); };
$('#fileIn').onchange = e => { addFiles(e.target.files); e.target.value = ''; };
// paste or drop photos/files straight into the box
inp.addEventListener('paste', e => { const fs = [...(e.clipboardData && e.clipboardData.files || [])]; if (fs.length) { e.preventDefault(); addFiles(fs); } });
document.addEventListener('dragover', e => { if (e.dataTransfer && [...e.dataTransfer.types].includes('Files')) e.preventDefault(); });
document.addEventListener('drop', e => { if (e.dataTransfer && e.dataTransfer.files.length) { e.preventDefault(); addFiles(e.dataTransfer.files); } });
$('#thinkChip').onclick = () => { const on = $('#thinkChip').getAttribute('aria-pressed') !== 'true'; $('#thinkChip').setAttribute('aria-pressed', String(on)); settings.think = on; store.set('settings', settings); };
if (settings.think) $('#thinkChip').setAttribute('aria-pressed', 'true');
$('#chatSearch').addEventListener('input', renderChats);
function syncTop() { $('#shareChat').hidden = !(chat && chat.turns.length); }
$('#shareChat').onclick = async () => {
  if (!chat) return;
  const md = `# ${chat.title}\n\n` + chat.turns.map(t => (t.role === 'user' ? '**You:** ' : '**OMEGA:** ') + (t.att ? '[' + t.att.files.map(f => f.name).join(', ') + '] ' : '') + t.text).join('\n\n');
  try { if (navigator.share && IS_PHONE) { await navigator.share({ title: chat.title, text: md }); return; } } catch (e) { if (e.name === 'AbortError') return; }
  const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([md], { type: 'text/markdown' })); a.download = (chat.title.replace(/[^\w -]+/g, '').trim().slice(0, 40) || 'omega-chat') + '.md'; document.body.appendChild(a); a.click(); a.remove();
};
function applyTheme() {
  const t = settings.theme || 'auto';
  if (t === 'auto') document.documentElement.removeAttribute('data-theme'); else document.documentElement.setAttribute('data-theme', t);
  document.querySelectorAll('#themeSeg button').forEach(b => b.classList.toggle('on', b.dataset.theme === t));
  const dark = t === 'dark' || (t === 'auto' && matchMedia('(prefers-color-scheme: dark)').matches);
  document.querySelectorAll('meta[name=theme-color]').forEach(m => { m.removeAttribute('media'); m.content = dark ? '#262624' : '#faf9f5'; });
}
document.querySelectorAll('#themeSeg button').forEach(b => b.onclick = () => { settings.theme = b.dataset.theme; store.set('settings', settings); applyTheme(); });
applyTheme();
// ---------------- boot ----------------
fillProfile(); renderFacts(); renderChats(); syncChips(); grow(); refreshWelcome();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
  // the multi-core brain needs the page to be served by the offline helper: reload once when it first takes over (never mid-answer)
  if (!window.crossOriginIsolated && typeof SharedArrayBuffer === 'undefined') navigator.serviceWorker.ready.then(() => {
    let tried = false; try { tried = !!sessionStorage.getItem('omega.coi'); sessionStorage.setItem('omega.coi', '1'); } catch (e) { tried = true; }
    if (tried) return;
    const go = () => { if (!busy && !loading && !engine) location.reload(); };
    if (navigator.serviceWorker.controller) go(); else navigator.serviceWorker.addEventListener('controllerchange', go, { once: true });
  }).catch(() => { });
}
// keep the downloaded brain from being cleared by the browser when storage is low
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
window.OMEGA = { threads: () => ({ isolated: !!window.crossOriginIsolated, cores: navigator.hardwareConcurrency || 1, brainThreads: brainThreads() }), quickMath, decideTools, currencyPair, placeFrom, isClockQuestion, toolWeather, toolTime, toolNews, toolCrypto, toolCurrency, version: VERSION };
