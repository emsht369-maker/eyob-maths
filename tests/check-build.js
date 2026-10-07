"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-site-"));
function listHtmlFiles(directory, prefix = "") {
  return fs.readdirSync(path.join(directory, prefix), { withFileTypes: true }).flatMap(entry => {
    const relative = path.posix.join(prefix, entry.name);
    return entry.isDirectory()
      ? listHtmlFiles(directory, relative)
      : entry.isFile() && entry.name.endsWith(".html") ? [relative] : [];
  });
}
async function run() {
try {
  const build = spawnSync(process.execPath, [path.join(root, "worker/build-site.mjs"), output], { encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  const headers = fs.readFileSync(path.join(output, "_headers"), "utf8");
  assert.match(headers, /\/\*\.html\s+Cache-Control: no-cache, no-store, must-revalidate/,
    "HTML must revalidate instead of serving a stale page");
  assert.match(headers, /\/assets\/\*\s+Cache-Control: public, max-age=31536000, immutable/,
    "hashed assets can use long-lived immutable caching");
  const missingPage = fs.readFileSync(path.join(output, "404.html"), "utf8");
  assert.match(missingPage, /<h1>[^<]*couldn’t find that page/i, "the Pages build includes a real 404 page");
  const redirects = fs.readFileSync(path.join(output, "_redirects"), "utf8");
  assert.match(redirects, /^\/topic\/\* \/topic\/:splat\/index\.html 200$/m,
    "clean topic URLs are routed to generated full-page HTML while unknown slugs remain 404s");
  assert.ok(fs.existsSync(path.join(output, "favicon.svg")), "the deploy build includes its local favicon");
  const htmlFiles = listHtmlFiles(output);
  assert.ok(htmlFiles.length > 5, "the site pages are included in the deploy build");
  assert.ok(htmlFiles.includes("topic/basic-arithmetic/index.html"), "the deploy includes nested topic pages");
  const topicPage = fs.readFileSync(path.join(output, "topic/basic-arithmetic/index.html"), "utf8");
  assert.match(topicPage, /assets\/js_answer-feedback\.[a-f0-9]{16}\.js/,
    "generated topic pages load the shared answer sound before the topic app");
  const linearAlgebraPage = fs.readFileSync(path.join(output, "topic/linear-algebra/index.html"), "utf8");
  assert.match(linearAlgebraPage, /assets\/data_imported-questions\.[a-f0-9]{16}\.js/,
    "linear algebra pages load the hashed imported question data");
  assert.ok(fs.existsSync(path.join(output, "assets/imported-question-images/mit18-06-pset1/q1.webp")),
    "the build includes imported question page images");
  assert.ok(fs.existsSync(path.join(output, "assets/mit-linear-algebra/22297c2a6dcf06d82e93ee4af115e91a_MIT18_06S10_pset1_s10_soln.pdf")),
    "the build includes linked source PDFs");
  assert.ok(fs.existsSync(path.join(output, "assets/mit-linear-algebra/4d876a9159e32543eb0d73b4d4382f4c_MIT18_06S10ZoomNotes.pdf")),
    "the authorized ZoomNotes resource is included in public output");
  for (const name of htmlFiles) {
    const html = fs.readFileSync(path.join(output, name), "utf8");
    assert.match(html, /MATH_MASTER_ASSETS=Object\.freeze\(/, `${name}: injects the content-hash map`);
    assert.ok(html.indexOf("<meta charset") < html.indexOf("MATH_MASTER_ASSETS="), `${name}: declares its character set before inline scripts`);
    for (const match of html.matchAll(/\b(?:src|href)=["']([^"']+\.(?:js|css))(?:\?[^"']*)?["']/g)) {
      const asset = match[1].replace(/^\//, "");
      if (/^(?:https?:)?\/\//.test(asset)) continue;
      assert.match(asset, /^assets\/(?:js|css|data)_[A-Za-z0-9_.-]+\.[a-f0-9]{16}\.(?:js|css)$/,
        `${name}: local JS/CSS/data reference ${asset} is content-hashed`);
      assert.ok(fs.existsSync(path.join(output, asset)), `${name}: built asset ${asset} exists`);
    }
  }
  const server = await servePagesPreview(output);
  try {
    const base = `http://127.0.0.1:${server.address().port}`;
    const home = await fetch(`${base}/index.html`);
    const latest = await fetch(`${base}/?v=latest`);
    assert.equal(home.status, 200);
    assert.equal(latest.status, 200);
    assert.equal(await home.text(), await latest.text(), "the normal and version-query home URLs serve identical content");
    assert.match(home.headers.get("cache-control"), /no-cache.*no-store/i, "HTML responses prevent stale cache entries");
    const html = await (await fetch(`${base}/index.html`)).text();
    const asset = html.match(/href="(\/?assets\/css_[^" ]+\.css)"/)[1].replace(/^\//, "");
    const cachedAsset = await fetch(`${base}/${asset}`);
    assert.equal(cachedAsset.status, 200);
    assert.match(cachedAsset.headers.get("cache-control"), /max-age=31536000.*immutable/i,
      "content-hashed assets receive immutable cache headers");
    const missing = await fetch(`${base}/not-a-real-page`);
    assert.equal(missing.status, 404, "unknown paths return an HTTP 404 status");
    assert.match(await missing.text(), /couldn’t find that page/i, "unknown paths display the real 404 page");
    const topic = await fetch(`${base}/topic/basic-arithmetic`);
    assert.equal(topic.status, 200, "the clean topic URL serves its topic page");
    assert.match(await topic.text(), /Basic Arithmetic &amp; Number Skills/, "the clean topic URL serves the correct topic");
    const unknownTopic = await fetch(`${base}/topic/not-a-topic`);
    assert.equal(unknownTopic.status, 404, "an unknown topic slug returns a real HTTP 404");
    assert.match(await unknownTopic.text(), /couldn’t find that page/i, "unknown topic slugs use the real 404 page");
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
  console.log(`Build checks passed: ${htmlFiles.length} HTML pages, topic routes, cache headers, 404 page and hashed local assets.`);
} finally {
  fs.rmSync(output, { recursive: true, force: true });
}
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
