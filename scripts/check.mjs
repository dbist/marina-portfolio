import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const htmlPath = join(root, "index.html");
const cssPath = join(root, "styles.css");
const jsPath = join(root, "script.js");

const failures = [];

const fail = (message) => failures.push(message);

const read = (path) => readFileSync(path, "utf8");

const checkRequiredFiles = () => {
  for (const path of [htmlPath, cssPath, jsPath]) {
    if (!existsSync(path)) fail(`Missing required file: ${path}`);
  }
};

const checkJavaScriptSyntax = () => {
  if (!existsSync(jsPath)) return;

  const result = spawnSync(process.execPath, ["--check", jsPath], {
    cwd: root,
    encoding: "utf8",
  });

  if (result.status !== 0) {
    fail(`JavaScript syntax check failed:\n${result.stderr || result.stdout}`);
  }
};

const checkHtmlReferences = () => {
  if (!existsSync(htmlPath)) return;

  const html = read(htmlPath);
  const refs = [...html.matchAll(/\b(?:src|href)=["']([^"']+)["']/g)].map((match) => match[1]);

  for (const ref of refs) {
    if (/^(#|https?:|mailto:|tel:)/.test(ref)) continue;

    const cleanRef = decodeURIComponent(ref.split("#")[0]);
    const path = join(root, cleanRef);

    if (!existsSync(path)) {
      fail(`Missing referenced asset: ${ref}`);
      continue;
    }

    if (statSync(path).isDirectory()) {
      fail(`Reference points to a directory instead of a file: ${ref}`);
    }
  }
};

const checkAnchors = () => {
  if (!existsSync(htmlPath)) return;

  const html = read(htmlPath);
  const ids = new Set([...html.matchAll(/\bid=["']([^"']+)["']/g)].map((match) => match[1]));
  const anchorRefs = [...html.matchAll(/\bhref=["']#([^"']+)["']/g)].map((match) => match[1]);

  for (const id of anchorRefs) {
    if (!ids.has(id)) fail(`Missing anchor target for href="#${id}"`);
  }
};

const checkImageAltText = () => {
  if (!existsSync(htmlPath)) return;

  const html = read(htmlPath);
  const imageTags = [...html.matchAll(/<img\b[^>]*>/g)].map((match) => match[0]);

  for (const tag of imageTags) {
    const alt = tag.match(/\balt=["']([^"']*)["']/);
    if (!alt || !alt[1].trim()) fail(`Image is missing useful alt text: ${tag}`);
  }
};

const checkCssBalance = () => {
  if (!existsSync(cssPath)) return;

  const css = read(cssPath);
  const opens = [...css.matchAll(/{/g)].length;
  const closes = [...css.matchAll(/}/g)].length;

  if (opens !== closes) {
    fail(`CSS brace mismatch: ${opens} opening braces and ${closes} closing braces`);
  }
};

const checkLargeSourceFiles = () => {
  const sourceFiles = ["index.html", "styles.css", "script.js", "AGENTS.md", "README.md", "package.json"];

  for (const file of sourceFiles) {
    const path = join(root, file);
    if (!existsSync(path)) continue;

    const size = statSync(path).size;
    if (size > 250_000 && extname(path) !== ".pdf") {
      fail(`Unexpectedly large source file: ${file} (${size} bytes)`);
    }
  }
};

checkRequiredFiles();
checkJavaScriptSyntax();
checkHtmlReferences();
checkAnchors();
checkImageAltText();
checkCssBalance();
checkLargeSourceFiles();

if (failures.length) {
  console.error(`Site checks failed:\n\n${failures.map((failure) => `- ${failure}`).join("\n")}`);
  process.exit(1);
}

console.log("Site checks passed.");
