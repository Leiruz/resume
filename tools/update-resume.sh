#!/usr/bin/env sh
# Update Zuriel's portfolio resume PDF and Cloudflare Worker AI knowledge.
#
# Usage:
#   ./tools/update-resume.sh path/to/new-resume.pdf [project-root]
#
# What it updates:
#   - assets/resume/Zuriel-Shanley-Tanyory-Resume.pdf
#   - assets/resume/resume-context.txt
#   - worker/src/index.js const PROFILE_CONTEXT = `...` block
#
# Requirements for text extraction, one of:
#   - pdftotext, or
#   - Python 3 with pypdf, PyPDF2, or pdfminer.six installed
#
# Privacy:
#   - Lines/fragments labelled Mobile, Phone, Tel, Telephone, or Contact Number
#     are removed from the AI context.
#   - The resume PDF itself is copied unchanged, so remove private details from
#     the PDF before publishing if you do not want them public.

set -eu

usage() {
  cat <<'USAGE'
Usage:
  ./tools/update-resume.sh path/to/new-resume.pdf [project-root]

Examples from Git Bash on Windows:
  ./tools/update-resume.sh "/c/Users/Zuriel/Downloads/Resume.pdf"
  ./tools/update-resume.sh "C:/Users/Zuriel/Downloads/Resume.pdf" "/c/Users/Zuriel/Documents/zuriel-portfolio-ai"

Examples from PowerShell if Git Bash is installed:
  bash tools/update-resume.sh "C:/Users/Zuriel/Downloads/Resume.pdf"
USAGE
}

die() {
  echo "Error: $*" >&2
  exit 1
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ]; then
  usage
  exit 0
fi

PDF_INPUT=${1:-}
PROJECT_ROOT=${2:-.}

[ -n "$PDF_INPUT" ] || { usage; exit 1; }
[ -f "$PDF_INPUT" ] || die "PDF file not found: $PDF_INPUT"

case "$(printf '%s' "$PDF_INPUT" | tr '[:upper:]' '[:lower:]')" in
  *.pdf) ;;
  *) die "Input file must be a .pdf file." ;;
esac

# Resolve project root without relying on GNU realpath.
PROJECT_ROOT=$(cd "$PROJECT_ROOT" 2>/dev/null && pwd) || die "Project root not found: $PROJECT_ROOT"
[ -f "$PROJECT_ROOT/index.html" ] || die "index.html not found in project root: $PROJECT_ROOT"
[ -f "$PROJECT_ROOT/worker/src/index.js" ] || die "worker/src/index.js not found in project root: $PROJECT_ROOT"

RESUME_DIR="$PROJECT_ROOT/assets/resume"
RESUME_TARGET="$RESUME_DIR/Zuriel-Shanley-Tanyory-Resume.pdf"
CONTEXT_TARGET="$RESUME_DIR/resume-context.txt"
WORKER_FILE="$PROJECT_ROOT/worker/src/index.js"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
TMP_RAW="${TMPDIR:-/tmp}/zuriel-resume-raw-$TIMESTAMP.txt"
TMP_CONTEXT="${TMPDIR:-/tmp}/zuriel-resume-context-$TIMESTAMP.txt"

mkdir -p "$RESUME_DIR"

extract_with_python() {
  PY_CMD=""
  if command -v python3 >/dev/null 2>&1; then
    PY_CMD=python3
  elif command -v python >/dev/null 2>&1; then
    PY_CMD=python
  else
    return 1
  fi

  "$PY_CMD" - "$PDF_INPUT" <<'PY'
import sys
from pathlib import Path

pdf_path = Path(sys.argv[1])
text = ""
errors = []

try:
    from pypdf import PdfReader
    reader = PdfReader(str(pdf_path))
    text = "\n".join((page.extract_text() or "") for page in reader.pages)
except Exception as exc:
    errors.append(f"pypdf: {exc}")

if not text.strip():
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(str(pdf_path))
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
    except Exception as exc:
        errors.append(f"PyPDF2: {exc}")

if not text.strip():
    try:
        from pdfminer.high_level import extract_text
        text = extract_text(str(pdf_path)) or ""
    except Exception as exc:
        errors.append(f"pdfminer.six: {exc}")

if not text.strip():
    sys.stderr.write("Could not extract text from PDF. Install poppler/pdftotext or Python package pypdf.\n")
    if errors:
        sys.stderr.write("Extractor errors:\n" + "\n".join(errors) + "\n")
    sys.exit(2)

print(text)
PY
}

echo "Extracting resume text..."
if command -v pdftotext >/dev/null 2>&1; then
  pdftotext -layout "$PDF_INPUT" - > "$TMP_RAW"
else
  extract_with_python > "$TMP_RAW"
fi

[ -s "$TMP_RAW" ] || die "Extracted resume text is empty."

# Sanitize the extracted text and wrap it in Worker-safe context.
PY_CMD=""
if command -v python3 >/dev/null 2>&1; then
  PY_CMD=python3
elif command -v python >/dev/null 2>&1; then
  PY_CMD=python
else
  die "Python is required to sanitize and update worker/src/index.js."
