# Resume update tool

Use `update-resume.sh` to update both the public resume PDF and the AI assistant's resume knowledge.

The LLM is not trained on the resume. The Worker sends resume-backed context to the model at request time. Updating the resume means updating the PDF and replacing the `PROFILE_CONTEXT` block in the Worker.

## Files updated by the tool

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
worker/src/index.js
```

The script creates backup files with names like:

```text
*.bak-YYYYMMDD-HHMMSS
```

Remove those backup files before committing if you do not want them in GitHub.

## Privacy behavior

The script removes labelled phone or mobile fields from the AI context, such as:

```text
Mobile:
Phone:
Tel:
Telephone:
Contact Number:
```

The resume PDF itself is copied unchanged. If the PDF contains a mobile number or private detail that you do not want public, remove it from the PDF before running the tool.

## Requirements

The script needs a shell that can run `.sh` files.

On Windows, use Git Bash, or run it from PowerShell with `bash`.

For PDF text extraction, the script tries:

```text
pdftotext
pypdf
PyPDF2
pdfminer.six
```

Recommended Windows setup:

```powershell
py -m pip install pypdf
```

## Step-by-step guide for Windows PowerShell

1. Save your new resume as a PDF, for example:

```text
C:/Users/Zuriel/Downloads/Zuriel-Shanley-Tanyory-Resume.pdf
```

2. Open PowerShell.

3. Go to the portfolio project folder:

```powershell
cd "C:/Users/Zuriel/Documents/zuriel-portfolio"
```

4. Run the update script:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Zuriel-Shanley-Tanyory-Resume.pdf"
```

5. Review the generated context:

```text
assets/resume/resume-context.txt
```

Check that it is accurate and public-safe.

6. Check that the public PDF was replaced:

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
```

7. Check that the Worker context was updated:

```text
worker/src/index.js
```

Look for:

```js
const PROFILE_CONTEXT = `
```

8. Upload the updated static files to GitHub Pages.

9. Redeploy the Worker in Cloudflare Dashboard:

```text
Workers & Pages
-> zuriel-ai-resume-assistant
-> Edit code
-> paste updated worker/src/index.js
-> Save and deploy
```

10. Test the AI assistant on the live site by asking about a fact from the new resume.

## Running from another folder

If you are not inside the project root, pass the project folder as the second argument:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Resume.pdf" "C:/Users/Zuriel/Documents/zuriel-portfolio"
```

## Git Bash example

```bash
./tools/update-resume.sh "/c/Users/Zuriel/Downloads/Resume.pdf"
```

## What the tool does not update

The tool does not rewrite visible website sections in `index.html`.

If your resume adds a new role, project, certification, or metric, update the visible portfolio copy manually in:

```text
index.html
```

Then redeploy the static website.

## Troubleshooting

### `bash` is not recognized

Install Git for Windows, then reopen PowerShell.

### The script cannot extract PDF text

Install `pypdf`:

```powershell
py -m pip install pypdf
```

Then run the script again.

### The chatbot still uses old resume facts

Redeploy the updated Worker code. Updating the PDF alone does not change the AI context running in Cloudflare.

### The AI route is blocked

Check that your Cloudflare WAF exception allows:

```text
GET /ai/run/
```

Do not broadly expose diagnostic routes such as `/ai/health` or `/ai/test`.
