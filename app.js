// OMEGA — a personal AI that runs entirely on your device.
// Brain: open-source models via WebLLM (WebGPU). Live info: free public APIs, no keys.
// Two engines:
//  • CPU brain (wllama = llama.cpp in WebAssembly): runs on the processor. Reliable on iPhone. Default.
//  • GPU brain (WebLLM, WebGPU): faster on computers. Optional; iPhone Safari's graphics process crashes easily.
const WEBLLM_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.89';
const WLLAMA_URL = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@4.0.0/esm/index.js';
const WLLAMA_WASM = 'https://cdn.jsdelivr.net/npm/@wllama/wllama@4.0.0/esm/wasm/wllama.wasm';
const PROXY = 'https://proxy.cors.dev/';
const VERSION = '3.9.1';

const MODELS = [
  { key: 'cpu-qwen3-0.6b', engine: 'cpu', name: 'Qwen3 0.6B', repo: 'unsloth/Qwen3-0.6B-GGUF', file: 'Qwen3-0.6B-Q4_K_M.gguf', sizeMB: 400, memMB: 650, thinking: true, desc: 'Recommended for phones and tablets. Runs on the processor, so it does not crash.' },
  { key: 'cpu-qwen3.5-0.8b', engine: 'cpu', name: 'Qwen3.5 0.8B', repo: 'unsloth/Qwen3.5-0.8B-GGUF', file: 'Qwen3.5-0.8B-Q4_K_M.gguf', sizeMB: 533, memMB: 800, thinking: true, desc: 'Newer and smarter than Qwen3 0.6B, still light enough for phones.' },
  { key: 'cpu-lfm2.5-1.2b', engine: 'cpu', name: 'LFM2.5 1.2B', repo: 'LiquidAI/LFM2.5-1.2B-Instruct-GGUF', file: 'LFM2.5-1.2B-Instruct-Q4_K_M.gguf', sizeMB: 731, memMB: 1000, ctx: 8192, desc: 'Fast and sharp, built for phones by Liquid AI.' },
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
// apps run in a locked-down frame where saving data (localStorage) is blocked; give them a pretend one so they don't crash
const STORAGE_SHIM = "<script>(function(){function mem(){var d={};return{getItem:function(k){return Object.prototype.hasOwnProperty.call(d,k)?d[k]:null},setItem:function(k,v){d[k]=String(v)},removeItem:function(k){delete d[k]},clear:function(){d={}},key:function(i){return Object.keys(d)[i]||null},get length(){return Object.keys(d).length}}}['localStorage','sessionStorage'].forEach(function(n){try{window[n].getItem('x')}catch(e){try{Object.defineProperty(window,n,{value:mem(),configurable:true})}catch(_){}}})})();<\/script>";
const withShim = code => /<head[^>]*>/i.test(code) ? code.replace(/<head[^>]*>/i, m => m + STORAGE_SHIM) : STORAGE_SHIM + code;
function openPlayer(code) {
  closePlayer();
  const kind = appKind(code, '');
  const p = document.createElement('div'); p.className = 'player'; p.id = 'player';
  p.innerHTML = `<div class="pbar"><button class="pclose" aria-label="Close">✕ Close</button><span class="ptitle">${esc(appTitle(code, kind))}</span><button class="pcopy">🔗 Copy link</button></div>`;
  const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals allow-pointer-lock'); f.setAttribute('allow', 'autoplay; fullscreen'); f.srcdoc = withShim(code); p.appendChild(f);
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
  if (b.dataset.linkfor) { if (!b.getAttribute('href')) { e.preventDefault(); const c = codes[b.dataset.linkfor]; const w = window.open('', '_blank'); if (c) makeLink(c.code).then(u => { b.href = u; if (w) w.location.href = u; else location.href = u; }); } return; } // a new tab, so OMEGA stays open
  if (b.dataset.copy && codes[b.dataset.copy]) copyText(codes[b.dataset.copy].code, b);
  if (b.dataset.run && codes[b.dataset.run]) runCode(codes[b.dataset.run], document.getElementById('r-' + b.dataset.run));
});

