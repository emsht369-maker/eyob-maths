"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-imported-room-"));

async function run() {
  const build = spawnSync(process.execPath, [path.join(root, "worker/build-site.mjs"), output], { encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  const server = await servePagesPreview(output);
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
    .find(candidate => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  await page.addInitScript(() => localStorage.setItem("mathmaster-rooms", JSON.stringify({ practiceMode: true })));
  const errors = [];
  const failedResponses = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
  });

  try {
    await page.goto(`${base}/topic/linear-algebra`, { waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-learn:not([hidden])").waitFor({ state: "visible" });
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    const guided = page.locator("#room-tab-practice [data-guided-path]");
    await guided.waitFor({ state: "visible" });
    const guidedCount = await page.evaluate(() => window.IMPORTED_QUESTIONS.filter(item =>
      item.topic === "linear-algebra" && item.confidence === "high" && item.verified === true &&
      item.answerSourceFile && item.answerSourcePage
    ).length);
    assert.match(await guided.locator(".guided-path-count").textContent(), new RegExp(`0 of ${guidedCount} questions completed`));
    assert.equal(await page.locator('#room-tab-learn .resource-groups a[href*=".pdf"]').count(), 0,
      "Linear Algebra PDFs are not shown as an ungrouped resource list");
    const firstGuidedId = await guided.locator("[data-guided-id]").getAttribute("data-guided-id");
    const expectedAnswer = await page.evaluate(id => {
      const item = window.IMPORTED_QUESTIONS.find(question => question.id === id);
      return item.finalAnswer || item.answerText;
    }, firstGuidedId);
    await guided.locator("[data-guided-answer]").fill("not the answer");
    await guided.locator("[data-guided-check]").click();
    await guided.locator(".guided-path-feedback.is-wrong").waitFor({ state: "visible" });
    assert.equal(await guided.locator("[data-guided-next]").count(), 0,
      "an incorrect answer does not unlock the next question");
    await guided.locator("[data-guided-answer]").fill(expectedAnswer);
    await guided.locator("[data-guided-check]").click();
    await guided.locator(".guided-path-feedback.is-correct").waitFor({ state: "visible" });
    assert.equal(await guided.locator("[data-guided-next]").count(), 1,
      "a correct answer earns a green reward and unlocks the next question");
    assert.equal(await guided.locator(".mm-question-final").isVisible(), true,
      "the final answer is available after the correct answer");
    assert.equal(await guided.locator(".mm-question-steps").isVisible(), true,
      "the worked-answer section is available after the correct answer");
    await guided.locator("[data-guided-next]").click();
    assert.notEqual(await guided.locator("[data-guided-id]").getAttribute("data-guided-id"), firstGuidedId,
      "the next question opens in the same Practice step");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-practice [data-guided-path] [data-guided-id]").waitFor({ state: "visible" });
    assert.notEqual(await page.locator("#room-tab-practice [data-guided-path] [data-guided-id]").getAttribute("data-guided-id"), firstGuidedId,
      "guided progress resumes at the next unlocked question after reload");
    await page.setViewportSize({ width: 360, height: 800 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "the guided Linear Algebra lesson fits a 360px phone screen");
    await page.setViewportSize({ width: 1280, height: 900 });

    assert.equal(await page.locator("#room-tab-practice .q .ai-tutor").count(), 1,
      "every topic's current generated practice question can expose its contextual AI helper");
    assert.equal(await page.locator("#room-tab-practice [data-imported-station]").count(), 0,
      "source questions cannot be freely browsed outside the guided path");
    assert.equal(await page.locator("#room-tab-exam [data-guided-entry]").count(), 0,
      "guided paper questions stay in the Practice step instead of being duplicated in the challenge");
    assert.equal(await page.locator("#room-tab-practice iframe[src*='.pdf']").count(), 0,
      "the Practice panel does not embed source PDFs");
    assert.ok(await page.locator("#room-tab-learn .resource-groups > .resource-group").count() >= 5,
      "Linear Algebra PDFs are organized by topic");
    assert.ok(await page.locator("#room-tab-learn .learn-task-card a[href*='.pdf']").count() > 0,
      "topic lessons link directly to the related MIT notes pages");
    assert.equal(await page.locator(".room-panel iframe[src*='.pdf']").count(), 0,
      "Linear Algebra source PDFs open as optional links rather than interrupting the room");

    await page.setViewportSize({ width: 360, height: 800 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "the guided learning page does not overflow horizontally on mobile");
    assert.deepEqual(errors, [], errors.join("\n"));
    assert.deepEqual(failedResponses, [], failedResponses.join("\n"));
    console.log("Linear Algebra guided path passed: gated answers, saved progress, topic-grouped PDFs, and 360px layout.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
    fs.rmSync(output, { recursive: true, force: true });
  }
}

run().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
