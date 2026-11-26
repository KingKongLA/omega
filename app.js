// OMEGA — a personal AI that runs entirely on your device.
// Brain: open-source models via WebLLM (WebGPU). Live info: free public APIs, no keys.
const WEBLLM_URL = 'https://esm.run/@mlc-ai/web-llm@0.2.89';
const PROXY = 'https://proxy.cors.dev/';
const VERSION = '1.0.0';

// memMB = GPU memory WebLLM estimates at a 4K context. iPhones cap a browser tab at about 1.5 GB in total,
// so only brains under ~1 GB are allowed there (others crash the tab and Safari reloads the page).
const MODELS = [
  { key: 'llama-3.2-1b', name: 'Llama 3.2 1B', f16: 'Llama-3.2-1B-Instruct-q4f16_1-MLC', f32: 'Llama-3.2-1B-Instruct-q4f32_1-MLC', memMB: 880, desc: 'Best brain for iPhone. Natural chat, fast.' },
  { key: 'qwen2.5-0.5b', name: 'Qwen2.5 0.5B (Mini)', f16: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC', f32: 'Qwen2.5-0.5B-Instruct-q4f32_1-MLC', memMB: 945, desc: 'Very small and quick. Use if Llama 1B has trouble.' },
  { key: 'smollm2-360m', name: 'SmolLM2 360M (Tiny)', f16: 'SmolLM2-360M-Instruct-q4f16_1-MLC', f32: 'SmolLM2-360M-Instruct-q4f32_1-MLC', memMB: 380, desc: 'Emergency backup for older phones. Simple answers only.' },
  { key: 'qwen3-1.7b', name: 'Qwen3 1.7B', f16: 'Qwen3-1.7B-q4f16_1-MLC', f32: 'Qwen3-1.7B-q4f32_1-MLC', memMB: 2040, desc: 'Smarter. For computers.', thinking: true },
  { key: 'llama-3.2-3b', name: 'Llama 3.2 3B', f16: 'Llama-3.2-3B-Instruct-q4f16_1-MLC', f32: 'Llama-3.2-3B-Instruct-q4f32_1-MLC', memMB: 2260, desc: 'Very natural conversation. For computers.' },
  { key: 'coder-3b', name: 'Qwen2.5 Coder 3B', f16: 'Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC', f32: 'Qwen2.5-Coder-3B-Instruct-q4f32_1-MLC', memMB: 2500, desc: 'Best for code. For computers.' },
  { key: 'qwen3-4b', name: 'Qwen3 4B', f16: 'Qwen3-4B-q4f16_1-MLC', f32: 'Qwen3-4B-q4f32_1-MLC', memMB: 3430, desc: 'Smartest. Needs a computer with a good graphics card.', thinking: true },
];
// if a brain crashes (out of memory), OMEGA falls back to the next lighter one
const LIGHTER = { 'qwen3-4b': 'qwen3-1.7b', 'llama-3.2-3b': 'qwen3-1.7b', 'coder-3b': 'qwen3-1.7b', 'qwen3-1.7b': 'llama-3.2-1b', 'llama-3.2-1b': 'qwen2.5-0.5b', 'qwen2.5-0.5b': 'smollm2-360m' };
const IS_PHONE = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const IS_IOS = /iPhone|iPad|iPod/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(navigator.userAgent));
const PHONE_MAX_MB = 1000;
const fitsDevice = m => !IS_IOS || m.memMB <= PHONE_MAX_MB;
const CTX = IS_PHONE ? 2048 : 4096; // smaller working memory on phones = far less RAM
const isGpuCrash = e => /device (was )?lost|disposed|external instance|mapAsync|GPUDevice|out of memory|OOM|allocation|WebGPU.*lost|Instance reference/i.test(String((e && e.message) || e));

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
let settings = store.get('settings', { model: IS_PHONE ? 'llama-3.2-1b' : 'qwen3-1.7b', live: true });
if (!MODELS.some(m => m.key === settings.model)) settings.model = IS_PHONE ? 'llama-3.2-1b' : 'qwen3-1.7b';
// a brain that is too big for this iPhone would crash the tab, so switch it before it ever loads
if (IS_IOS && !fitsDevice(MODELS.find(m => m.key === settings.model))) { settings.model = 'llama-3.2-1b'; store.set('settings', settings); }
let crashNote = '';
// crash-loop protection: if Safari killed the page while the brain was loading or answering, use a lighter brain
(() => { const f = store.get('inflight', null); if (f && Date.now() - f.t < 10 * 60 * 1000 && LIGHTER[f.model]) { const from = f.model; settings.model = LIGHTER[from]; store.set('settings', settings); crashNote = `Last time your device ran out of memory, so OMEGA switched to a lighter brain.`; } store.set('inflight', null); })();
let chat = null, busy = false, stopFlag = false;
let webllm = null, engine = null, loadedKey = null, loading = null, hasF16 = null;
const codes = {}; let seq = 0;