// ---------------- code runner ----------------
function runCode({ lang, code }, out) {
  out.innerHTML = '';
  if (/^(html|htm|svg)$/.test(lang)) { const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals'); f.srcdoc = withShim(code); out.appendChild(f); return; }
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
  let t = String(text), was;
  do { was = t; t = t.replace(/^\s*(hey|yo|omega|bro|please|pls|can you|could you|search( for| up)?|look up|google)\b[, ]*/i, ''); } while (t !== was && t);
  return (t || String(text)).replace(/\s+/g, ' ').trim().slice(0, 200);
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
// deep research: several searches + reading the top pages, then the brain writes a report with sources
async function toolResearch(text) {
  const q = cleanQuery(text.replace(/^(please\s+)?(do (some )?)?(deep\s+)?(research|deep dive)(\s+(on|into|about))?\s*/i, '')) || cleanQuery(text);
  const year = new Date().getFullYear();
  const runs = await Promise.allSettled([toolWeb(q), toolWeb(q + ' ' + year), toolWeb(q + ' pros and cons tips')]);
  const parts = [], sources = [], seen = new Set();
  for (const r of runs) if (r.status === 'fulfilled') { parts.push(r.value.text); for (const x of r.value.sources) if (!seen.has(x.url)) { seen.add(x.url); sources.push(x); } }
  if (!parts.length) throw new Error('No web sources answered');
  const pages = sources.filter(x => !/wikipedia|duckduckgo/i.test(x.url)).slice(0, 3);
  const reads = await Promise.allSettled(pages.map(x => toolRead(x.url)));
  for (const r of reads) if (r.status === 'fulfilled') parts.push(clip(r.value.text, 2500));
  return { label: 'Research', text: `DEEP RESEARCH on "${q}" (searched ${runs.filter(r => r.status === 'fulfilled').length} times and read ${reads.filter(r => r.status === 'fulfilled').length} pages just now). Write a clear, organized report with headings and bullet points, and cite sources by name:\n\n` + parts.join('\n\n'), sources: sources.slice(0, 8) };
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
// ---------------- stock prices (Yahoo Finance through the free proxy; may be delayed) ----------------
const STOCKS = { apple: 'AAPL', tesla: 'TSLA', nvidia: 'NVDA', microsoft: 'MSFT', amazon: 'AMZN', google: 'GOOGL', alphabet: 'GOOGL', meta: 'META', facebook: 'META', netflix: 'NFLX', amd: 'AMD', intel: 'INTC', disney: 'DIS', nike: 'NKE', 'coca cola': 'KO', coke: 'KO', walmart: 'WMT', costco: 'COST', gamestop: 'GME', amc: 'AMC', palantir: 'PLTR', uber: 'UBER', spotify: 'SPOT', starbucks: 'SBUX', mcdonalds: 'MCD', "mcdonald's": 'MCD', boeing: 'BA', ford: 'F', 'general motors': 'GM', paypal: 'PYPL', visa: 'V', jpmorgan: 'JPM', 'home depot': 'HD', 'lowes': 'LOW', "lowe's": 'LOW', 'take two': 'TTWO', 'take-two': 'TTWO', rockstar: 'TTWO', sony: 'SONY', nintendo: 'NTDOY', 'roblox': 'RBLX', 'coinbase': 'COIN', 'robinhood': 'HOOD', 's&p 500': '^GSPC', 's&p': '^GSPC', 'sp500': '^GSPC', 'dow jones': '^DJI', 'the dow': '^DJI', nasdaq: '^IXIC', spy: 'SPY', qqq: 'QQQ' };
function stockSymbols(text) {
  const t = text.toLowerCase(), out = new Set();
  if (!/\b(stocks?|shares?|share price|market|ticker|trading|nasdaq|s&p|dow|etf)\b|\$[a-z]{1,5}\b/i.test(text)) return [];
  for (const m of text.matchAll(/\$([A-Za-z]{1,5})\b/g)) out.add(m[1].toUpperCase());
  for (const [k, v] of Object.entries(STOCKS)) if (new RegExp('(^|[^a-z])' + k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^a-z]|$)').test(t)) out.add(v);
  for (const m of text.matchAll(/\b([A-Z]{2,5})\b(?=\s+(stock|shares?|price))/g)) out.add(m[1]);
  if (!out.size && /\b(stock market|the market|markets|stocks today)\b/.test(t)) ['^GSPC', '^DJI', '^IXIC'].forEach(s => out.add(s));
  return [...out].slice(0, 4);
}
async function toolStock(text) {
  const syms = stockSymbols(text); if (!syms.length) throw new Error('no stock');
  const rows = await Promise.all(syms.map(s => fetchT(PROXY + `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(s)}?range=5d&interval=1d`, { ms: 12000 }).then(d => {
    const m = d.chart.result[0].meta, p = m.regularMarketPrice, prev = m.chartPreviousClose || m.previousClose, ch = p - prev, pct = prev ? ch / prev * 100 : 0;
    const when = m.regularMarketTime ? new Date(m.regularMarketTime * 1000).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }) : '';
    return `${m.longName || m.shortName || s} (${m.symbol}): ${p.toLocaleString('en-US', { maximumFractionDigits: 2 })} ${m.currency || ''}, ${ch >= 0 ? '+' : ''}${ch.toFixed(2)} (${pct >= 0 ? '+' : ''}${pct.toFixed(2)}%) vs the last close${when ? ', as of ' + when : ''}`;
  }).catch(() => null)));
  const lines = rows.filter(Boolean); if (!lines.length) throw new Error('no prices');
  return { label: 'Stocks', plain: '📈 ' + lines.join('\n'), text: 'STOCK PRICES (Yahoo Finance, live or slightly delayed). Give the numbers; this is info, not investment advice:\n' + lines.join('\n'), sources: [{ title: 'Yahoo Finance', url: 'https://finance.yahoo.com/quote/' + encodeURIComponent(syms[0]) }] };
}

// ---------------- sports scores (ESPN's free scoreboard, no key) ----------------
const TEAMS = {"basketball/nba":[["atl","Atlanta Hawks","hawks","atlanta"],["bos","Boston Celtics","celtics","boston"],["bkn","Brooklyn Nets","nets","brooklyn"],["cha","Charlotte Hornets","hornets","charlotte"],["chi","Chicago Bulls","bulls","chicago"],["cle","Cleveland Cavaliers","cavaliers","cleveland"],["dal","Dallas Mavericks","mavericks","dallas"],["den","Denver Nuggets","nuggets","denver"],["det","Detroit Pistons","pistons","detroit"],["gs","Golden State Warriors","warriors","golden state"],["hou","Houston Rockets","rockets","houston"],["ind","Indiana Pacers","pacers","indiana"],["lac","LA Clippers","clippers","la"],["lal","Los Angeles Lakers","lakers","los angeles"],["mem","Memphis Grizzlies","grizzlies","memphis"],["mia","Miami Heat","heat","miami"],["mil","Milwaukee Bucks","bucks","milwaukee"],["min","Minnesota Timberwolves","timberwolves","minnesota"],["no","New Orleans Pelicans","pelicans","new orleans"],["ny","New York Knicks","knicks","new york"],["okc","Oklahoma City Thunder","thunder","oklahoma city"],["orl","Orlando Magic","magic","orlando"],["phi","Philadelphia 76ers","76ers","philadelphia"],["phx","Phoenix Suns","suns","phoenix"],["por","Portland Trail Blazers","trail blazers","portland"],["sac","Sacramento Kings","kings","sacramento"],["sa","San Antonio Spurs","spurs","san antonio"],["tor","Toronto Raptors","raptors","toronto"],["utah","Utah Jazz","jazz","utah"],["wsh","Washington Wizards","wizards","washington"]],"football/nfl":[["ari","Arizona Cardinals","cardinals","arizona"],["atl","Atlanta Falcons","falcons","atlanta"],["bal","Baltimore Ravens","ravens","baltimore"],["buf","Buffalo Bills","bills","buffalo"],["car","Carolina Panthers","panthers","carolina"],["chi","Chicago Bears","bears","chicago"],["cin","Cincinnati Bengals","bengals","cincinnati"],["cle","Cleveland Browns","browns","cleveland"],["dal","Dallas Cowboys","cowboys","dallas"],["den","Denver Broncos","broncos","denver"],["det","Detroit Lions","lions","detroit"],["gb","Green Bay Packers","packers","green bay"],["hou","Houston Texans","texans","houston"],["ind","Indianapolis Colts","colts","indianapolis"],["jax","Jacksonville Jaguars","jaguars","jacksonville"],["kc","Kansas City Chiefs","chiefs","kansas city"],["lv","Las Vegas Raiders","raiders","las vegas"],["lac","Los Angeles Chargers","chargers","los angeles"],["lar","Los Angeles Rams","rams","los angeles"],["mia","Miami Dolphins","dolphins","miami"],["min","Minnesota Vikings","vikings","minnesota"],["ne","New England Patriots","patriots","new england"],["no","New Orleans Saints","saints","new orleans"],["nyg","New York Giants","giants","new york"],["nyj","New York Jets","jets","new york"],["phi","Philadelphia Eagles","eagles","philadelphia"],["pit","Pittsburgh Steelers","steelers","pittsburgh"],["sf","San Francisco 49ers","49ers","san francisco"],["sea","Seattle Seahawks","seahawks","seattle"],["tb","Tampa Bay Buccaneers","buccaneers","tampa bay"],["ten","Tennessee Titans","titans","tennessee"],["wsh","Washington Commanders","commanders","washington"]],"baseball/mlb":[["ari","Arizona Diamondbacks","diamondbacks","arizona"],["ath","Athletics","athletics","athletics"],["atl","Atlanta Braves","braves","atlanta"],["bal","Baltimore Orioles","orioles","baltimore"],["bos","Boston Red Sox","red sox","boston"],["chc","Chicago Cubs","cubs","chicago"],["chw","Chicago White Sox","white sox","chicago"],["cin","Cincinnati Reds","reds","cincinnati"],["cle","Cleveland Guardians","guardians","cleveland"],["col","Colorado Rockies","rockies","colorado"],["det","Detroit Tigers","tigers","detroit"],["hou","Houston Astros","astros","houston"],["kc","Kansas City Royals","royals","kansas city"],["laa","Los Angeles Angels","angels","los angeles"],["lad","Los Angeles Dodgers","dodgers","los angeles"],["mia","Miami Marlins","marlins","miami"],["mil","Milwaukee Brewers","brewers","milwaukee"],["min","Minnesota Twins","twins","minnesota"],["nym","New York Mets","mets","new york"],["nyy","New York Yankees","yankees","new york"],["phi","Philadelphia Phillies","phillies","philadelphia"],["pit","Pittsburgh Pirates","pirates","pittsburgh"],["sd","San Diego Padres","padres","san diego"],["sf","San Francisco Giants","giants","san francisco"],["sea","Seattle Mariners","mariners","seattle"],["stl","St. Louis Cardinals","cardinals","st. louis"],["tb","Tampa Bay Rays","rays","tampa bay"],["tex","Texas Rangers","rangers","texas"],["tor","Toronto Blue Jays","blue jays","toronto"],["wsh","Washington Nationals","nationals","washington"]],"hockey/nhl":[["ana","Anaheim Ducks","ducks","anaheim"],["bos","Boston Bruins","bruins","boston"],["buf","Buffalo Sabres","sabres","buffalo"],["cgy","Calgary Flames","flames","calgary"],["car","Carolina Hurricanes","hurricanes","carolina"],["chi","Chicago Blackhawks","blackhawks","chicago"],["col","Colorado Avalanche","avalanche","colorado"],["cbj","Columbus Blue Jackets","blue jackets","columbus"],["dal","Dallas Stars","stars","dallas"],["det","Detroit Red Wings","red wings","detroit"],["edm","Edmonton Oilers","oilers","edmonton"],["fla","Florida Panthers","panthers","florida"],["la","Los Angeles Kings","kings","los angeles"],["min","Minnesota Wild","wild","minnesota"],["mtl","Montreal Canadiens","canadiens","montreal"],["nsh","Nashville Predators","predators","nashville"],["nj","New Jersey Devils","devils","new jersey"],["nyi","New York Islanders","islanders","new york"],["nyr","New York Rangers","rangers","new york"],["ott","Ottawa Senators","senators","ottawa"],["phi","Philadelphia Flyers","flyers","philadelphia"],["pit","Pittsburgh Penguins","penguins","pittsburgh"],["sj","San Jose Sharks","sharks","san jose"],["sea","Seattle Kraken","kraken","seattle"],["stl","St. Louis Blues","blues","st. louis"],["tb","Tampa Bay Lightning","lightning","tampa bay"],["tor","Toronto Maple Leafs","maple leafs","toronto"],["utah","Utah Mammoth","mammoth","utah"],["van","Vancouver Canucks","canucks","vancouver"],["vgk","Vegas Golden Knights","golden knights","vegas"],["wsh","Washington Capitals","capitals","washington"],["wpg","Winnipeg Jets","jets","winnipeg"]],"basketball/wnba":[["atl","Atlanta Dream","dream","atlanta"],["chi","Chicago Sky","sky","chicago"],["dal","Dallas Wings","wings","dallas"],["gs","Golden State Valkyries","valkyries","golden state"],["ind","Indiana Fever","fever","indiana"],["lv","Las Vegas Aces","aces","las vegas"],["la","Los Angeles Sparks","sparks","los angeles"],["min","Minnesota Lynx","lynx","minnesota"],["ny","New York Liberty","liberty","new york"],["phx","Phoenix Mercury","mercury","phoenix"],["por","Portland Fire","fire","portland"],["sea","Seattle Storm","storm","seattle"],["tor","Toronto Tempo","tempo","toronto"],["wsh","Washington Mystics","mystics","washington"]]};
const SEASON = { 'football/nfl': [9, 10, 11, 12, 1, 2], 'basketball/nba': [10, 11, 12, 1, 2, 3, 4, 5, 6], 'hockey/nhl': [10, 11, 12, 1, 2, 3, 4, 5, 6], 'baseball/mlb': [3, 4, 5, 6, 7, 8, 9, 10], 'basketball/wnba': [5, 6, 7, 8, 9, 10] };
const SPORT_WORDS = /\b(how did|how are|doing|game|games|won|win|wins|lose|lost|loses|score|scores|play|plays|playing|played|next|tonight|last night|yesterday|beat|record|vs\.?|versus|season|schedule|match|kick ?off|tip ?off|standings)\b/;
function findTeam(text) {
  const t = ' ' + text.toLowerCase().replace(/[’']/g, "'") + ' ';
  const hint = /\b(nfl|football)\b/.test(t) ? 'football/nfl' : /\b(nba|basketball)\b/.test(t) ? 'basketball/nba' : /\b(nhl|hockey)\b/.test(t) ? 'hockey/nhl' : /\b(mlb|baseball)\b/.test(t) ? 'baseball/mlb' : /\bwnba\b/.test(t) ? 'basketball/wnba' : '';
  const month = new Date().getMonth() + 1, hits = [];
  const t2 = t.replace(/\b(la|l\.a\.)\b/g, 'los angeles').replace(/\bny\b/g, 'new york').replace(/\bsf\b/g, 'san francisco');
  for (const [lg, list] of Object.entries(TEAMS)) for (const [abbr, full, nick, loc] of list) {
    const re = new RegExp('\\b(' + full.toLowerCase().replace(/[.]/g, '\\.') + '|' + nick.replace(/[.]/g, '\\.') + ')\\b');
    if (re.test(t)) hits.push({ lg, abbr, full, nick, exact: t.includes(full.toLowerCase()), here: !!loc && t2.includes(loc) });
  }
  if (!hits.length) return null;
  const score = h => (h.exact ? 100 : 0) + (h.here ? 40 : 0) + (h.lg === hint ? 50 : 0) + ((SEASON[h.lg] || []).includes(month) ? 10 : 0) + (5 - Object.keys(TEAMS).indexOf(h.lg));
  const best = hits.sort((a, b) => score(b) - score(a))[0];
  if (!best.exact && !hint && !SPORT_WORDS.test(t)) return null; // "the heat" or "the magic" alone isn't about a team
  return best;
}
async function toolSports(text) {
  const tm = findTeam(text); if (!tm) throw new Error('no team');
  const d = await fetchT(`https://site.api.espn.com/apis/site/v2/sports/${tm.lg}/teams/${tm.abbr}/schedule`, { ms: 15000 });
  const evs = (d.events || []).map(e => { const c = e.competitions && e.competitions[0]; return c ? { e, c, when: new Date(e.date), st: (c.status && c.status.type) || {} } : null; }).filter(Boolean);
  const done = evs.filter(x => x.st.completed).sort((a, b) => b.when - a.when);
  const live = evs.find(x => x.st.state === 'in');
  const next = evs.filter(x => !x.st.completed && x.st.state === 'pre' && x.when > Date.now() - 3 * 3600e3).sort((a, b) => a.when - b.when)[0];
  const side = x => { const us = x.c.competitors.find(c => (c.team.abbreviation || '').toLowerCase() === tm.abbr) || x.c.competitors[0], them = x.c.competitors.find(c => c !== us); return { us, them, home: us.homeAway === 'home' }; };
  const sc = c => (c.score && (c.score.displayValue || c.score.value)) || c.score || '0';
  const day = w => w.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }), time = w => w.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZoneName: 'short' });
  const lines = [];
  if (live) { const s = side(live); lines.push(`LIVE NOW: ${s.us.team.shortDisplayName} ${sc(s.us)}, ${s.them.team.shortDisplayName} ${sc(s.them)} (${live.st.shortDetail || live.st.detail || 'in progress'})`); }
  if (done[0]) { const s = side(done[0]), w = s.us.winner ? 'won' : s.them.winner ? 'lost' : 'tied'; lines.push(`Last game (${day(done[0].when)}): ${tm.full} ${w}, ${s.us.team.shortDisplayName} ${sc(s.us)} - ${s.them.team.shortDisplayName} ${sc(s.them)} (${s.home ? 'home' : 'away'})`); }
  if (done[1]) { const s = side(done[1]); lines.push(`Game before that (${day(done[1].when)}): ${s.us.team.shortDisplayName} ${sc(s.us)} - ${s.them.team.shortDisplayName} ${sc(s.them)}`); }
  if (next) { const s = side(next), tv = ((next.c.broadcasts || [])[0] || {}).media; lines.push(`Next game: ${day(next.when)} at ${time(next.when)}, ${s.home ? 'vs' : 'at'} ${s.them.team.displayName}${tv && tv.shortName ? ' (on ' + tv.shortName + ')' : ''}`); }
  const rec = d.team && d.team.recordSummary; if (rec) lines.push(`Record: ${rec}${d.team.standingSummary ? ', ' + d.team.standingSummary : ''}`);
  if (!lines.length) throw new Error('no games found');
  return { label: 'Sports', plain: `🏟 ${tm.full}\n` + lines.join('\n'), text: `SPORTS (ESPN, live) for the ${tm.full}:\n` + lines.join('\n'), sources: [{ title: 'ESPN', url: `https://www.espn.com/${tm.lg.split('/')[1]}/team/_/name/${tm.abbr}` }] };
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
// ---- instant unit answers: "how many feet in a mile", "5 cups to ml", "60 mph in km/h" (no internet needed) ----
const U = {}; // unit -> [kind, size in base unit, singular, plural]
const addU = (kind, list) => { for (const [k, f, s, p, words] of list) U[k] = { kind, f, s, p, words }; };
addU('length', [['mm', 0.001, 'millimeter', 'millimeters', 'mm|millimeters?|millimetres?'], ['cm', 0.01, 'centimeter', 'centimeters', 'cm|centimeters?|centimetres?'], ['m', 1, 'meter', 'meters', 'm|meters?|metres?'], ['km', 1000, 'kilometer', 'kilometers', 'km|kms|kilometers?|kilometres?|klicks?'], ['in', 0.0254, 'inch', 'inches', 'in|inch|inches|"'], ['ft', 0.3048, 'foot', 'feet', 'ft|foot|feet|\''], ['yd', 0.9144, 'yard', 'yards', 'yds?|yards?'], ['mi', 1609.344, 'mile', 'miles', 'mi|miles?'], ['nmi', 1852, 'nautical mile', 'nautical miles', 'nautical miles?|nmi']]);
addU('mass', [['mg', 1e-6, 'milligram', 'milligrams', 'mg|milligrams?'], ['g', 0.001, 'gram', 'grams', 'g|grams?|gr'], ['kg', 1, 'kilogram', 'kilograms', 'kg|kgs|kilograms?|kilos?'], ['oz', 0.028349523125, 'ounce', 'ounces', 'oz|ounces?'], ['lb', 0.45359237, 'pound', 'pounds', 'lbs?|pounds?'], ['st', 6.35029318, 'stone', 'stone', 'stones?'], ['ton', 907.18474, 'ton', 'tons', 'tons?|short tons?'], ['t', 1000, 'metric ton', 'metric tons', 'metric tons?|tonnes?']]);
addU('volume', [['ml', 0.001, 'milliliter', 'milliliters', 'ml|milliliters?|millilitres?'], ['l', 1, 'liter', 'liters', 'l|liters?|litres?'], ['tsp', 0.00492892159375, 'teaspoon', 'teaspoons', 'tsp|teaspoons?'], ['tbsp', 0.01478676478125, 'tablespoon', 'tablespoons', 'tbsp|tablespoons?'], ['floz', 0.0295735295625, 'fluid ounce', 'fluid ounces', 'fl ?oz|fluid ounces?'], ['cup', 0.2365882365, 'cup', 'cups', 'cups?'], ['pt', 0.473176473, 'pint', 'pints', 'pints?|pt'], ['qt', 0.946352946, 'quart', 'quarts', 'quarts?|qt'], ['gal', 3.785411784, 'gallon', 'gallons', 'gallons?|gal']]);
addU('time', [['ms', 0.001, 'millisecond', 'milliseconds', 'ms|milliseconds?'], ['s', 1, 'second', 'seconds', 's|secs?|seconds?'], ['min', 60, 'minute', 'minutes', 'mins?|minutes?'], ['h', 3600, 'hour', 'hours', 'h|hrs?|hours?'], ['day', 86400, 'day', 'days', 'days?'], ['wk', 604800, 'week', 'weeks', 'weeks?|wks?'], ['mo', 2629746, 'month', 'months', 'months?'], ['yr', 31556952, 'year', 'years', 'years?|yrs?']]);
addU('speed', [['mph', 0.44704, 'mph', 'mph', 'mph|miles per hour|miles an hour'], ['kmh', 1 / 3.6, 'km/h', 'km/h', 'km/h|kph|kmh|kilometers per hour|kilometres per hour'], ['mps', 1, 'm/s', 'm/s', 'm/s|meters per second'], ['kn', 0.514444, 'knot', 'knots', 'knots?']]);
addU('area', [['sqft', 0.09290304, 'square foot', 'square feet', 'sq ?ft|square feet|square foot|ft2'], ['sqm', 1, 'square meter', 'square meters', 'sq ?m|square meters?|square metres?|m2'], ['acre', 4046.8564224, 'acre', 'acres', 'acres?'], ['ha', 10000, 'hectare', 'hectares', 'hectares?|ha'], ['sqmi', 2589988.110336, 'square mile', 'square miles', 'sq ?mi|square miles?'], ['sqkm', 1e6, 'square kilometer', 'square kilometers', 'sq ?km|square kilometers?|square kilometres?|km2']]);
addU('data', [['b', 1, 'byte', 'bytes', 'bytes?'], ['kb', 1e3, 'KB', 'KB', 'kb|kilobytes?'], ['mb', 1e6, 'MB', 'MB', 'mb|megabytes?|megs?'], ['gb', 1e9, 'GB', 'GB', 'gb|gigabytes?|gigs?'], ['tb', 1e12, 'TB', 'TB', 'tb|terabytes?']]);
const U_ALT = Object.entries(U).flatMap(([k, u]) => u.words.split('|').map(w => [w, k])).sort((a, b) => b[0].length - a[0].length);
const U_RE = U_ALT.map(([w]) => w.replace(/[.*+?^${}()[\]\\]/g, m => m === '?' ? '?' : '\\' + m)).join('|');
const unitKey = w => { w = String(w || '').toLowerCase().trim(); for (const [alt, k] of U_ALT) if (new RegExp('^(?:' + alt + ')$', 'i').test(w)) return k; return null; };
const NUMW = { a: 1, an: 1, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12, half: 0.5, quarter: 0.25, dozen: 12, hundred: 100, thousand: 1000 };
const numOf = s => { s = String(s || '').trim().toLowerCase(); if (!s) return 1; if (NUMW[s] != null) return NUMW[s]; const fr = s.match(/^(\d+)\/(\d+)$/); if (fr) return +fr[1] / +fr[2]; const n = parseFloat(s); return isNaN(n) ? null : n; };
const prettyNum = v => { const a = Math.abs(v); const r = a >= 100 ? Math.round(v * 100) / 100 : a >= 1 ? Math.round(v * 1e4) / 1e4 : +v.toPrecision(4); return fmtNum(r); };
function convertUnits(n, from, to) {
  const a = U[from], b = U[to]; if (!a || !b || a.kind !== b.kind || from === to) return null;
  const v = n * a.f / b.f;
  return `${fmtNum(n)} ${n === 1 ? a.s : a.p} = **${prettyNum(v)} ${Math.abs(v) === 1 ? b.s : b.p}**`;
}
function unitAnswer(text) {
  const t = ' ' + text.toLowerCase().replace(/,(?=\d{3})/g, '').replace(/[?!]/g, ' ').replace(/\s+/g, ' ') + ' ';
  const N = '(\\d+(?:\\.\\d+)?|\\d+\\/\\d+|a|an|one|two|three|four|five|six|seven|eight|nine|ten|twelve|half(?: a)?|a quarter|a dozen|a hundred|a thousand)';
  const UN = '(' + U_RE + ')';
  let m;
  // "how many feet in a mile", "how many cups are in 2 gallons", "how many ounces is a pound"
  if ((m = t.match(new RegExp('how (?:many|much)\\s+' + UN + '\\s+(?:are |is )?(?:there )?(?:in|per|is|are|make|makes|equals?|to)\\s+(?:' + N + '\\s*)?' + UN + '\\b', 'i')))) {
    const to = unitKey(m[1]), from = unitKey(m[3]), n = numOf((m[2] || '1').replace(/^(half) a$/, '$1').replace(/^a (quarter|dozen|hundred|thousand)$/, '$1'));
    if (to && from && n != null) return convertUnits(n, from, to);
  }
  // "5 miles to km", "a mile in feet", "convert 60 mph to km/h", "10 kg = lbs"
  if ((m = t.match(new RegExp('(?:^|\\s)' + N + '\\s*' + UN + '\\s+(?:to|in|into|=|equals?|is how many|in how many|as)\\s+' + UN + '(?=\\s|$)', 'i')))) {
    const n = numOf(m[1].replace(/^(half) a$/, '$1').replace(/^a (quarter|dozen|hundred|thousand)$/, '$1')), from = unitKey(m[2]), to = unitKey(m[3]);
    if (from && to && n != null) return convertUnits(n, from, to);
  }
  // temperature, incl. kelvin
  if ((m = t.match(/(-?\d+(?:\.\d+)?)\s*(?:°|degrees?)?\s*(f|fahrenheit|c|celsius|centigrade|k|kelvin)\b.*?\b(?:to|in|into)\s*(?:°|degrees?)?\s*(f|fahrenheit|c|celsius|k|kelvin)\b/))) {
    const v = +m[1], f = m[2][0], to = m[3][0]; if (f === to) return null;
    const c = f === 'f' ? (v - 32) * 5 / 9 : f === 'k' ? v - 273.15 : v, r = to === 'f' ? c * 9 / 5 + 32 : to === 'k' ? c + 273.15 : c;
    const L = x => x === 'k' ? ' K' : '°' + x.toUpperCase();
    return `${v}${L(f)} = **${fmtNum(Math.round(r * 10) / 10)}${L(to)}**`;
  }
  return null;
}
// tips and simple money math: "20% tip on 45", "what's 15% off 80", "split 120 between 4"
function moneyAnswer(text) {
  const t = text.toLowerCase().replace(/[$,?]/g, '').trim(); let m;
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s+tip\s+(?:on|for|of)\s+(\d+(?:\.\d+)?)/)) || (m = t.match(/tip\s+(?:on|for)\s+(\d+(?:\.\d+)?)\s+(?:at|with)\s+(\d+(?:\.\d+)?)\s*(?:%|percent)/))) {
    const [p, b] = /tip\s+(?:on|for)/.test(m[0]) && !/^\d/.test(m[0]) ? [+m[2], +m[1]] : [+m[1], +m[2]];
    const tip = b * p / 100; return `${p}% tip on $${fmtNum(b)} = **$${tip.toFixed(2)}** (total **$${(b + tip).toFixed(2)}**)`;
  }
  if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:%|percent)\s+off\s+(?:of\s+)?(\d+(?:\.\d+)?)/))) { const p = +m[1], b = +m[2]; return `${p}% off $${fmtNum(b)} = **$${(b * (1 - p / 100)).toFixed(2)}** (you save $${(b * p / 100).toFixed(2)})`; }
  if ((m = t.match(/split\s+(\d+(?:\.\d+)?)\s+(?:between|among|by|with|for)\s+(\d+)/))) { const b = +m[1], n = +m[2]; if (n > 0) return `$${fmtNum(b)} split ${n} ways = **$${(b / n).toFixed(2)} each**`; }
  if ((m = t.match(/(\d+(?:\.\d+)?)\s+is\s+what\s+(?:%|percent)\s+of\s+(\d+(?:\.\d+)?)/))) { const a = +m[1], b = +m[2]; if (b) return `${fmtNum(a)} is **${prettyNum(a / b * 100)}%** of ${fmtNum(b)}`; }
  return null;
}
function quickMath(text) {
  const conv = unitAnswer(text) || moneyAnswer(text) || quickConvert(text); if (conv) return conv;
  let t = text.toLowerCase().replace(/,(?=\d{3})/g, '').replace(/[?!=]+/g, ' ').trim();
  t = t.replace(/^(yo|hey|bro|omega|ok|okay)[, ]+/g, '').replace(/^(what'?s|whats|what is|how much is|calculate|calc|compute|solve)\s+/, '').replace(/\s+(equal|equals|be)$/, '');
  const pct = t.match(/^(\d+(?:\.\d+)?)\s*(?:%|percent)\s+of\s+(\d+(?:\.\d+)?)$/);
  if (pct) { const v = +pct[1] / 100 * +pct[2]; return `${pct[1]}% of ${pct[2]} is ${fmtNum(v)}.`; }
  const e = t.replace(/\b(times|multiplied by|x)\b|×/g, '*').replace(/\b(divided by|over)\b|÷/g, '/').replace(/\bplus\b/g, '+').replace(/\bminus\b/g, '-').replace(/\bsquared\b/g, '**2').replace(/\bcubed\b/g, '**3').replace(/\^/g, '**').replace(/\s+/g, '');
  if (!/^[\d.+\-*/()]+$/.test(e) || !/\d[+\-*/]+[\d(]|\*\*\d/.test(e) || e.length > 60) return null;
  try { const v = Function('"use strict";return (' + e + ')')(); if (typeof v !== 'number' || !isFinite(v)) return null; return `${e.replace(/\*\*/g, '^').replace(/\*/g, ' × ').replace(/\//g, ' ÷ ').replace(/\+/g, ' + ').replace(/(\d)-/g, '$1 - ')} = ${fmtNum(v)}`; } catch (_) { return null; }
}
const fmtNum = v => Math.abs(v) >= 1e15 ? v.toExponential(4) : (+v.toFixed(6)).toLocaleString('en-US', { maximumFractionDigits: 6 });
// ---- follow-ups: "show me the current info" means current info about what we were just talking about ----
function prevUserText() {
  if (!chat || !chat.turns) return '';
  const us = chat.turns.filter(t => t.role === 'user'); // the newest is the message being answered
  return us.length >= 2 ? String(us[us.length - 2].text || '') : '';
}
function isFollowUp(text) {
  const prev = prevUserText(); if (!prev) return false;
  const t = text.toLowerCase(), words = t.split(/\s+/).filter(Boolean).length;
  if (words > 22) return false;
  const cue = /\b(it|its|it's|that|this|those|these|he|him|his|she|her|hers|they|them|their|there|current(ly)?|up.?to.?date|updated?|latest|newest|recent|now|today|more|again|instead|same|also|what about|how about|and the|not the|before|older?|then|thing|one|account|profile|page)\b/.test(t);
  const names = (text.match(/\b[A-Z][a-z]{2,}|\b[a-z]+\d+[a-z0-9_]*\b|@\w+/g) || []).filter(w => !/^(I|Show|Tell|Give|What|How|Why|When|Where|Who|Can|Could|Please|Now|Not|The|And|But|Bro|Yo|Hey)$/.test(w));
  const wantsLive = /\b(current(ly)?|up.?to.?date|updated?|latest|newest|recent|right now|today|this (week|month|year)|news)\b/.test(t);
  return cue && names.length === 0 && (!!chat.lastTopic || wantsLive); // only when the last answer used live info, or this one asks for it
}
async function standaloneQuery(text, ui) {
  const prev = prevUserText(), lastA = chat.turns.filter(t => t.role === 'assistant').slice(-1)[0];
  let q = '';
  if (cloudOn()) {
    try {
      const sys = 'You turn a chat follow-up into ONE standalone web search query. Use the earlier messages to fill in what "it/he/that/this/current/the account" refers to. Keep names, usernames and handles exactly. Max 12 words. Reply with only the query, no quotes.';
      const user = `Earlier user message: ${clip(prev, 400)}\n${chat.lastTopic ? 'Last thing searched: ' + chat.lastTopic + '\n' : ''}Assistant's last answer (start): ${clip(lastA ? String(lastA.text || '') : '', 300)}\nNew follow-up: ${clip(text, 300)}\n\nSearch query:`;
      const o = { maxTokens: 60, temperature: 0, bg: true, onText: () => { } };
      const out = await Promise.race([cloudChat([{ role: 'system', content: sys }, { role: 'user', content: user }], o), sleep(9000).then(() => '')]);
      q = thinkStrip(out || '').split('\n').map(s => s.trim()).filter(Boolean)[0] || '';
      q = q.replace(/^(search query|query)\s*:\s*/i, '').replace(/^["'“]|["'”]$/g, '').trim();
    } catch (_) { }
  }
  if (!q || q.length < 3 || q.length > 160) q = ((chat.lastTopic || cleanQuery(prev)) + ' ' + text.replace(/\b(show me|tell me|give me|the|not|before|dates?|please|bro|info(rmation)?)\b/gi, ' ')).replace(/\s+/g, ' ').trim(); // simple backup: earlier topic + new words
  if (ui) step(ui, `🔁 Understood as: "${clip(q, 70)}"`);
  return q;
}
const SOCIAL = /\b(instagram|insta|ig|tiktok|tik tok|twitter|x\.com|threads|facebook|fb|snapchat|snap|youtube channel|twitch)\b/i;
// ================= PLUG-INS AND CONNECTORS =================
// Plug-ins: free services OMEGA can use (one tap to add). Connectors: MCP servers (the same kind Claude uses).
// Your own plug-in: any web address that answers with text or JSON, with {q} where the search words go.
const plugSettings = () => { settings.plugins = settings.plugins || {}; settings.plugins.on = settings.plugins.on || PLUGINS.map(p => p.id); /* the free plug-ins start switched on */ settings.plugins.custom = settings.plugins.custom || []; settings.plugins.conn = settings.plugins.conn || []; settings.toolsOff = settings.toolsOff || {}; return settings.plugins; };
const plugSave = () => store.set('settings', settings);
const htmlText = s => String(s || '').replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();
const afterWord = (t, re) => { const m = t.match(re); return m ? m[m.length - 1].trim().replace(/[?.!]+$/, '') : ''; };
const BUILTINS = [
  ['web', '🔎', 'Web search', 'Searches the internet for current info'], ['news', '📰', 'News', 'Latest headlines'], ['weather', '🌤', 'Weather', 'Forecasts for your city or anywhere'],
  ['sports', '🏟', 'Sports scores', 'Live ESPN scores and schedules'], ['stocks', '📈', 'Stocks', 'Live stock prices'], ['crypto', '🪙', 'Crypto', 'Live coin prices'],
  ['currency', '💱', 'Currency', 'Exchange rates'], ['time', '🕒', 'World clock', 'Time anywhere'], ['read', '🔗', 'Read links', 'Reads web pages you paste'],
];
const toolOn = name => { plugSettings(); return !settings.toolsOff[name]; };
const PLUGINS = [
  { id: 'dictionary', icon: '📖', name: 'Dictionary', desc: 'Definitions, how words are said, and examples', when: /\b(define|definition of|meaning of|what does [\w'-]+ mean|what is the meaning|how do you (say|pronounce))\b/i,
    run: async t => { const w = (afterWord(t, /(?:define|definition of|meaning of|pronounce)\s+(?:the word\s+)?["']?([\w'-]+)/i) || afterWord(t, /what does\s+["']?([\w'-]+)["']?\s+mean/i)).toLowerCase(); if (!w) throw new Error('no word'); const d = await fetchT('https://api.dictionaryapi.dev/api/v2/entries/en/' + encodeURIComponent(w)); const e = d[0]; const lines = [`${e.word}${e.phonetic ? ' ' + e.phonetic : ''}`]; for (const m of e.meanings.slice(0, 3)) for (const x of m.definitions.slice(0, 2)) lines.push(`(${m.partOfSpeech}) ${x.definition}${x.example ? ' Example: "' + x.example + '"' : ''}`); const syn = [...new Set(e.meanings.flatMap(m => m.synonyms || []))].slice(0, 6); if (syn.length) lines.push('Similar words: ' + syn.join(', ')); return { label: 'Dictionary', text: 'DICTIONARY:\n' + lines.join('\n'), sources: [{ title: 'Free Dictionary', url: 'https://dictionaryapi.dev/' }] }; } },
  { id: 'words', icon: '🔤', name: 'Rhymes and synonyms', desc: 'Words that rhyme, other ways to say something (great for lyrics and captions)', when: /\b(rhymes? with|words? that rhyme|synonyms? (for|of)|another word for|other words for|antonyms? (for|of)|opposite of)\b/i,
    run: async t => { const w = afterWord(t, /(?:rhymes? with|rhyme with|synonyms? (?:for|of)|another word for|other words for|antonyms? (?:for|of)|opposite of)\s+["']?([\w' -]+?)["']?(?:\s|$)/i).split(' ')[0]; if (!w) throw new Error('no word'); const kind = /rhym/i.test(t) ? 'rel_rhy' : /antonym|opposite/i.test(t) ? 'rel_ant' : 'ml'; const d = await fetchT(`https://api.datamuse.com/words?${kind}=${encodeURIComponent(w)}&max=30`); const list = d.map(x => x.word).slice(0, 30); if (!list.length) throw new Error('none'); return { label: 'Words', text: `${kind === 'rel_rhy' ? 'WORDS THAT RHYME WITH' : kind === 'rel_ant' ? 'OPPOSITES OF' : 'SIMILAR WORDS TO'} "${w}" (Datamuse): ${list.join(', ')}`, sources: [{ title: 'Datamuse', url: 'https://www.datamuse.com/api/' }] }; } },
  { id: 'recipes', icon: '🍳', name: 'Recipes', desc: 'Real recipes with ingredients and steps', when: /\b(recipe|recipes|how (do i|to|can i) (make|cook|bake)|ingredients (for|in))\b/i,
    run: async t => { const q = afterWord(t, /(?:recipe for|recipes? for|make|cook|bake|ingredients (?:for|in))\s+(?:a |an |some |the )?([\w ]{2,40})/i).split(' ').slice(0, 3).join(' ') || cleanQuery(t); const d = await fetchT('https://www.themealdb.com/api/json/v1/1/search.php?s=' + encodeURIComponent(q)); const m = d.meals && d.meals[0]; if (!m) throw new Error('no recipe found'); const ing = []; for (let i = 1; i <= 20; i++) { const x = (m['strIngredient' + i] || '').trim(); if (x) ing.push(`${(m['strMeasure' + i] || '').trim()} ${x}`.trim()); } return { label: 'Recipe', text: `RECIPE: ${m.strMeal} (${m.strArea || ''} ${m.strCategory || ''})\nIngredients: ${ing.join('; ')}\nSteps: ${clip(m.strInstructions, 1800)}`, sources: [{ title: 'TheMealDB: ' + m.strMeal, url: m.strSource || 'https://www.themealdb.com/' }] }; } },
  { id: 'books', icon: '📚', name: 'Books', desc: 'Find books, authors and when they came out', when: /\b(books? (by|about|like|on)|novels? (by|about)|who wrote|author of|good books?|book called)\b/i,
    run: async t => { const q = cleanQuery(t).replace(/\b(books?|novels?|by|about|who wrote|author of|good|book called|recommend|me|some|the)\b/gi, ' ').replace(/\s+/g, ' ').trim() || cleanQuery(t); const d = await fetchT(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=6&fields=title,author_name,first_publish_year,key`); const rows = (d.docs || []).map(b => `${b.title} by ${(b.author_name || ['?']).slice(0, 2).join(', ')}${b.first_publish_year ? ' (' + b.first_publish_year + ')' : ''}`); if (!rows.length) throw new Error('no books'); return { label: 'Books', text: 'BOOKS (Open Library):\n' + rows.join('\n'), sources: [{ title: 'Open Library', url: 'https://openlibrary.org/search?q=' + encodeURIComponent(q) }] }; } },
  { id: 'tv', icon: '📺', name: 'TV shows', desc: 'Shows, when they air, seasons and where', when: /\b(tv show|tv series|show called|series called|seasons? of|episodes? of|new season|when does .+ (come out|air|return))\b/i,
    run: async t => { const q = cleanQuery(t).replace(/\b(tv|show|series|called|seasons?|episodes?|of|new|when|does|come out|air|return|is|the|how many|there)\b/gi, ' ').replace(/\s+/g, ' ').trim(); const d = await fetchT('https://api.tvmaze.com/search/shows?q=' + encodeURIComponent(q || t)); const s = d[0] && d[0].show; if (!s) throw new Error('no show'); return { label: 'TV', text: `TV SHOW (TVmaze): ${s.name}. Status: ${s.status}. Premiered: ${s.premiered || '?'}${s.ended ? ', ended ' + s.ended : ''}. Network: ${(s.network || s.webChannel || {}).name || '?'}. Rating: ${(s.rating || {}).average || '?'}. ${clip(htmlText(s.summary), 600)}`, sources: [{ title: 'TVmaze: ' + s.name, url: s.url }] }; } },
  { id: 'music', icon: '🎵', name: 'Music', desc: 'Songs, albums and release dates (Apple Music catalog)', when: /\b(songs? by|albums? by|new (song|album) (by|from)|discography|when did .+ (drop|release)|latest (song|album))\b/i,
    run: async t => { const q = cleanQuery(t).replace(/\b(songs?|albums?|by|new|from|latest|discography|when|did|drop|release|released|the|what|is|are)\b/gi, ' ').replace(/\s+/g, ' ').trim(); const ent = /album/i.test(t) ? 'album' : 'song'; const d = await fetchT(`https://itunes.apple.com/search?term=${encodeURIComponent(q)}&entity=${ent}&limit=10`); const rows = (d.results || []).sort((a, b) => (b.releaseDate || '').localeCompare(a.releaseDate || '')).slice(0, 8).map(x => `${x.trackName || x.collectionName} by ${x.artistName} (${(x.releaseDate || '').slice(0, 10)})`); if (!rows.length) throw new Error('nothing found'); return { label: 'Music', text: `MUSIC (Apple catalog, newest first):\n${rows.join('\n')}`, sources: [{ title: 'Apple Music', url: 'https://music.apple.com/search?term=' + encodeURIComponent(q) }] }; } },
  { id: 'quakes', icon: '🌎', name: 'Earthquakes', desc: 'Recent earthquakes worldwide (USGS)', when: /\bearthquakes?\b|\bquake\b/i,
    run: async () => { const d = await fetchT('https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson'); const rows = d.features.slice(0, 10).map(f => `M${f.properties.mag} ${f.properties.place} (${new Date(f.properties.time).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })})`); return { label: 'Earthquakes', text: 'EARTHQUAKES IN THE LAST DAY (USGS, newest first):\n' + rows.join('\n'), sources: [{ title: 'USGS', url: 'https://earthquake.usgs.gov/earthquakes/map/' }] }; } },
  { id: 'holidays', icon: '🎉', name: 'Holidays', desc: 'US holidays coming up', when: /\b(holiday|holidays|day off|federal holiday|bank holiday)\b/i,
    run: async () => { const y = new Date().getFullYear(); const [a, b] = await Promise.all([fetchT(`https://date.nager.at/api/v3/PublicHolidays/${y}/US`), fetchT(`https://date.nager.at/api/v3/PublicHolidays/${y + 1}/US`).catch(() => [])]); const today = new Date().toISOString().slice(0, 10); const rows = [...a, ...b].filter(h => h.date >= today).slice(0, 8).map(h => `${h.date}: ${h.localName}`); return { label: 'Holidays', text: 'UPCOMING US HOLIDAYS:\n' + rows.join('\n'), sources: [{ title: 'Nager.Date', url: 'https://date.nager.at/' }] }; } },
  { id: 'air', icon: '😷', name: 'Air quality', desc: 'Air quality (AQI) for your city', when: /\b(air quality|aqi|smog|pollution|smoke)\b/i,
    run: async t => { const place = placeFrom(t) || profile.city || 'Los Angeles'; const p = await geocode(place); const d = await fetchT(`https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${p.latitude}&longitude=${p.longitude}&current=us_aqi,pm2_5,pm10,ozone`); const c = d.current; const lvl = c.us_aqi <= 50 ? 'Good' : c.us_aqi <= 100 ? 'Moderate' : c.us_aqi <= 150 ? 'Unhealthy for sensitive groups' : c.us_aqi <= 200 ? 'Unhealthy' : 'Very unhealthy'; return { label: 'Air quality', plain: `😷 Air quality in ${p.name}: AQI ${c.us_aqi} (${lvl})`, text: `AIR QUALITY in ${p.name}, ${p.admin1 || ''} (Open-Meteo, now): US AQI ${c.us_aqi} (${lvl}), PM2.5 ${c.pm2_5}, PM10 ${c.pm10}, ozone ${c.ozone}`, sources: [{ title: 'Open-Meteo Air Quality', url: 'https://open-meteo.com/en/docs/air-quality-api' }] }; } },
  { id: 'pokemon', icon: '⚡', name: 'Pokémon', desc: 'Pokémon stats, types and abilities', when: /\bpok[eé]mon\b/i,
    run: async t => { const w = (afterWord(t, /pok[eé]mon\s+(?:called|named)?\s*([a-z-]+)/i) || afterWord(t, /\b([a-z-]+)\s+pok[eé]mon/i)).toLowerCase(); const d = await fetchT('https://pokeapi.co/api/v2/pokemon/' + encodeURIComponent(w)); return { label: 'Pokémon', text: `POKEMON ${d.name}: types ${d.types.map(x => x.type.name).join('/')}; abilities ${d.abilities.map(x => x.ability.name).join(', ')}; stats ${d.stats.map(s => s.stat.name + ' ' + s.base_stat).join(', ')}; height ${d.height / 10} m, weight ${d.weight / 10} kg`, sources: [{ title: 'PokéAPI', url: 'https://pokeapi.co/' }] }; } },
  { id: 'hn', icon: '🧑‍💻', name: 'Tech news', desc: 'Top stories on Hacker News', when: /\b(hacker news|tech news|startup news|what'?s new in tech)\b/i,
    run: async () => { const ids = (await fetchT('https://hacker-news.firebaseio.com/v0/topstories.json')).slice(0, 8); const its = await Promise.all(ids.map(i => fetchT(`https://hacker-news.firebaseio.com/v0/item/${i}.json`).catch(() => null))); const rows = its.filter(Boolean).map(x => `${x.title} (${x.score} points)`); return { label: 'Tech news', text: 'TOP TECH STORIES NOW (Hacker News):\n' + rows.join('\n'), sources: [{ title: 'Hacker News', url: 'https://news.ycombinator.com/' }] }; } },
];
const CONNECTOR_CATALOG = [
  { name: 'DeepWiki', icon: '🐙', url: 'https://mcp.deepwiki.com/mcp', desc: 'Ask questions about any GitHub project (how its code works)' },
  { name: 'Context7', icon: '📘', url: 'https://mcp.context7.com/mcp', desc: 'Up-to-date docs and code examples for coding libraries' },
];
// ---- connectors: talk to MCP servers over the internet (JSON-RPC) ----
let mcpId = 0; const mcpSid = {};
async function mcpRPC(c, method, params, notify) {
  const h = { 'Content-Type': 'application/json', Accept: 'application/json, text/event-stream', 'MCP-Protocol-Version': '2025-06-18' };
  if (c.token) h.Authorization = 'Bearer ' + c.token;
  if (mcpSid[c.id]) h['Mcp-Session-Id'] = mcpSid[c.id];
  const body = notify ? { jsonrpc: '2.0', method, params } : { jsonrpc: '2.0', id: ++mcpId, method, params };
  const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 30000);
  try {
    const r = await fetch(c.url, { method: 'POST', headers: h, body: JSON.stringify(body), signal: ctl.signal });
    const sid = r.headers.get('mcp-session-id'); if (sid) mcpSid[c.id] = sid;
    if (notify) return null;
    if (r.status === 401 || r.status === 403) throw new Error('this connector needs a key (paste a token)');
    if (!r.ok) throw Object.assign(new Error('connector error ' + r.status), { status: r.status });
    const ct = r.headers.get('content-type') || ''; let msg = null;
    if (ct.includes('event-stream')) { for (const line of (await r.text()).split('\n')) if (line.startsWith('data:')) { try { const j = JSON.parse(line.slice(5)); if (j.id === body.id) msg = j; } catch (_) { } } }
    else msg = await r.json();
    if (!msg) throw new Error('the connector did not answer');
    if (msg.error) throw new Error(msg.error.message || 'connector error');
    return msg.result;
  } catch (e) { if (e.name === 'AbortError') throw new Error('the connector took too long'); if (e instanceof TypeError) throw new Error("couldn't reach it (it may not allow apps in a browser)"); throw e; }
  finally { clearTimeout(tm); }
}
async function mcpConnect(c) {
  delete mcpSid[c.id];
  await mcpRPC(c, 'initialize', { protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'OMEGA', version: VERSION } });
  await mcpRPC(c, 'notifications/initialized', {}, true).catch(() => { });
  const r = await mcpRPC(c, 'tools/list', {});
  c.tools = (r.tools || []).slice(0, 40).map(t => ({ name: t.name, description: clip(t.description || '', 400), schema: t.inputSchema || {} }));
  c.ok = Date.now(); return c;
}
async function mcpCall(c, name, args) {
  if (!mcpSid[c.id]) await mcpConnect(c);
  let r;
  try { r = await mcpRPC(c, 'tools/call', { name, arguments: args || {} }); }
  catch (e) { if (e.status === 400 || e.status === 404 || /session/i.test(e.message)) { await mcpConnect(c); r = await mcpRPC(c, 'tools/call', { name, arguments: args || {} }); } else throw e; }
  const out = (r.content || []).map(p => p.type === 'text' ? p.text : p.type === 'resource' && p.resource ? p.resource.text || '' : '').join('\n');
  if (r.isError) throw new Error(clip(out || 'the tool failed', 120));
  return out;
}
const shortSchema = s => { const p = (s && s.properties) || {}; const o = {}; for (const [k, v] of Object.entries(p).slice(0, 8)) o[k] = clip((v.type || 'any') + (v.description ? ': ' + v.description : ''), 90); return { args: o, required: (s && s.required) || [] }; };
// ---- your own plug-ins: a web address with {q} ----
async function runCustom(p, q) {
  const url = p.url.replace(/\{q\}/g, encodeURIComponent(q)); const raw = await fetchT(url, { type: 'text', ms: 12000 });
  let text = raw; try { text = JSON.stringify(JSON.parse(raw)).slice(0, 4000); } catch (_) { text = clip(htmlText(raw), 4000); }
  return { label: p.name, text: `${p.name.toUpperCase()} (your plug-in, from ${new URL(url).hostname}):\n${text}`, sources: [{ title: p.name, url }] };
}
// ---- deciding which plug-ins to use for a message ----
// built-in plug-ins: fast word matching. Your own plug-ins and connectors: the cloud brain picks (one quick call).
function catalogTools(text, qtext) {
  const P = plugSettings();
  return PLUGINS.filter(p => P.on.includes(p.id) && (p.when.test(text) || p.when.test(qtext))).map(p => { const use = p.when.test(text) ? text : qtext; return ['plug:' + p.id, () => p.run(use), `${p.icon} Using ${p.name}`]; });
}
async function routedTools(text, qtext, ui) {
  const P = plugSettings(), cands = [];
  for (const p of P.custom) cands.push({ id: 'p:' + p.id, label: p.name, line: `${p.name}: ${p.desc || 'no description'} | args {"q":"search words"}`, run: a => runCustom(p, a.q || cleanQuery(qtext)) });
  for (const c of P.conn) for (const t of (c.tools || [])) cands.push({ id: `c:${c.id}:${t.name}`, label: `${c.name} (${t.name})`, line: `${c.name} → ${t.name}: ${t.description} | ${JSON.stringify(shortSchema(t.schema))}`, run: async a => ({ label: c.name, text: `${c.name.toUpperCase()} CONNECTOR, tool ${t.name}:\n` + clip(await mcpCall(c, t.name, a), 6000), sources: [{ title: c.name, url: c.url.replace(/\/mcp\/?$/, '') }] }) });
  if (!cands.length) return [];
  // only ask the brain when the message actually sounds like one of these tools (fast: most messages skip this)
  const words = new Set((text.toLowerCase().match(/[a-z0-9][a-z0-9_-]{2,}/g) || []).filter(w => !PAST_STOP.has(w) && !STOPW.has(w)));
  if (/\b[\w.-]+\/[\w.-]+\b/.test(text)) words.add('repository').add('github');
  const fits = c => { const desc = (c.label + ' ' + c.line).toLowerCase(); if (desc.includes(c.label.toLowerCase().split(/[\s(]/)[0]) && text.toLowerCase().includes(c.label.toLowerCase().split(/[\s(]/)[0])) return 9; let n = 0; for (const w of words) if (w.length >= 4 && desc.includes(w.replace(/s$/, ''))) n++; return n; };
  const scored = cands.map(c => [c, fits(c)]).filter(([, s]) => s >= 2);
  if (!scored.length) return [];
  if (ui) step(ui, '🧩 Picking the right plug-in');
  if (!cloudOn()) { // no cloud brain: only your own plug-ins, when their name is in the message
    return cands.filter(c => c.id.startsWith('p:') && new RegExp('\\b' + c.label.split(/\s+/)[0].replace(/[^\w]/g, '') + '\\b', 'i').test(text)).slice(0, 2).map(c => [c.id, () => c.run({ q: cleanQuery(qtext) }), `🧩 Using ${c.label}`]);
  }
  const offer = scored.sort((x, y) => y[1] - x[1]).slice(0, 8).map(([c]) => c);
  const sys = 'You decide which of the user\'s tools (if any) would really help answer their latest message. Only pick a tool when it clearly fits; most messages need none. Fill in the args from the message.\nTools (id | what it does | args):\n' + offer.map((c, i) => `${i + 1}. ${c.id} | ${c.line}`).join('\n') + '\nReply with JSON only: {"calls":[{"id":"...","args":{}}]} with at most 2 calls, or {"calls":[]}';
  const prev = prevUserText();
  const o = { maxTokens: 300, temperature: 0, bg: true, onText: () => { } };
  let out = ''; const cands0 = cands;
  try { out = await Promise.race([cloudChat([{ role: 'system', content: sys }, { role: 'user', content: (prev ? `(Earlier: ${clip(prev, 200)})\n` : '') + clip(text, 1200) }], o), sleep(30000).then(() => '')]); } catch (_) { return []; }
  const j = thinkStrip(out || '').match(/\{[\s\S]*\}/); if (!j) return [];
  let r; try { r = JSON.parse(j[0]); } catch (_) { return []; }
  return (Array.isArray(r.calls) ? r.calls : []).slice(0, 2).map(x => { const c = cands.find(c => c.id === x.id); return c ? [c.id, () => c.run(x.args && typeof x.args === 'object' ? x.args : {}), `🧩 Using ${c.label}`] : null; }).filter(Boolean);
}
// ---- the Plug-ins screen ----
function renderPlugins() {
  const P = plugSettings();
  $('#plugBuiltin').innerHTML = BUILTINS.map(([k, ic, n, d]) => `<label class="plugrow"><span class="pic">${ic}</span><span class="ptx"><b>${esc(n)}</b><span>${esc(d)}</span></span><input type="checkbox" data-tool="${k}" ${settings.toolsOff[k] ? '' : 'checked'}></label>`).join('');
  $('#plugCatalog').innerHTML = PLUGINS.map(p => { const on = P.on.includes(p.id); return `<div class="plugrow"><span class="pic">${p.icon}</span><span class="ptx"><b>${esc(p.name)}</b><span>${esc(p.desc)}</span></span><button type="button" class="${on ? '' : 'primary'}" data-plug="${p.id}">${on ? 'Added ✓' : 'Add'}</button></div>`; }).join('');
  $('#plugCustom').innerHTML = P.custom.map((p, i) => `<div class="plugrow"><span class="pic">🧩</span><span class="ptx"><b>${esc(p.name)}</b><span>${esc(clip(p.desc || p.url, 90))}</span></span><button type="button" data-delcustom="${i}">Remove</button></div>`).join('') || '<p class="hint">None yet.</p>';
  $('#connList').innerHTML = P.conn.map((c, i) => `<div class="plugrow"><span class="pic">🔌</span><span class="ptx"><b>${esc(c.name)}</b><span>${c.tools && c.tools.length ? `${c.tools.length} tools: ${esc(clip(c.tools.map(t => t.name).join(', '), 90))}` : 'Not connected yet'}${c.err ? ' · ⚠️ ' + esc(clip(c.err, 60)) : ''}</span></span><span class="keybtns"><button type="button" data-reconn="${i}">Refresh</button><button type="button" data-delconn="${i}">Remove</button></span></div>`).join('') || '<p class="hint">None yet.</p>';
  $('#connCatalog').innerHTML = CONNECTOR_CATALOG.map((c, i) => { const has = P.conn.some(x => x.url === c.url); return `<div class="plugrow"><span class="pic">${c.icon}</span><span class="ptx"><b>${esc(c.name)}</b><span>${esc(c.desc)}</span></span><button type="button" class="${has ? '' : 'primary'}" data-addconn="${i}" ${has ? 'disabled' : ''}>${has ? 'Added ✓' : 'Add'}</button></div>`; }).join('');
  $('#plugCount').textContent = P.on.length + P.custom.length + P.conn.length ? `${P.on.length + P.custom.length + P.conn.length} added` : '';
}
async function addConnector(c, msgEl) {
  const P = plugSettings();
  const item = { id: 'c' + Date.now().toString(36), name: c.name || new URL(c.url).hostname, url: c.url, token: c.token || '', tools: [] };
  msgEl.textContent = `Connecting to ${item.name}…`;
  try { await mcpConnect(item); item.err = ''; P.conn.push(item); plugSave(); msgEl.textContent = `✅ Connected to ${item.name}: ${item.tools.length} tools. Just ask OMEGA and it will use them when they fit.`; }
  catch (e) { msgEl.textContent = `Couldn't connect to ${item.name}: ${e.message}`; }
  renderPlugins();
}
function wirePlugins() {
  $('#openPlug').onclick = () => { openSheet('#plugSheet'); renderPlugins(); };
  $('#plugBuiltin').onchange = e => { const k = e.target.dataset.tool; if (!k) return; settings.toolsOff[k] = !e.target.checked; plugSave(); };
  $('#plugCatalog').onclick = e => { const b = e.target.closest('[data-plug]'); if (!b) return; const P = plugSettings(), id = b.dataset.plug; P.on = P.on.includes(id) ? P.on.filter(x => x !== id) : [...P.on, id]; plugSave(); renderPlugins(); };
  $('#plugCustom').onclick = e => { const b = e.target.closest('[data-delcustom]'); if (!b) return; plugSettings().custom.splice(+b.dataset.delcustom, 1); plugSave(); renderPlugins(); };
  $('#addCustom').onclick = () => {
    const name = $('#cName').value.trim(), url = $('#cUrl').value.trim(), desc = $('#cDesc').value.trim();
    if (!name || !/^https:\/\//i.test(url)) { $('#customMsg').textContent = 'Give it a name and a web address starting with https://'; return; }
    plugSettings().custom.push({ id: 'p' + Date.now().toString(36), name: name.slice(0, 40), url: /\{q\}/.test(url) ? url : url + (url.includes('?') ? '&' : '?') + 'q={q}', desc: desc.slice(0, 200) });
    plugSave(); $('#cName').value = $('#cUrl').value = $('#cDesc').value = ''; $('#customMsg').textContent = `✅ Added ${name}. OMEGA will use it when your message fits "${clip(desc || name, 60)}".`; renderPlugins();
  };
  $('#connCatalog').onclick = e => { const b = e.target.closest('[data-addconn]'); if (b) addConnector(CONNECTOR_CATALOG[+b.dataset.addconn], $('#connMsg')); };
  $('#addConn').onclick = () => { const url = $('#connUrl').value.trim(); if (!/^https:\/\//i.test(url)) { $('#connMsg').textContent = 'Paste the connector address (it starts with https://)'; return; } addConnector({ name: $('#connName').value.trim(), url, token: $('#connToken').value.trim() }, $('#connMsg')).then(() => { $('#connUrl').value = $('#connName').value = $('#connToken').value = ''; }); };
  $('#connList').onclick = async e => {
    const P = plugSettings(), d = e.target.closest('[data-delconn]'), r = e.target.closest('[data-reconn]');
    if (d) { P.conn.splice(+d.dataset.delconn, 1); plugSave(); renderPlugins(); return; }
    if (r) { const c = P.conn[+r.dataset.reconn]; $('#connMsg').textContent = `Refreshing ${c.name}…`; try { await mcpConnect(c); c.err = ''; $('#connMsg').textContent = `✅ ${c.name}: ${c.tools.length} tools`; } catch (err) { c.err = err.message; $('#connMsg').textContent = `${c.name}: ${err.message}`; } plugSave(); renderPlugins(); }
  };
}
function decideTools(text) {
  const t = text.toLowerCase(), tools = [];
  const url = ((text.match(/https?:\/\/[^\s)<>"']+/) || [])[0] || '').replace(/[.,!?;:]+$/, '');
  if (url) tools.push(['read', () => toolRead(url)]);
  if (/^(please\s+)?(do (some )?)?(deep\s+)?(research|deep dive)\b/.test(t) && t.split(/\s+/).length >= 2) return [['research', () => toolResearch(text)]];
  if (isClockQuestion(t)) tools.push(['time', () => toolTime(text)]);
  if (/\b(weather|temperature|forecast|rain(ing|y)?|snow(ing|y)?|humid|humidity|how hot|how cold|degrees outside|sunny|cloudy|windy|thunderstorms?|umbrella|jacket)\b/.test(t) && !/\b(song|album|lyrics|movie|film|band|rapper|track)\b/.test(t) || /\b(outside|outdoors?|beach|park|hike|bbq|barbecue|pour concrete|roofing|paint the)\b/.test(t) && /\b(today|tomorrow|tonight|weekend|monday|tuesday|wednesday|thursday|friday|saturday|sunday|this week)\b/.test(t)) tools.push(['weather', () => toolWeather(text)]);
  if (/\b(bitcoin|btc|ethereum|eth|crypto|solana|dogecoin|doge|xrp|cardano|litecoin|shiba|pepe)\b/.test(t) && /\b(price|worth|cost|how much|value|at|today|now|up|down)\b/.test(t)) tools.push(['crypto', () => toolCrypto(text)]);
  if (currencyPair(text)) tools.push(['currency', () => toolCurrency(text)]);
  if (stockSymbols(text).length && !/\b(make|build|code|create|design)\b/.test(t)) tools.push(['stocks', () => toolStock(text)]);
  const team = findTeam(text);
  if (team && !/\b(news|trade|rumou?rs?|injur(y|ies|ed)|signs?|signed|draft|make|build|code|create|design|draw)\b/.test(t)) return [...tools, ['sports', () => toolSports(text).catch(() => toolNews(text))]]; // exact scores and next game from ESPN
  if (/\b(news|headlines?|what'?s happening|what happened)\b/.test(t)) tools.push(['news', () => toolNews(text)]);
  // asking OMEGA to make/build/write something: answer with its own work, don't search the web (unless asked to search)
  const build = /\b(make|build|write|create|code|program|generate|design|draw|develop)\b/.test(t) && !/\b(search|look up|google|news|latest|price)\b/.test(t);
  // questions about the user themselves are answered from memory, not the web
  const personal = /\b(my name|my city|my business|my job|my age|my birthday|about me|who am i|do you (know|remember) (me|my)|what do you know about me|my favorite|my girlfriend|my boyfriend|my wife|my husband|my mom|my dad|my kids?)\b/.test(t) || /\b(when|what|where|how|who) (do|did|am|was|should) i\b.*\bmy\b/.test(t) || /\b(what|how) should i\b|\bshould i\b|\bwhat do you think\b|\badvice\b/.test(t) && !/\b(weather|rain|news|price|buy|stock|crypto)\b/.test(t);
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
const ctxOf = m => m.vision ? 4096 : (m.ctx || CTX); // LFM2.5 uses very little memory per word, so it gets a much bigger window
const ctxNow = () => engine && loadedKey ? ctxOf(modelOf(loadedKey)) : CTX;
function visionKey() { return settings.vision || (!IS_PHONE && (navigator.hardwareConcurrency || 1) >= 4 ? 'vis-lfm2-1.6b' : 'vis-lfm2-450m'); }
// how many processor cores the brain uses (only possible when the page is cross-origin isolated)
function brainThreads() {
  const c = navigator.hardwareConcurrency || 1;
  if (!window.crossOriginIsolated || c < 2 || IS_IOS) return 1; // iPhone/iPad: single-core is the proven, stable mode
  return IS_PHONE ? Math.min(4, Math.max(2, c - 2)) : Math.min(8, Math.max(2, c - 1));
}
async function startCpuBrain(m, cb, saved) {
  if (!wasmCheck()) throw new Error('This browser cannot run WebAssembly.');
  const { Wllama } = await getWllama();
  const w = new Wllama({ default: WLLAMA_WASM }, { suppressNativeLog: true, allowOffline: true });
  // load straight from the file address (skips Hugging Face's file-list lookup, so a saved brain opens with no internet)
  await w.loadModelFromUrl({ url: `https://huggingface.co/${m.repo}/resolve/main/${m.file}`, ...(m.mmproj ? { mmprojUrl: `https://huggingface.co/${m.repo}/resolve/main/${m.mmproj}` } : {}) }, {
    n_ctx: ctxOf(m), n_gpu_layers: 0, n_batch: 512, n_threads: brainThreads(), ...brainTuning(),
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
        if (window.__omegaStallOnce) { window.__omegaStallOnce = false; await new Promise(r => abort.signal.addEventListener('abort', r)); } // test switch: simulate a frozen brain
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
async function dropEngine() { if (typeof enginePending !== 'undefined' && enginePending) { try { e0stop(); } catch (_) { } await Promise.race([enginePending.catch(() => { }), new Promise(r => setTimeout(r, 60000))]); } const e = engine; engine = null; loadedKey = null; try { e && await e.unload(); } catch (_) { } }
function e0stop() { engine && engine.stop(); }
const thoughtsOf = t => { const m = String(t).match(/<think>([\s\S]*?)(?:<\/think>|$)/); return m ? m[1].trim() : ''; };
const thinkOn = () => $('#thinkChip') && $('#thinkChip').getAttribute('aria-pressed') === 'true';
// The thinking panel (like ChatGPT / Claude): while OMEGA works you see each step it takes and its thoughts streaming live;
// when it's done it folds into "Thought for 8s", which you can tap to open again.
function step(ui, txt) {
  if (!ui || !ui.think) return;
  ui.steps = ui.steps || []; if (!ui._t0) ui._t0 = Date.now();
  if (ui.steps[ui.steps.length - 1] === txt) return;
  ui.steps.push(txt); showThoughts(ui, null, ui._t0, false);
}
function showThoughts(ui, out, t0, done) {
  if (out != null) { const th = thoughtsOf(out); if (th) ui._th = th; }
  const th = ui._th || '', steps = ui.steps || [];
  if (!th && !steps.length) return;
  if (!ui._t0) ui._t0 = t0 || Date.now();
  const finished = !!done || (out != null && /<\/think>/.test(out));
  const secs = Math.max(1, Math.round((Date.now() - ui._t0) / 1000));
  if (finished && !ui.think.dataset.secs) ui.think.dataset.secs = secs;
  ui.think.hidden = false;
  const stepsHtml = steps.length ? `<ul class="steps">${steps.map((s, i) => `<li class="${!finished && i === steps.length - 1 && !th ? 'now' : 'did'}">${esc(s)}</li>`).join('')}</ul>` : '';
  const label = th ? `Thought for ${ui.think.dataset.secs || secs}s` : `Worked for ${ui.think.dataset.secs || secs}s · ${steps.length} step${steps.length === 1 ? '' : 's'}`;
  if (finished) {
    const wasOpen = !!ui.think.querySelector('details[open]');
    ui.think.innerHTML = `<details${wasOpen ? ' open' : ''}><summary>💡 ${label}</summary>${stepsHtml}<div class="tbody"></div></details>`;
    const b = ui.think.querySelector('.tbody'); if (b) { b.textContent = th; b.hidden = !th; }
  } else {
    if (!ui.think.querySelector('.tlive')) ui.think.innerHTML = `<div class="tlive"><div class="thead">💡 <span class="tl">Thinking</span><span class="dots"></span><span class="tsec"></span></div><div class="tsteps"></div><div class="tstream" hidden></div></div>`;
    ui.think.querySelector('.tsteps').innerHTML = stepsHtml;
    ui.think.querySelector('.tsec').textContent = ' ' + secs + 's';
    const s = ui.think.querySelector('.tstream');
    if (th) { s.hidden = false; s.textContent = th.length > 1500 ? '…' + th.slice(-1500) : th; s.scrollTop = s.scrollHeight; }
  }
}
// keep the "Thinking 7s" timer ticking while OMEGA works
setInterval(() => { document.querySelectorAll('.tlive .tsec').forEach(el => { const ui = el.closest('.msg') && el.closest('.msg')._ui; if (ui && ui._t0) el.textContent = ' ' + Math.round((Date.now() - ui._t0) / 1000) + 's'; }); }, 1000);
const thinkStrip = t => t.replace(/<think>[\s\S]*?<\/think>\s*/g, '').replace(/<think>[\s\S]*$/, '');

// ---------------- prompt ----------------
function systemPrompt(codeMode, hasLive) {
  const name = profile.name || 'the user';
  const who = profile.name || 'the user';
  // facts are saved in the user's words ("my team is the Rams"); rewrite them so the brain doesn't think "my" means itself
  const third = x => String(x).replace(/\bI am\b|\bI'm\b/gi, who + ' is').replace(/\bI have\b|\bI've\b/gi, who + ' has').replace(/\bmy\b/gi, who + "'s").replace(/\bmine\b/gi, who + "'s").replace(/\bI\b/g, who).replace(/\bme\b/gi, who);
  const f = facts.slice(-40).map(x => '- ' + third(x)).join('\n');
  const l = lessons.slice(-6).map(x => `- When asked "${clip(x.q, 120)}", ${name} said: ${clip(x.fix, 300)}`).join('\n');
  return [
    `You are OMEGA, ${name}'s personal AI assistant. You are an AI, not a person, so don't pretend to have a body, a personal life or human experiences. Happily help with anything ${name} asks: questions, advice, stories, jokes, scripts, captions, plans and code. Your name is OMEGA: if asked who or what you are, say you are OMEGA, ${name}'s own AI that runs right on their device (not ChatGPT, not Claude). Talk in a casual, warm, direct way, like a helpful friend texting back. Reply to exactly what ${name} said. Short answers for simple stuff, more detail when it's needed. ${name} often types fast or uses voice-to-text, so words can come out wrong (like "accord" for "occur", or a misspelled name). Work out what ${name} most likely meant and answer that directly. Never correct the spelling and never ask "did you mean...?". Only ask a short question if you truly can't guess what was meant.`,
    `Today is ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}${profile.city ? ` and ${name} is in ${profile.city}` : ''}.`,
    profile.style ? `How ${name} wants you to talk: ${profile.style}` : '',
    profile.about ? `About ${name}: ${profile.about}` : '',
    f ? `Facts about ${name} (when ${name} asks about "my ...", answer with "your ..."):\n${f}` : '',
    l ? `Feedback ${name} gave you before (follow it):\n${l}` : '',
    (store.get('promptVariant', '') === 'b' ? 'Answer common-knowledge questions directly. If you really do not know something, say so instead of making it up.' : 'If you do not know something, say so instead of making it up.'),
    codeMode ? 'CODING MODE: write complete, working code in fenced code blocks with a language tag (```html, ```javascript, ```python). For a game, app, website or anything visual: reply with ONE short sentence, then ONE complete self-contained ```html file (all CSS and JavaScript inside it, no outside files or images). It is played on a phone: fill the screen, and make taps/touches work (touchstart) as well as clicks and keys. Keep it simple so it is finished and works. Do not explain the code after it, and do not tell the user to save it to a file or open it in a browser: OMEGA shows a Play button for it. For plain scripts, JavaScript runs in a worker (use console.log).' : '',
  ].filter(Boolean).join('\n\n');
}
// questions about yourself ("what business do I run?"): hand the brain the matching saved facts right next to the question
const STOPW = new Set('the a an i my me is are was do does did what which who how when where why you your of to in on for and or it at with about again'.split(' '));
// ---- remembering past chats: when you bring up something from another chat, OMEGA looks through your old chats ----
const PAST_CUE = /\b(remember|recall|last time|earlier|before|previous(ly)?|we (talked|discussed|spoke|said|were|did|made|decided|planned|worked)|you (said|told|suggested|recommended|made|wrote|gave|helped)|i (told|said|asked|mentioned|showed|gave) you|other chat|another chat|old chat|that (chat|convo|conversation)|yesterday|last (week|night|month)|this morning|continue|pick up|left off|again|our|the (one|thing|idea|plan|game|app|script|video) (we|you|i))\b/i;
const PAST_STOP = new Set([...STOPW, 'remember', 'recall', 'talked', 'talk', 'said', 'told', 'tell', 'last', 'time', 'earlier', 'before', 'chat', 'chats', 'convo', 'conversation', 'yesterday', 'week', 'night', 'month', 'morning', 'can', 'could', 'would', 'should', 'that', 'this', 'thing', 'stuff', 'we', 'our', 'us', 'bro', 'hey', 'yo', 'like', 'just', 'know', 'think', 'remind', 'again', 'other', 'another', 'previous', 'discussed', 'mentioned', 'asked', 'gave', 'made', 'did', 'have', 'had', 'has', 'there', 'then', 'them', 'they', 'one', 'some', 'any', 'get', 'got', 'want', 'need', 'please', 'make', 'help', 'continue', 'left', 'off', 'pick', 'were', 'been', 'from', 'into', 'still', 'also', 'okay', 'ok']);
function pastWindow(text) {
  const day = 864e5, now = new Date(), start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  if (/\byesterday\b/i.test(text)) return [start - day, start];
  if (/\b(today|this morning|earlier today)\b/i.test(text)) return [start, Infinity];
  if (/\blast night\b/i.test(text)) return [start - day, start + 6 * 36e5];
  if (/\b(last|this|past) week\b/i.test(text)) return [start - 8 * day, Infinity];
  if (/\b(last|this|past) month\b/i.test(text)) return [start - 32 * day, Infinity];
  return null;
}
function searchPast(text) {
  const others = chats.filter(c => (!chat || c.id !== chat.id) && c.turns && c.turns.length);
  if (!others.length) return null;
  const win = pastWindow(text), inWin = c => !win || ((c.u || c.t || 0) >= win[0] && (c.u || c.t || 0) < win[1]);
  const words = [...new Set((text.toLowerCase().match(/[a-z0-9']{3,}/g) || []).map(w => w.replace(/'s$/, '')).filter(w => !PAST_STOP.has(w)))];
  const stem = w => w.length > 4 ? w.replace(/(ing|ed|es|s)$/, '') : w;
  const terms = words.map(stem);
  const df = t => others.filter(c => c.turns.some(x => String(x.text || '').toLowerCase().includes(t))).length;
  const idf = Object.fromEntries(terms.map(t => [t, Math.log(1 + others.length / (1 + df(t)))]));
  const scored = [];
  for (const c of others) {
    if (!inWin(c)) continue;
    let best = null, total = 0, hit = new Set();
    c.turns.forEach((t, i) => {
      const s = String(t.text || '').toLowerCase(); let sc = 0;
      for (const w of terms) if (s.includes(w)) { sc += idf[w] * (t.role === 'user' ? 1.3 : 1); hit.add(w); }
      total += sc; if (sc > 0 && (!best || sc > best.sc)) best = { i, sc };
    });
    const title = (c.title || '').toLowerCase(); for (const w of terms) if (title.includes(w)) { total += 2 * idf[w]; hit.add(w); }
    if (terms.length ? hit.size : win) scored.push({ c, best, score: terms.length ? total * (hit.size / terms.length + 0.3) : (c.u || c.t || 0), hits: hit.size });
  }
  scored.sort((x, y) => y.score - x.score);
  const top = scored.slice(0, 3).filter((x, k) => !terms.length || x.hits >= Math.min(2, terms.length) || (k === 0 && x.hits >= 1 && terms.length <= 2));
  if (!top.length) return null;
  const when = c => new Date(c.u || c.t || Date.now()).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const one = t => clip(String(t.text || '').replace(/```[\s\S]*?```/g, '[code]').replace(/\s+/g, ' '), 320);
  const notes = top.map(({ c, best }) => {
    let lines;
    if (best) { const i = best.i, q = c.turns[c.turns[i].role === 'user' ? i : Math.max(0, i - 1)], a2 = c.turns[c.turns[i].role === 'user' ? i + 1 : i]; lines = [q && q.role === 'user' ? 'User: ' + one(q) : '', a2 && a2.role !== 'user' ? 'You (OMEGA): ' + one(a2) : ''].filter(Boolean); }
    else lines = c.turns.filter(t => t.role === 'user').slice(0, 3).map(t => 'User: ' + one(t));
    return `Chat "${clip(c.title || 'untitled', 60)}" (${when(c)}):\n${lines.join('\n')}`;
  });
  return { text: notes.join('\n\n'), found: top.map(x => `"${clip(x.c.title || 'a chat', 34)}" (${when(x.c)})`), strong: !!top[0].hits && top[0].hits >= Math.min(3, terms.length) };
}
let pastNote = '', memPending = null; // what OMEGA found in your old chats for the message being answered
function memoryHint(text) {
  const past = pastNote ? `(From your past chats with me, in case it helps. Use it if the user is talking about it; do not mention chats that aren't relevant:\n${pastNote})\n\n` : '';
  return past + memoryHint0(text);
}
function memoryHint0(text) {
  if (!/\b(i|my|me|mine)\b/i.test(text) || !facts.length) return '';
  const words = text.toLowerCase().match(/[a-z']{3,}/g) || []; const key = words.filter(w => !STOPW.has(w));
  const scored = facts.map(f => ({ f, n: key.filter(w => f.toLowerCase().includes(w.replace(/s$/, ''))).length })).filter(x => x.n > 0).sort((a, b) => b.n - a.n).slice(0, 3);
  return scored.length ? `(What I told you before that may help: ${scored.map(x => x.f).join('; ')})\n\n` : '';
}
function historyFor(maxChars, keepCode) {
  const turns = (chat && chat.turns) || [];
  // what each turn looks like to the brain: the newest code stays whole (so "make it bigger" works), older code becomes [code]
  let codeKept = !keepCode;
  const parts = new Array(turns.length);
  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i], raw = String(t.text || '');
    let c;
    if (!codeKept && t.role !== 'user' && /```/.test(raw)) { c = raw.length <= maxChars * 0.8 ? raw : clip(raw, Math.floor(maxChars * 0.8)); codeKept = true; }
    else c = clip(raw.replace(/```[\s\S]*?(```|$)/g, '[code]'), 2500);
    parts[i] = { role: t.role === 'user' ? 'user' : 'assistant', content: c };
  }
  // speed: keep the START of the chat window fixed and only jump it forward (dropping about half) when it gets full.
  // The brain reuses everything it already read (prompt cache), so it only reads the new message most of the time,
  // instead of re-reading the whole chat on every message.
  const hs = chat ? (chat.hs = chat.hs || {}) : {};
  let st = Math.min(hs[maxChars] || 0, Math.max(0, turns.length - 1));
  const size = from => parts.slice(from).reduce((n, p) => n + p.content.length, 0);
  if (size(st) > maxChars) {
    if (window.__omegaNoSnap) { st = turns.length - 1; while (st > 0 && size(st - 1) <= maxChars) st--; }
    else while (st < turns.length - 2 && size(st) > maxChars * 0.5) st++;
    while (st < turns.length - 1 && turns[st].role !== 'user') st++;
    while (st < turns.length - 1 && size(st) > maxChars) st++; // one huge message: still fit
  }
  hs[maxChars] = st;
  const out = parts.slice(st);
  // long chat: remind the brain what came earlier (just the questions), so old topics aren't completely forgotten
  const older = turns.slice(0, st).filter(t => t.role === 'user').map(t => clip(String(t.text || '').replace(/\s+/g, ' '), 70));
  if (older.length && out.length) out[0] = { role: out[0].role, content: (out[0].role === 'user' ? `(Earlier in this chat ${profile.name || 'the user'} asked about: ${older.slice(-12).join(' / ')})\n\n` : '') + out[0].content };
  if (older.length && out.length && out[0].role !== 'user') out.unshift({ role: 'user', content: `(Earlier in this chat I asked about: ${older.slice(-12).join(' / ')})` }), out.splice(1, 0, { role: 'assistant', content: 'Got it.' });
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
  ['Research', 'free ways to get more construction leads in LA'],
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
    else setup = `<div class="setup"><h2>One-time setup</h2>${settings.auto && deviceCache ? `<p style="margin-bottom:6px"><b>Picked for your ${esc(kindWord(deviceCache.kind))}:</b> ${esc(m.name)}. ${esc(deviceCache.why)}</p>` : ''}${cloudOn() ? `<p style="margin-bottom:6px"><b>You can chat right now</b> with the free cloud brain. Download the phone brain too, so OMEGA also works offline and keeps your chats on this phone.</p>` : ''}<p>OMEGA's brain (${esc(m.name)}) downloads to this device once, then runs offline. It's about ${sizeText(m.sizeMB)}, so use Wi-Fi and keep this page open while it downloads.</p><button class="btn pri" id="setupGo">Download OMEGA's brain</button><div class="bar" id="setupBarWrap" hidden><div class="fill" id="setupBar"></div></div><p class="hint" id="setupText" style="margin-top:8px"></p></div>`;
  }
  let upgrade = '';
  if (engine && settings.auto && !modelOf(loadedKey).vision) {
    const d = await detectDevice(), r = modelOf(d.rec);
    const saved = await isCached(r).catch(() => false);
    if ((RANK[d.rec] || 0) > (RANK[loadedKey] || 0) && settings.skipRec !== d.rec) upgrade = `<div class="setup" style="margin-bottom:14px"><p style="margin:0 0 10px"><b>Your ${esc(kindWord(d.kind))} can run a smarter brain:</b> ${esc(r.name)} (${saved ? `already saved on this ${DEVICE}, switches in seconds` : 'about ' + sizeText(r.sizeMB)}). ${esc(d.why)}</p><button class="btn pri" id="recGo">${saved ? 'Switch' : 'Get'} ${esc(r.name)}</button> <button class="btn" id="recSkip">Not now</button><div class="bar" id="recBarWrap" hidden><div class="fill" id="recBar"></div></div><p class="hint" id="recText" style="margin-top:8px"></p></div>`;
  }
  if (chat) return;
  col.innerHTML = `${crashNote ? `<div class="err" style="max-width:520px;margin:8px auto">${esc(crashNote)}</div>` : ''}<div class="welcome"><div class="big">Ω</div><h1>${esc(greet())}${first}</h1><p>${engine || cloudOn() ? 'What do you want to get done?' : `Your own AI, running on your ${DEVICE}.`}</p>${engine ? `<p class="hint" style="margin:-10px 0 14px">✓ ${esc(modelOf(loadedKey).name)} is saved on this ${DEVICE}, so it opens instantly next time, even offline.</p>` : ''}${engine && IS_IOS && !STANDALONE ? `<div class="setup" style="margin-bottom:14px"><p style="margin:0"><b>Tip:</b> tap Share → <b>Add to Home Screen</b>. Safari can clear saved website data after 7 days without a visit, but not for Home Screen apps. (The Home Screen app downloads the brain once more the first time you open it.)</p></div>` : ''}${setup}${upgrade}${engine || cloudOn() ? `<div class="sugg">${SUGG.map((s, i) => `<button data-s="${i}"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></button>`).join('')}</div>` : ''}</div>`;
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
// edit a message: it goes back into the box, and that question + everything after it are removed
function editLast(node, text) {
  if (busy || !chat) return;
  // which of your messages was tapped (any message can be edited, not just the last one)
  const nth = [...col.querySelectorAll('.msg.user')].indexOf(node);
  let i = -1, seen = -1;
  for (let k = 0; k < chat.turns.length; k++) if (chat.turns[k].role === 'user' && ++seen === nth) { i = k; break; }
  if (i < 0) { i = chat.turns.length - 1; while (i >= 0 && chat.turns[i].role !== 'user') i--; }
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
const canvasBuf = (c, q = 0.85) => new Promise((r, no) => c.toBlob(b => b ? r(b.arrayBuffer()) : no(new Error("That photo couldn't be read. Try a screenshot of it or a JPG.")), 'image/jpeg', q));
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
    if (kind === 'video' && attachment.files.filter(f => f.kind === 'video').length >= 3) { problems.push('Up to 3 videos per message.'); continue; }
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
  // online with the free cloud brain: OMEGA's eyes describe the picture, then the big cloud brain answers (much smarter answers)
  if (cloudOn() && !cloudSees() && !stopFlag) { // the cloud can't see photos: OMEGA's eyes look, the cloud answers
    try {
      ui.work.hidden = false; ui.wt.textContent = vid ? 'Looking closely at your video…' : 'Looking closely at your photo…';
      const dparts = imgs.map(im => ({ type: 'image', data: im.data }));
      let desc = '';
      if (dparts.length) desc = (await engine.chat([{ role: 'system', content: sys }, { role: 'user', content: [...dparts, { type: 'text', text: `Describe ${imgs.length > 1 ? 'each picture' : 'this picture'} in detail: the objects, people, animals, colors, setting and anything unusual. Copy any text you see exactly.` }] }], { maxTokens: 320, temperature: 0.1, onText: () => { } })).trim();
      if (stopFlag) { turn.text = '(stopped)'; render(ui.ans, turn.text); return; }
      const seen = [vid ? 'Moments from the video:\n' + notes.join('\n') : '', desc ? (imgs.length > 1 ? 'The photos:\n' : 'The photo:\n') + desc : ''].filter(Boolean).join('\n\n');
      if (!seen.trim()) throw new Error('saw nothing');
      await answerInCloud(`${text || (vid ? 'What happens in this video?' : 'What is in this photo?')}\n\n(I attached ${vid ? `a ${Math.round(vid.duration || 0)}-second video` : imgs.length > 1 ? imgs.length + ' photos' : 'a photo'}. You can't see it yourself, but OMEGA's eyes looked at it and wrote this:\n${seen}\n${fileText ? '\nAttached text:\n' + clip(fileText, 3000) + '\n' : ''}Answer my question using that. Don't mention the notes, just answer naturally.)`, '', null, ui, turn);
      turn.think = 'What OMEGA saw:\n' + seen;
      showThoughts(ui, '<think>' + turn.think + '</think>', Date.now(), true); ui.think.querySelector('summary').textContent = vid ? '🎬 What OMEGA saw' : '👁 What OMEGA saw';
      ui.wt.textContent = `☁️ OMEGA's eyes looked, the cloud brain answered`;
      return;
    } catch (e) { if (stopFlag) return; ui.wt.textContent = 'Answering with the phone brain…'; }
  }
  ui.wt.textContent = vid ? 'Watched your video' : imgs.length > 1 ? `Looked at ${imgs.length} photos` : 'Looked at your photo';
  render(ui.ans, '', true);
  const out = await engine.chat([{ role: 'system', content: sys }, { role: 'user', content: parts }], { maxTokens: 400, temperature: 0.2, onText: o => { render(ui.ans, thinkStrip(o), true); toBottom(); } });
  turn.text = thinkStrip(out).trim() || (stopFlag ? '(stopped)' : "I couldn't make that out. Try a clearer photo?");
  if (turn.think) showThoughts(ui, '<think>' + turn.think + '</think>', Date.now(), true), ui.think.querySelector('summary').textContent = '🎬 What OMEGA saw';
  render(ui.ans, turn.text);
}
// ---------------- optional cloud brain (OpenRouter, free models, your own key stays on this device) ----------------
// two cloud brains: your own OpenRouter key if you added one, otherwise Pollinations' free brain (no key, no signup, text only)
if (/[?&]nocloud\b/.test(location.search)) window.__omegaNoCloud = true; if (/[?&]nosnap\b/.test(location.search)) window.__omegaNoSnap = true; // test switches
const cloudOn = () => settings.cloud !== false && navigator.onLine !== false && !window.__omegaNoCloud;
// ---- your saved AI keys: add as many as you want; OMEGA tries them in order and skips any that fail ----
function cloudKeys() {
  if (!Array.isArray(settings.cloudKeys) || settings.cloudKey) { // move a key saved by an older OMEGA into the list
    const old = (settings.cloudKey || '').trim(); settings.cloudKeys = Array.isArray(settings.cloudKeys) ? settings.cloudKeys : [];
    if (old && !settings.cloudKeys.includes(old)) settings.cloudKeys.unshift(old); delete settings.cloudKey; store.set('settings', settings);
  }
  return settings.cloudKeys;
}
const keyCool = {}; // keys that just failed rest for a bit so answers stay fast
const curKey = () => usableKeys()[0] || ''; // the first key OMEGA can actually use
const cloudFree = () => !curKey();
const polliKey = () => /^(sk_|pk_|plln_)/.test(curKey()); // a free Pollinations key (enter.pollinations.ai): faster, and the cloud can see photos
// OMEGA's own brain switchboard (Vercel): tries free top AI brains in order (DeepSeek, Gemini, Groq, NVIDIA, OpenRouter, GLM, Mistral, Cloudflare).
// Its keys live on the server, never in this public code. If it's not set up or all are busy, OMEGA uses the Pollinations free brain, then the phone brain.
const HUB = 'https://omega-brain.vercel.app';
let hub = store.get('hub', { ready: [], t: 0 });
const hubUp = () => !!(hub.ready && hub.ready.length > 0 && Date.now() >= hubCoolUntil);
const hubReady = () => cloudProvider() === 'free' && hubUp();
let hubCoolUntil = 0;
async function checkHub() {
  try { const r = await fetch(HUB + '/api/health', { cache: 'no-store' }); if (!r.ok) throw new Error('HTTP ' + r.status); const j = await r.json(); hub = { ready: Array.isArray(j.ready) ? j.ready : [], t: Date.now() }; }
  catch (e) { hub = { ready: [], t: Date.now() }; } // down or gone: don't wait on it
  store.set('hub', hub);
  try { syncCloud(); } catch (e) { }
}
if (!window.__omegaNoCloud) { setTimeout(checkHub, 1500); setInterval(checkHub, 10 * 60 * 1000); }
// which cloud brain your key is for (you paste one key in Settings; OMEGA works out the rest)
function cloudProvider() {
  return keyProvider(curKey());
}
function keyProvider(key, forceFree) {
  const k = (key || '').trim();
  if (!k || forceFree) return 'free';
  const m = (settings.keyMeta || {})[k]; if (m && m.prov && m.prov !== 'auto') return m.prov; // you picked it in Settings
  return guessProvider(k);
}
function guessProvider(k) {
  if (/^sk-or-/.test(k)) return 'openrouter';
  if (/^sk-ant-/.test(k)) return 'anthropic';
  if (/^nvapi-/.test(k)) return 'nvidia';
  if (/^hf_/.test(k)) return 'huggingface';
  if (/^xai-/.test(k)) return 'xai';
  if (/^sk-[0-9a-f]{32}$/.test(k)) return 'deepseek';  // DeepSeek keys: sk- and 32 letters/numbers
  if (/^csk-/.test(k)) return 'cerebras';   // Cerebras (free tier): very fast
  if (/^sk-(proj-|svcacct-)?[A-Za-z0-9_-]{20,}$/.test(k) && !/^sk-ant-/.test(k)) return 'openai';
  if (/^AIza/.test(k)) return 'gemini';     // Google AI Studio (free tier): smart, sees photos, thinks out loud
  if (/^gsk_/.test(k)) return 'groq';       // Groq (free tier): super fast big open models
  if (/^(sk_|pk_|plln_)/.test(k)) return 'polli';
  if (/^[0-9a-f]{32}\.[A-Za-z0-9]{10,}$/.test(k)) return 'glm';
  if (/^(tgp_v1_)?[0-9a-f]{64}$/.test(k)) return 'together';
  if (/^[A-Za-z0-9]{32}$/.test(k)) return 'mistral';
  return 'unknown';
}
const keyName = k => { const m = (settings.keyMeta || {})[k]; return (m && m.name) || CLOUD_NAME[keyProvider(k)] || 'Key'; };
// services that answer straight from your phone (OpenAI-style); NVIDIA, GLM and Claude keys need a server, so OMEGA can't use them directly
const EXTRA = {
  deepseek: { url: 'https://api.deepseek.com/chat/completions', models: ['deepseek-chat', 'deepseek-reasoner'] },
  mistral: { url: 'https://api.mistral.ai/v1/chat/completions', models: ['mistral-medium-latest', 'mistral-small-latest', 'mistral-large-latest'], sees: true },
  huggingface: { url: 'https://router.huggingface.co/v1/chat/completions', models: ['openai/gpt-oss-120b', 'deepseek-ai/DeepSeek-V3.1', 'Qwen/Qwen3-235B-A22B-Instruct-2507', 'meta-llama/Llama-3.3-70B-Instruct'] },
  xai: { url: 'https://api.x.ai/v1/chat/completions', models: ['grok-4-fast', 'grok-4', 'grok-3-mini'], sees: true },
  together: { url: 'https://api.together.xyz/v1/chat/completions', models: ['openai/gpt-oss-120b', 'meta-llama/Llama-3.3-70B-Instruct-Turbo', 'deepseek-ai/DeepSeek-V3'] },
};
const NO_PHONE = { nvidia: 'NVIDIA', glm: 'GLM (Zhipu)', anthropic: 'Claude (Anthropic)', unknown: 'this key' };
const SEES = p => ['gemini', 'polli', 'openai'].includes(p) || !!(EXTRA[p] && EXTRA[p].sees); // OpenRouter's free models are text only
const usableKeys = () => cloudKeys().filter(k => !NO_PHONE[keyProvider(k)]);
const cloudSees = () => usableKeys().some(k => SEES(keyProvider(k))) || (!usableKeys().length && SEES(cloudProvider())); // can it look at photos itself?
const CLOUD_NAME = { free: 'the free cloud brain', gemini: 'Gemini', groq: 'Groq', polli: 'Pollinations', openrouter: 'OpenRouter', openai: 'ChatGPT (OpenAI)', cerebras: 'Cerebras', deepseek: 'DeepSeek', mistral: 'Mistral', huggingface: 'Hugging Face', xai: 'Grok (xAI)', together: 'Together AI', nvidia: 'NVIDIA', glm: 'GLM (Zhipu)', anthropic: 'Claude (Anthropic)', unknown: 'Unknown key' };
// best models first; if one isn't on your free plan (or is busy) OMEGA tries the next one and remembers what worked
const CLOUD_MODELS = {
  gemini: ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3.5-flash-lite', 'gemini-flash-lite-latest'],
  groq: ['openai/gpt-oss-120b', 'qwen/qwen3.8-27b', 'moonshotai/kimi-k2-instruct', 'llama-3.3-70b-versatile', 'openai/gpt-oss-20b'],
  openrouter: ['deepseek/deepseek-chat-v3.1:free', 'deepseek/deepseek-r1:free', 'openrouter/free'],
  openai: ['gpt-5.5-mini', 'gpt-5-mini', 'gpt-4.1-mini', 'gpt-4o-mini'],
  cerebras: ['gpt-oss-120b', 'qwen-3-235b-a22b-instruct-2507', 'llama-3.3-70b'],
};
let cloudCoolUntil = 0; // after a "too many requests" from the free brain, let the phone brain answer for a bit
let cloudAbort = null; const cloudAborts = new Set();
// ---------------- OMEGA tests the apps and games it makes (like a developer would) ----------------
// Runs the app in a hidden, locked-down frame, taps its buttons and the screen, and collects any errors.
function selfTest(code, ms = 2600) {
  return new Promise(res => {
    const id = 't' + Math.random().toString(36).slice(2);
    const probe = `<script>(function(){var id=${JSON.stringify(id)},errs=[];function send(m){try{parent.postMessage(Object.assign({omegaTest:id},m),'*')}catch(e){}}
window.addEventListener('error',function(e){errs.push(String(e.message||'script error')+(e.lineno?' (line '+e.lineno+')':''))});
window.addEventListener('unhandledrejection',function(e){errs.push('Promise error: '+String(e.reason&&e.reason.message||e.reason))});
var ce=console.error;console.error=function(){errs.push('console.error: '+[].map.call(arguments,String).join(' '));try{ce.apply(console,arguments)}catch(e){}};
window.alert=window.confirm=window.prompt=function(){return ''};
window.addEventListener('load',function(){setTimeout(function(){try{
var b=[].slice.call(document.querySelectorAll('button,input[type=button],[onclick]')).slice(0,10).concat([].slice.call(document.querySelectorAll('[class*=cell],[class*=card],[class*=tile],[class*=key],[class*=mole],[class*=square]')).slice(0,6));b.forEach(function(x){try{x.click()}catch(e){errs.push(String(e.message))}});
var el=document.querySelector('canvas')||document.body,r=el.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
var tch=null;try{tch=new Touch({identifier:1,target:el,clientX:cx,clientY:cy,pageX:cx,pageY:cy})}catch(e){}
['touchstart','touchend','mousedown','mouseup','click'].forEach(function(t){try{var isT=t.indexOf('touch')===0;if(isT&&!tch)return;var ev=isT?new TouchEvent(t,{bubbles:true,cancelable:true,touches:t==='touchend'?[]:[tch],targetTouches:t==='touchend'?[]:[tch],changedTouches:[tch]}):new MouseEvent(t,{bubbles:true,clientX:cx,clientY:cy});el.dispatchEvent(ev)}catch(e){}});
['Space','ArrowUp','ArrowLeft','ArrowRight','Enter'].forEach(function(k){try{document.dispatchEvent(new KeyboardEvent('keydown',{key:k===' '?' ':k,code:k,bubbles:true}))}catch(e){}});
}catch(e){errs.push(String(e.message))}setTimeout(function(){send({done:1,errs:errs.slice(0,5),buttons:document.querySelectorAll('button,input,canvas,[onclick]').length})},900)},1000)});})();<\/script>`;
    const html = withShim(/<head[^>]*>/i.test(code) ? code.replace(/<head[^>]*>/i, m => m + probe) : probe + code);
    const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts'); f.setAttribute('aria-hidden', 'true'); f.tabIndex = -1;
    f.style.cssText = 'position:fixed;left:-10000px;top:0;width:390px;height:700px;opacity:0;pointer-events:none;border:0';
    let fin = false; const done = r => { if (fin) return; fin = true; removeEventListener('message', on); clearTimeout(t); f.remove(); res(r); };
    const on = e => { const d = e.data; if (d && d.omegaTest === id && e.source === f.contentWindow) done({ errs: d.errs || [], parts: d.buttons || 0 }); };
    addEventListener('message', on);
    const t = setTimeout(() => done({ errs: [], parts: -1, timeout: true }), ms + 4000);
    f.srcdoc = html; document.body.appendChild(f);
  });
}
const lastHtml = t => { const all = [...String(t).matchAll(/```(html|htm)?\s*\n([\s\S]*?)```/gi)].filter(m => m[1] || /^\s*<(!doctype|html)/i.test(m[2])); return all.length ? all[all.length - 1] : null; };
async function testAndFix(ui, turn) {
  const m = lastHtml(turn.text); if (!m) return;
  const badge = (txt, cls) => { const b = document.createElement('div'); b.className = 'hint selftest ' + (cls || ''); b.textContent = txt; ui.ans.after(b); return b; };
  ui.work.hidden = false; ui.wt.textContent = '🧪 Testing the app…'; step(ui, '🧪 Testing the app: opening it and tapping its buttons');
  let r = await selfTest(m[2]);
  if (!r.errs.length) { step(ui, '✅ It runs with no errors'); badge(r.timeout ? '🧪 Tested: it loads (OMEGA could not finish the tap test).' : '✅ OMEGA tested it: it opens and reacts to taps with no errors.'); ui.wt.textContent = 'Tested the app'; turn.tested = 'ok'; return; }
  const errText = r.errs.slice(0, 3).join('\n');
  if (cloudOn() && !stopFlag) {
    ui.wt.textContent = '🛠 Found a bug while testing. Fixing it…'; step(ui, `🐞 Found a bug: ${clip(r.errs[0], 70)}`); step(ui, '🛠 Fixing it and testing again');
    try {
      const raw = await cloudChat([{ role: 'system', content: systemPrompt(true, false) }, { role: 'user', content: `This app has a bug. When I ran it and tapped around, I got these errors:\n${errText}\n\nHere is the code:\n\n\`\`\`html\n${m[2]}\n\`\`\`\n\nFix the bug. Give back the WHOLE fixed file in one \`\`\`html block, then one short sentence about what you fixed.` }], { maxTokens: 6000, temperature: 0.2, onText: () => { } });
      const fx = lastHtml(thinkStrip(raw));
      if (fx && !stopFlag) {
        const r2 = await selfTest(fx[2]);
        if (r2.errs.length < r.errs.length) {
          turn.text = turn.text.replace(m[0], '```html\n' + fx[2] + '```'); render(ui.ans, turn.text);
          badge(r2.errs.length ? `🛠 OMEGA fixed some bugs it found. One may be left: ${clip(r2.errs[0], 120)}` : '✅ OMEGA found a bug while testing and fixed it. It now runs with no errors.');
          ui.wt.textContent = 'Tested and fixed the app'; turn.tested = r2.errs.length ? 'partly' : 'fixed'; return;
        }
      }
    } catch (e) { }
  }
  const b = badge(`⚠️ While testing, OMEGA saw an error: ${clip(r.errs[0], 140)} `, 'warn');
  const fixBtn = document.createElement('button'); fixBtn.className = 'btn'; fixBtn.textContent = '🛠 Fix it'; b.appendChild(fixBtn);
  fixBtn.onclick = () => { if (busy) return; $('#codeChip').setAttribute('aria-pressed', 'true'); inp.value = `Fix this error in the app: ${clip(r.errs[0], 200)}`; grow(); send(); };
  ui.wt.textContent = 'Tested the app: found an error'; turn.tested = 'error';
}

// ---------------- video editor ----------------
let videoBusy = false; // Stop also stops a video edit that's running
async function editVideo(text, files, ui, turn) {
  const V = window.OMEGA_VIDEO, vids = files.filter(f => f.kind === 'video'), imgs = files.filter(f => f.kind === 'image');
  const totalMB = files.reduce((n, f) => n + ((f.blob && f.blob.size) || 0), 0) / 1048576;
  if (totalMB > 150) { turn.text = `That's ${Math.round(totalMB)} MB of video. Your phone can edit up to about 150 MB at once without crashing. Try a shorter clip.`; render(ui.ans, turn.text); return; }
  ui.work.hidden = false;
  // iPhone/iPad: Safari closes tabs that use too much memory, so put the chat brain away while editing (it comes back in seconds)
  if (IS_IOS && engine && !loading) { ui.wt.textContent = '🎬 Making room for the video editor…'; await dropEngine(); }
  ui.wt.textContent = '🎬 Planning your edit…'; step(ui, '🎬 Working out the edit you want'); videoBusy = true;
  const rules = V.planFromText(text, vids.length, imgs.length);
  let plan = null;
  if (cloudOn()) { // the cloud brain understands messy requests best ("cut the boring part at the start and make it tiktok ready")
    try {
      const simple = rules.ops.length || rules.merge || rules.slideshow || rules.output !== undefined;
      const raw = await Promise.race([new Promise((_, no) => setTimeout(() => no(new Error('slow')), simple ? 9000 : 25000)), cloudChat([{ role: 'system', content: V.PLAN_HELP }, { role: 'user', content: `${vids.length ? `Video${vids.length > 1 ? 's' : ''}: ${vids.map((v, i) => `#${i + 1} is ${Math.round(v.duration || 0)} seconds`).join(', ')}.` : `${imgs.length} photos.`}\nRequest: ${text}` }], { maxTokens: 700, temperature: 0.1, onText: () => { } })]);
      const j = String(thinkStrip(raw)).match(/\{[\s\S]*\}/);
      if (j) plan = JSON.parse(j[0]);
    } catch (e) { plan = null; }
  }
  if (!plan || !Array.isArray(plan.ops)) plan = rules;
  else { plan.merge = plan.merge || rules.merge; plan.slideshow = plan.slideshow || rules.slideshow; if (!plan.ops.length && rules.ops.length) plan.ops = rules.ops; if (!plan.output || plan.output === 'mp4') plan.output = rules.output || plan.output; plan.compress = plan.compress || rules.compress; plan.transcript = plan.transcript || rules.transcript;
    const rc = rules.ops.find(o => o.op === 'captions'), pc = plan.ops.find(o => o && o.op === 'captions'); if (rc && pc) pc.style = rc.style; else if (rc && !pc) plan.ops.push(rc); }
  plan = V.cleanPlan(plan, { duration: vids[0] && vids[0].duration });
  if (!plan.ops.length && !plan.transcript && !(plan.merge && vids.length > 1) && !(imgs.length && !vids.length) && plan.output === 'mp4' && !plan.compress) {
    turn.text = 'I can edit that! Tell me what to do, for example:\n- "cut the first 3 seconds"\n- "make it vertical for TikTok" (add "blur the background" to keep the whole picture)\n- "add text \"DAY 1\" at the top"\n- "speed it up 2x" or "slow motion"\n- "mute it", "make it black and white", "turn it into a GIF"\n- "add captions" (it writes down what is said, TikTok style)\n- "transcribe it" to get the words\n- attach 2–3 clips and say "merge these"';
    ui.wt.textContent = '🎬 Video editor'; render(ui.ans, turn.text); return;
  }
  const t0 = Date.now();
  try {
    const r = await V.run(text, files, plan, msg => { ui.wt.textContent = '🎬 ' + msg; step(ui, '🎬 ' + msg); }, p => { ui.wt.textContent = `🎬 Editing… ${Math.round(p * 100)}%`; });
    if (stopFlag) { turn.text = '(stopped)'; render(ui.ans, turn.text); return; }
    if (r.transcript !== undefined) { // "transcribe this video": the words, with times
      const lines = []; let cur = null;
      for (const w of r.words || []) { if (!cur || w.s - cur.s > 8 || /[.!?]$/.test(cur.t)) { if (cur) lines.push(cur); cur = { s: w.s, t: w.t }; } else cur.t += ' ' + w.t; }
      if (cur) lines.push(cur);
      const mmss = s => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
      turn.text = r.transcript ? `Here's what's said in the video:\n\n${lines.map(l => `**${mmss(l.s)}** ${l.t}`).join('\n')}` : "I couldn't hear any words in that video.";
      render(ui.ans, turn.text); ui.wt.textContent = `🎬 Transcribed on your phone in ${Math.round((Date.now() - t0) / 1000)}s`; return;
    }
    const say = V.describe(plan, vids.length, imgs.length).filter(x => r.captioned || !/captions|subtitles/.test(x));
    const name = `omega-${new Date().toISOString().slice(0, 10)}.${r.ext}`;
    const file = new File([r.blob], name, { type: r.type });
    const url = URL.createObjectURL(r.blob);
    turn.text = `${say.length ? `Done! I ${say.join(', ').replace(/, ([^,]*)$/, ' and $1')}.` : 'Here it is.'}${r.duration ? ` It's ${Math.round(r.duration * 10) / 10} seconds long.` : ''} Tap **Save** to keep it (it's not saved in the chat).${r.note ? ' ' + r.note : ''}`;
    render(ui.ans, turn.text);
    const card = document.createElement('div'); card.className = 'vidcard';
    card.innerHTML = (r.ext === 'gif' ? `<img src="${url}" alt="your GIF">` : r.ext === 'mp3' ? `<audio controls src="${url}"></audio>` : `<video controls playsinline src="${url}"></video>`) + `<div class="vidbtns"><button class="vsave">💾 Save</button><a class="vdl" href="${url}" download="${name}">Download</a><span class="hint">${(r.blob.size / 1048576).toFixed(1)} MB · ${Math.round((Date.now() - t0) / 1000)}s</span></div>`;
    card.querySelector('.vsave').onclick = async () => {
      try { if (navigator.canShare && navigator.canShare({ files: [file] })) { await navigator.share({ files: [file] }); return; } } catch (e) { if (e && e.name === 'AbortError') return; }
      card.querySelector('.vdl').click();
    };
    ui.ans.after(card);
    ui.wt.textContent = `🎬 Edited on your phone in ${Math.round((Date.now() - t0) / 1000)}s`;
  } catch (e) {
    if (stopFlag) { turn.text = '(stopped)'; render(ui.ans, turn.text); return; }
    turn.text = `I couldn't finish that edit: ${e.message}. Try a shorter clip, or ask for one change at a time.`;
    render(ui.ans, turn.text);
  } finally { videoBusy = false; V.release().catch(() => { }); } // free the editor's memory after every job (it restarts in a second next time)
}
// The free cloud stops each answer after about 800 words-pieces. For long answers (whole apps and games),
// OMEGA asks it to keep going and stitches the parts together, so the code comes out complete.
// your key's brain first; if it fails (free limit reached, key problem), the free no-key cloud brain answers instead
async function cloudChat(messages, o) {
  const keys = usableKeys();
  if (!keys.length || o._fb) return cloudChatLong(messages, o);
  const hasPics = messages.some(m => Array.isArray(m.content) && m.content.some(p => p.type === 'image_url'));
  // the key that worked last time goes first, then the rest in the order you saved them (photos: only keys that can see)
  const last = store.get('keyOk', ''); let order = [...new Set([keys.includes(last) ? last : null, ...keys].filter(Boolean))];
  if (hasPics) order = order.filter(k => SEES(keyProvider(k)));
  const ready = order.filter(k => !(keyCool[k] > Date.now())); if (ready.length) order = ready; // skip keys that just failed (for 10 minutes)
  let lastErr = null;
  for (const k of order) {
    const name = keyName(k);
    try { const r = await cloudChatLong(messages, { ...o, key: k, _out: o }); store.set('keyOk', k); o.brain = name; return r; }
    catch (e) {
      if (stopFlag) throw e; lastErr = e; keyCool[k] = Date.now() + 10 * 60 * 1000; try { syncCloud(); } catch (_) { }
      if (o.ui) { o.ui.wt.textContent = `☁️ ${name} didn't answer, trying the next brain…`; step(o.ui, `↪️ ${name} (key ••••${k.slice(-4)}) didn't answer (${clip(e.message, 40)})`); }
    }
  }
  if (hasPics) throw lastErr || new Error('none of your keys can see photos');
  if (o.ui) step(o.ui, '↪️ None of your keys answered, so the free cloud brain is answering');
  try { const r = await cloudChatLong(messages, { ...o, key: '', _fb: true, _out: o }); o.model = 'free cloud'; return r; }
  catch (e) { throw lastErr || e; }
}
async function cloudChatLong(messages, o) {
  let all = '', thoughts = '', parts = 0;
  const show = o.onText;
  while (true) {
    // continue from a whole line (continuing mid-word makes the brain garble code)
    if (parts) { const cut = all.lastIndexOf('\n'); if (cut > all.length - 400 && cut > 0) all = all.slice(0, cut + 1); }
    const prefix = all;
    const oo = { ...o, finish: '', onText: out => { const t = thinkStrip(out), th = thoughtsOf(out); if (!parts && th) thoughts = th; show((thoughts ? '<think>' + thoughts + '</think>' : '') + glue(prefix, t)); } };
    const tail = all.split('\n').slice(-7).join('\n');
    const msgs = parts ? [...messages, { role: 'assistant', content: all }, { role: 'user', content: `You were cut off. These are the last lines you wrote:\n${tail}\n\nContinue with the NEXT line after those. Do not repeat them, do not restart the code block, no intro. Finish the file.` }] : messages;
    let raw;
    if (!parts) raw = await cloudChatOnce(msgs, oo);
    else { // a later part failed (busy): wait and try again, and if it still fails keep what we have
      try { raw = await cloudChatOnce(msgs, oo); } catch (e) { if (stopFlag) break; await sleep(10000); cloudCoolUntil = 0; try { raw = await cloudChatOnce(msgs, oo); } catch (e2) { break; } }
    }
    o.got = true; o.finish = oo.finish; o.model = oo.model || o.model; if (o._out) { o._out.got = true; o._out.model = o.model; }
    if (stopFlag) return (thoughts ? '<think>' + thoughts + '</think>' : '') + all;
    const piece = thinkStrip(raw); if (!parts) thoughts = thoughtsOf(raw);
    all = glue(prefix, piece); parts++;
    const unfinished = o.finish === 'length' && ((all.match(/```/g) || []).length % 2 === 1 || !/[.!?)\]}>`"'*]\s*$/.test(all));
    if (!unfinished || parts >= 6) break;
    if (o.ui) o.ui.wt.textContent = `☁️ Writing a long answer… part ${parts + 1}`;
    for (let k = 0; k < 3 && Date.now() < cloudCoolUntil; k++) await sleep(8000);
    cloudCoolUntil = 0;
  }
  return (thoughts ? '<think>' + thoughts + '</think>' : '') + all;
}
// join a continued answer to what came before: drop a restarted code fence and any repeated words
function glue(a, b) {
  if (!a) return b;
  if ((a.match(/```/g) || []).length % 2 === 1) b = b.replace(/^\s*```[\w-]*\s*\n/, '');
  // drop lines the brain repeated from the end of the last part
  const lastLines = a.split('\n').slice(-8).map(s => s.trim()).filter(Boolean);
  const bl = b.split('\n');
  while (bl.length && bl[0].trim() && lastLines.includes(bl[0].trim())) bl.shift();
  b = bl.join('\n');
  if (a.endsWith('\n')) b = b.replace(/^\n+/, '');
  return a + b;
}
async function cloudChatOnce(messages, o) {
  const ctl = new AbortController(); cloudAbort = ctl; cloudAborts.add(ctl); const sig = ctl.signal; // each call has its own stop switch (team mode runs several at once)
  const t = setTimeout(() => ctl.abort(), 120000);
  const KEY = o.key != null ? o.key : curKey(); // team mode passes the key; otherwise the key being tried now
  try {
    const prov = o.key != null ? keyProvider(o.key) : cloudProvider();
    if (prov === 'free' && !hubUp() && Date.now() < cloudCoolUntil) throw new Error('free cloud brain is busy, try again in a minute');
    const free = prov === 'free';
    const busyNote = setTimeout(() => { if (o.ui && !o.got) o.ui.wt.textContent = '☁️ The free cloud brain is busy, your answer is on the way…'; }, 9000);
    const textOnly = ms => ms.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : m.content.filter(p => p.type === 'text').map(p => p.text).join('\n') }));
    const deep = !!o.deep; // Think chip on: think harder
    const request = model => {
      if (prov === 'gemini') return fetch('https://generativelanguage.googleapis.com/v1beta/openai/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY.trim() },
        body: JSON.stringify({ model, messages, stream: true, max_tokens: Math.max(o.maxTokens, 4000), temperature: o.temperature, extra_body: { google: { thinking_config: { thinking_level: deep ? 'high' : 'low', include_thoughts: true } } } }) });
      if (prov === 'groq') return fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY.trim() },
        body: JSON.stringify({ model, messages: textOnly(messages), stream: true, max_tokens: o.maxTokens, temperature: o.temperature, ...(/gpt-oss|qwen3|r1/.test(model) ? { reasoning_format: 'parsed', reasoning_effort: deep ? 'high' : 'medium' } : {}) }) });
      if (prov === 'openai') return fetch('https://api.openai.com/v1/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ model, messages, stream: true, max_completion_tokens: Math.max(o.maxTokens, 4000), ...(deep ? { reasoning_effort: 'high' } : {}) }) });
      if (prov === 'cerebras') return fetch('https://api.cerebras.ai/v1/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY },
        body: JSON.stringify({ model, messages: textOnly(messages), stream: true, max_completion_tokens: o.maxTokens, temperature: o.temperature }) });
      if (EXTRA[prov]) return fetch(EXTRA[prov].url, { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY.trim() },
        body: JSON.stringify({ model, messages: EXTRA[prov].sees ? messages : textOnly(messages), stream: true, max_tokens: o.maxTokens, temperature: o.temperature }) });
      if (prov === 'polli') return fetch('https://gen.pollinations.ai/v1/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY }, body: JSON.stringify({ model: 'openai', messages, stream: true, max_tokens: o.maxTokens, temperature: o.temperature }) });
      if (prov === 'openrouter') return fetch('https://openrouter.ai/api/v1/chat/completions', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + KEY, 'X-Title': 'OMEGA' },
        body: JSON.stringify({ model, messages, stream: true, max_tokens: o.maxTokens, temperature: o.temperature }) });
      return fetch('https://text.pollinations.ai/openai', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ model: 'openai', messages: textOnly(messages), stream: true, max_tokens: o.maxTokens, temperature: o.temperature, private: true, referrer: 'omega', ...(deep ? { reasoning_effort: 'high' } : {}) }) });
    };
    // pick the model: the one that worked last time first, then the rest of the list
    if (NO_PHONE[prov]) throw new Error(prov === 'unknown' ? 'OMEGA doesn\u2019t know what kind of key this is. Tap Edit in Settings and pick it' : CLOUD_NAME[prov] + ' keys only work through a server, not straight from a phone');
    if (EXTRA[prov] && !CLOUD_MODELS[prov]) CLOUD_MODELS[prov] = EXTRA[prov].models.slice();
    const list = CLOUD_MODELS[prov] ? [...new Set([settings.cloudModel && CLOUD_MODELS[prov].includes(settings.cloudModel) ? settings.cloudModel : null, store.get('cloudOk_' + prov), ...CLOUD_MODELS[prov]].filter(Boolean))] : [null];
    const textOnlyMsgs = messages.map(m => ({ role: m.role, content: typeof m.content === 'string' ? m.content : m.content.filter(p => p.type === 'text').map(p => p.text).join('\n') }));
    let hubName = '';
    let r = null, used = null;
    if (free && hubUp()) { // OMEGA's own switchboard first: the strongest free brains
      try {
        const h = await fetch(HUB + '/api/chat', { method: 'POST', signal: sig, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: textOnlyMsgs, max_tokens: o.maxTokens, temperature: o.temperature }) });
        if (h.ok && h.body) { r = h; hubName = h.headers.get('X-Omega-Provider') || 'free brain'; }
        else { hubCoolUntil = Date.now() + (h.status === 503 ? 60000 : 15000); try { await h.body?.cancel(); } catch (_) { } }
      } catch (e) { if (sig.aborted) throw e; hubCoolUntil = Date.now() + 15000; }
    }
    if (!r) for (const model of list) {
      r = await request(model); used = model;
      if (r.ok || !CLOUD_MODELS[prov] || ![400, 404, 429, 403, 503].includes(r.status) || r.status === 401) break;
      if (r.status === 400 || r.status === 403) { const body = await r.clone().text().catch(() => ''); if (/api[ _-]?key|invalid.*key|unauth|permission/i.test(body)) break; } // a bad key: don't try every model
      if (r.status === 403 && prov !== 'gemini') break;
      try { await r.text(); } catch (_) { } // try the next model
    }
    if (r && !r.ok && r.status === 404 && (EXTRA[prov] || prov === 'openai' || prov === 'cerebras')) { // none of the usual models exist: ask the service which ones it has
      try {
        const base = (EXTRA[prov] ? EXTRA[prov].url : prov === 'openai' ? 'https://api.openai.com/v1/chat/completions' : 'https://api.cerebras.ai/v1/chat/completions').replace(/\/chat\/completions$/, '');
        const ml = await (await fetch(base + '/models', { signal: sig, headers: { Authorization: 'Bearer ' + KEY.trim() } })).json();
        const ids = (ml.data || []).map(x => x.id).filter(id => !/embed|whisper|tts|audio|image|dall|moderation|rerank|ocr|guard/i.test(id));
        for (const model of ids.slice(0, 4)) { r = await request(model); used = model; if (r.ok) { CLOUD_MODELS[prov] = [model, ...CLOUD_MODELS[prov]]; break; } }
      } catch (_) { }
    }
    if (r.ok && used && CLOUD_MODELS[prov]) store.set('cloudOk_' + prov, used);
    clearTimeout(busyNote);
    if (free && !hubName && !o.bg && (r.status === 429 || r.status === 402)) cloudCoolUntil = Date.now() + 45000; // the free cloud's per-minute limit: let the phone brain answer for a bit
    if (!r.ok) { let m = 'HTTP ' + r.status; try { const j = await r.json(); m = (j.error && j.error.message) || m; } catch (_) { } if (r.status === 401 || r.status === 403) m = 'the cloud key is not valid'; if (r.status === 402 && free) m = 'the free cloud is busy right now'; if (r.status === 429) m = 'free limit reached for now'; throw new Error(m); }
    const rd = r.body.getReader(), dec = new TextDecoder(); let buf = '', text = '', reason = '', model = '', inThought = false;
    while (true) {
      const { done, value } = await rd.read(); if (done) break;
      buf += dec.decode(value, { stream: true }); const lines = buf.split('\n'); buf = lines.pop();
      for (const ln of lines) {
        const l = ln.trim(); if (!l.startsWith('data:')) continue; const d = l.slice(5).trim(); if (d === '[DONE]') continue;
        let j; try { j = JSON.parse(d); } catch (_) { continue; } if (j.error) throw new Error((j.error && j.error.message) || 'cloud error'); try { model = j.model || model; const ch0 = j.choices && j.choices[0]; if (ch0 && ch0.finish_reason) o.finish = ch0.finish_reason; const dl = (ch0 && ch0.delta) || {}; reason += dl.reasoning || dl.reasoning_content || ''; let ct = dl.content || ''; if (ct && (inThought || /<thought>/.test(ct))) { const parts = ct.split(/(<\/?thought>)/); ct = ''; for (const p of parts) { if (p === '<thought>') inThought = true; else if (p === '</thought>') inThought = false; else if (inThought) reason += p; else ct += p; } } if (dl.extra_content && dl.extra_content.google && dl.extra_content.google.thought) { reason += ct; ct = ''; } text += ct; } catch (_) { }
        o.got = true; o.onText(reason ? '<think>' + reason + (text ? '</think>' : '') + text : text);
        if (stopFlag) { ctl.abort(); break; }
      }
      if (stopFlag) break;
    }
    o.model = hubName || model || used || '';
    if (!text.trim() && !stopFlag) throw new Error('empty answer');
    return reason ? '<think>' + reason + '</think>' + text : text;
  } catch (e) { if (sig.aborted && stopFlag) return ''; if (sig.aborted) throw new Error('took too long'); throw e; }
  finally { clearTimeout(t); cloudAborts.delete(ctl); }
}
const toDataURL = buf => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(new Blob([buf], { type: 'image/jpeg' })); });
async function answerInCloud(text, live, att, ui, turn, media = []) {
  if (media.length && !cloudSees()) throw new Error('the free cloud brain cannot see photos, using OMEGA\'s eyes');
  ui.work.hidden = false; ui.wt.textContent = '☁️ Asking the cloud brain…';
  const codeMode = $('#codeChip').getAttribute('aria-pressed') === 'true';
  const files = att ? attText(att) : '';
  const content = (live ? 'LIVE INFO (fetched just now):\n' + clip(live, 14000) + '\n\n(Use the LIVE INFO above when it helps; it is current, so copy numbers exactly. For live facts (scores, prices, times, weather, news), if it does not have the exact detail, say so. For everything else, if the LIVE INFO is off-topic or empty, just answer from your own knowledge and do not mention the LIVE INFO at all.)\n---\n' : '') + (files ? `Attached file(s):\n-----\n${clip(files, 30000)}\n-----\n\n` : '') + memoryHint(text) + text;
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
  const hist = historyFor(20000, true); if (hist.length) hist.pop(); // the cloud sees the newest code whole, so "make the buttons bigger" works
  // the free cloud cuts each answer at about 2,800 characters: ask for compact code so most apps fit in one go
  const compact = codeMode && cloudProvider() === 'free' && !hubReady() ? '\n\nKeep the html file compact so it fits in one reply: short CSS, short variable names, no comments, under about 2,500 characters if you can.' : '';
  const messages = [{ role: 'system', content: systemPrompt(codeMode, !!live) + compact }, ...hist, { role: 'user', content: user }];
  const t0 = Date.now(), o = { ui, deep: thinkOn(), maxTokens: codeMode ? 6000 : 2000, temperature: codeMode ? 0.3 : 0.6, onText: out => { showThoughts(ui, out, t0); render(ui.ans, thinkStrip(out), true); toBottom(); } };
  render(ui.ans, '', true); if (window.OMEGA) window.OMEGA.lastPrompt = messages;
  let raw;
  if (memPending) { ui.wt.textContent = '🧠 Saving a memory first…'; await Promise.race([memPending, sleep(12000)]); } // the free cloud answers one thing at a time
  let team = null;
  const tk = teamKeys();
  if (!media.length && tk.length >= 2 && teamWanted(text, codeMode, o.deep)) { try { team = await teamAnswer(messages, o, ui, tk, codeMode); } catch (e) { if (stopFlag) throw e; } if (team) raw = team.raw; }
  if (raw == null && stopFlag) raw = '';
  if (raw == null) try { raw = await cloudChat(messages, o); }
  catch (e) { if (stopFlag || !/empty answer|took too long|Failed to fetch|network|HTTP 5/i.test(e.message)) throw e; ui.wt.textContent = '☁️ Asking the cloud brain again…'; raw = await cloudChat(messages, o); } // the free cloud sometimes hiccups: one quick retry
  const th = thoughtsOf(raw); if (th) { turn.think = clip(th, 6000); showThoughts(ui, raw, t0, true); }
  turn.text = thinkStrip(raw).trim() || '(stopped)';
  if (team && team.team.length > 1) ui.wt.textContent = `👥 Team answer: ${team.team.join(' + ')} · combined by ${team.by}`;
  else if (team) ui.wt.textContent = `☁️ Answered by ${team.by}${team.model ? ' (' + team.model + ')' : ''}`;
  else ui.wt.textContent = `☁️ Answered by ${o.model === 'free cloud' ? 'the free cloud brain' : o.brain || CLOUD_NAME[cloudProvider()]}${o.model && o.model !== 'free cloud' ? ' (' + o.model.replace(/:free$/, '').replace(/^models\//, '') + ')' : ''}`;
  render(ui.ans, turn.text);
}
// ---- team mode: ask all your AI keys at once, then one of them combines the best parts ----
const teamKeys = () => cloudKeys().filter(k => !NO_PHONE[keyProvider(k)] && !(keyCool[k] > Date.now()));
function teamWanted(text, codeMode, deep) {
  const m = settings.team || 'auto';
  if (m === 'off') return false; if (m === 'always') return true;
  return deep || codeMode || text.length > 180 || /\b(explain|why|how (do|does|can|should)|compare|vs\.?|versus|best|plan|strategy|analy[sz]e|research|pros and cons|decide|choose|essay|business|math|solve|prove|step by step|ideas?)\b/i.test(text);
}
const COMBINER_RANK = ['gemini', 'openai', 'xai', 'mistral', 'deepseek', 'openrouter', 'groq', 'cerebras', 'together', 'huggingface', 'polli'];
async function teamAnswer(messages, o, ui, keys, codeMode) {
  const names = keys.map(keyName), t0 = Date.now();
  ui.work.hidden = false; ui.wt.textContent = `👥 Asking ${keys.length} brains at once…`;
  step(ui, `👥 Asking ${keys.length} brains at once: ${names.join(', ')}`);
  const drafts = []; let pending = keys.length, firstAt = 0, wake = null;
  keys.forEach((k, i) => {
    const oi = { key: k, deep: o.deep, maxTokens: o.maxTokens, temperature: o.temperature, onText: () => { } };
    Promise.race([cloudChatLong(messages, oi), sleep(codeMode ? 100000 : 50000).then(() => { throw new Error('took too long'); })])
      .then(out => { const txt = thinkStrip(out).trim(); if (!txt) throw new Error('empty answer'); drafts.push({ k, name: names[i], text: txt, model: oi.model || '' }); store.set('keyOk', k); step(ui, `✓ ${names[i]} answered (${Math.round((Date.now() - t0) / 1000)}s)`); if (!firstAt) firstAt = Date.now(); })
      .catch(e => { if (!stopFlag) { step(ui, `✗ ${names[i]} didn't answer (${clip(e.message, 40)})`); keyCool[k] = Date.now() + 10 * 60 * 1000; } })
      .finally(() => { pending--; wake && wake(); });
  });
  // wait for everyone, but once one has answered give the slow ones only a little longer
  while (pending > 0 && !stopFlag) {
    if (firstAt && Date.now() - firstAt > (codeMode ? 25000 : 12000)) { step(ui, `⏱ Not waiting for the slow ones`); break; }
    await new Promise(r => { wake = r; setTimeout(r, 500); });
  }
  if (stopFlag || !drafts.length) return null;
  ui.wt.textContent = `👥 ${drafts.length} of ${keys.length} brains answered`;
  if (drafts.length === 1) { o.onText(drafts[0].text); return { raw: drafts[0].text, team: [drafts[0].name], by: drafts[0].name, model: drafts[0].model }; }
  const ok = drafts.map(d => d.k);
  const comb = [...ok].sort((x, y) => { const r = p => { const i = COMBINER_RANK.indexOf(keyProvider(p)); return i < 0 ? 99 : i; }; return r(x) - r(y); })[0];
  const last = messages[messages.length - 1];
  const q = typeof last.content === 'string' ? last.content : last.content.filter(p => p.type === 'text').map(p => p.text).join('\n');
  const draftText = drafts.map((d, i) => `[Answer ${i + 1}]\n${clip(d.text, codeMode ? 14000 : 5000)}`).join('\n\n');
  const cm = [...messages.slice(0, -1), { role: 'user', content: q + `\n\n---\n(Private note for you, not from the user: ${drafts.length} other AI models already answered the message above. Their answers are below and may contain mistakes. Write the single best final answer to the user's message: keep what is correct and useful from each, fix any errors, drop repetition, and follow all your usual rules and the user's style.${codeMode ? ' For code: start from the strongest version, add real improvements from the others, and give ONE complete working file.' : ''} Never mention other models, answers, drafts or combining.)\n\n${draftText}` }];
  step(ui, `🧩 ${keyName(comb)} is combining the best parts`); ui.wt.textContent = '🧩 Combining the best parts…';
  const oc = { ...o, key: comb, maxTokens: Math.max(o.maxTokens, codeMode ? 8000 : 2500) };
  try {
    const out = await cloudChatLong(cm, oc);
    if (!thinkStrip(out).trim()) throw new Error('empty answer');
    return { raw: out, team: drafts.map(d => d.name), by: keyName(comb), model: oc.model || '' };
  } catch (e) {
    if (stopFlag) return null;
    step(ui, `↪️ Combining failed, using ${drafts[0].name}'s answer`);
    o.onText(drafts[0].text); return { raw: drafts[0].text, team: [drafts[0].name], by: drafts[0].name, model: drafts[0].model };
  }
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
  const ui = { el: d, think: d.querySelector('.think'), work: d.querySelector('.work'), wt: d.querySelector('.wt'), live: d.querySelector('.live'), ans: d.querySelector('.ans'), srcs: d.querySelector('.srcs'), acts: d.querySelector('.acts') };
  d._ui = ui; return ui;
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
    else { const ui = addBot(); if (t.live) { ui.live.textContent = t.live; ui.live.hidden = false; } if (t.think || (t.steps && t.steps.length)) { ui.think.dataset.secs = '…'; ui.steps = t.steps || []; showThoughts(ui, t.think ? '<think>' + t.think + '</think>' : null, Date.now(), true); ui.think.querySelector('summary').textContent = t.think ? '💡 Show thinking' : `💡 Show the ${ui.steps.length} step${ui.steps.length === 1 ? '' : 's'}`; } render(ui.ans, t.text); showSources(ui, t.sources); showActs(ui, t, lastQ); }
  }
}

function grow() { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 200) + 'px'; const hasFiles = attachment && attachment.files.length && !attachment.files.some(f => f.loading); sendBtn.disabled = !busy && !inp.value.trim() && !hasFiles; } // a photo or video alone can be sent too
inp.addEventListener('input', grow);
const coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.isComposing) { e.preventDefault(); send(); } });
const SEND_SVG = sendBtn.innerHTML, STOP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/></svg>';
function setBusy(b) { busy = b; sendBtn.innerHTML = b ? STOP_SVG : SEND_SVG; sendBtn.setAttribute('aria-label', b ? 'Stop' : 'Send'); grow(); }
// Stop answers right away, even while the brain is still reading a long chat (it finishes reading quietly in the background)
let enginePending = null; const stopWaiters = [];
sendBtn.onclick = () => { if (busy) { stopFlag = true; stopWaiters.splice(0).forEach(f => f()); try { engine && engine.stop(); } catch (e) { } try { cloudAborts.forEach(c => c.abort()); } catch (e) { } if (videoBusy && window.OMEGA_VIDEO) OMEGA_VIDEO.release().catch(() => { }); try { cloudAbort && cloudAbort.abort(); } catch (e) { } } else send(); };

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
  setBusy(true); stopFlag = false; stopWaiters.length = 0;
  const turn = { role: 'assistant', text: '', sources: [] };
  try {
    const media = att ? att.files.filter(f => (f.kind === 'image' && f.data) || (f.kind === 'video' && f.blob)) : [];
    if (att && att.files.some(f => (f.kind === 'image' || f.kind === 'video')) && !media.length) { turn.text = 'That photo/video is no longer in memory (saved chats keep only a preview). Attach it again with 📎 and ask.'; render(ui.ans, turn.text); return; }
    // video editing: trim, cut, vertical, text, speed, GIF, merge clips, photo slideshows (all on the phone, free)
    if (att && window.OMEGA_VIDEO && OMEGA_VIDEO.wantsEdit(text, att.files)) {
      const edFiles = att.files.filter(f => (f.kind === 'video' && f.blob) || (f.kind === 'image' && f.data));
      if (edFiles.length) { await editVideo(text, edFiles, ui, turn); return; }
    }
    if (media.length) {
      if (cloudOn() && cloudSees()) { try { step(ui, `👁 ${keyName(usableKeys().find(k => SEES(keyProvider(k))) || '') || 'The cloud brain'} is looking at your ${media.some(m => m.kind === 'video') ? 'video' : 'photo'}`); await answerInCloud(text, '', att, ui, turn, media); return; } catch (e) { if (stopFlag) return; ui.work.hidden = false; ui.wt.textContent = `Cloud brain unavailable, using OMEGA's own eyes`; } }
      await answerWithEyes(text, att, media, ui, turn); return;
    }
    // memory command
    // "remember that I..." saves it; "remember the plan we talked about?" is a question about the past, not a save
    const rem = /\?/.test(text) || /^(?:please\s+)?(?:do you\s+)?remember\s+(?:when|what|how|where|who|why|the time|that time|we|our|you|us|the \w+ (?:we|you|i))\b/i.test(text) ? null : text.match(/^(?:please\s+)?(?:remember|don'?t forget)(?:\s+that)?[:,]?\s+(.{3,})$/i);
    if (rem) turn.noMem = true;
    if (rem) { const f = rem[1].replace(/[.!]+$/, ''); facts.push(f); facts = facts.slice(-150); store.set('facts', facts); renderFacts(); }
    // well-known games: use OMEGA's tested game library (the phone brain is too small to write a whole game reliably)
    // learn the basics automatically: name and city
    const nm = text.match(/\b(?:my name is|my name's|call me|i'?m called)\s+([A-Z][a-z]{1,20})\b/i), ct = text.match(/\bi (?:live|stay|'m based|am based|live out) in ([A-Za-z][A-Za-z .'-]{2,30}?)(?:[,.!?]|\s+(?:and|but|so|bro)\b|$)/i);
    if (nm && !/^(not|just|so|the|a|later|back|tomorrow|today|tonight|now|soon|when|if|after|before|please|bro|asap|whenever|maybe|again|sometime|anytime)$/i.test(nm[1])) { profile.name = nm[1][0].toUpperCase() + nm[1].slice(1); store.set('profile', profile); fillProfile(); }
    if (ct && !NOT_PLACE.test(ct[1])) { profile.city = PLACE_ALIASES[ct[1].trim().toLowerCase()] || ct[1].trim(); store.set('profile', profile); fillProfile(); }
    // auto-memory (like ChatGPT's "Memory updated"): save clear facts about yourself, e.g. "I run a construction business in LA"
    if (!rem && settings.autoMemory !== false && !cloudOn() && !/\?\s*$/.test(text)) {
      const found = [];
      for (const part of text.split(/(?<=[.!])\s+|\s+(?:and|but)\s+(?=i\b|my\b)/i)) {
        const m = part.match(/^(?:yo|hey|so|btw|also|ok|okay|well|no|nah|nope|actually)?[,\s]*((?:i (?:run|own|work (?:at|as|for)|am a|'m a|am an|'m an|have (?:a|an|two|three|\d+)|drive|study|go to|play|like|love|hate|prefer|can't eat|don't eat|am allergic)|my (?:\w+ ){0,2}(?:is|are|was born))\b.{2,90})$/i);
        if (m && (m[1] = m[1].replace(/[,;]\s*(remember (that|this|it)|don'?t forget|ok|okay).*$/i, '')) && m[1].split(/\s+/).length >= 4 && !/\b(it|that|this|them|those|one)$/i.test(m[1].replace(/[.!]+$/, '')) && !/\b(name is|you|your|today|right now|tired|hungry|bored|gonna|going to|about to)\b/i.test(m[1])) found.push(m[1].replace(/[.!]+$/, '').trim());
      }
      const fresh = found.filter(f => !facts.some(x => x.toLowerCase() === f.toLowerCase()));
      if (fresh.length) { facts.push(...fresh); facts = facts.slice(-150); store.set('facts', facts); renderFacts(); turn.memo = fresh; }
    }
    // learning from corrections: "no, it's ..." / "that's wrong, ..." right after an answer becomes a lesson OMEGA follows next time
    if (!rem && !att && !/^(no+|nah|nope)\b[,.! ]*(worries|problem|prob|thanks|thank you|need|i'?m good|im good|all good|that'?s (it|all|fine|good)|it'?s (fine|ok|okay|good))\b/i.test(text) && /^(no+|nah|nope|wrong|that'?s (wrong|not right|incorrect|not true)|incorrect|actually|not quite)\b[,.! ]+\S/i.test(text) && text.split(/\s+/).length >= 4) {
      const prevA = [...chat.turns].slice(0, -1).reverse().find(t => t.role !== 'user');
      const prevQ = chat.turns.slice(0, -1).filter(t => t.role === 'user').pop();
      if (prevA && prevQ && !/```/.test(prevA.text || '')) { lessons.push({ q: clip(prevQ.text, 300), a: clip(prevA.text, 400), fix: clip(text, 400), t: Date.now(), auto: true }); lessons = lessons.slice(-100); store.set('lessons', lessons); renderFacts(); turn.memo = (turn.memo || []).concat(['learned from your correction']); }
    }
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
    if (/^(what'?s|whats|what is|what was|what'?s|do you know|do you remember|remember|you remember|tell me)\s+my name\b|^who am i\b|\bwhat(?:'?s| is| was) my name\b/i.test(text) && profile.name) { turn.text = `Your name is ${profile.name}.`; render(ui.ans, turn.text); return; }
    // "what can you do?": a real list of OMEGA's abilities (the brain itself doesn't know them)
    if (!att && /^(?:yo |hey |so |ok |omega,? )*(?:what can (?:you|omega) do|what (?:are|r) (?:your|omega'?s) (?:features|abilities|skills)|what do you do|how do i use (?:you|omega|this)|help|what can i (?:ask|do with) (?:you|omega|this))\??$/i.test(text.trim())) {
      turn.text = `Here's what I can do for you:\n\n- **Chat and advice**: ask me anything. Online I use a big free cloud brain; offline, the brain on your phone.\n- **Plug-ins and connectors**: open the menu → 🧩 Plug-ins to add more (dictionary, recipes, music, books, TV, earthquakes, your own web services, and MCP connectors like DeepWiki).\n- **Live info**: weather, news, sports scores (\"did the Lakers win?\"), stock prices, crypto, currency, the time anywhere, web search.\n- **Deep research**: start with \"research…\" and I search several times, read the pages and write a report with sources.\n- **Build apps and games**: tap **Code**, then say what to make. I test it myself and fix bugs I find. Or say \"play snake\" for a ready game.\n- **Edit videos**: attach a video and say \"cut the first 3 seconds\", \"make it vertical\", \"add captions\", \"speed it up\", \"merge these\", \"make a GIF\", or \"transcribe it\".\n- **Photos**: attach one and ask about it, or turn photos into a slideshow video.\n- **Pictures**: \"draw a lowrider at sunset\".\n- **Files**: attach a PDF or text file and ask about it.\n- **Memory**: I remember what you tell me about yourself. Tap 👎 to teach me.\n- **Voice**: tap the 🎤 and talk; I read answers out loud.`;
      render(ui.ans, turn.text); return;
    }
    const pic = att ? null : pictureRequest(text);
    if (pic) { await makePicture(pic, ui, turn); return; }
    const math = att ? null : quickMath(text);
    if (math) { turn.text = math; render(ui.ans, turn.text); return; } // exact, instant, no brain needed
    // live info first, so OMEGA can still help even if the brain can't start
    let live = '', liveShown = '';
    const P0 = plugSettings(), anyPlug = P0.on.length + P0.custom.length + P0.conn.length > 0;
    if ((settings.live || anyPlug) && !rem) {
      const aboutPast = /\b(you (said|told|gave|suggested|recommended|made|wrote|showed)( me)?|did you (say|tell|give|suggest|recommend|make|write|show)|we (talked|discussed|said|decided|planned|were talking)|(in|from) (the|our|another|other|that|my) (old |last )?(chat|convo|conversation)|last time (we|you|i))\b/i.test(text) && chats.length > 1; // about our old chats, not the internet
      let qtext = text;
      if (navigator.onLine !== false && !att && !aboutPast && isFollowUp(text)) { ui.work.hidden = false; ui.wt.textContent = 'Working out what you mean…'; qtext = await standaloneQuery(text, ui); }
      const offlineish = navigator.onLine === false || att || aboutPast; // no internet (or a file to read): skip live info
      const tools = offlineish || !settings.live ? [] : decideTools(qtext).filter(t => toolOn(t[0]));
      if (!offlineish && anyPlug) {
        tools.push(...catalogTools(text, qtext));
        if (P0.custom.length || P0.conn.length) { ui.work.hidden = false; ui.wt.textContent = '🧩 Checking your plug-ins…'; const rt = await routedTools(text, qtext, ui); tools.push(...rt); }
      }
      if (chat) chat.lastTopic = tools.length ? clip(cleanQuery(qtext), 120) : '';
      if (tools.length) {
        ui.work.hidden = false; ui.wt.textContent = 'Checking live info: ' + tools.map(t => t[0]).join(', ') + '…';
        const q40 = clip(cleanQuery(qtext) || qtext, 48);
        const STEP = { weather: '🌤 Checking the weather', news: `📰 Reading the latest news about "${q40}"`, web: `🔎 Searching the web for "${q40}"`, wiki: `📚 Looking up "${q40}"`, sports: '🏟 Checking live scores on ESPN', stocks: '📈 Checking live stock prices', crypto: '🪙 Checking crypto prices', currency: '💱 Checking exchange rates', time: '🕒 Checking the time', read: '📖 Reading the page you sent', research: `🔬 Researching "${q40}": 3 searches, then reading the top pages` };
        tools.forEach(t => step(ui, t[2] || STEP[t[0]] || `🔎 Looking up ${t[0]}`));
        const res = await Promise.allSettled(tools.map(t => t[1]()));
        const ok = res.filter(r => r.status === 'fulfilled').map(r => r.value);
        ok.forEach(r => turn.sources.push(...r.sources));
        live = ok.map(r => r.text).join('\n\n');
        if (qtext !== text) live = `(The user's follow-up "${clip(text, 160)}" was searched as: "${qtext}". Answer about that topic.)\n\n` + live;
        if (SOCIAL.test(qtext + ' ' + prevUserText())) live += '\n\n(IMPORTANT: Instagram, TikTok, X and similar apps block outside tools from reading live profiles. The results above are search-engine copies and can be weeks or months old: follower counts, bios and posts may be out of date. Say that plainly, give what was found with that warning, and tell the user to open the profile in the app for the current numbers. Never invent current numbers.)';
        liveShown = ok.map(r => r.plain || r.text).join('\n\n');
        const cards = ok.filter(r => r.plain).map(r => r.plain);
        if (cards.length) { turn.live = cards.join('\n\n'); ui.live.textContent = turn.live; ui.live.hidden = false; }
        if (tools.length === 1 && tools[0][0] === 'time' && ok[0] && ok[0].answer && text.split(/\s+/).length <= 14) {
          ui.work.hidden = true; ui.live.hidden = true; turn.live = ''; turn.text = ok[0].answer; render(ui.ans, turn.text); return;
        }
        ui.wt.textContent = ok.length ? `Checked ${ok.map(r => r.label.toLowerCase()).join(', ')}` : 'Live info unavailable right now';
        step(ui, ok.length ? `✓ Got live info${turn.sources.length ? ` from ${turn.sources.length} source${turn.sources.length === 1 ? '' : 's'}` : ''}` : '⚠️ Live info was unavailable');
        if (!ok.length && res.length && tools.some(t => t[0] !== 'web')) live = 'LIVE INFO: the lookup failed just now (no internet or sources busy). Tell the user you could not get live info this time.';
      }
    }
    pastNote = '';
    if (!rem && !att && settings.pastChats !== false && chats.length > 1) {
      const cue = PAST_CUE.test(text);
      const found = (cue || /\b(my|our)\b/i.test(text)) ? searchPast(text) : null;
      if (found && (cue || found.strong)) {
        ui.work.hidden = false; step(ui, '🧠 Checking your past chats');
        pastNote = clip(found.text, 2600); step(ui, `✓ Found it in ${found.found.slice(0, 2).join(' and ')}`);
      } else if (cue && /\b(remember|we talked|other chat|last time|you said)\b/i.test(text)) { ui.work.hidden = false; step(ui, '🧠 Checking your past chats'); step(ui, '· Nothing about that in your past chats'); }
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
      catch (e) {
        if (stopFlag) { turn.text = turn.text || '(stopped)'; render(ui.ans, turn.text); return; }
        // no phone brain downloaded yet: wait a moment and ask the free cloud again instead of giving up
        if (!engine && !loading && !(await isCached(modelOf(settings.model)).catch(() => false))) {
          ui.work.hidden = false; ui.wt.textContent = '☁️ The free cloud brain is busy. Trying again in a few seconds…';
          await sleep(12000); cloudCoolUntil = 0;
          if (!stopFlag) { try { await answerInCloud(text, live, att, ui, turn); return; } catch (e2) { if (stopFlag) { turn.text = '(stopped)'; render(ui.ans, turn.text); return; } } }
        }
        ui.work.hidden = false; ui.wt.textContent = `Cloud brain unavailable (${clip(e.message, 60)}), using the phone brain`;
      }
    }
    if (engine && modelOf(loadedKey).vision && !loading) { ui.work.hidden = false; ui.wt.textContent = 'Switching back to the chat brain…'; await dropEngine(); }
    if (!engine) {
      try {
        if (loading) { ui.work.hidden = false; ui.wt.textContent = 'Waking up OMEGA…'; await loading; }
        else if (crashBlocked) throw Object.assign(new Error("OMEGA's brain crashed twice from low memory. Go to the home screen (✎ New chat) and tap Try again."), { setup: true });
        else if ((await pickSavedBrain(), !crashBlocked && await isCached(modelOf(settings.model)))) { ui.work.hidden = false; ui.wt.textContent = 'Waking up OMEGA…'; await loadBrain(settings.model, p => { ui.wt.textContent = `Waking up OMEGA… ${Math.round((p.progress || 0) * 100)}%`; }); }
        else throw Object.assign(new Error(cloudOn() && navigator.onLine !== false ? "The free cloud brain is busy right now, and the phone brain isn't downloaded yet. Try again in a minute, or download the phone brain so OMEGA always works, even offline." : 'OMEGA needs its brain first. Tap "Download OMEGA\'s brain" on the home screen.'), { setup: true });
      } catch (e) {
        if (liveShown) { turn.text = fallback(e.setup ? "My brain isn't downloaded yet, so I can't chat, but I can still look things up." : "My brain couldn't start just now."); render(ui.ans, turn.text); return; }
        throw e;
      }
    }
    if (stopFlag) { turn.text = '(stopped)'; render(ui.ans, turn.text); return; }
    // answer
    const codeMode = $('#codeChip').getAttribute('aria-pressed') === 'true';
    const wantsApp = codeMode && /\b(app|calculator|website|web ?site|page|landing|game|tool|timer|stopwatch|to-?do|todo|tracker|form|quiz|clock|counter|converter|ui|dashboard|portfolio|menu|button)\b/i.test(text) && !/\b(python|script|terminal|command line|node|java|c\+\+|swift|sql)\b/i.test(text);
    const userContent = (live ? 'LIVE INFO (fetched just now):\n' + clip(live, IS_PHONE && ctxNow() < 8192 ? 2400 : 5000) + '\n\n(Answer using the LIVE INFO above. It is real and current. Copy numbers, times and names exactly as written, and name the source. If it lists headlines or results, summarize the most relevant ones, and prefer the newest dated item. If the LIVE INFO does not contain the exact answer to a live question (a time, score, price or date), say you could not find that exact detail and share what you did find. Never guess numbers, times or scores. For general questions (history, science, how things work), if the LIVE INFO is off-topic, just answer from what you know and do not mention it.)\n---\n' : '') + (att && attText(att) ? `Here is the file the user attached (${att.files.map(f => f.name).join(', ')}):\n-----\n${clip(attText(att), Math.max(1200, (ctxNow() - 900) * 3))}\n-----\n\nUsing the file above, answer this: ` : '') + memoryHint(text) + text + (wantsApp ? '\n\n(Make it as ONE complete, working ```html file with the CSS and JavaScript inside. No input() prompts. It must work on a phone screen.)' : '');
    const win = ctxNow(), big = win >= 8192;
    // keep the last code whole only when this is a change to it ("make it bigger"), not when asking for something new
    const editsCode = codeMode && !/^(?:please |can you |could you |now )?(write|create|build|code|generate|program)\b/i.test(text) && !/\b(a|an|another|new)\b[\w\s]{0,30}\b(app|game|calculator|website|site|page|tool|timer|script|program|function)\b/i.test(text) && /\b(it|its|it's|this one|the (button|buttons|color|colors|background|text|title|font|game|app|page|player|score|speed|size|code)|bigger|smaller|change|fix|add|remove|update|improve|instead|faster|slower|colou?r|rename)\b/i.test(text);
    const hist = historyFor(big ? (IS_PHONE ? 9000 : 16000) : IS_PHONE ? (live ? 1200 : codeMode ? 3000 : 2600) : (live ? 3500 : 6000), editsCode);
    if (hist.length) hist.pop(); // drop the current user turn (already added) — we send the enriched version
    // changing earlier code: give the small brain ONLY that code + the change, so it can't mix up which app it is
    let editContent = null;
    if (editsCode) {
      const last = [...chat.turns].reverse().find(t => t.role !== 'user' && /```/.test(String(t.text || '')));
      const m = last && String(last.text).match(/```(\w*)\n([\s\S]*?)(```|$)/);
      if (m) editContent = `Here is my current code:\n\n\`\`\`${m[1] || 'html'}\n${clip(m[2], Math.floor(ctxNow() * 1.6))}\n\`\`\`\n\nChange it: ${text}\n\nGive back the WHOLE updated file in one code block, with the change made.`;
    }
    const messages = editContent ? [{ role: 'system', content: systemPrompt(codeMode, false) }, { role: 'user', content: editContent }] : [{ role: 'system', content: systemPrompt(codeMode, !!live) }, ...hist, { role: 'user', content: userContent }];
    if (window.OMEGA) window.OMEGA.lastPrompt = messages; // for the test harness
    const promptTokens = Math.ceil(messages.reduce((n, x) => n + x.content.length, 0) / 3.2) + 40;
    const want = big ? (codeMode ? 3000 : 900) : IS_PHONE ? (codeMode ? 1400 : 500) : (codeMode ? 2000 : 800);
    const think = thinkOn() && !!modelOf(loadedKey).thinking;
    if (thinkOn() && !think) messages[messages.length - 1].content += '\n\n(Think it through step by step first, then give the final answer clearly at the end.)';
    const t0 = Date.now();
    const creative = /\b(write|story|poem|haiku|joke|caption|lyrics|rap|song|script|name ideas|ideas|brainstorm|slogan|funny|creative|imagine)\b/i.test(text);
    const opts = { think, temperature: think ? 0.6 : codeMode ? 0.3 : creative ? 0.8 : 0.35, maxTokens: Math.max(200, Math.min(think ? want * 3 : want, win - promptTokens - 64)), onText: out => { showThoughts(ui, out, t0); render(ui.ans, thinkStrip(out), true); toBottom(); } };
    render(ui.ans, '', true); toBottom(); // shows "Thinking…" until the first words arrive
    // watchdog: if the brain goes silent (no new words for a long time), stop it so OMEGA can restart it instead of hanging
    let lastTick = Date.now(), gotWords = false, stalled = false, reloading = false;
    let dead = false; const tick0 = opts.onText; opts.onText = out => { if (dead) return; lastTick = Date.now(); gotWords = true; tick0(out); }; // dead: you pressed Stop, ignore late words
    const dog = setInterval(() => { const quiet = Date.now() - lastTick; if (!stopFlag && !reloading && quiet > (window.__omegaDogMs || (gotWords ? 45000 : 150000))) { stalled = true; try { engine && engine.stop(); } catch (e) { } } }, 3000);
    const run = async msgs => { lastTick = Date.now(); gotWords = false; stalled = false; if (enginePending) { ui.wt.textContent = 'Finishing the last answer…'; await enginePending.catch(() => { }); } const p = engine.chat(msgs, opts); enginePending = p; p.catch(() => { }).finally(() => { if (enginePending === p) enginePending = null; }); const raw = await Promise.race([p, new Promise(r => stopWaiters.push(() => { dead = true; r(''); }))]); if (stalled) throw new Error('brain stalled'); const th = thoughtsOf(raw); if (th) turn.think = clip(th, 6000); showThoughts(ui, raw, t0, true); return thinkStrip(raw).trim(); };
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
      else if (!stopFlag) {
        // anything else (the brain stalled or errored): restart it and try once more with a shorter conversation
        ui.work.hidden = false; ui.wt.textContent = 'The brain got stuck. Restarting it…'; window.__omegaDogMs = 0; reloading = true;
        const key = loadedKey; await dropEngine();
        await loadBrain(key, p => { lastTick = Date.now(); ui.wt.textContent = `Restarting the brain… ${Math.round((p.progress || 0) * 100)}%`; });
        reloading = false; setInflight({ model: loadedKey, t: Date.now(), what: 'answer' });
        turn.text = await run([messages[0], ...messages.slice(-5, -1), { role: 'user', content: userContent }].map(m => ({ role: m.role, content: clip(m.content, 3000) })));
        ui.wt.textContent = 'Restarted the brain and answered';
      }
      else throw e;
    } finally { setInflight(null); clearInterval(dog); }
    if (turn.text) store.set('crashes', null); // answered fine: reset the crash count
    // the small brain sometimes refuses or comes back empty even with good live info: show what was found instead
    if (liveShown && !stopFlag && (!turn.text || /^(i'?m sorry,? but )?i (can'?t|cannot|am unable to|'m unable to) (assist|help) with (that|this)\.?$/i.test(turn.text.trim()))) turn.text = "Here's what I found:\n\n" + liveShown;
    if (!turn.text) turn.text = stopFlag ? '(stopped)' : "Hmm, I didn't get anything there. Try asking again?";
    render(ui.ans, turn.text);
    if (!live && !ui.wt.textContent.startsWith('Checked')) ui.work.hidden = true;
  } catch (e) {
    ui.ans.innerHTML = '';
    const d = document.createElement('div'); d.className = 'err'; d.textContent = /brain stalled/.test((e && e.message) || '') ? "The brain froze twice in a row. Tap New chat and ask again, it'll be fresh." : isGpuCrash(e) ? "OMEGA's brain crashed. Open Brain and settings and pick Qwen3 0.6B, then try again." : ((e && e.message) || String(e)); ui.ans.appendChild(d); if (isGpuCrash(e)) await dropEngine();
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
    if (turn.text && !stopFlag && lastHtml(turn.text) && settings.selfTest !== false && !window.__omegaNoSelfTest) { try { await testAndFix(ui, turn); } catch (e) { } }
    pastNote = '';
    if (turn.text && turn.memo) { const mm = document.createElement('div'); mm.className = 'hint memo'; mm.textContent = '🧠 Memory updated: ' + turn.memo.join(' · '); ui.ans.after(mm); }
    if (turn.text) { chat.turns.push(turn); showSources(ui, turn.sources); showActs(ui, turn, text); if (spoken && !stopFlag && settings.voiceReply !== false) { const rb = ui.acts.querySelector('[data-a=read]'); if (rb) speak(turn.text, rb); } }
    else chat.turns.pop();
    if ((ui.steps && ui.steps.length) || ui._th) { showThoughts(ui, null, ui._t0, true); if (ui.steps && ui.steps.length) turn.steps = ui.steps.slice(0, 30); }
    ui.work.classList.add('done'); // finished: stop the little spinner next to the status line
    saveChats(); setBusy(false); toBottom();
    if (turn.text && !stopFlag && !turn.noMem && settings.autoMemory !== false && cloudOn() && !window.__omegaNoMemory) { const p = smartMemory(text, turn, ui).catch(() => { }); memPending = p; p.finally(() => { if (memPending === p) memPending = null; }); }
  }
}
// ---- smart memory (like ChatGPT and Claude): after you talk, a big brain decides what's worth remembering ----
async function smartMemory(text, turn, ui) {
  if (text.split(/\s+/).length < 4 || !/\b(i|i'm|im|i've|my|me|mine|we|our|us|forget|remember)\b/i.test(text)) return; // nothing about you in it
  if (/\?\s*$/.test(text) && !/[.!]\s+\S/.test(text) && !/\b(remember|forget)\b/i.test(text)) return; // just a question: nothing new to keep
  const name = profile.name || 'the user';
  const sys = `You manage long-term memory for ${name}'s personal AI assistant, OMEGA. Read ${name}'s latest message and decide what, if anything, is worth remembering for FUTURE chats.
SAVE only lasting things ${name} said about themselves or their life: name, age, job, school, where they live, people in their life (and their names), pets, ongoing projects and businesses, goals, plans with dates, strong likes and dislikes, and how they want OMEGA to talk or act. Also save anything they clearly ask you to remember.
DO NOT save: questions, one-time requests or tasks ("make me a game"), passing moods ("I'm tired"), small talk, anything OMEGA said or looked up, guesses, passwords, API keys, card or ID numbers. When unsure, don't save.
Write each memory as one short line in ${name}'s own voice, starting with "I" or "My" (e.g. "I run a construction business in LA", "My sister is Ana"). Combine related details in one line. If a new fact changes an existing memory, put it in "update" with the old line copied exactly. If ${name} asks to forget something, put the existing line in "forget".
Reply with JSON only: {"add":[],"update":[{"old":"","new":""}],"forget":[]}`;
  const mem = facts.length ? facts.map(f => '- ' + f).join('\n') : '(none yet)';
  const user = `Existing memories:\n${clip(mem, 6000)}\n\n${name}'s latest message:\n${clip(text, 1500)}\n\n(OMEGA's reply, for context only, never save it: ${clip(turn.text, 500)})`;
  const o = { maxTokens: 400, temperature: 0.1, bg: true, onText: () => { } };
  const out = thinkStrip(await cloudChat([{ role: 'system', content: sys }, { role: 'user', content: user }], o));
  const j = out.match(/\{[\s\S]*\}/); if (!j) return;
  let r; try { r = JSON.parse(j[0]); } catch (_) { return; }
  const ok = s => typeof s === 'string' && s.trim().length >= 6 && s.length <= 220 && !/(\bsk-[A-Za-z0-9_-]{10,}|AIza[\w-]{10,}|gsk_\w{10,}|password|\b\d{12,}\b)/i.test(s);
  const low = s => s.toLowerCase().replace(/[^a-z0-9 ]/g, '').trim();
  const changed = [];
  for (const f of (Array.isArray(r.forget) ? r.forget : [])) { const i = facts.findIndex(x => low(x) === low(String(f))); if (i >= 0) { facts.splice(i, 1); changed.push('forgot: ' + clip(String(f), 60)); } }
  for (const u of (Array.isArray(r.update) ? r.update : [])) { if (!u || !ok(u.new)) continue; const i = facts.findIndex(x => low(x) === low(String(u.old || ''))); if (i >= 0) facts[i] = u.new.trim(); else if (!facts.some(x => low(x) === low(u.new))) facts.push(u.new.trim()); changed.push(clip(u.new.trim(), 80)); }
  const gone = (Array.isArray(r.forget) ? r.forget : []).map(x => low(String(x)));
  for (const f of (Array.isArray(r.add) ? r.add : [])) { if (!ok(f) || facts.some(x => low(x) === low(f)) || gone.includes(low(f))) continue; facts.push(f.trim()); changed.push(clip(f.trim(), 80)); }
  if (!changed.length) return;
  facts = facts.slice(-150); store.set('facts', facts); renderFacts();
  turn.memo = (turn.memo || []).concat(changed); saveChats();
  if (ui && ui.ans && ui.ans.isConnected) { const old = ui.ans.parentNode && ui.ans.parentNode.querySelector('.memo'); if (old) old.remove(); const mm = document.createElement('div'); mm.className = 'hint memo'; mm.textContent = '🧠 Memory updated: ' + turn.memo.join(' · '); ui.ans.after(mm); }
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
function closeSheets() { veil.hidden = true; ['#setSheet', '#memSheet', '#fbSheet', '#plugSheet'].forEach(s => $(s).hidden = true); }
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
function addKeys(raw) {
  const found = (raw || '').split(/[\s,;]+/).map(s => s.trim().replace(/^["']|["']$/g, '')).filter(s => s.length >= 16);
  const keys = cloudKeys(); let added = 0;
  for (const k of found) if (!keys.includes(k)) { keys.push(k); added++; }
  store.set('settings', settings); syncCloud();
  return added;
}
$('#cloudKey').onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); $('#keyAdd').click(); } };
$('#keyAdd').onclick = () => {
  const n = addKeys($('#cloudKey').value); $('#cloudKey').value = '';
  $('#keyMsg').textContent = n ? `✅ Saved ${n} key${n > 1 ? 's' : ''}. OMEGA will use ${n > 1 ? 'them' : 'it'} now.` : 'That doesn\u2019t look like a key (or it\u2019s already saved).';
};
$('#keyList').onclick = e => {
  const row = e.target.closest('.keyrow');
  const ed = e.target.closest('[data-editkey]'); if (ed && row) { row.querySelector('.keyview').hidden = true; row.querySelector('.keyedit').hidden = false; row.querySelector('.kname').focus(); return; }
  if (e.target.closest('[data-cancelkey]')) { row.querySelector('.keyedit').hidden = true; syncCloud(); return; }
  const sv = e.target.closest('[data-savekey]');
  if (sv && row) {
    const k = cloudKeys()[+sv.dataset.savekey]; settings.keyMeta = settings.keyMeta || {};
    const name = row.querySelector('.kname').value.trim().slice(0, 40), prov = row.querySelector('.kprov').value;
    row.querySelector('.keyedit').hidden = true; settings.keyMeta[k] = { name, prov }; delete keyCool[k]; if (store.get('keyOk', '') === k) store.set('keyOk', '');
    store.set('settings', settings); syncCloud(); $('#keyMsg').textContent = `✅ Saved "${name || CLOUD_NAME[keyProvider(k)]}".`; return;
  }
  const b = e.target.closest('[data-delkey]'); if (!b) return;
  const keys = cloudKeys(); const gone = keys.splice(+b.dataset.delkey, 1)[0]; if (settings.keyMeta) delete settings.keyMeta[gone]; store.set('settings', settings); syncCloud(); $('#keyMsg').textContent = 'Removed.';
};
function syncCloud() {
  $('#cloudOn').checked = settings.cloud !== false;
  const keys = cloudKeys();
  const editing = !!document.querySelector('#keyList .keyedit:not([hidden])');
  const PROV_OPTS = ['auto', 'gemini', 'groq', 'openrouter', 'openai', 'deepseek', 'mistral', 'huggingface', 'xai', 'together', 'cerebras', 'polli', 'nvidia', 'glm', 'anthropic'];
  if (!editing) $('#keyList').innerHTML = keys.map((k, i) => { const m = (settings.keyMeta || {})[k] || {}; const p = keyProvider(k); const status = NO_PHONE[p] ? ' ⚠️ can\u2019t use from phone' : keyCool[k] > Date.now() ? ' ⚠️ resting' : store.get('keyOk', '') === k ? ' ✅' : '';
    return `<div class="keyrow" data-k="${i}"><div class="keyview"><span>${i + 1}. ${esc(keyName(k))} <span class="kmask">••••${esc(k.slice(-4))}</span>${status}</span><span class="keybtns"><button type="button" data-editkey="${i}">Edit</button><button type="button" data-delkey="${i}" aria-label="Remove this key">Remove</button></span></div>
    <div class="keyedit" hidden><label>Name<input type="text" class="kname" maxlength="40" value="${esc(m.name || '')}" placeholder="${esc(CLOUD_NAME[p])}"></label>
    <label>What kind of key<select class="kprov">${PROV_OPTS.map(o => `<option value="${o}"${(m.prov || 'auto') === o ? ' selected' : ''}>${o === 'auto' ? 'Let OMEGA guess (' + esc(CLOUD_NAME[guessProvider(k)]) + ')' : esc(CLOUD_NAME[o])}${NO_PHONE[o] ? ' (needs a server)' : ''}</option>`).join('')}</select></label>
    <span class="keybtns"><button type="button" data-savekey="${i}" class="primary">Save</button><button type="button" data-cancelkey="${i}">Cancel</button></span></div></div>`; }).join('');
  const sk = usableKeys()[0] || '', sp = keyProvider(sk);
  $('#cloudState').textContent = (keys.length > 1 && settings.cloud !== false ? `${keys.length} keys saved. OMEGA tries them top to bottom and skips any that fail or hit their limit. ` : '') + (settings.cloud === false ? 'Off: everything stays on this device.' : navigator.onLine === false ? 'On, but you are offline: the phone brain answers.' : (hub.ready && hub.ready.length && !sk ? `On: answers come from OMEGA's own switchboard of free top AI brains (${hub.ready.length} ready: ${hub.ready.join(', ')}), then Pollinations, then the phone brain. Your messages go to whichever one answers. Paste a free key below for your own brain.` : null) || ({ free: 'On: answers come from a big free cloud brain (Pollinations, no key needed) when you are online. Your messages go to Pollinations. Photos and videos stay with the phone brain. Paste a free key below for a smarter, faster brain.', gemini: 'On, with your Google Gemini key: a smart brain that thinks out loud and can see photos. Your messages go to Google. If it hits its free limit, the free cloud or phone brain answers.', groq: 'On, with your Groq key: very fast big open models. Your messages go to Groq.', polli: 'On, with your Pollinations key: faster cloud answers, and it can see photos. Your messages go to Pollinations.', openrouter: 'On, with your OpenRouter key: free models like DeepSeek. Your messages go to OpenRouter.', openai: 'On, with your ChatGPT (OpenAI) key. Your messages go to OpenAI. OpenAI keys usually need credit on the account.', cerebras: 'On, with your Cerebras key: very fast open models. Your messages go to Cerebras.' })[sp] || `On, with your ${keyName(sk)} key. Your messages go to ${CLOUD_NAME[sp]}.`);
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
  const tests = [['Weather', () => toolWeather('weather')], ['News', () => toolNews('news')], ['Web search', () => toolWeb('Los Angeles population')], ['Crypto', () => toolCrypto('bitcoin price')], ['Currency', () => toolCurrency('1 usd to mxn')], ['Sports scores', () => toolSports('lakers game')], ['Stock prices', () => toolStock('apple stock')], ['Read a web page', () => toolRead('https://example.com')]];
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
$('#autoMem').checked = settings.autoMemory !== false;
$('#autoMem').onchange = e => { settings.autoMemory = e.target.checked; store.set('settings', settings); };
$('#pastChats').checked = settings.pastChats !== false;
$('#teamMode').value = settings.team || 'auto';
$('#teamMode').onchange = e => { settings.team = e.target.value; store.set('settings', settings); };
$('#pastChats').onchange = e => { settings.pastChats = e.target.checked; store.set('settings', settings); };
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
fillProfile(); renderFacts(); renderChats(); syncChips(); grow(); refreshWelcome(); wirePlugins();
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => { });
  // the multi-core brain needs the page to be served by the offline helper: reload once when it first takes over (never mid-answer)
  const multiCoreBrowser = /(Chrome|Chromium|Firefox)\//.test(navigator.userAgent) && !IS_IOS; // Safari stays single-core (more reliable there)
  if (multiCoreBrowser && !window.crossOriginIsolated && typeof SharedArrayBuffer === 'undefined') navigator.serviceWorker.ready.then(() => {
    let tried = false; try { tried = !!sessionStorage.getItem('omega.coi'); sessionStorage.setItem('omega.coi', '1'); } catch (e) { tried = true; }
    if (tried) return;
    const go = () => { if (!busy && !loading && !engine && !chat && !inp.value.trim() && !attachment) location.reload(); };
    if (navigator.serviceWorker.controller) go(); else navigator.serviceWorker.addEventListener('controllerchange', go, { once: true });
  }).catch(() => { });
}
// keep the downloaded brain from being cleared by the browser when storage is low
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
window.OMEGA = { routedTools, catalogTools, unitAnswer, selfTest, findTeam, toolSports, toolStock, stockSymbols, threads: () => ({ isolated: !!window.crossOriginIsolated, cores: navigator.hardwareConcurrency || 1, brainThreads: brainThreads() }), quickMath, decideTools, currencyPair, placeFrom, isClockQuestion, toolWeather, toolTime, toolNews, toolCrypto, toolCurrency, version: VERSION };