fi

"$PY_CMD" - "$TMP_RAW" "$TMP_CONTEXT" <<'PY'
import re
import sys
from datetime import datetime, timezone
from pathlib import Path

raw_path = Path(sys.argv[1])
out_path = Path(sys.argv[2])
raw = raw_path.read_text(encoding="utf-8", errors="replace")

# Normalize whitespace while keeping readable resume line breaks.
raw = raw.replace("\r\n", "\n").replace("\r", "\n")
raw = re.sub(r"[ \t]+", " ", raw)
raw = re.sub(r"\n{3,}", "\n\n", raw).strip()

phone_labels = r"(?:mobile|phone|tel(?:ephone)?|contact\s*number)"
cleaned_lines = []
for line in raw.splitlines():
    # Remove labelled phone fields but keep later public fields such as Email, GitHub, LinkedIn.
    line = re.sub(
        rf"\b{phone_labels}\s*:\s*.*?(?=\b(?:email|e-mail|github|linkedin|https?://|www\.|github\.com|linkedin\.com)\b|$)",
        "[public phone omitted] ",
        line,
        flags=re.IGNORECASE,
    )
    # Remove residual standalone labelled phone fragments.
    line = re.sub(rf"\b{phone_labels}\s*:\s*\S+", "[public phone omitted]", line, flags=re.IGNORECASE)
    cleaned_lines.append(line.strip())

cleaned = "\n".join(line for line in cleaned_lines if line)
cleaned = re.sub(r"\n{3,}", "\n\n", cleaned).strip()

today = datetime.now(timezone.utc).strftime("%Y-%m-%d")
context = f"""PUBLIC PROFILE CONTEXT FOR ZURIEL SHANLEY TANYORY
Use only this context when answering. Do not invent facts. Do not reveal or infer private contact details. Public phone or mobile numbers are intentionally excluded. If the answer is not present in this context, say that the information is not available from the verified resume context.

Context source:
- Latest public resume PDF uploaded by Zuriel.
- Generated on {today} UTC by tools/update-resume.sh.

LATEST RESUME TEXT
{cleaned}
""".strip()

out_path.write_text(context + "\n", encoding="utf-8")
PY

# Update the Worker PROFILE_CONTEXT block.
"$PY_CMD" - "$WORKER_FILE" "$TMP_CONTEXT" "$TIMESTAMP" <<'PY'
import re
import shutil
import sys
from pathlib import Path

worker_path = Path(sys.argv[1])
context_path = Path(sys.argv[2])
timestamp = sys.argv[3]

source = worker_path.read_text(encoding="utf-8")
context = context_path.read_text(encoding="utf-8")

# Escape only what can break a JavaScript template literal.
context_js = context.replace("\\", "\\\\").replace("`", "\\`").replace("${", "\\${")
replacement = "const PROFILE_CONTEXT = `\n" + context_js.rstrip() + "\n`;"
pattern = re.compile(r"const\s+PROFILE_CONTEXT\s*=\s*`.*?`;", re.DOTALL)
new_source, count = pattern.subn(replacement, source, count=1)

if count != 1:
    raise SystemExit("Could not find exactly one PROFILE_CONTEXT template literal in worker/src/index.js")

backup_path = worker_path.with_suffix(worker_path.suffix + f".bak-{timestamp}")
shutil.copy2(worker_path, backup_path)
worker_path.write_text(new_source, encoding="utf-8")
print(f"Backed up Worker file to: {backup_path}")
PY

# Copy resume PDF last, after extraction/update succeeded.
INPUT_ABS=$(cd "$(dirname "$PDF_INPUT")" 2>/dev/null && pwd)/$(basename "$PDF_INPUT")
TARGET_ABS=$(cd "$(dirname "$RESUME_TARGET")" 2>/dev/null && pwd)/$(basename "$RESUME_TARGET")
if [ -f "$RESUME_TARGET" ] && [ "$INPUT_ABS" != "$TARGET_ABS" ]; then
  cp "$RESUME_TARGET" "$RESUME_TARGET.bak-$TIMESTAMP"
  echo "Backed up existing resume PDF to: $RESUME_TARGET.bak-$TIMESTAMP"
fi
if [ "$INPUT_ABS" != "$TARGET_ABS" ]; then
  cp "$PDF_INPUT" "$RESUME_TARGET"
else
  echo "Resume PDF is already at target path; leaving it in place."
fi
cp "$TMP_CONTEXT" "$CONTEXT_TARGET"

rm -f "$TMP_RAW" "$TMP_CONTEXT"

echo ""
echo "Resume update complete."
echo "Updated files:"
echo "  - $RESUME_TARGET"
echo "  - $CONTEXT_TARGET"
echo "  - $WORKER_FILE"
echo ""
echo "Next steps:"
echo "  1. Review assets/resume/resume-context.txt for accuracy and privacy."
echo "  2. Upload the updated website files to your host/GitHub Pages."
echo "  3. Deploy the updated Worker code from worker/src/index.js to Cloudflare."
echo "  4. Test the chatbot with a question from the new resume."
