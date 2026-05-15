# Wi-Fi / Organization Network AI Fix

Your AI Worker is working, but some Wi-Fi networks block the `workers.dev` hostname or interfere with QUIC/HTTP3 traffic. The safest fix is to call the Worker through your own domain path instead of directly calling `workers.dev`.

## 1. Add a Worker route

Cloudflare Dashboard:

```text
Workers & Pages
→ zuriel-ai-resume-assistant
→ Settings
→ Domains & Routes
→ Add
→ Route
```

Use:

```text
Zone: zurielst.com
Route pattern: zurielst.com/ai/*
Worker: zuriel-ai-resume-assistant
```

If you use `www.zurielst.com`, add:

```text
Route pattern: www.zurielst.com/ai/*
```

## 2. Make sure the website uses the same-origin endpoint

In `index.html`, the body tag should contain:

```html
<body data-ai-endpoint="/ai/chat">
```

In `script.js`, the default endpoint should be:

```js
const DEFAULT_AI_ENDPOINT = '/ai/chat';
```

## 3. Test

Open:

```text
https://zurielst.com/ai/health
```

Then open:

```text
https://zurielst.com/ai/chat?message=Summarize%20Zuriel%20for%20a%20cybersecurity%20consulting%20role
```

If both return JSON, refresh the portfolio and test the Ask AI button.

## 4. Cache cleanup

After changing the route or uploading website files:

```text
Cloudflare Dashboard
→ zurielst.com
→ Caching
→ Purge Everything
```

Then hard refresh the browser.
