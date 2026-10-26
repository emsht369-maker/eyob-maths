"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-responsive-pages-"));
const topLevelPages = fs.readdirSync(root, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith(".html"))
  .map(entry => `/${entry.name}`);
const topicPages = fs.readdirSync(path.join(root, "topic"), { withFileTypes: true })
  .filter(entry => entry.isDirectory())
  .map(entry => `/topic/${entry.name}/`);
const viewports = [{ width: 412, height: 915 }, { width: 360, height: 640 }, { width: 768, height: 1024 }, { width: 1280, height: 900 }];

async function run() {
  const build = spawnSync(process.execPath, [path.join(root, "worker/build-site.mjs"), output], { encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  const server = await servePagesPreview(output);
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
    .find(candidate => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", error => errors.push(`${new URL(page.url()).pathname}: ${error.message}`));
  page.on("response", response => {
    if (response.url().startsWith(base) && response.status() >= 400) {
      errors.push(`${response.status()} ${new URL(response.url()).pathname}`);
    }
  });

  try {
    for (const route of [...topLevelPages, ...topicPages]) {
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
        await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
        await page.waitForTimeout(80);
        const width = await page.evaluate(() => ({
          viewport: window.innerWidth,
          document: document.documentElement.scrollWidth,
          title: document.title,
          undersizedButtons: [...document.querySelectorAll("button")]
            .filter(button => button.getClientRects().length && button.getBoundingClientRect().height < 44)
            .map(button => `${button.className || button.textContent.trim() || "button"} (${Math.round(button.getBoundingClientRect().height)}px)`),
          overlappingButtons: (() => {
            const buttons = [...document.querySelectorAll("button")].filter(button => button.getClientRects().length);
            const overlaps = [];
            for (let left = 0; left < buttons.length; left += 1) {
              const first = buttons[left].getBoundingClientRect();
              for (let right = left + 1; right < buttons.length; right += 1) {
                const second = buttons[right].getBoundingClientRect();
                const overlapWidth = Math.min(first.right, second.right) - Math.max(first.left, second.left);
                const overlapHeight = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
                const visible = first.bottom > 0 && second.bottom > 0 &&
                  first.top < innerHeight && second.top < innerHeight &&
                  first.right > 0 && second.right > 0 &&
                  first.left < innerWidth && second.left < innerWidth;
                if (visible && overlapWidth > 1 && overlapHeight > 1) {
                  overlaps.push(`${buttons[left].className || "button"}@${Math.round(first.left)},${Math.round(first.top)},${Math.round(first.right)},${Math.round(first.bottom)} / ${buttons[right].className || "button"}@${Math.round(second.left)},${Math.round(second.top)},${Math.round(second.right)},${Math.round(second.bottom)}`);
                }
              }
            }
            return overlaps;
          })()
        }));
        assert.ok(width.document <= width.viewport,
          `${route} overflows horizontally at ${viewport.width}px (${width.document}px)`);
        assert.ok(width.title, `${route} has no page title`);
        if (viewport.width <= 768) {
          assert.deepEqual(width.undersizedButtons, [],
            `${route} has mobile buttons below the 44px touch-target minimum: ${width.undersizedButtons.join(", ")}`);
          assert.deepEqual(width.overlappingButtons, [],
            `${route} has overlapping visible buttons at ${viewport.width}px: ${width.overlappingButtons.join(", ")}`);
        }
      }
    }
    assert.deepEqual(errors, [], `page-load errors found:\n${errors.join("\n")}`);
    console.log(`Responsive smoke checks passed for ${topLevelPages.length + topicPages.length} pages at 412px, 360px, 768px and 1280px.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(output, { recursive: true, force: true });
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
