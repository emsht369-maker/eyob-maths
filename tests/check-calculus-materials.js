"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { chromium } = require("./node_modules/playwright-core");
const servePagesPreview = require("./serve-pages-preview");

const root = path.resolve(__dirname, "..");
const output = fs.mkdtempSync(path.join(os.tmpdir(), "math-master-calculus-materials-"));

async function run() {
  let server;
  let browser;
  try {
    const build = spawnSync(process.execPath, [path.join(root, "worker/build-site.mjs"), output], { encoding: "utf8" });
    assert.equal(build.status, 0, build.stderr || build.stdout);

    const inventory = JSON.parse(fs.readFileSync(path.join(root, "data/calculus-pdf-inventory.json"), "utf8"));
    assert.equal(inventory.uniqueFiles, 36, "all unique calculus PDFs are recorded");
    assert.equal(inventory.sourceCopies, 49, "the inventory accounts for every supplied PDF copy");
    assert.equal(inventory.duplicatesCollapsed, 13, "duplicate copies are identified instead of republished");
    for (const item of inventory.resources) {
      assert.ok(fs.existsSync(path.join(output, "assets/mit-calculus", item.file)), `${item.file} is included in the site build`);
    }
    assert.ok(fs.existsSync(path.join(output, "vendor/pdfjs/build/pdf.min.js")), "the PDF reader library is included in the site build");
    assert.ok(fs.existsSync(path.join(output, "vendor/pdfjs/build/pdf.worker.min.js")), "the PDF reader worker is included in the site build");

    server = await servePagesPreview(output);
    const base = `http://127.0.0.1:${server.address().port}`;
    const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
      .find(candidate => fs.existsSync(candidate));
    browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const tutorRequests = [];
    await page.route("**/api/tutor", async route => {
      const payload = JSON.parse(route.request().postData() || "{}");
      tutorRequests.push(payload);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(payload.mode === "similar"
          ? { ok: true, text: "For the matrix in part (a), find its nullspace using different entries.", answer: "The nullspace is the zero vector." }
          : { ok: true, text: `The key idea is to isolate one variable at a time. Reply ${tutorRequests.length}.` })
      });
    });
    await page.addInitScript(() => localStorage.setItem("mathmaster-rooms", JSON.stringify({ practiceMode: true })));
    const errors = [];
    page.on("pageerror", error => errors.push(error.message));

    await page.goto(`${base}/topic/calculus`, { waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-learn:not([hidden])").waitFor({ state: "visible" });
    await page.setViewportSize({ width: 412, height: 915 });
    await page.locator(".site-menu-more > summary").click();
    for (const href of ["/rooms.html", "/courses.html", "/gcse.html", "/questions.html"]) {
      assert.equal(await page.locator(`.site-menu-submenu a[href="${href}"]`).isVisible(), true,
        `the mobile navigation drawer includes ${href}`);
    }
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
      "the mobile navigation drawer has no horizontal page overflow");
    await page.locator(".site-menu-more > summary").click();
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    const failedResponses = [];
    page.on("response", response => {
      if (response.status() >= 400) failedResponses.push(`${response.status()} ${response.url()}`);
    });
    const guided = page.locator("#room-tab-practice [data-guided-path]");
    await guided.waitFor({ state: "visible" });
    assert.match(await guided.locator(".guided-path-count").textContent(), /0 of 11 questions completed/);
    assert.equal(await page.locator("#room-tab-learn #room-tab-links").count(), 1,
      "the Learn step keeps its study-resource library in the room flow");
    assert.equal(await page.evaluate(() => new Set(
      [...document.querySelectorAll("#room-tab-learn #room-tab-links a[href$='.pdf']")]
        .map(link => new URL(link.href).pathname)
    ).size), 36, "the Learn step exposes all 36 unique Calculus PDFs as direct links");
    assert.ok(await page.locator("#room-tab-learn #room-tab-links .resource-read[href$='.pdf']").count() > 0,
      "the Learn step provides reading actions for its Calculus PDFs");
    const firstGuidedId = await guided.locator("[data-guided-id]").getAttribute("data-guided-id");
    const guidedAnswer = await page.evaluate(id => {
      const item = window.IMPORTED_QUESTIONS.find(question => question.id === id);
      return item.finalAnswer || item.answerText;
    }, firstGuidedId);
    await guided.locator("[data-guided-answer]").fill("not the answer");
    await guided.locator("[data-guided-check]").click();
    await guided.locator(".guided-path-feedback.is-wrong").waitFor({ state: "visible" });
    assert.equal(await guided.locator("[data-guided-next]").count(), 0,
      "an incorrect answer keeps the next Calculus question locked");
    await guided.locator("[data-guided-answer]").fill(guidedAnswer);
    await guided.locator("[data-guided-check]").click();
    await guided.locator(".guided-path-feedback.is-correct").waitFor({ state: "visible" });
    assert.equal(await guided.locator("[data-guided-next]").count(), 1,
      "a correct Calculus answer unlocks the next question");
    await guided.locator("[data-guided-next]").click();
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#room-tab-practice [data-guided-path] [data-guided-id]").waitFor({ state: "visible" });
    assert.notEqual(await page.locator("#room-tab-practice [data-guided-path] [data-guided-id]").getAttribute("data-guided-id"), firstGuidedId,
      "Calculus guided progress resumes after reload");
    await page.setViewportSize({ width: 360, height: 800 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "the guided Calculus room fits a 360px phone screen");
    await page.setViewportSize({ width: 1280, height: 900 });

    assert.equal(await page.locator("#room-tab-practice [data-imported-station]").count(), 0,
      "source questions cannot be freely browsed outside the guided path");
    assert.equal(await page.locator("#room-tab-exam [data-guided-entry]").count(), 0,
      "guided paper questions are not duplicated in the challenge step");
    assert.equal(await page.locator("#room-tab-practice iframe[src*='.pdf']").count(), 0,
      "the Practice panel does not embed source PDFs");
    await page.screenshot({ path: path.join(os.tmpdir(), "math-master-calculus-desktop.png") });

    assert.equal(await page.locator("#room-tab-learn .resource-group").count() >= 4, true,
      "the PDF library is organized into course-material categories");
    assert.equal(await page.evaluate(() => new Set(
      [...document.querySelectorAll("#room-tab-learn #room-tab-links a[href$='.pdf']")]
        .map(link => new URL(link.href).pathname)
    ).size), 36, "all Calculus PDFs remain available in the Learn step");
    assert.equal(await page.locator("#room-tab-practice .resource-title[href$='.pdf']").count(), 0,
      "the Learn-step PDF library is not duplicated in Practice");
    const paper = await fetch(`${base}/assets/mit-calculus/MIT18_01SC_pset3prb.pdf`);
    assert.equal(paper.status, 200, "a problem PDF opens from the published build");
    const paperBytes = new Uint8Array(await paper.arrayBuffer());
    assert.equal(new TextDecoder().decode(paperBytes.slice(0, 5)), "%PDF-", "the resource is a readable PDF file");

    await page.setViewportSize({ width: 360, height: 800 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      "the room and its Calculus PDF library fit a narrow mobile screen");
    await page.locator(".topic-flow-controls [data-topic-next]").click();
    await page.locator("#room-tab-exam:not([hidden])").waitFor({ state: "visible" });
    assert.equal(await page.locator("#room-tab-exam .topic-exam-paper").count(), 5,
      "all five full Calculus exam papers are prominent in the Challenge step");
    assert.equal(await page.locator("#room-tab-exam .topic-exam-paper a").count(), 10,
      "each full Calculus exam offers clearly labelled question and solution PDFs");
    await page.locator("#room-tab-exam .topic-exam-paper a").first().click();
    await page.locator("#mm-pdf-reader[open]").waitFor({ state: "visible" });
    await page.locator(".mm-pdf-page canvas").first().waitFor({ state: "visible", timeout: 20000 });
    assert.ok(await page.locator(".mm-pdf-page canvas").first().evaluate(canvas => canvas.width > 0),
      "the full exam paper renders at readable width in the built-in PDF reader");
    for (const viewport of [{ width: 412, height: 915 }, { width: 360, height: 640 }, { width: 768, height: 1024 }]) {
      await page.setViewportSize(viewport);
      await page.waitForFunction(width => innerWidth === width, viewport.width);
      await page.waitForTimeout(150);
      const layout = await page.evaluate(() => {
        const reader = document.querySelector("#mm-pdf-reader");
        const viewer = reader.querySelector(".mm-pdf-pages");
        const canvas = viewer.querySelector("canvas");
        const toolbar = [...reader.querySelectorAll(".mm-pdf-toolbar > button, .mm-pdf-toolbar > label")];
        const footerButtons = [...reader.querySelectorAll(".mm-pdf-reading-actions button:not([hidden])")];
        return {
          viewportHeight: innerHeight,
          dialog: reader.getBoundingClientRect().toJSON(),
          viewerHeight: viewer.getBoundingClientRect().height,
          canvasWidth: canvas?.getBoundingClientRect().width || 0,
          viewerWidth: viewer.clientWidth,
          tutorOpen: reader.querySelector(".mm-pdf-ai").open,
          toolbarRowHeight: Math.max(...toolbar.map(control => control.getBoundingClientRect().top)) -
            Math.min(...toolbar.map(control => control.getBoundingClientRect().top)),
          footerRowHeight: Math.max(...footerButtons.map(control => control.getBoundingClientRect().top)) -
            Math.min(...footerButtons.map(control => control.getBoundingClientRect().top)),
          nestedPdfScrollers: [...reader.querySelectorAll("*")].filter(element =>
            element !== viewer && getComputedStyle(element).overflowY === "auto" && element.scrollHeight > element.clientHeight
          ).length,
          horizontalOverflow: document.documentElement.scrollWidth > innerWidth,
          shortButtonHeights: [...reader.querySelectorAll("button:not([hidden])")]
            .filter(button => button.getClientRects().length)
            .map(button => button.getBoundingClientRect().height).filter(height => height < 44)
        };
      });
      assert.ok(layout.dialog.width >= viewport.width * .9 && layout.dialog.height >= viewport.height * .9,
        `the reader fills the ${viewport.width}×${viewport.height} viewport`);
      assert.ok(layout.viewerHeight > 0 && layout.canvasWidth >= layout.viewerWidth * .85,
        `the PDF is fit to the available width at ${viewport.width}px`);
      assert.equal(layout.tutorOpen, false, "the PDF tutor starts collapsed so it does not shrink the page");
      assert.ok(layout.nestedPdfScrollers <= 1, "PDF pages have one vertical scrolling container");
      assert.equal(layout.horizontalOverflow, false, `the page has no horizontal overflow at ${viewport.width}px`);
      assert.deepEqual(layout.shortButtonHeights, [], `all PDF reader buttons are at least 44px tall at ${viewport.width}px`);
      if (viewport.width <= 600) {
        assert.ok(layout.toolbarRowHeight < 6, `phone PDF controls fit on a single row (measured ${layout.toolbarRowHeight}px at ${viewport.width}px)`);
        assert.ok(layout.footerRowHeight < 4, "phone reading actions fit on a single row");
      }
    }
    await page.setViewportSize({ width: 412, height: 915 });
    await page.locator("#mm-pdf-reader .mm-pdf-ai > summary").click();
    await page.locator(".mm-pdf-ai[open]").waitFor();
    await page.locator("[data-pdf-ai] .ai-tutor-buttons button").first().waitFor({ state: "visible" });
    assert.deepEqual(await page.locator("[data-pdf-ai] .ai-tutor-buttons button").allTextContents(), [
      "Teach me the idea", "Give me a hint", "Check my working", "Similar question", "Ask a question"
    ], "the PDF tutor keeps its five guided-help actions");
    assert.ok(await page.locator(".mm-pdf-ai").evaluate(element =>
      element.getBoundingClientRect().height <= window.innerHeight * .45
    ), "the expanded PDF tutor is a bottom sheet no taller than 45dvh");
    assert.equal(await page.locator("[data-pdf-ai] h4").isHidden(), true, "the contextual tutor has no duplicate guided-help subheading");
    await page.locator("[data-pdf-ai] .ai-tutor-buttons button").first().click();
    await page.locator("[data-pdf-ai] .ai-tutor-answer:not([hidden])").waitFor();
    assert.equal(tutorRequests.length, 1, "the selected tutor action makes one page-context request");
    assert.equal(tutorRequests[0].pdfStudy, true);
    assert.match(tutorRequests[0].resourceTitle, /Exam 1.*Questions/);
    assert.match(tutorRequests[0].question, /Page 1:/);
    assert.match(tutorRequests[0].question, /Resource: Exam 1.*Questions/);
    assert.match(tutorRequests[0].topic, /Calculus/i);
    assert.equal(await page.locator("[data-pdf-ai] .ai-tutor-buttons").evaluate(element => element.classList.contains("has-answer")),
      true, "the five tutor actions become a horizontally scrollable chip row after an answer");
    assert.ok(await page.locator("[data-pdf-ai] .ai-tutor-copy").isVisible(), "Copy remains available below the answer in the scrollable sheet body");
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false,
      "the expanded tutor sheet does not cause horizontal page scrolling at 412px");
    await page.evaluate(() => {
      const viewer = document.querySelector(".mm-pdf-pages");
      const secondPage = viewer.querySelector('[data-pdf-page-container="2"]');
      viewer.scrollTo({ top: secondPage.offsetTop, behavior: "instant" });
    });
    await page.waitForFunction(() => /^Using page 2 of \d+$/.test(document.querySelector("[data-pdf-ai-page]").textContent));
    await page.locator("[data-pdf-ai] .ai-tutor-buttons button").first().click();
    await page.waitForFunction(() => document.querySelector("[data-pdf-ai] .ai-tutor-answer").textContent.endsWith("Reply 2."));
    assert.equal(tutorRequests.length, 2, "changing PDF pages refreshes the tutor context");
    assert.match(tutorRequests[1].question, /Page 1:/, "the tutor request includes the previous page");
    assert.match(tutorRequests[1].question, /Page 2:/, `the tutor request includes the current page (${tutorRequests[1].question})`);
    await page.locator("[data-pdf-ai] .ai-tutor-buttons button", { hasText: "Similar question" }).click();
    await page.locator("[data-pdf-ai] .ai-tutor-similar-answer:not([hidden])").waitFor();
    assert.equal(tutorRequests[2].mode, "similar", "Similar question sends the page context in one click");
    assert.equal(await page.locator("[data-pdf-ai] .ai-tutor-similar-answer").evaluate(element => element.open),
      false, "the generated question's answer starts hidden");
    await page.locator("[data-pdf-ai] .ai-tutor-similar-answer summary").click();
    assert.equal(await page.locator("[data-pdf-ai] .ai-tutor-similar-answer p").textContent(), "The nullspace is the zero vector.");
    await page.locator("[data-pdf-ai] .ai-tutor-buttons button", { hasText: "Check my working" }).click();
    const working = page.locator("[data-pdf-ai] textarea[aria-label='Your working or attempt']");
    await working.waitFor({ state: "visible" });
    await working.fill("First I write Ax = 0.");
    await page.locator("[data-pdf-ai] [data-ai-check-submit]").click();
    await page.waitForFunction(() => document.querySelector("[data-pdf-ai] .ai-tutor-answer").textContent.endsWith("Reply 4."));
    assert.equal(tutorRequests[3].mode, "check");
    assert.equal(tutorRequests[3].studentWorking, "First I write Ax = 0.");
    await page.locator("[data-pdf-ai] .ai-tutor-buttons button", { hasText: "Ask a question" }).click();
    const questionInput = page.locator("[data-pdf-ai] textarea[aria-label='Ask the AI Tutor a maths question']");
    await questionInput.waitFor({ state: "visible" });
    await questionInput.fill("What does nullspace mean in part (a)?");
    await page.locator("[data-pdf-ai] [data-ai-ask-submit]").click();
    await page.waitForFunction(() => document.querySelector("[data-pdf-ai] .ai-tutor-answer").textContent.endsWith("Reply 5."));
    assert.equal(tutorRequests[4].mode, "ask");
    assert.equal(tutorRequests[4].studentQuestion, "What does nullspace mean in part (a)?");
    await page.locator("#mm-pdf-reader .mm-pdf-ai > summary").click();
    const fittedWidth = await page.locator(".mm-pdf-page canvas").first().evaluate(canvas => canvas.getBoundingClientRect().width);
    await page.locator("[data-pdf-zoom-in]").click();
    await page.waitForFunction(width => document.querySelector(".mm-pdf-page canvas")?.getBoundingClientRect().width > width, fittedWidth);
    await page.locator("[data-pdf-fit]").click();
    await page.waitForFunction(width => Math.abs(document.querySelector(".mm-pdf-page canvas")?.getBoundingClientRect().width - width) < 2, fittedWidth);
    assert.equal(await page.locator("[data-pdf-solutions]").isVisible(), true,
      "the reader keeps the paired solutions action beside the reading controls");
    assert.equal(await page.locator("[data-pdf-next-file]").isDisabled(), true,
      "the next paper stays locked until the current paper is marked as read");
    await page.locator("[data-pdf-finish]").click();
    await page.waitForFunction(() => !document.querySelector("[data-pdf-next-file]")?.disabled);
    await page.locator("[data-mm2-toast]").waitFor({ state: "visible" });
    await page.locator(".mm-pdf-close").click();
    await page.screenshot({ path: path.join(os.tmpdir(), "math-master-calculus-mobile.png") });
    assert.deepEqual(errors, [], errors.join("\n"));
    assert.deepEqual(failedResponses, [], failedResponses.join("\n"));
    console.log("Calculus guided path passed: 36 source PDFs retained in the build, 11 reviewed questions, saved progress, no student-facing PDFs, and 360px layout.");
  } finally {
    if (browser) await browser.close();
    if (server) await new Promise(resolve => server.close(resolve));
    fs.rmSync(output, { recursive: true, force: true });
  }
}

run().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
