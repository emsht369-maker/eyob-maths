"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const vm = require("node:vm");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-gcse-steps-"));
const gcseEngine = fs.readFileSync(path.join(root, "js/gcse/engine.js"), "utf8");
const checkerStart = gcseEngine.indexOf("  function normalizedAnswer(value){");
const checkerEnd = gcseEngine.indexOf("\n  function isQuestionOpen(", checkerStart);
assert.ok(checkerStart >= 0 && checkerEnd > checkerStart, "Could not locate the GCSE answer checker.");
const checkerContext = vm.createContext({});
vm.runInContext(gcseEngine.slice(checkerStart, checkerEnd), checkerContext, { filename: "GCSE answer checker" });
const isGCSEAnswerCorrect = vm.runInContext("isGCSEAnswerCorrect", checkerContext);
assert.equal(isGCSEAnswerCorrect("25%", "25"), false, "A percent answer must not equal the same whole-number value.");
assert.equal(isGCSEAnswerCorrect("25%", "0.25"), true, "Equivalent percent and decimal answers should match.");

async function run() {
  const build = spawnSync(process.execPath, [path.join(root, "worker/build-site.mjs"), output], { encoding: "utf8" });
  assert.equal(build.status, 0, build.stderr || build.stdout);
  const server = await servePagesPreview(output);
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
    .find(candidate => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });

  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.goto(`${base}/gcse.html`);
    await page.locator("#topic-list [data-topic]").first().waitFor({ state: "visible" });
    await page.locator("#topic-list [data-topic]").first().click();
    await page.locator("#topic-view .gcse-current-step h2").waitFor({ state: "visible" });

    const topic = await page.evaluate(() => window.GCSE[0]);
    const topicTitle = await page.locator(".gcse-topic-header h1").textContent();
    assert.equal(await page.locator(".gcse-current-step h2").textContent(), `Learn · ${topicTitle}`,
      "A GCSE topic opens at its Learn step.");
    assert.equal(await page.locator(".gcse-current-step").count(), 1,
      "Only one learning step is shown in the main panel.");
    assert.equal(await page.locator(".gcse-topic-sidebar .gcse-step-item").count(),
      topic.practice.length + topic.exam.length + 2, "The sidebar lists Learn, every practice/exam question, and Links.");
    assert.equal(await page.locator('.gcse-topic-sidebar [data-gcse-step="links"]').count(), 0,
      "Study links remain locked until all questions are attempted.");
    assert.equal(await page.locator(".gcse-topic-sidebar a[aria-current=step]").getAttribute("data-gcse-step"),
      "learn", "The current step is exposed accessibly.");
    assert.equal(await page.locator('.gcse-topic-sidebar [data-gcse-step="practice-0"]').count(), 0,
      "Practice stays locked until the learner completes the Learn step.");

    await page.locator(".gcse-step-next").click();
    await page.waitForURL(/&step=practice-0$/);
    assert.equal(await page.locator(".gcse-current-step h2").textContent(),
      `Practice · Question 1 of ${topic.practice.length}`);
    assert.equal(await page.locator(".gcse-topic-sidebar [aria-current=step]").getAttribute("data-gcse-step"),
      "practice-0", "Starting practice marks the Learn step complete and opens the first question.");
    assert.equal(await page.locator(".gcse-question-locked").count(), 0,
      "The first practice question is open.");
    assert.ok(await page.locator('.gcse-step-item.is-locked [aria-disabled="true"]').count() > 0,
      "Future questions remain locked.");
    await page.locator(".gcse-answer-input").fill("");
    const blankSubmit = page.locator('[data-check-gcse-answer],[data-self-mark]').first();
    await blankSubmit.click();
    assert.match(page.url(), /&step=practice-0$/,
      "Submitting a blank GCSE response does not advance to the next question.");
    assert.equal(await page.evaluate(() => Object.keys(JSON.parse(localStorage.getItem("mathmaster-gcse")).answers).length), 0,
      "A blank GCSE response is not saved as an attempt.");
    await page.locator(".gcse-answer-input").fill("attempted, not correct");
    const practiceWrongMark = page.locator('[data-self-mark="wrong"]');
    if (await practiceWrongMark.count()) await practiceWrongMark.click();
    else await page.locator("[data-check-gcse-answer]").click();
    await page.waitForURL(/&step=practice-1$/);
    await page.locator(".answer-feedback-toast.is-wrong").waitFor({ state: "visible" });
    assert.equal(await page.locator(".gcse-current-step h2").textContent(),
      `Practice · Question 2 of ${topic.practice.length}`,
      "Submitting any non-empty answer advances one step.");
    assert.match(await page.locator(".gcse-topic-main > .gcse-mark-feedback").textContent(),
      /Not correct yet\. No points earned/,"An incorrect answer is clearly identified after step advancement.");
    assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-gcse")).points), 0,
      "An incorrect answer unlocks the next step without earning points.");
    await page.locator(".gcse-answer-input").fill("correct answer");
    const selfMarkCorrect = page.locator('[data-self-mark="correct"]');
    if (await selfMarkCorrect.count()) await selfMarkCorrect.click();
    else {
      const correctAnswer = await page.evaluate(() => window.GCSE[0].practice[1].a);
      await page.locator(".gcse-answer-input").fill(String(correctAnswer));
      await page.locator("[data-check-gcse-answer]").click();
    }
    await page.waitForURL(/&step=practice-2$/);
    await page.locator(".answer-feedback-toast.is-correct").waitFor({ state: "visible" });
    assert.match(await page.locator(".answer-feedback-toast").textContent(),/Correct! \+10 points earned/);
    assert.match(await page.locator(".gcse-topic-main > .gcse-mark-feedback").textContent(),
      /Correct! \+10 points earned/,"A correct answer announces its points reward.");
    assert.match(await page.locator(".gcse-topic-progress").textContent(),/⭐ 10 points/,
      "The current topic header displays the updated points total.");
    assert.match(await page.locator("#gcse-points-count").textContent(),/10 points earned/,
      "The GCSE progress header displays the updated points total.");
    await page.reload();
    assert.equal(await page.locator(".gcse-current-step h2").textContent(),
      `Practice · Question 3 of ${topic.practice.length}`,
      "Reload preserves the selected question step.");
    assert.equal(await page.locator(".gcse-topic-sidebar a[aria-current=step]").getAttribute("data-gcse-step"),
      "practice-2", "The sidebar restores the current step.");

    await page.locator('.gcse-topic-sidebar a[data-gcse-step="practice-0"]').click();
    assert.equal(await page.locator(".gcse-question-reviewed").count(), 1,
      "Completed questions can be revisited as review steps.");
    await page.locator('.gcse-topic-sidebar a[data-gcse-step="practice-1"]').click();
    await page.goBack();
    await page.waitForURL(/\/gcse\.html$/);
    assert.equal(await page.locator("#topic-view").isHidden(), true,
      "Browser Back returns from the topic to the GCSE topic list.");
    await page.locator("#topic-list [data-topic]").first().click();
    assert.equal(await page.locator(".gcse-current-step h2").textContent(),
      `Practice · Question 2 of ${topic.practice.length}`,
      "Reopening a GCSE topic restores the previously selected step.");

    const seededAttempts = await page.evaluate(() => {
      const topic = window.GCSE[0], state = JSON.parse(localStorage.getItem("mathmaster-gcse"));
      for (const [index] of topic.practice.entries()) {
        const key = `${topic.id}:practice:${index}`;
        state.answers[key] ||= { topicId: topic.id, attempted: true, response: "practice attempt", right: 0, wrong: 1 };
        state.answers[key].attempted = true;
      }
      state.currentSteps[topic.id] = "exam-0";
      localStorage.setItem("mathmaster-gcse", JSON.stringify(state));
      return Object.keys(state.answers).filter(key => key.startsWith(`${topic.id}:practice:`)).length;
    });
    assert.equal(seededAttempts, topic.practice.length, "All practice attempts are seeded for the exam gate check.");
    await page.goto(`${base}/index.html`);
    await page.goto(`${base}/gcse.html#topic=${encodeURIComponent(topic.id)}&step=exam-0`);
    await page.locator(".gcse-current-step h2").waitFor({ state: "visible" });
    assert.match(await page.locator(".gcse-current-step h2").textContent(), /^Exam · Question 1 of /,
      "Exam opens after every practice answer has been attempted.");
    assert.equal(await page.locator(".gcse-topic-sidebar a[aria-current=step]").getAttribute("data-gcse-step"),
      "exam-0", "Direct step links restore the selected exam question.");
    await page.locator(".gcse-answer-input").fill("exam attempt");
    const examWrongMark = page.locator('[data-self-mark="wrong"]');
    if (await examWrongMark.count()) await examWrongMark.click();
    else {
      await page.locator(".gcse-answer-input").fill("definitely incorrect");
      await page.locator("[data-check-gcse-answer]").click();
    }
    await page.waitForURL(/&step=exam-1$/);
    assert.match(await page.locator(".gcse-current-step h2").textContent(), /^Exam · Question 2 of /,
      "Exam questions unlock sequentially after submission.");

    await page.setViewportSize({ width: 375, height: 812 });
    const mobile = await page.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      sidebarVisible: getComputedStyle(document.querySelector(".gcse-topic-sidebar")).display !== "none",
      selectorOverflow: document.querySelector(".gcse-topic-sidebar ol").scrollWidth > document.querySelector(".gcse-topic-sidebar ol").clientWidth
    }));
    assert.ok(mobile.document <= mobile.viewport, "The GCSE topic has no horizontal page overflow on mobile.");
    assert.equal(mobile.sidebarVisible, true, "Mobile keeps a compact sticky step selector.");
    assert.equal(mobile.selectorOverflow, true, "The mobile steps scroll inside the selector, not the page.");
    await page.goto(`${base}/gcse.html#topic=${encodeURIComponent(topic.id)}&step=learn`);
    await page.locator(".gcse-step-next").waitFor({ state: "visible" });
    await page.locator(".ai-tutor-launcher").waitFor({ state: "visible" });
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const mobileControls = await page.evaluate(() => {
      const next = document.querySelector(".gcse-step-next");
      const tutor = document.querySelector(".ai-tutor-launcher");
      const nextRect = next.getBoundingClientRect(), tutorRect = tutor.getBoundingClientRect();
      return {
        nextVisible: nextRect.top < innerHeight && nextRect.bottom > 0,
        tutorVisible: tutorRect.top < innerHeight && tutorRect.bottom > 0,
        tutorWidth: tutorRect.width,
        tutorHeight: tutorRect.height,
        nextWidth: nextRect.width,
        nextHeight: nextRect.height,
        overlap: nextRect.left < tutorRect.right && nextRect.right > tutorRect.left &&
          nextRect.top < tutorRect.bottom && nextRect.bottom > tutorRect.top
      };
    });
    assert.equal(mobileControls.nextVisible, true, "The mobile Next button remains visible at the end of the step.");
    assert.equal(mobileControls.tutorVisible, true, "The floating tutor button remains visible on mobile.");
    assert.ok(mobileControls.tutorWidth <= 52 && mobileControls.tutorHeight <= 52,
      "The mobile tutor launcher stays a compact icon.");
    assert.ok(mobileControls.nextWidth < 200 && mobileControls.nextHeight >= 44,
      "The mobile GCSE step navigation is compact and touch accessible.");
    assert.equal(mobileControls.overlap, false, "The mobile Next button no longer overlaps the Ask maths tutor button.");
    await page.setViewportSize({ width: 768, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true,
      "The tablet topic page has no horizontal overflow.");

    console.log("GCSE topic step check passed: sequential unlocks, review, reload, deep links and mobile selector.");
    await page.close();
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
