# Marina Portfolio Agent Guide

This project is a static portfolio website for Marina Ervits, built from the Canva/PDF portfolio and resume materials in this repo. Keep future changes focused, visual, and easy to verify.

## Project Shape

- The site is currently plain HTML, CSS, and JavaScript:
  - `index.html`
  - `styles.css`
  - `script.js`
- Source reference files:
  - `MARINA ERVITS PORTFOLIO-Sweater.pdf`
  - `Marina Ervits Resume-Cobalt.pdf`
- Extracted portfolio visuals live under `assets/extracted/`.
- The local preview can be served with:

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Design Direction

- The chosen direction is the hybrid option from GitHub issue #2: keep the web-native single-page structure, but make it feel closer to the PDF portfolio.
- Preserve the portfolio's editorial fashion feel:
  - large serif typography
  - restrained grayscale and warm neutral base
  - dark charcoal panels
  - lookbook-like image grids
  - technical/product-development callouts
  - generous spacing on desktop
  - readable stacked sections on mobile
- Do not recreate all 39 PDF pages one-for-one unless an issue explicitly asks for that.
- Do not shrink full PDF spreads into tiny unreadable images. Convert deck content into responsive web sections.

## Content Priorities

Emphasize Marina's senior design leadership, not only the finished product boards.

Useful themes to surface:

- strategic brand growth
- design-to-value philosophy
- fully fashioned knitwear expertise
- yarn R&D and stitch engineering
- cost engineering
- global vendor stewardship
- cross-functional partnership
- team leadership and mentorship
- commercially successful sweater assortments
- measurable impact such as speed-to-market, sampling-cost, STU, AUR, best-seller, and volume-driver signals when supported by source material

When adding resume content, summarize it into a web-native section and keep a direct download link to the PDF.

## Implementation Guidelines

- Keep the site dependency-free unless there is a clear reason to add a build system.
- Prefer semantic HTML and CSS over JavaScript for layout and interaction.
- Keep JavaScript small and progressive.
- Use responsive CSS with stable dimensions for image grids, product cards, navigation, and buttons.
- Product-development images often contain technical boards or garment details; use `object-fit: contain` when cropping would hide important information.
- Keep copy concise and recruiter-friendly.
- Avoid broad refactors while making content or design changes.

## Asset Handling

- Use the PDFs as source/reference material.
- Extracted images from PDFs may be lower quality or oddly cropped. Prefer original Canva exports if they become available.
- Keep asset names descriptive when adding new files.
- Do not delete source PDFs unless explicitly asked.
- Before committing, check for accidentally huge or duplicate extracted assets.

### Transparency: never flatten cut-outs onto black

Many product/model images in the deck are extracted from the PDF as **transparent cut-outs** (RGBA, `alpha=0` at the corners — the figure floats on nothing). The default behavior of `PIL.Image.convert("RGB")` and most format conversions composites transparent pixels onto **black**, which puts each model in an ugly black box on the otherwise white cards. This shipped once unnoticed and had to be re-fixed.

When converting or re-encoding extracted images (e.g. PNG -> WebP):

- **Always composite onto the card background explicitly**, not the implicit black. The cards use `var(--white)` = `#fffdf8`. Paste with the alpha channel as the mask:

  ```python
  bg = Image.new("RGB", src.size, (255, 253, 248))  # #fffdf8
  bg.paste(src, mask=src.split()[3])                 # src is RGBA
  ```

- **Do not blindly `.convert("RGB")`** on an RGBA cut-out — that is the bug.
- **Detect the problem** before committing: an image is suspect if all four corner pixels are near-black. Quick check across referenced images:

  ```python
  im = Image.open(p).convert("RGB"); w, h = im.size
  black = all(sum(im.getpixel(xy)) < 60
              for xy in [(2,2),(w-3,2),(2,h-3),(w-3,h-3)])
  ```

- **Genuinely dark photos are fine and must be kept** — e.g. the Holiday disco-ball hero (`collection-02-disco-sparkle`) is a real editorial photo shot on black. Distinguish artifact from intent by checking the **PDF source**: if the matching embedded image is RGBA with transparent corners it is a cut-out (fix it); if it is opaque RGB it is a real photo (leave it).
- If transparency was already flattened in a committed file, the alpha is gone — **recover the cut-out by re-extracting from the PDF**, not by editing the flattened file. When several PDF images share a size, disambiguate by visual similarity (lowest MSE of `candidate-composited-on-black` vs the current file); the correct source's page number will line up with the `page-NN-*` filename.

## Verification

For visual changes:

- Run a local server and inspect the page in the browser.
- Check the top of the page, collections section, product-development section, and footer.
- Verify both desktop and narrow/mobile layouts when possible.
- Confirm image links and PDF download links work.
- Confirm product images are not cropped in ways that hide important garments or technical details.

For code sanity:

```sh
npm run check
```

This runs `scripts/check.mjs`, which verifies JavaScript syntax, local asset links, anchor targets, image alt text, and simple CSS brace balance.

Formatting scripts are available through `package.json`:

```sh
npm run format
npm run format:check
```

They require installing the dev dependency first with `npm install`.

If validation is limited, state exactly what was and was not checked.

## Pre-Commit Hook

- The repo uses a tracked Git hook in `.githooks/pre-commit`.
- The hook runs `npm run check`.
- Git is configured locally with `core.hooksPath=.githooks`; if hooks do not run after a fresh clone, run:

```sh
npm run prepare
```

## GitHub Workflow

- Repository: `dbist/marina-portfolio`.
- Track meaningful future work as GitHub issues before or alongside implementation.
- When creating issue bodies through `gh`, avoid inline shell quoting for text with backticks, dollar signs, or multiline snippets. Use a temp body file or carefully verify the created issue body afterward.
- Before mutating issues or PRs, verify the target repo and current worktree state.
- Do not close issues until the corresponding work is implemented and verified.
- Keep issues focused enough to be independently actionable.

## GitHub Actions Maintenance

- Keep GitHub Actions versions current when adding or editing `.github/workflows`.
- Before changing workflow files, run an update check with `gh api repos/dbist/marina-portfolio/actions/workflows` and inspect any workflow warnings in recent runs.
- If repo-owned workflows use marketplace actions, compare them with the latest upstream releases, such as `gh api repos/actions/checkout/releases/latest --jq '.tag_name'` and `gh api repos/actions/upload-artifact/releases/latest --jq '.tag_name'`.
- Prefer updating action versions to Node 24-compatible releases over suppressing deprecation warnings with temporary environment flags.
- If the warning comes from GitHub-managed Pages workflows such as `dynamic/pages/pages-build-deployment`, document that there is no repo-owned workflow file to edit and verify the managed workflow still succeeds.

## Working Style

- Make small, traceable changes.
- Match the existing static-site approach unless an issue explicitly changes the stack.
- Preserve user-provided files and any work already in progress.
- If a requested change can be interpreted multiple ways, choose the smallest useful implementation and note the tradeoff.
- Prefer improving the portfolio's clarity and hiring-manager usefulness over adding decorative complexity.
