"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-room-rewards-"));

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
    await page.goto(`${base}/rooms.html?path=gcse`);
    await page.locator("#rooms-list .topic-section").first().waitFor();
    const numberGuidedRooms = await page.evaluate(() => {
      const section = [...document.querySelectorAll(".topic-section")]
        .find(item => item.querySelector("summary h3")?.textContent.trim() === "Number");
      return [...section.querySelectorAll(".room-card.is-guided .room-card-title")]
        .map(item => item.textContent.trim());
    });
    assert.deepEqual(numberGuidedRooms, [
      "Order of Operations (BIDMAS)",
      "Fractions: Add and Subtract",
      "Percentages of an Amount"
    ], "GCSE guided rooms appear first in their topic section in learning order.");
    await page.locator('[data-filter-group="status"][data-filter="open"]').click();
    assert.equal(await page.locator(".room-card").count(), 96,
      "Not started includes locked rooms while preserving their locked preview state.");
    assert.ok(await page.locator(".room-card.is-locked").count() > 0);
    await page.locator('[data-filter-group="status"][data-filter="all"]').click();

    await page.goto(`${base}/rooms.html?path=ml`);
    await page.locator("#rooms-list .topic-section").first().waitFor();
    const mlSectionOrder = await page.locator("#rooms-list .topic-section").evaluateAll(sections =>
      sections.map(section => Boolean(section.querySelector(".badge-optional")))
    );
    assert.equal(mlSectionOrder.slice(0, 12).some(Boolean), false, "The 12 ML core sections come first.");
    assert.equal(mlSectionOrder.slice(12).every(Boolean), true, "Further ML sections follow as optional sections.");

    await page.goto(`${base}/rooms.html#room=gcse-bidmas`);
    await page.locator("#room-view h1").filter({ hasText: "Order of Operations" }).waitFor({ state: "visible" });

    const room = await page.evaluate(() => window.ROOMS.find(item => item.id === "gcse-bidmas"));
    assert.equal(await page.locator("body").evaluate(element => element.classList.contains("rooms-room-open")), true,
      "Opening a GCSE room switches to the full-page room layout.");
    assert.equal(await page.locator("#rooms-list").isVisible(), false,
      "The room list is hidden while a full-page room is open.");
    assert.ok(await page.locator(".room-back-link").isVisible(), "The full-page room has a clear way back to the room list.");
    assert.equal(await page.locator("#room-view .room-task-accordion").count(), room.tasks.length,
      "Every learning task is available in the room accordion.");
    assert.equal(await page.locator("#room-view .room-task-accordion[open]").count(), 1,
      "Only the current learning task is expanded initially.");
    assert.equal(await page.locator("#room-view .room-task-accordion.is-locked").count(), room.tasks.length - 1,
      "Tasks after the current step are visibly locked.");
    assert.equal(await page.locator(".room-step-item").count(), room.tasks.length + 1,
      "The sidebar lists each task and the Hard Exam step.");
    assert.equal(await page.locator(".room-step-item>a[aria-current='step']").count(), 1,
      "The active task is announced in the sidebar.");
    assert.ok((await page.locator(".room-step-main").boundingBox()).width > 700,
      "The desktop learning content uses the full page beside the step sidebar.");
    assert.match(await page.locator(".room-next-locked").textContent(),/Answer this step to continue/,
      "The next-step control clearly stays locked until an answer is submitted.");
    for (let attempt = 0; attempt < 3; attempt += 1) {
      await page.locator(".room-next-locked").click();
      assert.equal(Number(await page.locator(".room-task-accordion.is-current .room-task").getAttribute("data-task-index")), 0,
        "Repeated Next clicks without an answer cannot leave the first task.");
    }
    await page.goto(`${base}/rooms.html#room=gcse-bidmas&step=1`);
    assert.equal(Number(await page.locator(".room-task-accordion.is-current .room-task").getAttribute("data-task-index")), 0,
      "Editing the room URL cannot bypass the unanswered-task lock.");
    await page.goto(`${base}/rooms.html#room=gcse-bidmas`);
    assert.equal(await page.locator('[data-task-answer="0-1"]').count(), 0,
      "The next question is locked until the current one is submitted.");
    await page.locator('[data-action="check-task"][data-task="0"][data-question="0"]').click();
    assert.equal(await page.locator('[data-task-answer="0-0"]').count(), 1,
      "A blank answer must not unlock the current question.");
    await page.locator('[data-task-answer="0-0"]').fill("not the answer");
    await page.locator('[data-action="check-task"][data-task="0"][data-question="0"]').click();
    await page.locator(".answer-feedback-toast.is-wrong").waitFor({ state: "visible" });
    assert.match(await page.locator(".answer-feedback-toast").textContent(),/Not correct yet\. No points earned/);
    assert.match(await page.locator(".room-step-feedback").textContent(),/Not correct yet\. No points earned/);
    assert.match(await page.locator(".room-earned-points").textContent(),/0 points earned/);
    const nextTaskIndex = room.tasks[0].questions.length > 1 ? 0 : 1;
    const nextQuestionIndex = room.tasks[0].questions.length > 1 ? 1 : 0;
    assert.equal(await page.locator(`[data-task-answer="${nextTaskIndex}-${nextQuestionIndex}"]`).count(), 1,
      "Submitting a wrong answer should still unlock the next question.");
    assert.equal(Number(await page.locator(".room-task-accordion.is-current .room-task").getAttribute("data-task-index")), nextTaskIndex,
      "The main view advances to the next available task step.");
    await page.reload();
    assert.equal(Number(await page.locator(".room-task-accordion.is-current .room-task").getAttribute("data-task-index")), nextTaskIndex,
      "Reload restores the current available task step.");
    if (nextTaskIndex === 1) {
      const nextStepLink = page.locator(".room-step-item>a[href$='&step=1']");
      assert.ok(await nextStepLink.isVisible(), "The newly unlocked task is available from the sidebar.");
      await nextStepLink.click();
      await page.waitForURL(/&step=1$/);
      assert.equal(Number(await page.locator(".room-task-accordion.is-current .room-task").getAttribute("data-task-index")), 1,
        "Selecting an unlocked step updates the full-page room view.");
      await page.reload();
      assert.equal(Number(await page.locator(".room-task-accordion.is-current .room-task").getAttribute("data-task-index")), 1,
        "Reload keeps the selected room step.");
      await page.goto(`${base}/rooms.html#room=gcse-bidmas`);
      await page.locator("#room-view h1").filter({ hasText: "Order of Operations" }).waitFor({ state: "visible" });
    }
    const firstStepState = await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-rooms")));
    assert.equal(firstStepState.points, 0, "A wrong answer should not earn points.");

    for (let taskIndex = 0; taskIndex < room.tasks.length; taskIndex += 1) {
      for (let questionIndex = 0; questionIndex < room.tasks[taskIndex].questions.length; questionIndex += 1) {
        if (taskIndex === 0 && questionIndex === 0) continue;
        const question = room.tasks[taskIndex].questions[questionIndex];
        const answer = typeof question.answer === "string" ? question.answer : String(question.answer);
        const input = page.locator(`[data-task-answer="${taskIndex}-${questionIndex}"]`);
        await input.fill(answer);
        await page.locator(`[data-action="check-task"][data-task="${taskIndex}"][data-question="${questionIndex}"]`).click();
      }
    }
    await page.locator("[data-mm2-toast]").waitFor({ state: "visible" });
    await page.waitForFunction(() => document.querySelector("[data-mm2-toast]")?.textContent.includes("+10 points"));
    assert.match(await page.locator("[data-mm2-toast]").textContent(), /\+10 points/);
    assert.match(await page.locator(".room-earned-points").textContent(),/\d+ points earned/,
      "The room header shows the updated total points after correct answers.");

    await page.locator('[data-action="start-exam"]').click();
    for (let questionIndex = 0; questionIndex < 25; questionIndex += 1) {
      const examQuestion = await page.evaluate(index => {
        const saved = JSON.parse(localStorage.getItem("mathmaster-rooms"));
        return saved.rooms["gcse-bidmas"].activeExam.questions[index];
      }, questionIndex);
      await page.locator("#exam-answer").fill(String(examQuestion.answer));
      await page.locator('[data-action="submit-exam-answer"]').click();
      if (questionIndex < 24) await page.locator('[data-action="exam-next"]').click();
    }
    await page.locator('[data-action="finish-exam"]').click();
    await page.locator(".room-completion-reward").waitFor({ state: "visible" });

    const reward = await page.locator(".room-completion-reward").innerText();
    assert.match(reward, /ROOM COMPLETE/);
    assert.match(reward, /Order of Operations.*completed!/);
    assert.match(reward, /\+\d+ points earned/);
    assert.match(reward, /EXAM PASS/i);
    assert.ok(await page.locator(".room-step-feedback").isVisible(), "Room steps provide visible answer feedback.");
    assert.ok((await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-rooms")).points)) > room.points,
      "Correct answers earn points in addition to the room-completion reward.");
    assert.equal(await page.evaluate(() =>
      JSON.parse(localStorage.getItem("mathmaster-rooms")).rooms["gcse-bidmas"].complete), true,
    "passing the room exam persists the completed state");

    const mobilePage = await browser.newPage({ viewport: { width: 375, height: 812 } });
    await mobilePage.goto(`${base}/rooms.html#room=gcse-bidmas`);
    await mobilePage.locator("#room-view h1").filter({ hasText: "Order of Operations" }).waitFor({ state: "visible" });
    const mobileLayout = await mobilePage.evaluate(() => ({
      viewport: innerWidth,
      document: document.documentElement.scrollWidth,
      stepsOverflow: document.querySelector(".room-sidebar ol").scrollWidth > document.querySelector(".room-sidebar ol").clientWidth,
      taskVisible: getComputedStyle(document.querySelector(".room-task")).display !== "none"
    }));
    assert.ok(mobileLayout.document <= mobileLayout.viewport, "The mobile room view has no horizontal page overflow.");
    assert.equal(mobileLayout.stepsOverflow, true, "Mobile task navigation scrolls horizontally inside its own selector.");
    assert.equal(mobileLayout.taskVisible, true, "The active task remains visible on mobile.");
    await mobilePage.close();

    console.log("Room reward Playwright check passed: tasks, perfect exam, completion badge and points.");
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
