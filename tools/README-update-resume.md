# Resume update helper

Use `update-resume.sh` when you want to replace the public resume PDF and update the AI assistant's resume knowledge.

## What it updates

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
assets/resume/resume-context.txt
worker/src/index.js
```

The script extracts text from the PDF, removes labelled phone/mobile fields from the AI context, creates backups, and replaces the Worker `PROFILE_CONTEXT` block.

The PDF itself is copied unchanged. Remove private information from the PDF before publishing it publicly.

## Requirements

Run the script from one of these:

```text
Git Bash on Windows
WSL
macOS Terminal
Linux shell
```

The script needs either `pdftotext` or Python 3 with a PDF extraction package.

Recommended Windows setup:

```powershell
py -m pip install pypdf
```

## Step-by-step usage

1. Place your new resume PDF somewhere accessible, for example:

```text
C:\Users\Zuriel\Downloads\New-Resume.pdf
```

2. Open the project root, the folder containing `index.html`.

3. Run the script.

From Git Bash:

```bash
./tools/update-resume.sh "C:/Users/Zuriel/Downloads/New-Resume.pdf"
```

From PowerShell:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/New-Resume.pdf"
```

4. Review:

```text
assets/resume/resume-context.txt
```

Check that the facts are correct and that no private phone/mobile number is included.

5. Confirm this file was replaced:

```text
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
```

6. Confirm the Worker context was updated:

```text
worker/src/index.js
```

Look for:

```text
const PROFILE_CONTEXT = `
```

7. Upload the updated website files to GitHub Pages or your static host.

8. Deploy the updated Worker code from `worker/src/index.js` in Cloudflare.

9. Test the live chatbot with a new resume-specific question.

## Example

```bash
./tools/update-resume.sh "C:/Users/Zuriel/Downloads/Zuriel-Shanley-Tanyory-Resume-2026.pdf"
```

## Backups

The script creates timestamped backups of:

```text
worker/src/index.js
assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
```

Backups are kept beside the original files.

## Troubleshooting

If PDF extraction fails, install `pypdf`:

```powershell
py -m pip install pypdf
```

If the chatbot still gives old answers, redeploy the updated `worker/src/index.js` to Cloudflare. Updating only the PDF is not enough.
