"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-topic-pages-"));

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
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  page.on("pageerror", error => errors.push(error.message));

  try {
    await page.goto(`${base}/index.html#topics`);
    await page.locator("#grid .topic-open").first().waitFor({ state: "visible" });
    await page.locator("#grid .topic-open").first().click();
    await page.waitForURL(/\/topic\/basic-arithmetic\/?(?:#learn)?$/);
    await page.locator("#topic-mount .room-header h1").waitFor({ state: "visible" });
    assert.equal(await page.locator("dialog").count(), 0, "topic navigation does not use a dialog");
    assert.equal(await page.locator(".topic-section-tabs, .topic-sidebar, #topic-mobile-section").count(), 0,
      "the room does not split learning, practice and links across tabs or a sidebar");
    assert.equal(await page.locator(".topic-flow-controls").isVisible(), true,
      "the room keeps its Back and Next controls visible");
    assert.ok(await page.locator(".topic-page-shell > .room-content").evaluate(element =>
      element.getBoundingClientRect().width > 920), "desktop topic content uses the available page width");
    assert.match(await page.title(), /Basic Arithmetic & Number Skills/);

    await page.screenshot({ path: path.join(output, "topic-basic-arithmetic-1280.png") });
    await page.setViewportSize({ width: 375, height: 812 });
    assert.equal(await page.locator(".topic-flow-controls").isVisible(), true, "mobile keeps Next navigation visible");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true,
      "mobile topic page has no horizontal page overflow");
    assert.equal(await page.evaluate(() => [...document.querySelectorAll(".topic-page button")]
      .filter(button => button.getClientRects().length)
      .every(button => button.getBoundingClientRect().height >= 44)), true,
    "visible mobile buttons meet the 44px touch-target minimum");
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    await page.locator("#room-tab-practice:not([hidden])").waitFor({ state: "visible" });
    await page.locator("#room-tab-practice .q .ai-tutor").waitFor({ state: "visible" });
    assert.equal(await page.locator("#room-tab-practice .q .ai-tutor").count(), 1,
      "mobile practice puts AI help under its active question");
    await page.screenshot({ path: path.join(output, "topic-basic-arithmetic-375.png") });
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    assert.equal(new URL(page.url()).hash, "#hard-exam", "Next opens the challenge and updates the deep link");
    await page.locator("#room-tab-exam:not([hidden])").waitFor({ state: "visible" });
    await page.locator(".topic-flow-controls [data-topic-back]").click();
    await page.locator("#room-tab-practice:not([hidden])").waitFor({ state: "visible" });
    await page.locator(".topic-flow-controls [data-topic-back]").click();
    await page.locator("#room-tab-learn:not([hidden])").waitFor({ state: "visible" });
    await page.setViewportSize({ width: 768, height: 900 });
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth), true,
      "tablet topic page has no horizontal page overflow");
    await page.setViewportSize({ width: 1280, height: 900 });

    await page.locator('#room-tab-learn details.topic-flow-extra:has(input[data-s="0-0"]) > summary').click();
    await page.locator('#room-tab-learn input[data-s="0-0"]').check();
    assert.match(await page.locator(".room-progress-copy strong").textContent(), /^1\/13 learning goals$/);
    await page.reload();
    assert.equal(await page.locator('#room-tab-learn input[data-s="0-0"]').isChecked(), true,
      "learning-goal completion is restored after reload");

    await page.locator(".topic-flow-controls [data-topic-next]").click();
    assert.equal(new URL(page.url()).hash, "#practice", "Practice updates the deep-link hash");
    await page.reload();
    await page.locator("#room-tab-practice:not([hidden])").waitFor({ state: "visible" });

    const firstQuestion = page.locator("#room-tab-practice .q").first();
    const initialPoints = Number((await page.locator("[data-topic-points]").textContent()).match(/\d+/)[0]);
    const firstStatus = await page.locator(".practice-set-status").textContent();
    await firstQuestion.locator(".check-answer").click();
    assert.equal(await page.locator(".practice-set-status").textContent(), firstStatus,
      "an unanswered practice question does not unlock the next question");
    assert.equal(await page.locator("#room-tab-practice .practice-question-review").count(), 0,
      "an unanswered practice question is not recorded as attempted");
    assert.match(await page.locator("#room-tab-practice .practice-question-locked").textContent(),
      /more questions ready after this answer/i);
    const answer = (await firstQuestion.locator(".answer-value").textContent()).trim();
    const answerInput = firstQuestion.locator(".answer-input");
    await answerInput.fill(answer);
    await firstQuestion.locator(".check-answer").click();
    await page.locator("[data-mm2-toast]").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("[data-mm2-toast]")?.textContent.includes("+10 points"));
    assert.match(await page.locator("[data-mm2-toast]").textContent(), /\+10 points/,
      "A correct answer shows an in-page points toast.");
    const completedQuestion=page.locator("#room-tab-practice .practice-question-review").first();
    const completedText=await completedQuestion.evaluate(element=>element.textContent);
    assert.match(completedText,/Correct!/);
    assert.match(completedText,/\+10 points earned/);
    assert.match(completedText,new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),
      "submitted practice answers are retained in the completed-step review");
    assert.equal(Number((await page.locator("[data-topic-points]").textContent()).match(/\d+/)[0]), initialPoints + 10,
      "the topic header updates its points total when a correct answer earns points");
    await page.reload();
    const restoredReview=page.locator("#room-tab-practice .practice-question-review").first();
    const restoredText=await restoredReview.evaluate(element=>element.textContent);
    assert.match(restoredText,/Correct!/);
    assert.match(restoredText,new RegExp(answer.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")),
      "submitted practice answers are restored after reload");
    const nextQuestion=page.locator("#room-tab-practice .q").first();
    await nextQuestion.locator(".answer-input").fill("not the right answer");
    await nextQuestion.locator(".check-answer").click();
    await page.locator(".answer-feedback-toast.is-wrong").waitFor({ state: "visible" });
    assert.match(await page.locator(".answer-feedback-toast").textContent(),/Not correct yet\. No points earned/,
      "An incorrect answer shows an in-page toast without points.");
    const incorrectReview=page.locator("#room-tab-practice .practice-question-review").nth(1);
    assert.match(await incorrectReview.evaluate(element=>element.textContent),/Not correct yet\. No points earned/);
    assert.equal(Number((await page.locator("[data-topic-points]").textContent()).match(/\d+/)[0]), initialPoints + 10,
      "incorrect answers do not increase the topic-header points total");
    await page.reload();
    const restoredQuestion=page.locator("#room-tab-practice .q").first();
    await restoredQuestion.locator(".answer-input").fill("student working is preserved");

    await page.locator(".ai-tutor-launcher").click();
    await page.locator(".ai-tutor-dock-panel").waitFor({ state: "visible" });
    await page.locator(".ai-tutor-close").click();
    assert.match(page.url(), /#practice$/, "opening and closing the tutor keeps the topic and section");
    assert.equal(await restoredQuestion.locator(".answer-input").inputValue(), "student working is preserved",
      "using the tutor does not lose the student's answer");

    await page.goBack();
    await page.waitForURL(/\/index\.html#topics$/);
    const restoredScroll = await page.evaluate(() => window.scrollY);
    assert.ok(restoredScroll > 0, "Back restores the topic-list scroll position");

    const unknownTopic = await fetch(`${base}/topic/not-a-topic`);
    assert.equal(unknownTopic.status, 404, "unknown topic URLs return an HTTP 404");
    assert.match(await unknownTopic.text(), /couldn’t find that page/i);

    for (const [hash, panel] of [["examples", "learn"], ["hard-exam", "exam"], ["links", "learn"]]) {
      await page.goto(`${base}/topic/basic-arithmetic#${hash}`);
      await page.locator(`#room-tab-${panel}:not([hidden])`).waitFor({ state: "visible" });
    }

    await page.goto(`${base}/topic/algebra`);
    await page.locator(".topic-locked-notice").waitFor({ state: "visible" });
    assert.match(await page.locator(".topic-locked-notice").textContent(), /locked/i);
    await page.goto(`${base}/index.html#topics`);
    page.once("dialog", dialog => dialog.accept());
    await page.locator("#topic-practice-mode").check();
    await page.goto(`${base}/topic/algebra`);
    await page.locator("#topic-mount .room-header h1").waitFor({ state: "visible" });
    assert.equal(await page.locator(".topic-locked-notice").count(), 0, "Practice mode unlocks the direct topic URL");

    await page.goto(`${base}/topic.html?id=basic-arithmetic#practice`);
    await page.waitForURL(/\/topic\/basic-arithmetic#practice$/);
    await page.locator("#room-tab-practice:not([hidden])").waitFor({ state: "visible" });

    await page.goto(`${base}/topic/sequences-and-series#examples`);
    await page.locator("#room-tab-learn:not([hidden])").waitFor({ state: "visible" });
    const sequenceExample = page.locator("#room-tab-learn .worked-example")
      .filter({ hasText: "Find the 12th term of 4, 9, 14" }).first();
    await sequenceExample.locator("summary").click();
    assert.match(await page.locator("#topic-mount .room-header h1").textContent(), /Sequences & Series/);
    assert.match(await sequenceExample.textContent(), /4 \+ 55 = 59/);
    assert.equal(await page.locator("#room-tab-learn .worked-example summary")
      .evaluateAll(summaries => summaries.every(summary => /^Example \d+:/.test(summary.textContent))),
    true, "worked examples use consistent numbered labels");

    assert.deepEqual(errors, [], `topic pages emitted browser errors:\n${errors.join("\n")}`);
    console.log("Topic page Playwright checks passed at 375px, 768px and 1280px; screenshots refreshed.");
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
