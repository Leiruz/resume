# Zuriel Portfolio AI Worker

This Cloudflare Worker powers the optional AI Resume Assistant on the static portfolio site.

It uses Cloudflare Workers AI through an `AI` binding, so no OpenAI key or browser-exposed secret is required.

## Deploy

1. Install Node.js if needed.
2. From this `worker` folder, run:

```bash
npm create cloudflare@latest -- --help
npx wrangler login
npx wrangler deploy
```

3. Copy the deployed Worker URL shown by Wrangler and add `/chat` to the end.

Example:

```text
https://zuriel-portfolio-ai.your-subdomain.workers.dev/chat
```

4. Paste that URL into:

```text
assets/ai/config.js
```

5. Make sure `ALLOWED_ORIGINS` in `wrangler.toml` includes your GitHub Pages URL and/or custom domain.

## Test

```bash
curl -X POST "https://YOUR-WORKER.workers.dev/chat" \
  -H "Content-Type: application/json" \
  -d '{"message":"What SOC and EDR experience does Zuriel have?"}'
```

## Notes

- The Worker contains a curated public resume/profile context.
- The assistant is instructed not to invent facts and not to reveal a mobile number.
- The default model is `@cf/meta/llama-3.2-1b-instruct` to keep usage lightweight.
