# Zuriel Shanley Tanyory, Cybersecurity Portfolio

A fully static, GitHub Pages-ready cybersecurity portfolio with an optional Cloudflare Workers AI Resume Assistant.

## Important AI setup change in v35

This version makes the website call the AI assistant at a same-origin path:

```text
/chat
```

That avoids your current browser Content Security Policy issue because your CSP allows `connect-src 'self'`, but blocks calls to `workers.dev`.

## Files

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
├── _headers
├── assets/
│   ├── icons/favicon.svg
│   ├── images/hero-cyber-device.svg
│   ├── images/og-card.svg
│   └── resume/Zuriel-Shanley-Tanyory-Resume.pdf
└── worker/
    ├── README.md
    ├── wrangler.toml
    └── src/index.js
```

## Deploy the static portfolio

Upload these files to the root of your GitHub Pages repository or static hosting root:

```text
index.html
styles.css
script.js
_headers
assets/
```

`script.js` must be beside `index.html`.

## Required Cloudflare route

Because the website now calls `/chat`, add a Worker route in Cloudflare:

```text
Route pattern: zurielst.com/chat*
Worker: zuriel-ai-resume-assistant
```

Do not route `zurielst.com/*` to the Worker, because that would intercept the entire portfolio website.

After adding the route, test:

```text
https://zurielst.com/chat?message=What%20SOC%20and%20EDR%20experience%20does%20Zuriel%20have%3F
```

You should see JSON with an `answer` field.

## Why this fixes the AI button

Your current CSP allows:

```text
connect-src 'self' https://cloudflareinsights.com
```

A direct request to `https://zuriel-ai-resume-assistant.zuriel-shanley.workers.dev/chat` is not allowed by that policy. A request to `https://zurielst.com/chat` is same-origin, so it is allowed by `connect-src 'self'`.

## Cloudflare Worker

The Worker code remains in:

```text
worker/src/index.js
```

The Worker must keep a Workers AI binding named exactly:

```text
AI
```

## Notes

- No backend is added to the static site.
- No API key is exposed in browser JavaScript.
- No CDN animation scripts are used.
- The AI feature is isolated in Cloudflare Workers AI.
- The mobile number from the resume is not displayed.


## Recommended Cloudflare setup for reliable Ask AI

For the most reliable setup on restricted Wi-Fi networks, route the AI through the same portfolio domain instead of calling the `workers.dev` URL from the browser.

In Cloudflare Dashboard:

1. Open **Workers & Pages**.
2. Open `zuriel-ai-resume-assistant`.
3. Go to **Settings** → **Domains & Routes**.
4. Add a **Route**.
5. Select the `zurielst.com` zone.
6. Use this route pattern:

```text
zurielst.com/ai*
```

The portfolio already calls:

```text
/ai/chat
```

This keeps the browser request same-origin, so restrictive CSP policies such as `connect-src 'self'` will allow it. The Worker code also still supports direct testing at `/chat` on the `workers.dev` domain.

## v37 AI routing note

The AI front end now sends questions through `/ai/run/{encodedPayload}` first, with a text-only encoded fallback to `/ai/chat`. This keeps cybersecurity-related prompt text out of plain query strings and helps avoid false positives from Cloudflare security filters on `/ai/chat?message=...`.
