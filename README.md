# OMEGA

Your own AI that runs **on your phone**, in the browser. No server, no account, no monthly bill.

## What it can do
- **Chat** like a friend, on your device and offline after the first download.
- **Picks the best brain for your device** automatically (iPhone, iPad, Android, computer), and uses every processor core (multi-core mode).
- **Brains** (open-source, download once):
  - Processor brains via [wllama](https://github.com/ngxson/wllama) (llama.cpp in WebAssembly): **LFM2.5 1.2B** (default on phones), Qwen3 0.6B, Qwen3.5 0.8B, LFM3 1.7B, Qwen3 1.7B, Qwen3 4B, Llama 3.2 1B.
  - Fast mode on a computer's graphics chip via [WebLLM](https://github.com/mlc-ai/web-llm): Qwen3 1.7B/4B, Llama 3.2 3B, Qwen2.5 Coder 3B.
  - **Free cloud brain, on by default**: when online, answers come from a big free model through [Pollinations](https://pollinations.ai) (no key, no signup). Offline or when it's busy, the phone brain answers. Optional: your own free Pollinations or [OpenRouter](https://openrouter.ai) key (kept on your device) for faster answers and cloud eyes.
  - **Deep research**: start a message with "research ..." and OMEGA runs several web searches, reads the top pages and writes a report with sources.
  - **Auto memory**: facts you share about yourself ("I run a construction business in LA") are saved automatically ("🧠 Memory updated"). See or delete them in Settings.
  - **Never freezes in long chats**: a watchdog restarts a stuck brain and answers again; the chat window keeps a stable start so the brain can reuse what it already read.
- **Eyes:** looks at photos and videos with a small vision brain (LFM2-VL) running on your device.
- **Files:** attach PDFs and text files and ask about them. Limits keep the phone safe: 3 files per message, photos up to 25 MB, one video up to 200 MB / 10 minutes, PDFs up to 30 MB / 60 pages.
- **Live info:** time and weather for any city (Open-Meteo, wttr.in backup), news (Bing News, NYT), web search (DuckDuckGo via Jina Reader, Wikipedia), crypto (CoinGecko, Coinbase backup), currency (Frankfurter, ExchangeRate-API). All free, no keys.
- **Exact answers** for math, unit conversions, and the time (no guessing).
- **Pictures:** "draw a…" makes an image with the free Pollinations service.
- **Code:** writes apps and games you can play right away (built-in games: Flappy Bird, Snake, Pong, Breakout, Tic-Tac-Toe), runs JavaScript and Python in a locked sandbox.
- **Think mode, redo, edit, read aloud, chat search, export, light/dark themes.**
- **Memory and learning:** profile, facts ("remember that…"), lessons from 👎 feedback, and exportable training data. Stored only on your device.

## Use it
Open the site in **Safari on iOS 26+** (or Chrome/Edge on a computer), tap **Download OMEGA's brain**, then chat. Tap Share → **Add to Home Screen** to use it like an app and keep the brain saved.

## Files
`index.html` page · `style.css` look · `app.js` everything else · `games.js` built-in games · `play.html` shareable game links · `worker.js` fast-mode brain worker · `sw.js` offline support and multi-core mode · `evals/quiz.json` fixed test questions for comparing brains.
