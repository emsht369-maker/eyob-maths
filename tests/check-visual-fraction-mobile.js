"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("./node_modules/playwright-core");

const root = path.resolve(__dirname, "..");
const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".svg": "image/svg+xml" };
function serve() {
  const server = http.createServer((request, response) => {
    const file = path.resolve(root, `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`);
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    fs.readFile(file, (error, content) => {
      if (error) return response.writeHead(404).end();
      response.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" });
      response.end(content);
    });
  });
  return new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", () => resolve(server));
  });
}

async function run() {
  const executablePath = [process.env.CHROME_BIN, "/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/chromium-browser"]
    .find(candidate => candidate && fs.existsSync(candidate));
  assert.ok(executablePath, "No local Chromium executable was found.");
  const server = await serve();
  const browser = await chromium.launch({ executablePath, headless: true, args: ["--no-sandbox"] });
  const base = `http://127.0.0.1:${server.address().port}`;
  const cases = [
    { width: 375, touch: false }, { width: 375, touch: true },
    { width: 768, touch: false }, { width: 768, touch: true }
  ];
  try {
    for (const test of cases) {
      const context = await browser.newContext({
        viewport: { width: test.width, height: 820 },
        isMobile: test.touch,
        hasTouch: test.touch,
        deviceScaleFactor: 1
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", error => errors.push(error.message));
      await page.goto(`${base}/visual.html`);
      await page.waitForFunction(() => window.VISUAL_READY === true);

      await page.locator("#visual-area").selectOption("Fractions");
      await page.locator("#visual-skill").selectOption("shade-fraction");
      await page.locator("#visual-diagram [data-shade-part]").first().waitFor({ state: "visible" });
      assert.match(new URL(page.url()).pathname, /\/visual\.html$/, `${test.width}px: changing to the fraction model stays in Visual Lab`);
      const part = page.locator('#visual-diagram [data-shade-part="0"]');
      await part.scrollIntoViewIfNeeded();
      if (test.touch) await part.tap();
      else await part.click();
      assert.ok(await page.locator("#visual-click-answer").getAttribute("data-value"),
        `${test.width}px ${test.touch ? "touch" : "pointer"}: fraction model accepts an interaction`);

      await page.locator("#visual-same-type").click();
      await page.locator("#visual-diagram [data-shade-part]").first().waitFor({ state: "visible" });
      assert.match(new URL(page.url()).pathname, /\/visual\.html$/, `${test.width}px: changing fraction questions stays in Visual Lab`);
      const keyboardPart = page.locator('#visual-diagram [data-shade-part="0"]');
      await keyboardPart.focus();
      await page.keyboard.press("Enter");
      assert.ok(await page.locator("#visual-click-answer").getAttribute("data-value"), "fraction controls remain keyboard accessible");
      assert.deepEqual(errors, [], `${test.width}px: no browser JavaScript errors`);
      console.log(`Visual Lab fraction selection and input passed at ${test.width}px (${test.touch ? "touch" : "pointer"}).`);
      await context.close();
    }
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
