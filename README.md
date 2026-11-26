# OMEGA

Your own AI that runs **on your phone**, in the browser. No server, no account, no company in the middle.

- **Brain:** open-source models (Qwen3, Llama 3.2, Qwen2.5 Coder) running on your device's graphics chip through [WebLLM](https://github.com/mlc-ai/web-llm). Downloads once, then works offline.
- **Live info:** weather (Open-Meteo), news (Google News, NYT), web (DuckDuckGo, Wikipedia, Jina Reader), crypto (CoinGecko), currency (Frankfurter). All free, no keys.
- **Memory:** profile, facts ("remember that…"), and lessons from 👎 feedback. Stored only on your device.
- **Learning:** export liked answers and corrections as training data for fine-tuning.
- **Code:** writes code; runs JavaScript, Python (Pyodide) and previews HTML.

## Use it
Open the site in **Safari on iOS 26+** (or Chrome/Edge on a computer), tap **Download OMEGA's brain**, wait for the one-time download, then chat. Tap Share → **Add to Home Screen** to use it like an app.

## Files
`index.html` page · `style.css` look · `app.js` everything else · `worker.js` runs the model in the background · `sw.js` offline support.
