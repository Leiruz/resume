# Zuriel Shanley Tanyory Portfolio

A premium static cybersecurity portfolio with an optional Cloudflare Workers AI resume assistant.

The website is designed to be hosted as a static front end while the AI assistant runs separately on Cloudflare Workers AI. No API keys are exposed in browser JavaScript.

## Current setup

```text
Static website:
- index.html
- styles.css
- script.js
- assets/
- _headers

AI backend:
- worker/src/index.js
- worker/wrangler.toml

Resume update tool:
- tools/update-resume.sh
- tools/README-update-resume.md
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
│       └── Zuriel-Shanley-Tanyory-Resume.pdf
├── tools/
│   ├── README-update-resume.md
│   └── update-resume.sh
└── worker/
    ├── README.md
    ├── wrangler.toml
    └── src/
        └── index.js
```

## Static site deployment

Upload these files and folders to the root of the GitHub Pages repository:

```text
index.html
styles.css
script.js
_headers
assets/
README.md
```

Keep `script.js` beside `index.html`. The AI assistant button depends on that local script.

If the site is deployed behind Cloudflare, make sure your Cloudflare cache is purged after replacing files.

## Cloudflare Worker deployment

The AI assistant is powered by the Worker code in:

```text
worker/src/index.js
```

### Required Cloudflare settings

The Worker must have a Workers AI binding named exactly:

```text
AI
```

The live portfolio expects the Worker to be routed through the same domain:

```text
zurielst.com/ai*
```

The public website calls:

```text
/ai/run/<encoded-message>
```

Diagnostic endpoints such as `/ai/health`, `/ai/test`, `/ai/cors-check`, and `/ai/chat` should stay disabled.

### Cloudflare Dashboard deployment steps

1. Go to Cloudflare Dashboard.
2. Open **Workers & Pages**.
3. Open `zuriel-ai-resume-assistant`.
4. Click **Edit code**.
5. Replace the code with the contents of `worker/src/index.js`.
6. Click **Save and deploy**.
7. Confirm the Worker has a binding named `AI`.
8. Confirm the route pattern exists:

```text
zurielst.com/ai*
```

## Cloudflare WAF notes

Your strict static-site WAF rule should allow only the AI route that the website actually needs:

```text
GET /ai/run/<encoded-message>
```

It should not broadly allow every `/ai/` path.

Recommended exception inside `Block strict static-site exploit traffic v4.1`:

```text
and not (
  lower(http.host) in {"zurielst.com" "www.zurielst.com"}
  and starts_with(lower(http.request.uri.path), "/ai/run/")
  and http.request.method eq "GET"
  and raw.http.request.uri.query eq ""
  and len(raw.http.request.uri.path) gt 8
  and len(raw.http.request.uri.path) le 512
  and not (lower(raw.http.request.uri) contains "%")
)
```

Keep the existing rate limiting rule focused on `/ai/` if you only have one rate limiting rule available.

## How the AI assistant works

The LLM is not trained or fine-tuned on the resume. The Worker injects the current resume-backed profile context into the prompt at request time.

Flow:

```text
Visitor question
-> /ai/run/<encoded-message>
-> Cloudflare Worker
-> Workers AI model
-> Resume-backed answer
```

The Worker is instructed to answer only from verified profile context and to avoid inventing companies, dates, metrics, links, certifications, awards, publications, or private contact details.

Suggested prompt chips such as `Consulting fit`, `SOC / EDR`, and `Secure projects` only fill the input box. They do not send a request to the LLM until the visitor presses `Ask` or uses the Enter/submit action through the form.

## Updating your resume and AI knowledge

Use the included tool whenever you replace your resume PDF or want the AI assistant to know about a new resume version.

