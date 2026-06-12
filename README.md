# Marina Portfolio

Static portfolio website for Marina Ervits.

## Live Site

https://dbist.github.io/marina-portfolio/

## Local Preview

```sh
python3 -m http.server 8080
```

Then open `http://localhost:8080/`.

## Checks

```sh
npm run check
```

## PDF Assets

- `Marina Ervits Resume-Cobalt.pdf` is intentionally tracked so the resume download works with the site.
- `Marina-Ervits-Portfolio.pdf` is the **web-optimized full portfolio** (~5.5 MB, 39 pages) that the "Download Full Portfolio" buttons link to. It is tracked. Regenerate it from the high-res source by rendering each page to ~1600px-wide JPEG (quality ~78) and combining with `img2pdf`.
- `MARINA ERVITS PORTFOLIO-Sweater.pdf` is the ~87 MB high-res source/export. It is intentionally ignored (git) because it is far too large to track or serve. Keep a local copy at the repo root when using it as source material or to regenerate the optimized portfolio above.
