# /// script
# requires-python = ">=3.12"
# dependencies = ["weasyprint==70.0", "markdown==3.11.2"]
# ///
"""The CV as a PDF: cv.md (the text) laid out with cv.css (the look) and the fonts in fonts/.

    uv run cv/build.py [where/the.pdf]

The site's image runs this on every build (Containerfile, stage "cv"), so a pushed change to cv.md
updates the PDF the site links to. WeasyPrint needs Pango; to preview it on the Mac, build that stage:
    podman build --target cv -o cv/out .
"""

import sys
from pathlib import Path

import markdown
from weasyprint import HTML

here = Path(__file__).parent
out = Path(sys.argv[1]) if len(sys.argv) > 1 else here / "out" / "resume_muhammedBerkOnder.pdf"

body = markdown.markdown((here / "cv.md").read_text(encoding="utf-8"))
page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Muhammed Berk Önder: CV</title>
<meta name="author" content="Muhammed Berk Önder">
<meta name="description" content="AI/ML Engineer, MLOps and LLM Systems">
<link rel="stylesheet" href="cv.css">
</head>
<body>{body}</body>
</html>"""

out.parent.mkdir(parents=True, exist_ok=True)
HTML(string=page, base_url=str(here)).write_pdf(out)
print(out)