### What the tool updates

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
worker/src/index.js
```

It copies the new public resume PDF, extracts text from it, removes labelled phone or mobile fragments from the AI context, and replaces the `PROFILE_CONTEXT` block inside `worker/src/index.js`.

The PDF itself is copied unchanged. If you do not want a phone number or other private information to appear in the public downloadable resume, remove it from the PDF before running the tool.

### Requirements

You need a shell environment that can run `.sh` files. On Windows, use Git Bash or run the script from PowerShell using `bash`.

For PDF text extraction, the script uses one of these:

```text
pdftotext
Python 3 with pypdf
Python 3 with PyPDF2
Python 3 with pdfminer.six
```

Recommended Windows setup:

1. Install Git for Windows so Git Bash is available.
2. Install Python 3 if it is not already installed.
3. Install a PDF extractor package if needed:

```powershell
py -m pip install pypdf
```

### Step-by-step resume update guide

1. Put your new resume PDF somewhere easy to find, for example:

```text
C:/Users/Zuriel/Downloads/Zuriel-Shanley-Tanyory-Resume.pdf
```

2. Open PowerShell in the project root folder.

3. Run the script:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Zuriel-Shanley-Tanyory-Resume.pdf"
```

If you are running the script from outside the project folder, provide the project root as the second argument:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Zuriel-Shanley-Tanyory-Resume.pdf" "C:/Users/Zuriel/Documents/zuriel-portfolio"
```

4. Review the generated context file:

```text
assets/resume/resume-context.txt
```

Check that it is accurate, public-safe, and not exposing your mobile number.

5. Review the updated Worker file:

```text
worker/src/index.js
```

Confirm the `PROFILE_CONTEXT` block reflects the latest resume.

6. Upload the updated static site files to GitHub Pages, especially:

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
```

7. Deploy the updated Worker code in Cloudflare Dashboard:

```text
Workers & Pages
-> zuriel-ai-resume-assistant
-> Edit code
-> paste updated worker/src/index.js
-> Save and deploy
```

8. Test the live chatbot by asking about a new fact from the updated resume.

Example:

```text
What certifications does Zuriel have?
```

9. Remove backup files before committing if you do not want them in GitHub:

```text
*.bak-YYYYMMDD-HHMMSS
```

## Updating visible website content

The resume update tool updates the downloadable PDF and the AI context. It does not rewrite the visible website sections.

If your new resume changes roles, dates, projects, certifications, or metrics, also update the relevant text inside:

```text
index.html
```

Then redeploy the static site.

## Quick test checklist after a resume update

- The public resume button downloads the latest PDF.
- `assets/resume/resume-context.txt` does not expose private mobile information.
- The Worker has been redeployed.
- The AI assistant answers questions using the new resume context.
- The website still loads `script.js` correctly.
- The `/ai/run/` route is not blocked by the strict WAF rule.
- The rate limiting rule still protects `/ai/` from abusive bursts.

## Troubleshooting

### `bash` is not recognized on Windows

Install Git for Windows, then reopen PowerShell and try again.

### The script says it cannot extract PDF text

Install a Python PDF extraction package:

```powershell
py -m pip install pypdf
```

Then run the script again.

### The chatbot says the assistant is unavailable

Check these in order:

1. Cloudflare Worker has the `AI` binding.
2. The route `zurielst.com/ai*` points to the Worker.
3. Your WAF rule allows `GET /ai/run/`.
4. Your rate limiting rule is not temporarily blocking your IP.
5. The Worker code was redeployed after the resume update.

### The chatbot still answers with old information

The Worker probably has not been redeployed after the resume update. Redeploy `worker/src/index.js` in Cloudflare Dashboard.

## Privacy notes

- The mobile number from the resume is intentionally not displayed prominently on the website.
- The script removes labelled phone or mobile fragments from the AI context.
- The downloadable PDF is copied unchanged, so manually remove private details from the PDF if needed.
- Do not add secrets, API keys, or private notes to `PROFILE_CONTEXT`.

## Maintenance checklist

When updating the portfolio:

1. Update visible website copy in `index.html` if needed.
2. Update styles only in `styles.css`.
3. Update interactions only in `script.js`.
4. Use `tools/update-resume.sh` for resume and AI context updates.
5. Redeploy the Cloudflare Worker after AI context changes.
6. Purge Cloudflare cache after replacing website files.
