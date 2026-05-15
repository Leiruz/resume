# Zuriel AI Resume Assistant Worker

This Cloudflare Worker powers the AI assistant on the portfolio website.

The static website calls the Worker through the same domain:

```text
GET https://zurielst.com/ai/run/<encoded-message>
```

The Worker then sends the question and resume-backed context to Cloudflare Workers AI.

## Required binding

The Worker must have a Workers AI binding named exactly:

```text
AI
```

In Cloudflare Dashboard:

```text
Workers & Pages
-> zuriel-ai-resume-assistant
-> Settings
-> Bindings
-> Add binding
-> Workers AI
-> Variable name: AI
```

## Required route

Add this Worker route:

```text
zurielst.com/ai*
```

Optional if the `www` hostname is used:

```text
www.zurielst.com/ai*
```

Do not route the full site such as `zurielst.com/*` to this Worker, because that would intercept the portfolio page itself.

## Public routes

The only intended public assistant route is:

```text
GET /ai/run/<encoded-message>
```

The following setup/debug routes are intentionally disabled and return generic 404 responses:

```text
/ai/health
/ai/test
/ai/cors-check
/ai/chat
```

## Updating AI knowledge from a new resume

The Worker stores the resume-backed profile context in:

```text
const PROFILE_CONTEXT = `...`;
```

Use the project helper script from the project root:

```bash
./tools/update-resume.sh path/to/new-resume.pdf
```

On Windows PowerShell with Git Bash available:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/New-Resume.pdf"
```

The script updates:

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
worker/src/index.js
```

After running the script, deploy the updated `worker/src/index.js` to Cloudflare.

## Dashboard deployment

1. Open **Cloudflare Dashboard**.
2. Go to **Workers & Pages**.
3. Open `zuriel-ai-resume-assistant`.
4. Click **Edit code**.
5. Replace the code with the contents of `worker/src/index.js`.
6. Click **Save and deploy**.

## Optional Wrangler deployment

```bash
cd worker
npm install
npx wrangler deploy
```

## Security notes

- Do not put secrets or private contact details in `PROFILE_CONTEXT`.
- Keep the WAF exception narrow: allow only `GET /ai/run/`.
- Keep rate limiting enabled for `/ai/` to protect the Workers AI free allocation.
- The model is not trained on the resume. The Worker supplies resume context at request time.
