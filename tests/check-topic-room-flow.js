"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-topic-flow-"));

async function run() {
  const build = spawnSync(process.execPath, [path.join(root, "worker/build-site.mjs"), output], { encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  const server = await servePagesPreview(output);
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
    .find(candidate => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  page.on("response", response => {
    if (response.url().startsWith(base) && response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
  });

  try {
    await page.goto(`${base}/topic/basic-arithmetic`, { waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-learn:not([hidden])").waitFor();
    assert.equal(await page.locator(".topic-section-tabs, #topic-mobile-section, .topic-sidebar").count(), 0,
      "the room does not show separate section tabs, a section picker, or a task sidebar");
    assert.equal(await page.locator("#room-tab-examples").count(), 0,
      "worked examples are part of the Learn step, not a separate destination");
    assert.equal(await page.locator("#room-tab-links[open]").count(), 0,
      "optional links stay collapsed in the room");
    assert.match(await page.locator("[data-topic-flow-label]").textContent(), /Room step 1 of 3/);

    const controls = page.locator(".topic-flow-controls");
    assert.equal(await controls.evaluate(element => getComputedStyle(element).position), "fixed",
      "Back and Next stay on screen while the learner scrolls");
    await controls.locator("[data-topic-next]").click();
    await page.locator("#room-tab-practice:not([hidden])").waitFor();
    assert.match(new URL(page.url()).hash, /#practice$/);
    assert.match(await page.locator(".practice-set-status").textContent(), /Question 1 of 35/);

    const firstQuestion = page.locator("#room-tab-practice .q").first();
    const initialPoints = Number((await page.locator("[data-topic-points]").textContent()).match(/\d+/)[0]);
    await firstQuestion.locator(".check-answer").click();
    assert.match(await page.locator(".practice-set-status").textContent(), /Question 1 of 35/,
      "an empty answer does not advance the room");
    const correctAnswer = (await firstQuestion.locator(".answer-value").textContent()).trim();
    await firstQuestion.locator(".answer-input").fill(correctAnswer);
    await firstQuestion.locator(".check-answer").click();
    await page.locator("[data-mm2-toast]").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("[data-mm2-toast]")?.textContent.includes("+10 points"));
    await page.waitForFunction(() => document.querySelector(".practice-set-status")?.textContent.includes("Question 2 of 35"));
    assert.equal(Number((await page.locator("[data-topic-points]").textContent()).match(/\d+/)[0]), initialPoints + 10,
      "a correct answer earns points once");
    assert.equal(await page.locator("#room-tab-practice .q .answer-input").evaluate(element => element === document.activeElement),
      true, "checking an answer moves focus to the next question");

    const nextQuestion = page.locator("#room-tab-practice .q").first();
    await nextQuestion.locator(".answer-input").fill("definitely not the answer");
    await nextQuestion.locator(".check-answer").click();
    await page.locator(".answer-feedback-toast.is-wrong").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector(".practice-set-status")?.textContent.includes("Question 3 of 35"));
    assert.equal(Number((await page.locator("[data-topic-points]").textContent()).match(/\d+/)[0]), initialPoints + 10,
      "an incorrect answer advances without awarding points");

    await controls.locator("[data-topic-next]").click();
    await page.locator("#room-tab-exam:not([hidden])").waitFor();
    assert.match(await page.locator("[data-topic-flow-label]").textContent(), /Room step 3 of 3/);
    assert.equal(new URL(page.url()).hash, "#hard-exam");
    await page.setViewportSize({ width: 360, height: 800 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "the room and fixed Next control fit on a phone");
    assert.ok(await controls.locator("[data-topic-next]").isVisible(),
      "the phone keeps its Next control visible");

    await page.addInitScript(() => localStorage.setItem("mathmaster-rooms", JSON.stringify({ practiceMode: true })));
    await page.goto(`${base}/topic/calculus`, { waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-learn:not([hidden])").waitFor();
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    await page.locator("#room-tab-practice:not([hidden]) [data-guided-path]").waitFor();
    assert.equal(await page.locator("#room-tab-learn [data-guided-path]").count(), 0,
      "the selected PDF questions are part of the practice step in this same room");
    assert.equal(await page.locator("#room-tab-learn #room-tab-links").count(), 1,
      "Calculus course papers are available in the Learn step");
    assert.equal(await page.evaluate(() => new Set(
      [...document.querySelectorAll("#room-tab-learn #room-tab-links a[href$='.pdf']")]
        .map(link => new URL(link.href).pathname)
    ).size), 36, "all 36 unique Calculus PDFs are directly linked from the room");
    assert.ok(await page.locator("#room-tab-learn #room-tab-links .resource-read[href$='.pdf']").count() > 0,
      "the Learn step provides reading actions for its Calculus PDFs");

    await page.evaluate(() => localStorage.setItem("mathmaster-rooms", JSON.stringify({ practiceMode: true })));
    await page.goto(`${base}/topic/linear-algebra`, { waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-learn:not([hidden])").waitFor();
    assert.ok(await page.locator("#room-tab-learn .learn-task-card h3").count() > 0,
      "the Linear Algebra room includes its topic-by-topic learning sections");
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    await page.locator("#room-tab-practice [data-guided-path]").waitFor();
    assert.match(await page.locator("#room-tab-practice .guided-topic-label").textContent(), /Topic: .+ · 0 of \d+ in this topic complete/,
      "each guided source question is labelled and reports its topic progress");
    assert.ok(await page.locator("#room-tab-learn .learn-task-card a[href*='.pdf']").count() > 0,
      "Linear Algebra topic lessons link to the related MIT notes pages");
    assert.match(await page.locator("#room-tab-practice .room-task-intro").textContent(), /instant feedback.+worked steps.+another round/,
      "every topic explains its question sets, feedback, answers and next practice round");

    assert.deepEqual(errors, [], errors.join("\n"));
    console.log("Single-room course flow passed: navigation, one-question progression, feedback, points, mobile layout and topic-organized PDF materials.");
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
