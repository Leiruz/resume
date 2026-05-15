# Zuriel Shanley Tanyory - Cybersecurity Portfolio

A static, GitHub Pages-ready cybersecurity portfolio with an optional Cloudflare Workers AI resume assistant. The website is designed as a premium dark portfolio for cybersecurity consulting, SOC, EDR, SOAR, automation, secure software development, AI-assisted security, digital forensics, and leadership experience.

The site stays static. The AI assistant is handled separately by a Cloudflare Worker so no API key or model access is exposed in browser JavaScript.

## Current architecture

```text
Visitor browser
  -> Static portfolio on GitHub Pages / Cloudflare-proxied domain
  -> Ask AI button calls same-origin route: /ai/run/<encoded-message>
  -> Cloudflare Worker route: zurielst.com/ai*
  -> Cloudflare Workers AI binding: AI
  -> Worker returns a resume-backed answer
```

The public diagnostic routes are intentionally disabled. These should not reveal model, binding, or implementation details:

```text
/ai/health
/ai/test
/ai/cors-check
/ai/chat
```

## Project structure

```text
.
├── index.html
├── styles.css
├── script.js
├── README.md
├── _headers
├── assets/
│   ├── icons/
│   │   └── favicon.svg
│   ├── images/
│   │   ├── hero-cyber-device.svg
│   │   └── og-card.svg
│   └── resume/
│       ├── Zuriel-Shanley-Tanyory-Resume.pdf
│       └── resume-context.txt              # generated after running the resume update tool
├── tools/
│   ├── update-resume.sh
│   └── README-update-resume.md
└── worker/
    ├── README.md
    ├── wrangler.toml
    └── src/
        └── index.js
```

## Deploy the static website

Upload these files and folders to the root of your GitHub Pages repository or static hosting root:

```text
index.html
styles.css
script.js
_headers
assets/
tools/
worker/
README.md
```

Important placement:

```text
script.js must sit beside index.html
assets/ must stay as a folder beside index.html
```

The website can still open directly from `index.html`, but the AI assistant only works when the Cloudflare Worker route is deployed.

## Deploy or update the Cloudflare Worker

### Dashboard method

1. Open Cloudflare Dashboard.
2. Go to `Workers & Pages`.
3. Open the Worker named `zuriel-ai-resume-assistant`.
4. Click `Edit code`.
5. Replace the current Worker code with the contents of:

```text
worker/src/index.js
```

6. Click `Save and deploy`.

### Required Workers AI binding

The Worker must have a Workers AI binding named exactly:

```text
AI
```

Cloudflare Dashboard path:

```text
Workers & Pages
-> zuriel-ai-resume-assistant
-> Settings
-> Bindings
-> Add binding
-> Workers AI
-> Binding name: AI
```

### Required Worker route

Use a same-origin route so the website calls your own domain instead of the public `workers.dev` hostname:

```text
Route pattern: zurielst.com/ai*
Worker: zuriel-ai-resume-assistant
```

Optional if you use the `www` host:

```text
Route pattern: www.zurielst.com/ai*
Worker: zuriel-ai-resume-assistant
```

Do not route `zurielst.com/*` to the Worker because that would intercept the full portfolio website.

## AI route used by the website

The front end stores this base endpoint in `index.html`:

```html
<body data-ai-endpoint="/ai/chat">
```

The JavaScript intentionally converts that base into a safer route:

```text
GET /ai/run/<base64url-encoded-message>
```

This avoids query strings and keeps the AI route compatible with the strict static-site WAF rule.

## Cloudflare security notes

Recommended existing protections:

```text
Custom rules:
- Block strict static-site exploit traffic v4.1
- Challenge command-line and scanner clients
- Challenge non-read HTTP methods

Rate limiting:
- Rate limit AI assistant bursts or whole-site abusive bursts, depending on your current free-plan limit
```

The strict static-site rule should narrowly exempt only:

```text
GET /ai/run/<encoded-message>
```

