// OMEGA video editor: trims, cuts, speeds up, makes vertical, adds text, GIFs, slideshows... right on the phone.
// Uses ffmpeg.wasm (free, open source). The editor (~31 MB) downloads the first time you edit a video, then it's cached.
(function () {
  'use strict';
  const CORE = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.10/dist/umd';
  let ffP = null, ff = null, logs = [], progressCb = null;

  async function blobURL(u, type) {
    const r = await fetch(u);
    if (!r.ok) throw new Error('could not download the video editor (' + r.status + ')');
    return URL.createObjectURL(new Blob([await r.blob()], { type }));
  }
  function loadScript(src) {
    return new Promise((ok, bad) => { if (window.FFmpegWASM) return ok(); const s = document.createElement('script'); s.src = src; s.onload = ok; s.onerror = () => bad(new Error('could not load the video editor')); document.head.appendChild(s); });
  }
  async function getFF(onStatus) {
    if (ff) return ff;
    if (!ffP) ffP = (async () => {
      onStatus && onStatus('Getting the video editor ready (first time only, about 31 MB)…');
      await loadScript('ffmpeg/ffmpeg.js');
      const f = new window.FFmpegWASM.FFmpeg();
      f.on('log', e => { logs.push(e.message); if (logs.length > 400) logs.splice(0, 200); });
      f.on('progress', e => { try { progressCb && progressCb(e); } catch (_) { } });
      await f.load({ coreURL: await blobURL(CORE + '/ffmpeg-core.js', 'text/javascript'), wasmURL: await blobURL(CORE + '/ffmpeg-core.wasm', 'application/wasm') });
      ff = f; return f;
    })().catch(e => { ffP = null; throw e; });
    return ffP;
  }

  // ---------- understanding what you want ----------
  const T = '(\\d+(?::\\d{1,2}){0,2}(?:\\.\\d+)?)\\s*(?:s|sec|secs|seconds?|m|min|mins|minutes?)?';
  function secs(str) {
    if (str == null) return null;
    const s = String(str).trim().toLowerCase();
    const m = s.match(/^(\d+(?::\d{1,2}){0,2}(?:\.\d+)?)\s*(s|sec|secs|seconds?|m|min|mins|minutes?)?$/);
    if (!m) return null;
    if (m[1].includes(':')) return m[1].split(':').reduce((a, b) => a * 60 + parseFloat(b), 0);
    const n = parseFloat(m[1]);
    return /^m/.test(m[2] || '') ? n * 60 : n;
  }
  const WORDS = /\b(zoom|blur|subtitles?|captions?|transcribe|transcript|(?:he|she|they|people) (?:say|says|said|saying)|keep|only from|from \d|between \d|put|wide|trim|cut|clip|shorten|shorter|crop|speed|faster|slow|slo-?mo|mute|sound|audio|volume|louder|quieter|vertical|9:16|tiktok|reels?|shorts|square|1:1|16:9|horizontal|landscape|youtube|caption|captions|text|title|subtitle|gif|compress|smaller|shrink|mp3|merge|combine|join|stitch|reverse|backwards?|rotate|flip|mirror|black and white|b&w|grayscale|greyscale|fade|brighter|brighten|pop|edit|first \d|last \d|seconds?|slideshow|montage|music video|make (a|me a)? ?video)\b/i;

  function wantsEdit(text, files) {
    const vids = files.filter(f => f.kind === 'video'), imgs = files.filter(f => f.kind === 'image');
    const t = String(text || '');
    if (vids.length) {
      if (/^\s*(what|who|where|why|how many|describe|is there|are there|can you see|tell me (about|what))\b/i.test(t) && !/\b(trim|cut|edit|make|turn|convert|add|speed|slow|mute|merge|say|says|said|saying|transcribe)\b/i.test(t)) return false;
      return WORDS.test(t) || vids.length > 1;
    }
    return imgs.length >= 2 && /\b(video|slideshow|montage|reel|tiktok|short|clip|movie)\b/i.test(t);
  }

  // offline: read the request with simple rules (online, the cloud brain makes the plan instead)
  function planFromText(text, nVids, nImgs) {
    const t = ' ' + String(text || '').toLowerCase().replace(/[’']/g, "'") + ' ';
    const p = { ops: [] };
    let m;
    if ((m = t.match(new RegExp('(?:keep|only|just)?\\s*(?:the\\s+)?first\\s+' + T)))) { if (!/\b(cut|remove|delete|drop|skip|get rid of)\s+(off\s+|out\s+)?(the\s+)?first/.test(t)) p.ops.push({ op: 'trim', start: 0, end: secs(m[1]) }); }
    if ((m = t.match(new RegExp('(?:cut|remove|delete|drop|skip|get rid of)\\s+(?:off\\s+|out\\s+)?(?:the\\s+)?first\\s+' + T)))) p.ops.push({ op: 'trim', start: secs(m[1]) });
    if ((m = t.match(new RegExp('(?:cut|remove|delete|drop|get rid of)\\s+(?:off\\s+|out\\s+)?(?:the\\s+)?last\\s+' + T)))) p.ops.push({ op: 'trimEnd', cut: secs(m[1]) });
    else if ((m = t.match(new RegExp('(?:keep|only|just)?\\s*(?:the\\s+)?last\\s+' + T)))) p.ops.push({ op: 'keepLast', len: secs(m[1]) });
    if ((m = t.match(new RegExp('(?:cut|remove|delete|drop|get rid of)\\s+(?:out\\s+)?(?:the\\s+part\\s+)?(?:from\\s+)?' + T + '\\s*(?:to|-|until|and)\\s*' + T)))) p.ops.push({ op: 'cut', start: secs(m[1]), end: secs(m[2]) });
    else if ((m = t.match(new RegExp('(?:from|between)\\s+' + T + '\\s*(?:to|-|until|and)\\s*' + T)))) p.ops.push({ op: 'trim', start: secs(m[1]), end: secs(m[2]) });
    if ((m = t.match(/(?<!zoom(?:ed)?(?: it)? in )(?<!zoom )(?<![\d.])\b(\d+(?:\.\d+)?)\s*x\b/)) && !/\b\d+\s*x\s*\d+/.test(t)) p.ops.push({ op: 'speed', x: parseFloat(m[1]) });
    else if (/\b(slow[\s-]?mo|slow motion|slow (it )?down|slower|half speed)\b/.test(t)) p.ops.push({ op: 'speed', x: 0.5 });
    else if (/\b(speed (it )?up|faster|double speed|timelapse|time-lapse)\b/.test(t)) p.ops.push({ op: 'speed', x: /double/.test(t) ? 2 : 1.5 });
    if (/\b(mute|no sound|no audio|remove (the )?(sound|audio)|without (sound|audio)|silent)\b/.test(t)) p.ops.push({ op: 'mute' });
    else if (/\b(louder|turn (it|the (sound|volume)) up|boost (the )?(sound|audio|volume))\b/.test(t)) p.ops.push({ op: 'volume', x: 2 });
    else if (/\b(quieter|softer|turn (it|the (sound|volume)) down|lower (the )?volume)\b/.test(t)) p.ops.push({ op: 'volume', x: 0.5 });
    const fitBlur = /\b(blur(red)?( the)? background|blurry background|don'?t crop|no crop|without cropping|keep (the )?(whole|full|entire) (video|thing|screen)|fit (it|the whole)|whole video|full video|letterbox)\b/.test(t);
    if (/\b(vertical|9:16|9x16|portrait|tiktok|reels?|shorts|stories)\b/.test(t)) p.ops.push({ op: 'frame', shape: 'vertical', fit: fitBlur ? 'blur' : 'crop' });
    else if (/\b(square|1:1|instagram post)\b/.test(t)) p.ops.push({ op: 'frame', shape: 'square', fit: fitBlur ? 'blur' : 'crop' });
    else if (/\b(horizontal|landscape|16:9|wide|widescreen|youtube video)\b/.test(t)) p.ops.push({ op: 'frame', shape: 'wide' });
    if ((m = t.match(/\bzoom(?:ed)?(?: it)? in(?: (\d(?:\.\d+)?)\s*x)?\b/))) p.ops.push({ op: 'zoom', x: m[1] ? parseFloat(m[1]) : 1.4 });
    if (/\b(black and white|b&w|grayscale|greyscale|black & white)\b/.test(t)) p.ops.push({ op: 'bw' });
    if (/\b(brighter|brighten|make (it|the colou?rs?) pop|more colou?r|vibrant|enhance)\b/.test(t)) p.ops.push({ op: 'pop' });
    if (/\b(reverse|backwards?|rewind)\b/.test(t)) p.ops.push({ op: 'reverse' });
    if ((m = t.match(/\brotate\b[^.]*?\b(left|right|90|180|270|upside down|counter)/))) p.ops.push({ op: 'rotate', deg: /180|upside/.test(m[1]) ? 180 : /left|270|counter/.test(m[1]) ? 270 : 90 });
    else if (/\brotate\b/.test(t)) p.ops.push({ op: 'rotate', deg: 90 });
    if (/\b(flip|mirror)\b/.test(t)) p.ops.push({ op: 'flip' });
    if (/\bfade\b/.test(t)) p.ops.push({ op: 'fade' });
    // text on the video: quoted words, or "that says ..."
    if ((m = String(text).match(/["“”]([^"“”]{1,80})["“”]/)) || (m = String(text).match(/\b(?:says?|saying|caption|text|title)\s*[:\-]?\s+(?:that says\s+)?([^.!?\n]{2,60})/i))) {
      if (/\b(text|caption|title|words?|says?|saying|write|put)\b/i.test(text) && (/["“”]/.test(text) || /\b(that says|which says|saying|says:)\b/i.test(text)) && !/\bcaption (what|everything)\b/i.test(text)) p.ops.push({ op: 'text', text: m[1].trim(), pos: /\btop\b/.test(t) ? 'top' : /\b(middle|center|centre)\b/.test(t) ? 'center' : 'bottom' });
    }
    // auto captions from what's said in the video (speech to text, on the phone)
    if (/\b(auto[\s-]?captions?|subtitles?|subtitle it|captions? (it|this|the video)|add captions|put captions|closed captions|captions to|captions on|caption what (they|he|she|i) (say|said)|what (they|he|she|i) (say|said))\b/.test(t) && !p.ops.some(o => o.op === 'text')) p.ops.push({ op: 'captions', style: /\b(subtitles?|normal|small|simple|plain|classic)\b/.test(t) && !/\b(tiktok|reels?|shorts|big|bold)\b/.test(t) ? 'classic' : 'tiktok' });
    if (/\b(transcribe|transcript|write down what|what (do|does|did) (they|he|she|i) say)\b/.test(t) && !/\bcaptions?|subtitles?\b/.test(t)) p.transcript = true;
    if (/\bgif\b/.test(t)) p.output = 'gif';
    else if (/\b(mp3|audio only|just the (audio|sound)|extract (the )?(audio|sound|music)|get the (audio|sound|music))\b/.test(t)) p.output = 'mp3';
    if (/\b(compress|smaller|shrink|reduce (the )?size|make (it )?lighter)\b/.test(t)) p.compress = true;
    if (nVids > 1) p.merge = true;
    if (nImgs >= 2 && !nVids) { p.slideshow = true; if ((m = t.match(/(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds?)\s*(?:each|per|a)\b/))) p.perImage = parseFloat(m[1]); }
    return p;
  }

  // the plan the cloud brain writes must look like this (we check it, and fix anything strange)
  const PLAN_HELP = `Turn the user's video-edit request into JSON only (no other words). Schema:
{"ops":[ ... ], "output":"mp4"|"gif"|"mp3", "compress":true|false, "merge":true|false, "slideshow":true|false, "perImage":seconds, "transcript":true|false}
("transcript": true when the user only wants the words that are said, written out, not a video.)
Each op is one of:
{"op":"trim","start":sec,"end":sec}   keep only start..end (either may be missing)
{"op":"trimEnd","cut":sec}            remove the last N seconds
{"op":"keepLast","len":sec}           keep only the last N seconds
{"op":"cut","start":sec,"end":sec}    remove the part between start and end
{"op":"speed","x":0.25-4}             2 = twice as fast, 0.5 = slow motion
{"op":"mute"}  {"op":"volume","x":0.1-4}
{"op":"frame","shape":"vertical"|"square"|"wide","fit":"crop"|"blur"}   vertical = 9:16 for TikTok/Reels/Shorts; fit "blur" keeps the whole video with a blurred background (when they say don't crop / blur background)
{"op":"zoom","x":1.1-4}   zoom in on the middle
{"op":"text","text":"...","pos":"top"|"center"|"bottom","start":sec,"end":sec}
{"op":"captions","style":"tiktok"|"classic"}   automatic captions/subtitles of what is said in the video
{"op":"bw"} {"op":"pop"} {"op":"reverse"} {"op":"flip"} {"op":"rotate","deg":90|180|270} {"op":"fade"}
Times are in seconds from the start of the ORIGINAL video. Use only what the user asked for.`;

  function cleanPlan(p, info) {
    const D = info && info.duration || 0;
    const num = (v, lo, hi) => { const n = typeof v === 'number' ? v : secs(v); return n == null || isNaN(n) ? null : Math.min(hi, Math.max(lo, n)); };
    const out = { ops: [], transcript: !!(p && p.transcript), output: ['gif', 'mp3'].includes(p && p.output) ? p.output : 'mp4', compress: !!(p && p.compress), merge: !!(p && p.merge), slideshow: !!(p && p.slideshow), perImage: num(p && p.perImage, 0.5, 20) || 2.5 };
    for (const o of (p && Array.isArray(p.ops) ? p.ops : []).slice(0, 12)) {
      if (!o || typeof o !== 'object') continue;
      switch (o.op) {
        case 'trim': { const s = num(o.start, 0, 36000) || 0, e = num(o.end, 0, 36000); if (e != null && e <= s) break; out.ops.push({ op: 'trim', start: s, end: e }); break; }
        case 'trimEnd': { const c = num(o.cut, 0, 36000); if (c) out.ops.push({ op: 'trimEnd', cut: c }); break; }
        case 'keepLast': { const l = num(o.len, 0.2, 36000); if (l) out.ops.push({ op: 'keepLast', len: l }); break; }
        case 'cut': { const s = num(o.start, 0, 36000), e = num(o.end, 0, 36000); if (s != null && e != null && e > s) out.ops.push({ op: 'cut', start: s, end: e }); break; }
        case 'speed': { const x = num(o.x, 0.25, 4); if (x && x !== 1) out.ops.push({ op: 'speed', x }); break; }
        case 'volume': { const x = num(o.x, 0.05, 4); if (x) out.ops.push({ op: 'volume', x }); break; }
        case 'frame': if (['vertical', 'square', 'wide'].includes(o.shape)) out.ops.push({ op: 'frame', shape: o.shape, fit: o.fit === 'blur' ? 'blur' : 'crop' }); break;
        case 'zoom': { const x = num(o.x, 1.05, 4); if (x) out.ops.push({ op: 'zoom', x }); break; }
        case 'text': { const tx = String(o.text || '').replace(/\s+/g, ' ').trim().slice(0, 90); if (tx) out.ops.push({ op: 'text', text: tx, pos: ['top', 'center', 'bottom'].includes(o.pos) ? o.pos : 'bottom', start: num(o.start, 0, 36000), end: num(o.end, 0, 36000) }); break; }
        case 'rotate': out.ops.push({ op: 'rotate', deg: [90, 180, 270].includes(+o.deg) ? +o.deg : 90 }); break;
        case 'captions': if (!out.ops.some(x => x.op === 'captions')) out.ops.push({ op: 'captions', style: o.style === 'classic' ? 'classic' : 'tiktok' }); break;
        case 'mute': case 'bw': case 'pop': case 'reverse': case 'flip': case 'fade': if (!out.ops.some(x => x.op === o.op)) out.ops.push({ op: o.op }); break;
      }
    }
    if (D) for (const o of out.ops) { if (o.op === 'trim' && o.start >= D) o.start = 0; if (o.op === 'trim' && o.end != null && o.end > D) o.end = null; }
    return out;
  }

  // ---------- doing it ----------
  async function probe(f, name) {
    logs = [];
    try { await f.exec(['-hide_banner', '-i', name]); } catch (e) { }
    const L = logs.join('\n');
    const d = L.match(/Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/);
    const v = L.match(/Video:.*?(\d{2,5})x(\d{2,5})/);
    const rot = L.match(/rotate\s*:\s*(-?\d+)|displaymatrix: rotation of (-?\d+(?:\.\d+)?)/);
    let w = v ? +v[1] : 0, h = v ? +v[2] : 0;
    const r = rot ? Math.abs(Math.round(parseFloat(rot[1] || rot[2]))) % 180 : 0;
    if (r === 90) [w, h] = [h, w]; // phone videos shot upright
    return { duration: d ? (+d[1]) * 3600 + (+d[2]) * 60 + parseFloat(d[3]) : 0, width: w, height: h, audio: /Audio:/.test(L) };
  }
  const even = n => Math.max(2, Math.round(n / 2) * 2);

  // ---------- captions: what's said in the video becomes words on screen (speech-to-text runs on the phone) ----------
  const ASR_MODEL = 'onnx-community/whisper-base_timestamped';
  let asrP = null;
  function getASR(onStatus) {
    if (!asrP) asrP = (async () => {
      onStatus && onStatus('Getting the captions brain ready (first time only, about 80 MB)…');
      const T = await import('https://cdn.jsdelivr.net/npm/@huggingface/transformers@4.3.2');
      return await T.pipeline('automatic-speech-recognition', ASR_MODEL, { dtype: 'q8', device: 'wasm' });
    })().catch(e => { asrP = null; throw e; });
    return asrP;
  }
  async function transcribe(f, name, onStatus) {
    onStatus && onStatus('Listening to the video…');
    try { await f.deleteFile('audio.raw'); } catch (e) { }
    if (await f.exec(['-hide_banner', '-y', '-i', name, '-vn', '-ac', '1', '-ar', '16000', '-f', 'f32le', 'audio.raw']) !== 0) throw new Error('this video has no sound to caption');
    const raw = await f.readFile('audio.raw'); try { await f.deleteFile('audio.raw'); } catch (e) { }
    const audio = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
    if (audio.length < 16000 * 0.3) throw new Error('this video has no sound to caption');
    if (audio.length > 16000 * 300) throw new Error('captions work on clips up to 5 minutes on a phone. Trim it first, like "keep the first 60 seconds and add captions"');
    const asr = await getASR(onStatus);
    onStatus && onStatus(`Writing down what's said (${Math.round(audio.length / 16000)}s of audio)…`);
    const r = await asr(audio, { return_timestamps: 'word', chunk_length_s: 30, stride_length_s: 5 });
    const words = (r.chunks || []).map(w => ({ t: String(w.text || '').trim(), s: w.timestamp[0] || 0, e: w.timestamp[1] != null ? w.timestamp[1] : (w.timestamp[0] || 0) + 0.4 })).filter(w => w.t && !/^\[.*\]$/.test(w.t));
    return { text: String(r.text || '').trim(), words };
  }
  // group words into short caption lines: TikTok style = 1-3 punchy words, classic = a subtitle line
  function groupWords(words, style) {
    const maxW = style === 'tiktok' ? 3 : 7, maxT = style === 'tiktok' ? 1.4 : 3, maxC = style === 'tiktok' ? 18 : 42, out = [];
    let cur = null;
    for (const w of words) {
      if (!cur) { cur = { s: w.s, e: w.e, t: w.t, n: 1 }; }
      else if (cur.n >= maxW || w.e - cur.s > maxT || (cur.t + ' ' + w.t).length > maxC || /[.!?]$/.test(cur.t)) { out.push(cur); cur = { s: w.s, e: w.e, t: w.t, n: 1 }; }
      else { cur.t += ' ' + w.t; cur.e = w.e; cur.n++; }
    }
    if (cur) out.push(cur);
    for (let i = 0; i < out.length; i++) { const nx = out[i + 1]; if (nx && nx.s - out[i].e < 0.35) out[i].e = nx.s; else out[i].e = Math.max(out[i].e, out[i].s + 0.5); } // no flicker between close lines
    return out;
  }
  async function burnCaptions(f, inName, outName, groups, info, style, onStatus) {
    onStatus && onStatus(`Adding ${groups.length} captions…`);
    const W = info.width, H = info.height, made = [];
    await f.writeFile('cap_blank.png', await textPNG('', W, H)); made.push('cap_blank.png');
    const lines = ['ffconcat version 1.0'];
    let t = 0;
    for (let i = 0; i < groups.length; i++) {
      const g = groups[i];
      if (g.s > t + 0.01) { lines.push('file cap_blank.png', 'duration ' + (g.s - t).toFixed(3)); }
      const n = `cap${i}.png`; made.push(n);
      await f.writeFile(n, await textPNG(g.t, W, H, style === 'tiktok' ? 'lower' : 'bottom', style));
      lines.push('file ' + n, 'duration ' + Math.max(0.05, g.e - Math.max(t, g.s)).toFixed(3));
      t = Math.max(t, g.e);
    }
    lines.push('file cap_blank.png', 'duration ' + Math.max(0.5, (info.duration || t) - t + 0.5).toFixed(3), 'file cap_blank.png');
    await f.writeFile('caps.txt', new TextEncoder().encode(lines.join('\n'))); made.push('caps.txt');
    const args = ['-hide_banner', '-y', '-i', inName, '-f', 'concat', '-safe', '0', '-i', 'caps.txt', '-filter_complex', '[1:v]format=rgba,setpts=PTS-STARTPTS[c];[0:v][c]overlay=0:0:eof_action=pass:shortest=0[v]', '-map', '[v]', '-map', '0:a?', '-c:a', 'copy', '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-t', String(info.duration || t + 1), outName];
    const code = await f.exec(args);
    for (const n of made) { try { await f.deleteFile(n); } catch (e) { } }
    if (code !== 0) throw new Error(lastError());
  }

  // the time window that is kept, from trim ops
  function windowOf(plan, D) {
    let s = 0, e = D || 0;
    for (const o of plan.ops) {
      if (o.op === 'trim') { s = Math.max(s, o.start || 0); if (o.end != null) e = Math.min(e || o.end, o.end); }
      if (o.op === 'trimEnd' && D) e = Math.min(e, D - o.cut);
      if (o.op === 'keepLast' && D) s = Math.max(s, D - o.len);
    }
    if (e && e <= s) throw new Error(`that would leave nothing (the video is ${Math.round(D)} seconds long)`);
    return { s, e: e || null };
  }

  function textPNG(text, W, H, pos, style) {
    const c = document.createElement('canvas'); c.width = W; c.height = H;
    const g = c.getContext('2d');
    if (!text) return new Promise(ok => c.toBlob(b => b.arrayBuffer().then(a => ok(new Uint8Array(a))), 'image/png')); // empty (see-through) picture
    if (style === 'tiktok') text = text.toUpperCase();
    let size = Math.round(Math.min(W, H) * (style === 'tiktok' ? 0.095 : style === 'classic' ? 0.055 : 0.075));
    g.font = `800 ${size}px -apple-system, system-ui, Helvetica, Arial, sans-serif`;
    // wrap into lines that fit
    const words = text.split(' '), lines = [];
    let line = '';
    for (const w of words) { const tryL = line ? line + ' ' + w : w; if (g.measureText(tryL).width > W * 0.86 && line) { lines.push(line); line = w; } else line = tryL; }
    if (line) lines.push(line);
    const lh = size * 1.18, block = lines.length * lh;
    const y0 = pos === 'top' ? H * 0.1 : pos === 'center' ? (H - block) / 2 : pos === 'lower' ? H * 0.66 - block / 2 : H * 0.84 - block;
    if (style === 'classic') { // subtitle box
      let wmax = 0; lines.forEach(l => { wmax = Math.max(wmax, g.measureText(l).width); });
      g.fillStyle = 'rgba(0,0,0,0.6)'; const pad = size * 0.35; g.fillRect((W - wmax) / 2 - pad, y0 - pad * 0.6, wmax + pad * 2, block + pad * 1.2);
    }
    g.textAlign = 'center'; g.textBaseline = 'top'; g.lineJoin = 'round';
    lines.forEach((l, i) => {
      const y = y0 + i * lh;
      if (style !== 'classic') { g.lineWidth = Math.max(4, size * (style === 'tiktok' ? 0.2 : 0.16)); g.strokeStyle = 'rgba(0,0,0,0.9)'; g.strokeText(l, W / 2, y); }
      g.fillStyle = style === 'tiktok' && i === 0 && lines.length === 1 ? '#fff' : '#fff'; g.fillText(l, W / 2, y);
    });
    return new Promise(ok => c.toBlob(b => b.arrayBuffer().then(a => ok(new Uint8Array(a))), 'image/png'));
  }

  function atempo(x) { const out = []; while (x > 2) { out.push('atempo=2'); x /= 2; } while (x < 0.5) { out.push('atempo=0.5'); x /= 0.5; } out.push('atempo=' + x.toFixed(4)); return out; }

  // make one finished clip from one input video
  async function editOne(f, name, info, plan, outName, opt = {}) {
    const has = op => plan.ops.find(o => o.op === op);
    const { s, e } = windowOf(plan, info.duration);
    const speed = (has('speed') || {}).x || 1;
    const vf = [], af = [];
    // remove a middle part (times from the original video)
    const cuts = plan.ops.filter(o => o.op === 'cut');
    if (cuts.length) {
      const expr = cuts.map(c => `between(t,${(c.start - s).toFixed(3)},${(c.end - s).toFixed(3)})`).join('+');
      vf.push(`select='not(${expr})'`, 'setpts=N/FRAME_RATE/TB');
      if (info.audio) af.push(`aselect='not(${expr})'`, 'asetpts=N/SR/TB');
    }
    // size and shape
    let W = info.width || 1280, H = info.height || 720;
    const rot = has('rotate');
    if (rot) { if (rot.deg === 90) vf.push('transpose=1'); else if (rot.deg === 270) vf.push('transpose=2'); else vf.push('transpose=1,transpose=1'); if (rot.deg !== 180) [W, H] = [H, W]; }
    if (has('flip')) vf.push('hflip');
    const zm = has('zoom'); if (zm) { vf.push(`crop=trunc(iw/${zm.x}/2)*2:trunc(ih/${zm.x}/2)*2`); W = Math.floor(W / zm.x / 2) * 2; H = Math.floor(H / zm.x / 2) * 2; }
    const fr = has('frame') || (opt.shape ? { shape: opt.shape } : null);
    const maxEdge = plan.output === 'gif' ? 480 : plan.compress ? 854 : 1280; // phones edit faster at 720p
    if (fr) {
      const ar = fr.shape === 'vertical' ? 9 / 16 : fr.shape === 'square' ? 1 : 16 / 9;
      if (fr.fit === 'blur' && !opt.pad) { // keep the whole video, fill the rest with a blurred copy (popular for gaming clips)
        const tw = ar >= 1 ? maxEdge : even(maxEdge * ar), th = ar >= 1 ? even(maxEdge / ar) : maxEdge;
        vf.push(`split[bga][fga];[bga]scale=${tw}:${th}:force_original_aspect_ratio=increase,crop=${tw}:${th},boxblur=20:2,eq=brightness=-0.08[bgb];[fga]scale=${tw}:${th}:force_original_aspect_ratio=decrease[fgb];[bgb][fgb]overlay=(W-w)/2:(H-h)/2`, 'setsar=1'); W = tw; H = th;
      } else if (opt.pad) { // merging: fit inside without cutting
        const tw = ar >= 1 ? maxEdge : even(maxEdge * ar), th = ar >= 1 ? even(maxEdge / ar) : maxEdge;
        vf.push(`scale=${tw}:${th}:force_original_aspect_ratio=decrease`, `pad=${tw}:${th}:(ow-iw)/2:(oh-ih)/2:color=black`, 'setsar=1'); W = tw; H = th;
      } else {
        let cw = W, ch = H;
        if (W / H > ar) cw = even(H * ar); else ch = even(W / ar);
        vf.push(`crop=${cw}:${ch}`); W = cw; H = ch;
      }
    }
    if (Math.max(W, H) > maxEdge) { const k = maxEdge / Math.max(W, H); W = even(W * k); H = even(H * k); }
    W = even(W); H = even(H);
    if (!(fr && (opt.pad || fr.fit === 'blur'))) vf.push(`scale=${W}:${H}`, 'setsar=1');
    if (has('bw')) vf.push('hue=s=0');
    if (has('pop')) vf.push('eq=brightness=0.04:contrast=1.08:saturation=1.3');
    if (speed !== 1) { vf.push(`setpts=PTS/${speed}`); if (info.audio) af.push(...atempo(speed)); }
    if (has('reverse') && ((e || info.duration || 0) - s) > 30) throw new Error('reversing is limited to 30 seconds on a phone (it uses a lot of memory). Trim it first, like "keep the first 20 seconds and reverse it"');
    if (has('reverse')) { vf.push('reverse'); if (info.audio) af.push('areverse'); }
    if (opt.fps) vf.push('fps=' + opt.fps);
    let outLen = ((e || info.duration || 0) - s - cuts.reduce((n, c) => n + Math.max(0, Math.min(c.end, e || 1e9) - Math.max(c.start, s)), 0)) / speed;
    if (has('fade') && outLen > 1.2) { vf.push(`fade=t=in:st=0:d=0.5`, `fade=t=out:st=${(outLen - 0.5).toFixed(2)}:d=0.5`); if (info.audio) af.push(`afade=t=in:st=0:d=0.5`, `afade=t=out:st=${(outLen - 0.5).toFixed(2)}:d=0.5`); }
    const vol = has('volume'); if (vol && info.audio) af.push('volume=' + vol.x);
    const mute = has('mute') || !info.audio;

    const args = ['-hide_banner', '-y'];
    if (s > 0) args.push('-ss', s.toFixed(3));
    if (e) args.push('-t', (e - s).toFixed(3));
    args.push('-i', name);
    const texts = plan.ops.filter(o => o.op === 'text');
    let graph = `[0:v]${vf.join(',') || 'null'}[v0]`, last = 'v0';
    for (let i = 0; i < texts.length; i++) {
      const png = `txt${i}.png`;
      await f.writeFile(png, await textPNG(texts[i].text, W, H, texts[i].pos));
      args.push('-i', png);
      const ts = texts[i].start != null ? Math.max(0, (texts[i].start - s) / speed) : null, te = texts[i].end != null ? (texts[i].end - s) / speed : null;
      const en = ts != null || te != null ? `:enable='between(t,${(ts || 0).toFixed(2)},${(te != null ? te : 1e6).toFixed(2)})'` : '';
      graph += `;[${last}][${i + 1}:v]overlay=0:0${en}[v${i + 1}]`; last = 'v' + (i + 1);
    }
    if (plan.output === 'gif') {
      graph += `;[${last}]fps=12,split[g1][g2];[g1]palettegen=max_colors=128[pal];[g2][pal]paletteuse=dither=bayer[vout]`;
      args.push('-filter_complex', graph, '-map', '[vout]', '-loop', '0', outName);
    } else if (plan.output === 'mp3') {
      if (!info.audio) throw new Error('this video has no sound to save as audio');
      const a = af.length ? ['-af', af.join(',')] : [];
      return ['-hide_banner', '-y', ...(s > 0 ? ['-ss', s.toFixed(3)] : []), ...(e ? ['-t', (e - s).toFixed(3)] : []), '-i', name, '-vn', ...a, '-c:a', 'libmp3lame', '-q:a', '4', outName];
    } else {
      args.push('-filter_complex', graph, '-map', `[${last}]`);
      if (!mute) { args.push('-map', '0:a:0?'); if (af.length) args.push('-af', af.join(',')); args.push('-c:a', 'aac', '-b:a', '128k'); }
      else args.push('-an');
      args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', plan.compress ? '30' : '24', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', outName);
    }
    return args;
  }

  // one clip, made ready for joining: same size, same frame rate, and always a sound track (silent if needed)
  function mergeClipArgs(name, info, plan, shape, out) {
    const has = op => plan.ops.find(o => o.op === op);
    const maxEdge = plan.compress ? 854 : 1280, ar = shape === 'vertical' ? 9 / 16 : shape === 'square' ? 1 : 16 / 9;
    const W = ar >= 1 ? maxEdge : even(maxEdge * ar), H = ar >= 1 ? even(maxEdge / ar) : maxEdge;
    const speed = (has('speed') || {}).x || 1, vf = [], af = [];
    const rot = has('rotate'); if (rot) vf.push(rot.deg === 90 ? 'transpose=1' : rot.deg === 270 ? 'transpose=2' : 'transpose=1,transpose=1');
    if (has('flip')) vf.push('hflip');
    vf.push(`scale=${W}:${H}:force_original_aspect_ratio=decrease`, `pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black`, 'setsar=1');
    if (has('bw')) vf.push('hue=s=0');
    if (has('pop')) vf.push('eq=brightness=0.04:contrast=1.08:saturation=1.3');
    if (speed !== 1) vf.push(`setpts=PTS/${speed}`);
    vf.push('fps=30', 'format=yuv420p');
    const silent = !info.audio || has('mute');
    if (!silent) { if (speed !== 1) af.push(...atempo(speed)); const vol = has('volume'); if (vol) af.push('volume=' + vol.x); }
    af.push('aresample=44100');
    const args = ['-hide_banner', '-y', '-i', name];
    if (silent) args.push('-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo');
    args.push('-filter_complex', `[0:v]${vf.join(',')}[v];[${silent ? 1 : 0}:a${silent ? '' : ':0'}]${af.join(',')}[a]`, '-map', '[v]', '-map', '[a]');
    if (silent) args.push('-t', String(Math.max(0.5, (info.duration || 1) / speed)));
    args.push('-c:v', 'libx264', '-preset', 'ultrafast', '-crf', plan.compress ? '30' : '24', '-c:a', 'aac', '-ac', '2', '-b:a', '128k', out);
    return args;
  }

  async function run(text, files, plan, onStatus, onProgress) {
    const f = await getFF(onStatus);
    progressCb = ({ progress }) => { if (progress > 0 && progress <= 1) onProgress && onProgress(progress); };
    const vids = files.filter(x => x.kind === 'video'), imgs = files.filter(x => x.kind === 'image');
    if (plan.transcript && vids.length && !plan.ops.length) { // just the words, no new video
      const name = 'in0.' + (extOf(vids[0]) || 'mp4');
      await f.writeFile(name, await toBytes(vids[0]));
      try { const tr = await transcribe(f, name, onStatus); return { transcript: tr.text, words: tr.words }; }
      finally { try { await f.deleteFile(name); } catch (e) { } }
    }
    const ext = plan.output === 'gif' ? 'gif' : plan.output === 'mp3' ? 'mp3' : 'mp4';
    const out = 'omega-edit.' + ext;
    const clean = async names => { for (const n of names) { try { await f.deleteFile(n); } catch (e) { } } };
    const made = [];
    try {
      if (!vids.length && imgs.length) { // photos -> video slideshow
        onStatus && onStatus(`Making a video from your ${imgs.length} photos…`);
        const shape = (plan.ops.find(o => o.op === 'frame') || {}).shape || 'vertical';
        const W = shape === 'wide' ? 1280 : 720, H = shape === 'wide' ? 720 : shape === 'square' ? 720 : 1280;
        const d = plan.perImage || 2.5, args = ['-hide_banner', '-y'];
        let g = '';
        for (let i = 0; i < imgs.length; i++) {
          const n = `img${i}.jpg`; made.push(n);
          await f.writeFile(n, await toBytes(imgs[i]));
          args.push('-loop', '1', '-t', String(d), '-i', n);
          g += `[${i}:v]scale=${W}:${H}:force_original_aspect_ratio=decrease,pad=${W}:${H}:(ow-iw)/2:(oh-ih)/2:color=black,setsar=1,fps=30,format=yuv420p,fade=t=in:st=0:d=0.3,fade=t=out:st=${(d - 0.3).toFixed(2)}:d=0.3[p${i}];`;
        }
        g += imgs.map((_, i) => `[p${i}]`).join('') + `concat=n=${imgs.length}:v=1:a=0[sv]`;
        let last = 'sv';
        const texts = plan.ops.filter(o => o.op === 'text');
        for (let i = 0; i < texts.length; i++) { const n = `txt${i}.png`; made.push(n); await f.writeFile(n, await textPNG(texts[i].text, W, H, texts[i].pos)); args.push('-i', n); g += `;[${last}][${imgs.length + i}:v]overlay=0:0[t${i}]`; last = 't' + i; }
        if (plan.output === 'gif') { g += `;[${last}]fps=12,scale=480:-2,split[g1][g2];[g1]palettegen=max_colors=128[pal];[g2][pal]paletteuse[vout]`; args.push('-filter_complex', g, '-map', '[vout]', '-loop', '0', out); }
        else args.push('-filter_complex', g, '-map', `[${last}]`, '-c:v', 'libx264', '-preset', 'ultrafast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
        if (await f.exec(args) !== 0) throw new Error(lastError());
      } else if (vids.length === 1 || !plan.merge) {
        const v = vids[0], name = 'in0.' + (extOf(v) || 'mp4'); made.push(name);
        onStatus && onStatus('Loading your video into the editor…');
        await f.writeFile(name, await toBytes(v));
        const info = await probe(f, name);
        if (!info.width) throw new Error("couldn't read that video (try a .mp4 or .mov)");
        onStatus && onStatus('Editing your video…');
        const args = await editOne(f, name, info, plan, out);
        if (await f.exec(args) !== 0) throw new Error(lastError());
      } else { // merge clips: make every clip the same size, then join them
        const shape = (plan.ops.find(o => o.op === 'frame') || {}).shape;
        const parts = [];
        let first = null;
        for (let i = 0; i < vids.length; i++) {
          const name = `in${i}.${extOf(vids[i]) || 'mp4'}`; made.push(name);
          onStatus && onStatus(`Getting clip ${i + 1} of ${vids.length} ready…`);
          await f.writeFile(name, await toBytes(vids[i]));
          const info = await probe(f, name);
          if (!first) first = info;
          const sh = shape || (first.height > first.width ? 'vertical' : first.width === first.height ? 'square' : 'wide');
          const pn = `part${i}.mp4`; parts.push(pn); made.push(pn);
          onStatus && onStatus(`Editing clip ${i + 1} of ${vids.length}…`);
          if (await f.exec(mergeClipArgs(name, info, plan, sh, pn)) !== 0) throw new Error(lastError());
        }
        await f.writeFile('list.txt', new TextEncoder().encode(parts.map(p => `file '${p}'`).join('\n'))); made.push('list.txt');
        onStatus && onStatus('Joining your clips…');
        const joined = plan.ops.some(o => ['trim', 'trimEnd', 'keepLast', 'cut', 'text', 'fade'].includes(o.op)) || plan.output !== 'mp4' ? 'joined.mp4' : out;
        if (await f.exec(['-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', 'list.txt', '-c', 'copy', '-movflags', '+faststart', joined]) !== 0) throw new Error(lastError());
        if (joined !== out) { made.push(joined); const info = await probe(f, joined); const rest = { ...plan, ops: plan.ops.filter(o => ['trim', 'trimEnd', 'keepLast', 'cut', 'text', 'fade'].includes(o.op)) }; if (await f.exec(await editOne(f, joined, info, rest, out)) !== 0) throw new Error(lastError()); }
      }
      // captions go on last, so their timing matches the finished (trimmed / sped-up) video
      const capOp = plan.ops.find(o => o.op === 'captions');
      let finalName = out, note = '';
      if (capOp && ext === 'mp4') {
        const info = await probe(f, out);
        let tr = null;
        try { tr = await transcribe(f, out, onStatus); } catch (e) { if (/no sound/.test(e.message)) note = "There's no sound in this video, so there was nothing to caption."; else throw e; }
        if (tr && tr.words.length) { await burnCaptions(f, out, 'captioned.mp4', groupWords(tr.words, capOp.style), info, capOp.style, onStatus); finalName = 'captioned.mp4'; made.push('captioned.mp4'); }
        else if (tr) note = "I couldn't hear any words to caption.";
      }
      const data = await f.readFile(finalName);
      if (!data || data.length < 200) throw new Error('the edit came out empty');
      const type = ext === 'gif' ? 'image/gif' : ext === 'mp3' ? 'audio/mpeg' : 'video/mp4';
      let dur = 0;
      if (ext !== 'gif') { try { dur = (await probe(f, finalName)).duration; } catch (e) { } }
      return { blob: new Blob([data.buffer], { type }), ext, type, duration: dur, note, captioned: finalName === 'captioned.mp4' };
    } finally { await clean([...made, out, 'txt0.png', 'txt1.png', 'txt2.png']); }
  }
  function lastError() {
    const l = logs.filter(x => /error|invalid|no such|not found|cannot|failed|unable/i.test(x)).slice(-2).join(' ');
    return 'the editor hit a problem' + (l ? ': ' + l.slice(0, 160) : '');
  }
  function extOf(f) { const m = String(f.name || '').match(/\.(\w{2,4})$/); return m ? m[1].toLowerCase() : (/quicktime/.test(f.type || '') ? 'mov' : /webm/.test(f.type || '') ? 'webm' : 'mp4'); }
  async function toBytes(file) {
    if (file.blob) return new Uint8Array(await file.blob.arrayBuffer());
    if (file.data instanceof ArrayBuffer) return new Uint8Array(file.data);
    if (ArrayBuffer.isView(file.data)) return new Uint8Array(file.data.buffer, file.data.byteOffset, file.data.byteLength);
    if (typeof file.data === 'string') { const r = await fetch(file.data); return new Uint8Array(await r.arrayBuffer()); }
    if (file.arrayBuffer) return new Uint8Array(await file.arrayBuffer());
    throw new Error('that file is no longer in memory, attach it again');
  }

  // a short sentence saying what was done
  function describe(plan, nV, nI) {
    const say = [];
    if (plan.slideshow || (!nV && nI)) say.push(`turned your ${nI} photos into a video`);
    if (plan.merge && nV > 1) say.push(`joined your ${nV} clips`);
    for (const o of plan.ops) {
      if (o.op === 'trim') say.push(o.end != null ? `kept ${fmt(o.start)} to ${fmt(o.end)}` : `cut the first ${fmt(o.start)}`);
      if (o.op === 'trimEnd') say.push(`cut the last ${fmt(o.cut)}`);
      if (o.op === 'keepLast') say.push(`kept the last ${fmt(o.len)}`);
      if (o.op === 'cut') say.push(`removed ${fmt(o.start)} to ${fmt(o.end)}`);
      if (o.op === 'speed') say.push(o.x > 1 ? `sped it up ${o.x}x` : `slowed it to ${o.x}x`);
      if (o.op === 'mute') say.push('removed the sound');
      if (o.op === 'volume') say.push(o.x > 1 ? 'made it louder' : 'made it quieter');
      if (o.op === 'frame') say.push((o.shape === 'vertical' ? 'made it vertical (9:16) for TikTok/Reels' : o.shape === 'square' ? 'made it square' : 'made it wide (16:9)') + (o.fit === 'blur' ? ' with a blurred background so nothing gets cut off' : ''));
      if (o.op === 'zoom') say.push(`zoomed in ${o.x}x`);
      if (o.op === 'text') say.push(`added the text "${o.text}"`);
      if (o.op === 'bw') say.push('made it black and white');
      if (o.op === 'pop') say.push('made the colors pop');
      if (o.op === 'reverse') say.push('reversed it');
      if (o.op === 'flip') say.push('mirrored it');
      if (o.op === 'rotate') say.push(`rotated it ${o.deg === 270 ? 'left' : o.deg === 180 ? 'upside down' : 'right'}`);
      if (o.op === 'fade') say.push('added a fade in and out');
      if (o.op === 'captions') say.push(o.style === 'tiktok' ? 'added TikTok-style captions of what is said' : 'added subtitles of what is said');
    }
    if (plan.output === 'gif') say.push('made it a GIF'); if (plan.output === 'mp3') say.push('saved just the audio as an MP3');
    if (plan.compress) say.push('made the file smaller');
    return say;
  }
  function fmt(s) { s = Math.round(s * 10) / 10; return s >= 60 ? `${Math.floor(s / 60)}:${String(Math.round(s % 60)).padStart(2, '0')}` : `${s}s`; }

  // free the editor's memory (phones): it restarts in a second or two next time, from the saved copy
  async function release() {
    try { if (ff) ff.terminate(); } catch (e) { }
    ff = null; ffP = null;
    try { if (asrP) { const a = await asrP; a && a.dispose && await a.dispose(); } } catch (e) { }
    asrP = null;
  }
  window.OMEGA_VIDEO = { wantsEdit, planFromText, cleanPlan, run, describe, release, PLAN_HELP, secs, _ff: () => ff };
})();
