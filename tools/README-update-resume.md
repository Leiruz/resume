# Update resume helper

Run this from the project root to update the public resume PDF and Worker AI context:

```bash
./tools/update-resume.sh path/to/new-resume.pdf
```

On Windows PowerShell with Git Bash installed:

```powershell
bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Resume.pdf"
```

After running, review `assets/resume/resume-context.txt`, upload the static site files, and deploy the updated `worker/src/index.js` to Cloudflare.