Do not broadly exempt all `/ai/` paths if you want to keep `/ai/health`, `/ai/test`, and other diagnostics hidden.

## Update your resume and AI knowledge

Use the included helper script whenever you update your resume PDF.

### What the script updates

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
worker/src/index.js
```

The script extracts text from the new PDF, removes labelled phone/mobile fields from the AI context, and replaces the `PROFILE_CONTEXT` block inside the Worker.

Important privacy note:

```text
The PDF itself is copied unchanged.
Remove private information from the PDF before publishing if you do not want it public.
```

### Requirements

You need:

```text
Git Bash on Windows, or another shell that can run .sh files
Python 3
At least one PDF text extractor
```

Recommended Python extractor:

```bash
python -m pip install pypdf
```

Alternative extractors supported by the script:

```text
pdftotext / poppler
PyPDF2
pdfminer.six
```

### Step-by-step resume update guide

1. Put your new resume PDF somewhere easy to find, for example:

```text
C:/Users/Zuriel/Downloads/Zuriel-New-Resume.pdf
```

2. Open PowerShell.

3. Go to the project folder. Example:

```powershell
cd "C:\Users\Zuriel\Documents\zuriel-portfolio-ai"
```

4. Run the update script with Git Bash:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Zuriel-New-Resume.pdf"
```

If your project is not the current folder, pass the project root as the second argument:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Zuriel-New-Resume.pdf" "C:/Users/Zuriel/Documents/zuriel-portfolio-ai"
```

5. Review the generated AI context:

```text
assets/resume/resume-context.txt
```

Check that:

```text
- Dates are correct
- Role titles are correct
- Metrics are correct
- Certifications are correct
- No private phone number appears
- The wording is safe for a public portfolio
```

6. Review the updated Worker file:

```text
worker/src/index.js
```

The updated resume knowledge is inside:

```js
const PROFILE_CONTEXT = `
...
`;
```

7. Upload the updated static website files to GitHub Pages:

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
```

8. Redeploy the Worker using the updated:

```text
worker/src/index.js
```

9. Test the AI assistant on your live website by asking questions from the new resume, for example:

```text
What is Zuriel's latest cybersecurity experience?
What certifications does Zuriel have?
Which projects show secure software development?
```

10. If the visible portfolio content changed, update the website copy manually in:

```text
index.html
```

The script updates the public PDF and AI knowledge. It does not automatically rewrite visible website sections such as Work, Projects, Credentials, or Leadership.

## Optional Wrangler deployment

If you install Node.js and prefer command-line deployment:

```powershell
cd worker
npm install
npx wrangler login
npx wrangler deploy
```

Dashboard deployment is fine if you do not want an IDE.

## Troubleshooting

### Ask AI button opens, but answers are unavailable

Check:

```text
- Worker route exists: zurielst.com/ai*
- Workers AI binding is named exactly AI
- Your strict WAF rule exempts only GET /ai/run/
- Your rate limit is not blocking normal testing
- Cloudflare cache has been purged after deployment
```

### Browser console shows Content Security Policy errors

The website should call a same-origin route:

```text
/ai/run/<encoded-message>
```

If the console shows calls to `workers.dev`, your static files are stale. Purge Cloudflare cache and hard refresh.

### The Worker returns 404 for /ai/health or /ai/test

That is expected. Public diagnostics are disabled.

### The chatbot gives outdated resume answers

Run:

```powershell
bash tools/update-resume.sh "C:/path/to/new-resume.pdf"
```

Then redeploy the updated Worker code.

## Security and privacy notes

- The site is static.
- The AI assistant runs through Cloudflare Workers AI.
- No AI API key is stored in browser JavaScript.
- The LLM is not trained on your resume. The Worker passes resume context at request time.
- Public diagnostics are disabled.
- The mobile number is intentionally excluded from the website and AI context.
- Keep the `/ai/` WAF exception narrow.
- Keep a rate limit on AI usage to reduce quota abuse.