// ---------------- markdown + code blocks ----------------
function inline(t) {
  return esc(t).replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`\n]+)`/g, '<code>$1</code>')
    .replace(/\[([^\]]+)\]\((https:\/\/[^)\s]+)\)/g, (m, a, u) => `<a href="${u}" target="_blank" rel="noopener">${a}</a>`);
}
function mdBlock(t) {
  let h = '', list = null, para = [];
  const flushP = () => { if (para.length) { h += '<p>' + para.map(inline).join('<br>') + '</p>'; para = []; } };
  const flushL = () => { if (list) { h += `<${list.t}>` + list.items.map(x => '<li>' + inline(x) + '</li>').join('') + `</${list.t}>`; list = null; } };
  for (const raw of t.split('\n')) {
    const l = raw.trimEnd(); let m;
    if (!l.trim()) { flushP(); flushL(); continue; }
    if ((m = l.match(/^#{1,6}\s+(.*)/))) { flushP(); flushL(); h += '<h3>' + inline(m[1]) + '</h3>'; continue; }
    if ((m = l.match(/^\s*[-*•]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ul') { flushL(); list = { t: 'ul', items: [] }; } list.items.push(m[1]); continue; }
    if ((m = l.match(/^\s*\d+[.)]\s+(.*)/))) { flushP(); if (!list || list.t !== 'ol') { flushL(); list = { t: 'ol', items: [] }; } list.items.push(m[1]); continue; }
    flushL(); para.push(l);
  }
  flushP(); flushL(); return h;
}
function render(el, text) {
  if (!el.id) el.id = 'x' + (++seq);
  const parts = String(text || '').split(/```([\w+#.-]*)[^\n]*\n?([\s\S]*?)(?:```|$)/);
  let h = '', k = 0;
  for (let i = 0; i < parts.length; i += 3) {
    h += mdBlock(parts[i] || '');
    if (i + 2 < parts.length) {
      const lang = (parts[i + 1] || '').toLowerCase(), code = parts[i + 2] || '', id = el.id + '-' + (k++);
      codes[id] = { lang, code };
      const run = /^(js|javascript)$/.test(lang) ? 'Run' : /^(html|htm|svg)$/.test(lang) ? 'Preview' : /^(py|python)$/.test(lang) ? 'Run' : '';
      h += `<div class="code"><div class="cbar"><span>${esc(lang || 'code')}</span><button data-copy="${id}">Copy</button>${run ? `<button data-run="${id}">${run}</button>` : ''}</div><pre><code>${esc(code)}</code></pre><div class="runout" id="r-${id}"></div></div>`;
    }
  }
  el.innerHTML = h;
}
function copyText(text, b) {
  const done = ok => { if (!b) return; const o = b.textContent; b.textContent = ok ? 'Copied' : 'Copy failed'; setTimeout(() => { b.textContent = o; }, 1400); };
  if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(() => done(true), () => done(false));
  else { const t = document.createElement('textarea'); t.value = text; document.body.appendChild(t); t.select(); let ok = false; try { ok = document.execCommand('copy'); } catch (e) { } t.remove(); done(ok); }
}
document.addEventListener('click', e => {
  const b = e.target.closest && e.target.closest('[data-copy],[data-run]'); if (!b) return;
  if (b.dataset.copy && codes[b.dataset.copy]) copyText(codes[b.dataset.copy].code, b);
  if (b.dataset.run && codes[b.dataset.run]) runCode(codes[b.dataset.run], document.getElementById('r-' + b.dataset.run));
});

// ---------------- code runner ----------------
function runCode({ lang, code }, out) {
  out.innerHTML = '';
  if (/^(html|htm|svg)$/.test(lang)) { const f = document.createElement('iframe'); f.setAttribute('sandbox', 'allow-scripts allow-forms allow-modals'); f.srcdoc = code; out.appendChild(f); return; }
  const line = (t, bad) => { const d = document.createElement('div'); if (bad) d.className = 'e'; d.textContent = t; out.appendChild(d); };
  if (/^(py|python)$/.test(lang)) return runPy(code, line);
  const pre = 'const f=a=>a.map(x=>{try{return typeof x==="string"?x:JSON.stringify(x)}catch(e){return String(x)}}).join(" ");console.log=console.info=(...a)=>postMessage({e:0,v:f(a)});console.error=console.warn=(...a)=>postMessage({e:1,v:f(a)});';
  let w;
  try { w = new Worker(URL.createObjectURL(new Blob([pre + '(async()=>{try{\n' + code + '\n}catch(e){console.error(String(e))}finally{postMessage({end:1})}})();'], { type: 'text/javascript' }))); }
  catch (e) { return line("Code can't run here: " + e.message, 1); }
  const t = setTimeout(() => { w.terminate(); line('Stopped after 10 seconds.', 1); }, 10000);
  line('Running…');
  w.onmessage = m => { if (m.data.end) { clearTimeout(t); w.terminate(); line('Done.'); } else line(m.data.v, m.data.e); };
  w.onerror = ev => { ev.preventDefault(); clearTimeout(t); w.terminate(); line('Error: ' + (ev.message || 'script error'), 1); };
}
let pyReady = null;
function runPy(code, line) {
  line('Loading Python (first time takes ~10 seconds)…');
  if (!pyReady) pyReady = new Promise((res, rej) => { const s = document.createElement('script'); s.src = 'https://cdn.jsdelivr.net/pyodide/v0.26.4/full/pyodide.js'; s.onload = () => window.loadPyodide().then(res, rej); s.onerror = () => rej(new Error('Could not load Python')); document.head.appendChild(s); });
  pyReady.then(async py => { py.setStdout({ batched: t => line(t) }); py.setStderr({ batched: t => line(t, 1) }); try { const r = await py.runPythonAsync(code); if (r !== undefined && r !== null) line('→ ' + r); line('Done.'); } catch (e) { line(String(e.message || e), 1); } }).catch(e => { pyReady = null; line(e.message, 1); });
}

// ---------------- time ----------------
function nowLine() {
  const d = new Date(); let tz = '', full = '';
  try { tz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) { }
  try { full = d.toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: '2-digit', timeZoneName: 'short' }); } catch (e) { full = d.toString(); }
  return `Right now it is ${full}${tz ? ' (' + tz + ')' : ''}.`;
}

// ---------------- live info (free, no keys) ----------------
async function fetchT(url, { ms = 9000, type = 'json' } = {}) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms);
  try {
    const r = await fetch(url, { signal: c.signal });
    if (!r.ok) throw new Error('HTTP ' + r.status);
    return type === 'json' ? await r.json() : await r.text();
  } finally { clearTimeout(t); }
}
const WMO = { 0: 'clear sky', 1: 'mostly clear', 2: 'partly cloudy', 3: 'overcast', 45: 'fog', 48: 'freezing fog', 51: 'light drizzle', 53: 'drizzle', 55: 'heavy drizzle', 61: 'light rain', 63: 'rain', 65: 'heavy rain', 66: 'freezing rain', 67: 'heavy freezing rain', 71: 'light snow', 73: 'snow', 75: 'heavy snow', 80: 'rain showers', 81: 'rain showers', 82: 'violent rain showers', 95: 'thunderstorm', 96: 'thunderstorm with hail', 99: 'thunderstorm with hail' };
function placeFrom(text) {
  const m = text.match(/\b(?:in|for|at|near)\s+([A-Za-z][A-Za-z .'-]{1,40}?)(?:,\s*[A-Za-z .]+)?\s*(?:\?|!|\.|$|\b(?:today|tonight|tomorrow|right now|now|this week|this weekend|later)\b)/i);
  return (m ? m[1] : (profile.city || 'Los Angeles')).trim();
}
async function toolWeather(text) {
  const place = placeFrom(text).split(',')[0];
  const g = await fetchT(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(place)}&count=1&language=en&format=json`);
  const p = g && g.results && g.results[0];
  if (!p) throw new Error('Place not found: ' + place);
  const w = await fetchT(`https://api.open-meteo.com/v1/forecast?latitude=${p.latitude}&longitude=${p.longitude}&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,precipitation&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=3`);
  const c = w.current, d = w.daily, where = [p.name, p.admin1, p.country_code].filter(Boolean).join(', ');
  const days = d.time.map((t, i) => `${i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : t}: ${WMO[d.weather_code[i]] || 'mixed'}, high ${Math.round(d.temperature_2m_max[i])}°F, low ${Math.round(d.temperature_2m_min[i])}°F, ${d.precipitation_probability_max[i] ?? 0}% chance of rain`).join('\n');
  return { label: 'Weather', text: `WEATHER for ${where} (Open-Meteo, live):\nNow: ${Math.round(c.temperature_2m)}°F (feels like ${Math.round(c.apparent_temperature)}°F), ${WMO[c.weather_code] || 'mixed'}, humidity ${c.relative_humidity_2m}%, wind ${Math.round(c.wind_speed_10m)} mph.\n${days}`, sources: [{ title: 'Open-Meteo', url: 'https://open-meteo.com/' }] };
}
function parseRSS(xml, n) {
  const doc = new DOMParser().parseFromString(xml, 'text/xml');
  return [...doc.querySelectorAll('item')].slice(0, n).map(it => {
    const g = s => (it.querySelector(s) || {}).textContent || '';
    return { title: g('title').trim(), link: g('link').trim(), date: g('pubDate').trim(), source: g('source').trim() };
  }).filter(x => x.title);
}
function bingLink(l) { const m = l.match(/[?&]url=([^&]+)/); return m ? decodeURIComponent(m[1]) : l; }
async function toolNews(text) {
  const q = text.replace(/\b(news|latest|headlines?|what'?s|whats|happening|give me|show me|tell me|the|a|an|about|on|any|today|tonight|yesterday|last night|right now|update|updates|in the|who|what|when|where|did|does|do|is|was|were|are|won|win|score|of|for|please|bro|hey|yo|omega)\b/gi, ' ').replace(/[?!.,]/g, ' ').replace(/\s+/g, ' ').trim();
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
  return { label: 'News', text: `NEWS${q.length > 2 ? ' about "' + q + '"' : ' (top headlines)'} (live):\n` + items.map((x, i) => `${i + 1}. ${x.title}${srcName(x) && !x.title.includes(srcName(x)) ? ' — ' + srcName(x) : ''}${x.date ? ' (' + x.date.replace(/ [+-]\d{4}$| GMT$/, '') + ')' : ''}`).join('\n'), sources: items.filter(x => /^https:\/\//.test(x.link)).slice(0, 5).map(x => ({ title: srcName(x) || x.title, url: x.link })) };
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
async function toolCrypto(text) {
  const ids = [...new Set((text.toLowerCase().match(/\b[a-z]+\b/g) || []).map(w => COINS[w]).filter(Boolean))];
  if (!ids.length) ids.push('bitcoin', 'ethereum');
  const d = await fetchT(`https://api.coingecko.com/api/v3/simple/price?ids=${ids.join(',')}&vs_currencies=usd&include_24hr_change=true`);
  return { label: 'Crypto', text: 'CRYPTO PRICES (CoinGecko, live):\n' + ids.filter(i => d[i]).map(i => `${i}: $${d[i].usd.toLocaleString('en-US')} (${d[i].usd_24h_change >= 0 ? '+' : ''}${(d[i].usd_24h_change || 0).toFixed(2)}% in 24h)`).join('\n'), sources: [{ title: 'CoinGecko', url: 'https://www.coingecko.com/' }] };
}
const CUR = ['usd', 'eur', 'gbp', 'mxn', 'cad', 'jpy', 'cny', 'inr', 'aud', 'chf', 'krw', 'brl', 'php', 'gtq', 'cop', 'nzd', 'sek', 'hkd', 'sgd', 'zar', 'try', 'pln'];
const CURNAMES = { dollar: 'usd', dollars: 'usd', euro: 'eur', euros: 'eur', pound: 'gbp', pounds: 'gbp', peso: 'mxn', pesos: 'mxn', yen: 'jpy', rupee: 'inr', rupees: 'inr', quetzal: 'gtq', quetzales: 'gtq' };
function currencyPair(text) {
  const t = text.toLowerCase().replace(/\b(dollars?|euros?|pounds?|pesos?|yen|rupees?|quetzal(?:es)?)\b/g, m => CURNAMES[m]);
  const m = t.match(/(\d[\d,]*(?:\.\d+)?)?\s*\b([a-z]{3})\b\s*(?:to|in|into|->|=)\s*\b([a-z]{3})\b/);
  if (m && CUR.includes(m[2]) && CUR.includes(m[3])) return { amt: parseFloat((m[1] || '1').replace(/,/g, '')), from: m[2].toUpperCase(), to: m[3].toUpperCase() };
  return null;
}
async function toolCurrency(text) {
  const p = currencyPair(text);
  const d = await fetchT(`https://api.frankfurter.dev/v1/latest?amount=${p.amt}&base=${p.from}&symbols=${p.to}`);
  const v = d.rates && d.rates[p.to];
  return { label: 'Currency', text: `EXCHANGE RATE (Frankfurter / European Central Bank, ${d.date}): ${p.amt} ${p.from} = ${v} ${p.to}`, sources: [{ title: 'Frankfurter', url: 'https://frankfurter.dev/' }] };
}
function decideTools(text) {
  const t = text.toLowerCase(), tools = [];
  const url = (text.match(/https?:\/\/[^\s)]+/) || [])[0];
  if (url) tools.push(['read', () => toolRead(url)]);
  if (/\b(weather|temperature|forecast|raining|rain today|rain tomorrow|snow|humid|how hot|how cold|degrees outside|sunny)\b/.test(t)) tools.push(['weather', () => toolWeather(text)]);
  if (/\b(bitcoin|btc|ethereum|eth|crypto|solana|dogecoin|doge|xrp|cardano|litecoin|shiba|pepe)\b/.test(t) && /\b(price|worth|cost|how much|value|at|today|now|up|down)\b/.test(t)) tools.push(['crypto', () => toolCrypto(text)]);
  if (currencyPair(text)) tools.push(['currency', () => toolCurrency(text)]);
  if (/\b(news|headlines?|what'?s happening|what happened)\b/.test(t)) tools.push(['news', () => toolNews(text)]);
  if (!tools.length && !url) {
    const words = t.split(/\s+/).filter(Boolean).length;
    const live = /\b(today|tonight|yesterday|tomorrow|this (week|weekend|month|year)|right now|currently|current|latest|recent|newest|new|upcoming|202[4-9]|price|prices|cost|how much|who won|score|scores|game|release date|released|open now|hours|near me|stock|search|look up|google|who is|who's|what is|what's|when is|when does|when did|where is|is .+ still|did .+ (die|win|lose)|ceo of|president|election|update)\b/.test(t);
    const casual = /^(hi|hey|yo|sup|wassup|thanks|thank you|ok|okay|lol|lmao|bet|cool|nice|good (morning|night|afternoon))\b/.test(t) && words <= 5;
    if (live && !casual && words >= 2) tools.push(['web', () => toolWeb(text)]);
    if (live && !casual && /\b(won|win|score|scores|beat|lost|game|match|fight|final)\b/.test(t)) tools.push(['news', () => toolNews(text)]);
  }
  return tools;
}

// ---------------- brain (WebLLM) ----------------
const modelOf = key => MODELS.find(m => m.key === key) || MODELS[0];
async function gpuCheck() {
  if (!('gpu' in navigator) || !navigator.gpu) return { ok: false, why: 'This browser has no WebGPU. On iPhone, update to iOS 26 or newer and use Safari. On a computer, use Chrome or Edge.' };
  try {
    const a = await navigator.gpu.requestAdapter();
    if (!a) return { ok: false, why: 'WebGPU is on, but no graphics adapter was found. Close other tabs and try again.' };
    hasF16 = a.features && a.features.has('shader-f16');
    return { ok: true, f16: hasF16 };
  } catch (e) { return { ok: false, why: 'WebGPU error: ' + e.message }; }
}
async function getWebLLM() { if (!webllm) webllm = await import(WEBLLM_URL); return webllm; }
function modelId(m) { return hasF16 === false ? m.f32 : m.f16; }
async function isCached(m) { try { const w = await getWebLLM(); return await w.hasModelInCache(modelId(m)); } catch (e) { return false; } }
function setStatus(t) { const s = $('#brainStatus'); s.textContent = t || ''; s.hidden = !t; }
function loadBrain(key, onProgress) {
  if (loading) return loading;
  if (!fitsDevice(modelOf(key))) key = 'llama-3.2-1b';
  loading = (async () => {
    const g = await gpuCheck(); if (!g.ok) throw new Error(g.why);
    const w = await getWebLLM();
    const m = modelOf(key), id = modelId(m);
    const cb = p => { onProgress && onProgress(p); const pct = Math.round((p.progress || 0) * 100); setStatus(`Loading ${m.name}… ${pct}%`); };
    const chatOpts = { context_window_size: CTX };
    store.set('inflight', { model: key, t: Date.now(), what: 'load' });
    try {
      if (engine && loadedKey !== key) { try { engine.setInitProgressCallback(cb); await engine.reload(id, chatOpts); } catch (e) { try { await engine.unload(); } catch (_) { } engine = null; } }
      if (!engine) {
        try { engine = await w.CreateWebWorkerMLCEngine(new Worker(new URL('./worker.js', import.meta.url), { type: 'module' }), id, { initProgressCallback: cb }, chatOpts); }
        catch (e) { if (isGpuCrash(e)) throw e; engine = await w.CreateMLCEngine(id, { initProgressCallback: cb }, chatOpts); }
      }
    } finally { store.set('inflight', null); }
    loadedKey = key; settings.model = key; store.set('settings', settings);
    setStatus(''); refreshWelcome();
    return engine;
  })();
  loading.catch(e => { setStatus(''); engine = null; loadedKey = null; }).finally(() => { loading = null; });
  return loading;
}
async function dropEngine() { const e = engine; engine = null; loadedKey = null; try { e && await e.unload(); } catch (_) { } }
const thinkStrip = t => t.replace(/<think>[\s\S]*?<\/think>\s*/g, '').replace(/<think>[\s\S]*$/, '');

// ---------------- prompt ----------------
function systemPrompt(codeMode) {
  const name = profile.name || 'the user';
  const f = facts.slice(-30).map(x => '- ' + x).join('\n');
  const l = lessons.slice(-6).map(x => `- When asked "${clip(x.q, 120)}", ${name} said: ${clip(x.fix, 300)}`).join('\n');
  return [
    `You are OMEGA, ${name}'s personal AI. Talk like a real person texting a friend who happens to know a lot: casual, warm, direct, no corporate tone. Short answers for simple stuff, more detail when it's needed.`,
    profile.style ? `How ${name} wants you to talk: ${profile.style}` : '',
    profile.about ? `About ${name}: ${profile.about}` : '',
    f ? `Things to remember about ${name}:\n${f}` : '',
    l ? `Feedback ${name} gave you before (follow it):\n${l}` : '',
    nowLine() + (profile.city ? ` ${name} is usually in ${profile.city}.` : ''),
    'When LIVE INFO is given in a message, it was fetched from the internet just now: answer from it and name the source. Never say you cannot access the internet or real-time info when LIVE INFO is provided. If you truly do not know something, say so instead of making it up.',
    codeMode ? 'CODING MODE: write complete, working code in fenced code blocks with a language tag (```html, ```javascript, ```python). For apps, prefer one self-contained HTML file. JavaScript runs in a worker (use console.log). Explain briefly how to use it.' : '',
  ].filter(Boolean).join('\n\n');
}
function historyFor(maxChars) {
  const turns = (chat && chat.turns) || [];
  const out = []; let used = 0;
  for (let i = turns.length - 1; i >= 0; i--) {
    const t = turns[i]; const c = clip(t.text, 2500); used += c.length;
    if (used > maxChars) break;
    out.unshift({ role: t.role === 'user' ? 'user' : 'assistant', content: c });
  }
  return out;
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
    const g = await gpuCheck();
    const m = modelOf(settings.model);
    const cached = g.ok && await isCached(m);
    if (!g.ok) setup = `<div class="setup"><h2>This device can't run OMEGA's brain yet</h2><p>${esc(g.why)}</p></div>`;
    else if (cached) { setup = `<div class="setup"><h2>Waking up OMEGA…</h2><p>Loading ${esc(m.name)} from your phone. This takes a few seconds.</p></div>`; if (!loading) loadBrain(m.key).catch(e => showSetupError(e)); }
    else setup = `<div class="setup"><h2>One-time setup</h2><p>OMEGA's brain (${esc(m.name)}) downloads to this phone once, then runs offline. Use Wi-Fi: it's about ${IS_PHONE ? '700 MB' : '1–2 GB'}. Keep this page open while it downloads.</p><button class="btn pri" id="setupGo">Download OMEGA's brain</button><div class="bar" id="setupBarWrap" hidden><div class="fill" id="setupBar"></div></div><p class="hint" id="setupText" style="margin-top:8px"></p></div>`;
  }
  if (chat) return;
  col.innerHTML = `${crashNote ? `<div class="err" style="max-width:520px;margin:8px auto">${esc(crashNote)}</div>` : ''}<div class="welcome"><div class="big">Ω</div><h1>${esc(greet())}${first}</h1><p>${engine ? 'What do you want to get done?' : 'Your own AI, running on your phone.'}</p>${setup}${engine ? `<div class="sugg">${SUGG.map((s, i) => `<button data-s="${i}"><b>${esc(s[0])}</b><span>${esc(s[1])}</span></button>`).join('')}</div>` : ''}</div>`;
  col.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { const s = SUGG[+b.dataset.s]; inp.value = s[0] + ' ' + s[1]; grow(); inp.focus(); });
  const go = $('#setupGo');
  if (go) go.onclick = () => {
    go.disabled = true; $('#setupBarWrap').hidden = false;
    loadBrain(settings.model, p => { $('#setupBar').style.width = Math.round((p.progress || 0) * 100) + '%'; $('#setupText').textContent = p.text || ''; })
      .catch(e => showSetupError(e));
  };
}
function showSetupError(e) {
  if (isGpuCrash(e) && LIGHTER[settings.model]) { settings.model = LIGHTER[settings.model]; store.set('settings', settings); }
  const msg = String(e && e.message || e);
  const tip = isGpuCrash(e) ? ` Your device ran out of memory for that brain, so OMEGA picked a lighter one (${modelOf(settings.model).name}). Reload the page and tap Download again.` : '';
  const el = document.createElement('div'); el.className = 'err'; el.textContent = 'Could not load the brain: ' + msg + tip;
  (col.querySelector('.setup') || col).appendChild(el);
}
function addUser(text) {
  const d = document.createElement('div'); d.className = 'msg user';
  d.innerHTML = '<div class="bubble"></div>'; d.querySelector('.bubble').textContent = text; col.appendChild(d);
}
function addBot() {
  const d = document.createElement('div'); d.className = 'msg bot';
  d.innerHTML = '<div class="av">Ω</div><div class="body"><div class="work" hidden><span class="spin"></span><span class="wt"></span></div><div class="md ans"><span class="typing"><i></i><i></i><i></i></span></div><div class="srcs"></div><div class="acts" hidden></div></div>';
  col.appendChild(d);
  return { el: d, work: d.querySelector('.work'), wt: d.querySelector('.wt'), ans: d.querySelector('.ans'), srcs: d.querySelector('.srcs'), acts: d.querySelector('.acts') };
}
function showSources(ui, srcs) {
  ui.srcs.innerHTML = (srcs || []).filter(s => /^https:\/\//.test(s.url)).slice(0, 8).map(s => { let h = ''; try { h = new URL(s.url).hostname.replace(/^www\./, ''); } catch (e) { } return `<a href="${esc(s.url)}" target="_blank" rel="noopener" title="${esc(s.title)}">${esc(h === 'news.google.com' ? s.title : h || s.title)}</a>`; }).join('');
}
function showActs(ui, turn, q) {
  ui.acts.hidden = false;
  ui.acts.innerHTML = `<button data-a="copy">Copy</button><button data-a="up" class="${turn.fb === 'up' ? 'on' : ''}" aria-label="Good answer">👍</button><button data-a="down" class="${turn.fb === 'down' ? 'on' : ''}" aria-label="Bad answer">👎</button>`;
  ui.acts.querySelector('[data-a=copy]').onclick = e => copyText(turn.text, e.target);
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
    if (t.role === 'user') { addUser(t.text); lastQ = t.text; }
    else { const ui = addBot(); render(ui.ans, t.text); showSources(ui, t.sources); showActs(ui, t, lastQ); }
  }
}

function grow() { inp.style.height = 'auto'; inp.style.height = Math.min(inp.scrollHeight, 200) + 'px'; sendBtn.disabled = !busy && !inp.value.trim(); }
inp.addEventListener('input', grow);
const coarse = window.matchMedia && matchMedia('(pointer:coarse)').matches;
inp.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !coarse && !e.isComposing) { e.preventDefault(); send(); } });
const SEND_SVG = sendBtn.innerHTML, STOP_SVG = '<svg width="14" height="14" viewBox="0 0 24 24"><rect x="4" y="4" width="16" height="16" rx="3" fill="currentColor"/></svg>';
function setBusy(b) { busy = b; sendBtn.innerHTML = b ? STOP_SVG : SEND_SVG; sendBtn.setAttribute('aria-label', b ? 'Stop' : 'Send'); grow(); }
sendBtn.onclick = () => { if (busy) { stopFlag = true; try { engine && engine.interruptGenerate(); } catch (e) { } } else send(); };

async function send() {
  const text = inp.value.trim(); if (!text || busy) return;
  if (!chat) { chat = { id: 'c' + Date.now(), title: clip(text, 60), turns: [], t: Date.now() }; col.innerHTML = ''; $('#title').textContent = chat.title; }
  inp.value = ''; grow();
  addUser(text); chat.turns.push({ role: 'user', text });
  const ui = addBot(); toBottom(true);
  setBusy(true); stopFlag = false;
  const turn = { role: 'assistant', text: '', sources: [] };
  try {
    // memory command
    const rem = text.match(/^(?:please\s+)?(?:remember|don'?t forget)(?:\s+that)?[:,]?\s+(.{3,})$/i);
    if (rem) { const f = rem[1].replace(/[.!]+$/, ''); facts.push(f); facts = facts.slice(-100); store.set('facts', facts); renderFacts(); }
    // brain
    if (!engine) {
      if (loading) { ui.work.hidden = false; ui.wt.textContent = 'Waking up OMEGA…'; await loading; }
      else {
        const m = modelOf(settings.model); const g = await gpuCheck();
        if (!g.ok) throw new Error(g.why);
        if (await isCached(m)) { ui.work.hidden = false; ui.wt.textContent = 'Waking up OMEGA…'; await loadBrain(m.key); }
        else throw Object.assign(new Error('OMEGA needs its brain first. Tap "Download OMEGA\'s brain" on the home screen, or open Brain and settings.'), { setup: true });
      }
    }
    // live info
    let live = '';
    if (settings.live && !rem) {
      const tools = decideTools(text);
      if (tools.length) {
        ui.work.hidden = false; ui.wt.textContent = 'Checking live info: ' + tools.map(t => t[0]).join(', ') + '…';
        const res = await Promise.allSettled(tools.map(t => t[1]()));
        const ok = res.filter(r => r.status === 'fulfilled').map(r => r.value);
        ok.forEach(r => turn.sources.push(...r.sources));
        live = ok.map(r => r.text).join('\n\n');
        const fails = res.filter(r => r.status === 'rejected').length;
        ui.wt.textContent = ok.length ? `Checked ${ok.map(r => r.label.toLowerCase()).join(', ')}` : 'Live info unavailable right now';
        if (!ok.length && fails) live = 'LIVE INFO: the lookup failed just now (no internet or sources busy). Tell the user you could not get live info this time.';
      }
    }
    // answer
    const codeMode = $('#codeChip').getAttribute('aria-pressed') === 'true';
    const m = modelOf(loadedKey);
    const userContent = (live ? 'LIVE INFO (fetched just now):\n' + clip(live, IS_PHONE ? 2400 : 5000) + '\n\n---\n' : '') + (rem ? text + '\n(I saved this to memory. Confirm briefly.)' : text);
    const hist = historyFor(IS_PHONE ? (live ? 1200 : 2600) : (live ? 3500 : 6000));
    hist.pop(); // drop the current user turn (already added) — we send the enriched version
    const messages = [{ role: 'system', content: systemPrompt(codeMode) }, ...hist, { role: 'user', content: userContent }];
    const run = async msgs => {
      let out = '';
      const mm = modelOf(loadedKey); const stream = await engine.chat.completions.create({ messages: msgs, stream: true, temperature: codeMode ? 0.3 : 0.7, top_p: 0.9, max_tokens: IS_PHONE ? (codeMode ? 900 : 500) : (codeMode ? 1500 : 800), ...(mm.thinking ? { extra_body: { enable_thinking: false } } : {}) });
      for await (const ch of stream) {
        out += (ch.choices && ch.choices[0] && ch.choices[0].delta && ch.choices[0].delta.content) || '';
        const shown = thinkStrip(out); if (shown) { render(ui.ans, shown); toBottom(); }
        if (stopFlag) break;
      }
      return thinkStrip(out).trim();
    };
    store.set('inflight', { model: loadedKey, t: Date.now(), what: 'answer' });
    try { turn.text = await run(messages); }
    catch (e) {
      if (isGpuCrash(e)) {
        // the brain ran out of memory: switch to a lighter one and try once more
        const from = loadedKey, to = LIGHTER[from];
        await dropEngine();
        if (!to) throw new Error("This device ran out of memory even with the lightest brain. Close other tabs and apps, then try again.");
        ui.work.hidden = false; ui.wt.textContent = `Out of memory. Switching to ${modelOf(to).name}…`;
        await loadBrain(to, p => { ui.wt.textContent = `Out of memory. Loading ${modelOf(to).name}… ${Math.round((p.progress || 0) * 100)}%`; });
        const m2 = modelOf(to); messages[0].content = systemPrompt(codeMode);
        store.set('inflight', { model: to, t: Date.now(), what: 'answer' });
        turn.text = await run(messages.slice(0, 1).concat([{ role: 'user', content: clip(userContent, 2000) }]));
        ui.wt.textContent = `Switched to ${m2.name} to save memory`;
      } else if (/context|too long|exceed|prompt/i.test(String(e.message))) { turn.text = await run([messages[0], { role: 'user', content: clip(userContent, 2000) }]); }
      else throw e;
    } finally { store.set('inflight', null); }
    if (!turn.text) turn.text = stopFlag ? '(stopped)' : "Hmm, I didn't get anything there. Try asking again?";
    render(ui.ans, turn.text);
    if (!live && !ui.wt.textContent.startsWith('Checked')) ui.work.hidden = true;
  } catch (e) {
    ui.ans.innerHTML = '';
    const d = document.createElement('div'); d.className = 'err'; d.textContent = isGpuCrash(e) ? "OMEGA's brain ran out of memory. Open Brain and settings and pick Llama 3.2 1B (Lite), then try again." : ((e && e.message) || String(e)); ui.ans.appendChild(d); if (isGpuCrash(e)) await dropEngine();
    ui.work.hidden = true;
    if (e && e.setup) { const b = document.createElement('button'); b.className = 'btn pri'; b.style.marginTop = '8px'; b.textContent = 'Open Brain and settings'; b.onclick = () => openSheet('#setSheet'); d.appendChild(document.createElement('br')); d.appendChild(b); }
    turn.text = '';
  } finally {
    if (turn.text) { chat.turns.push(turn); showSources(ui, turn.sources); showActs(ui, turn, text); }
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
  $('#chats').innerHTML = chats.length ? chats.map(c => `<div class="chatitem ${chat && c.id === chat.id ? 'on' : ''}"><button class="open" data-open="${esc(c.id)}">${esc(c.title || 'Chat')}</button><button class="del" data-del="${esc(c.id)}" aria-label="Delete chat">✕</button></div>`).join('') : '<div class="empty">Your chats show up here.</div>';
}
$('#chats').onclick = e => {
  const o = e.target.closest('[data-open]'), d = e.target.closest('[data-del]');
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
document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeSheets(); closeSide(); } });
$('#openMem').onclick = () => openSheet('#memSheet'); $('#openSet').onclick = () => openSheet('#setSheet');

// chips
function syncChips() { $('#webChip').setAttribute('aria-pressed', String(!!settings.live)); }
$('#webChip').onclick = () => { settings.live = !settings.live; store.set('settings', settings); syncChips(); };
$('#codeChip').onclick = () => { const on = $('#codeChip').getAttribute('aria-pressed') !== 'true'; $('#codeChip').setAttribute('aria-pressed', String(on)); inp.placeholder = on ? 'What should OMEGA build?' : 'Message OMEGA'; };

// settings sheet
let pick = settings.model;
async function renderSettings() {
  const g = await gpuCheck();
  $('#gpuInfo').textContent = g.ok ? (engine ? `Running ${modelOf(loadedKey).name} on this device's graphics chip.` : 'This device can run OMEGA. Pick a brain and load it.') : g.why;
  const rows = await Promise.all(MODELS.map(async m => ({ m, cached: g.ok && await isCached(m) })));
  if (!fitsDevice(modelOf(pick))) pick = settings.model;
  $('#models').innerHTML = rows.map(({ m, cached }) => { const ok = fitsDevice(m); return `<label class="model ${pick === m.key ? 'on' : ''}" ${ok ? '' : 'style="opacity:.5"'}><input type="radio" name="model" value="${m.key}" ${pick === m.key ? 'checked' : ''} ${ok ? '' : 'disabled'}><div><b>${esc(m.name)}${loadedKey === m.key ? ' · running' : cached ? ' · downloaded' : ''}</b><span>${esc(m.desc)} Uses about ${(m.memMB / 1000).toFixed(1)} GB of memory.${ok ? '' : ' Too big for iPhone: Safari would crash.'}</span></div></label>`; }).join('');
  $('#models').querySelectorAll('input').forEach(i => i.onchange = () => { pick = i.value; renderSettings(); });
  $('#loadBtn').disabled = !g.ok || loadedKey === pick;
  $('#loadHint').textContent = loadedKey === pick ? 'Already running.' : '';
}
$('#loadBtn').onclick = () => {
  $('#loadBtn').disabled = true; $('#loadBarWrap').hidden = false; $('#loadText').textContent = 'Starting…';
  loadBrain(pick, p => { $('#loadBar').style.width = Math.round((p.progress || 0) * 100) + '%'; $('#loadText').textContent = p.text || ''; })
    .then(() => { $('#loadText').textContent = 'Ready! ' + modelOf(pick).name + ' is running.'; renderSettings(); })
    .catch(e => { $('#loadText').textContent = 'Could not load: ' + e.message + (/memory|OOM|lost/i.test(e.message) ? ' Try a smaller brain.' : ''); $('#loadBtn').disabled = false; });
};
$('#testSrc').onclick = async () => {
  const ul = $('#srcResults'); ul.innerHTML = ''; $('#testSrc').disabled = true;
  const row = (n, ok, d) => { const li = document.createElement('li'); li.innerHTML = `<span><b>${esc(n)}</b><br><span class="hint">${esc(clip(d, 120))}</span></span><span class="${ok ? 'ok' : 'bad'}">${ok ? 'Works' : 'Failed'}</span>`; ul.appendChild(li); };
  const tests = [['Weather', () => toolWeather('weather')], ['News', () => toolNews('news')], ['Web search', () => toolWeb('Los Angeles population')], ['Crypto', () => toolCrypto('bitcoin price')], ['Currency', () => toolCurrency('1 usd to mxn')], ['Read a web page', () => toolRead('https://example.com')]];
  for (const [n, f] of tests) { try { const r = await f(); row(n, true, r.text.split('\n').slice(0, 2).join(' ')); } catch (e) { row(n, false, e.message); } }
  $('#testSrc').disabled = false;
};
$('#clearChats').onclick = () => { if ($('#clearChats').dataset.sure) { chats = []; store.set('chats', chats); newChat(); $('#dataHint').textContent = 'All chats deleted.'; delete $('#clearChats').dataset.sure; $('#clearChats').textContent = 'Delete all chats'; } else { $('#clearChats').dataset.sure = '1'; $('#clearChats').textContent = 'Tap again to delete all chats'; } };
$('#clearCache').onclick = async () => {
  try { const w = await getWebLLM(); for (const m of MODELS) { if (loadedKey === m.key) continue; for (const id of [m.f16, m.f32]) { try { await w.deleteModelAllInfoInCache(id); } catch (e) { } } } $('#dataHint').textContent = 'Removed downloaded brains that are not running right now.'; renderSettings(); }
  catch (e) { $('#dataHint').textContent = 'Could not remove: ' + e.message; }
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
    rec.onresult = ev => { inp.value = base + [...ev.results].map(r => r[0].transcript).join(''); grow(); };
    rec.onend = () => { rec = null; mic.style.color = ''; };
    rec.onerror = () => { rec = null; mic.style.color = ''; };
    mic.style.color = 'var(--acc)'; rec.start();
  };
}

// ---------------- boot ----------------
fillProfile(); renderFacts(); renderChats(); syncChips(); grow(); refreshWelcome();
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => { });
// keep the downloaded brain from being cleared by the browser when storage is low
if (navigator.storage && navigator.storage.persist) navigator.storage.persist().catch(() => { });
window.OMEGA = { decideTools, currencyPair, placeFrom, version: VERSION };
