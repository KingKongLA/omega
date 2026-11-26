# OMEGA

Your own AI that runs **on your phone**, in the browser. No server, no account, no company in the middle.

- **Brain:** open-source models that download once and run on your device, offline.
  - **Processor brains** (default, iPhone-safe) via [wllama](https://github.com/ngxson/wllama) (llama.cpp in WebAssembly): Qwen3 0.6B, Llama 3.2 1B, Qwen2.5 0.5B.
  - **Fast mode** (computers) via [WebLLM](https://github.com/mlc-ai/web-llm) on the graphics chip: Qwen3 1.7B/4B, Llama 3.2 3B, Qwen2.5 Coder 3B.
  - If a brain crashes or the graphics chip is unavailable, OMEGA switches to a lighter brain automatically.
- **Live info:** time and weather for any city (Open-Meteo), news (Bing News, NYT), web (DuckDuckGo via Jina Reader, Wikipedia), crypto (CoinGecko), currency (Frankfurter). All free, no keys.
- **Memory:** profile, facts ("remember that…"), and lessons from 👎 feedback. Stored only on your device.
- **Learning:** export liked answers and corrections as training data for fine-tuning.
- **Code:** writes code; runs JavaScript, Python (Pyodide) and previews HTML.

## Use it
Open the site in **Safari on iOS 26+** (or Chrome/Edge on a computer), tap **Download OMEGA's brain**, wait for the one-time download, then chat. Tap Share → **Add to Home Screen** to use it like an app.

## Files
`index.html` page · `style.css` look · `app.js` everything else · `worker.js` runs the model in the background · `sw.js` offline support.
