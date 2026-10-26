"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("./node_modules/playwright-core");
const root = path.resolve(__dirname, "..");
const consoleErrors = [];

function serve() {
  const server = http.createServer((request, response) => {
    let file = path.resolve(root, `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`);
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, "index.html");
    fs.readFile(file, (error, content) => {
      const status = error ? 404 : 200;
      if (error) content = fs.readFileSync(path.join(root, "404.html"));
      const type = path.extname(file) === ".css" ? "text/css" :
        path.extname(file) === ".js" ? "text/javascript" :
        path.extname(file) === ".svg" ? "image/svg+xml" : "text/html";
      response.writeHead(status, { "Content-Type": type });
      response.end(content);
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function openPage(browser, base, name) {
  const page = await browser.newPage();
  page.on("console", message => { if (message.type() === "error") consoleErrors.push(`${name}: ${message.text()}`); });
  page.on("pageerror", error => consoleErrors.push(`${name}: ${error.message}`));
  page.on("response", response => {
    if (response.status() >= 400) consoleErrors.push(`${name}: HTTP ${response.status()} ${response.url()}`);
  });
  await page.goto(`${base}/${name}`);
  return page;
}

async function run() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
    .find(candidate => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    let page = await openPage(browser, base, "index.html");
    await page.locator(".topic-open").first().click();
    await page.waitForURL(/\/topic\/basic-arithmetic/);
    assert.strictEqual(await page.locator("dialog").count(), 0, "topics open as pages, not modal dialogs");
    await page.locator("#room-tab-button-practice").click();
    await page.locator("#room-tab-practice .ai-tutor").first().waitFor({ state: "visible" });
    assert.strictEqual(await page.locator("#room-tab-exam .ai-tutor").count(), 0, "topic hard-exam questions do not get AI panels");
    await page.close();

    page = await openPage(browser, base, "gcse.html");
    await page.locator("#topic-list .gcse-topic").first().click();
    await page.locator(".gcse-step-next").click();
    await page.waitForURL(/&step=practice-0$/);
    await page.locator('.gcse-question[data-question-type="practice"] .ai-tutor').waitFor({ state: "attached" });
    assert.strictEqual(await page.locator('.gcse-question[data-question-type="exam"] .ai-tutor').count(), 0, "GCSE exam questions do not get AI panels");
    await page.close();

    page = await openPage(browser, base, "questions.html");
    await page.locator("#qb-start").click();
    await page.locator("#qb-practice-question .ai-tutor").waitFor({ state: "attached" });
    await page.locator("#qb-exam-start").click();
    await page.locator("#qb-exam-panel:not([hidden])").waitFor({ state: "visible" });
    assert.strictEqual(await page.locator("#qb-exam-panel .ai-tutor").count(), 0, "timed exam questions do not get AI panels");
    const examCount=await page.evaluate(()=>JSON.parse(localStorage.getItem("mathmaster-gcse-bank")).activeTimedExam.queue.length);
    for(let index=0;index<examCount;index+=1){
      await page.locator("[data-exam-response]").fill("attempted answer");
      await page.locator("[data-exam-mark]").fill("0");
      await page.locator("[data-submit-exam-question]").click();
      if(index<examCount-1)await page.locator("[data-exam-next]").click();
    }
    await page.locator("#qb-submit-exam").click();
    await page.locator("#qb-exam-results .qb-wrong .ai-tutor").first().waitFor({ state: "attached" });
    await page.close();

    page = await openPage(browser, base, "gcse-mock.html");
    await page.waitForLoadState("networkidle");
    await page.locator("#mock-start").click();
    await page.locator("#mock-submit").waitFor({ state: "attached" });
    assert.strictEqual(await page.locator("#mock-paper .ai-tutor").count(), 0, "running mocks have no AI panels");
    await page.locator("#mock-submit").click();
    await page.locator("#mock-results .ai-tutor").first().waitFor({ state: "attached" });
    await page.close();

    page = await openPage(browser, base, "visual.html");
    await page.locator(".visual-question-card .ai-tutor").waitFor({ state: "attached" });
    await page.locator("#visual-start-exam").click();
    assert.strictEqual(await page.locator(".visual-question-card .ai-tutor").count(), 0, "starting a timed test removes the practice tutor");
    page.once("dialog", dialog => dialog.accept());
    await page.locator("#visual-finish-exam").click();
    await page.waitForFunction(() => document.querySelector("#visual-exam-review")?.hidden === false);
    await page.locator("#visual-exam-review-list .ai-tutor").first().waitFor({ state: "attached" });
    await page.close();

    page = await openPage(browser, base, "rooms.html");
    assert.strictEqual(await page.locator("[data-ai-global]").count(), 1, "the global tutor is available outside question banks");
    await page.locator("#rooms-list .room-card.is-locked").first().waitFor({ state: "attached" });
    await page.locator("#rooms-list .room-card.is-locked .room-preview-link").first().click();
    await page.locator("#room-view .room-question-preview").first().waitFor({ state: "attached" });
    assert.strictEqual(await page.locator("#room-view .ai-tutor").count(), 0, "locked-room previews do not get AI panels");
    assert.strictEqual(await page.locator("#rooms-list").isVisible(), false, "locked room previews also use the full-page layout");
    await page.locator(".room-back-link").click();
    await page.locator("#rooms-list").waitFor({ state: "visible" });
    await page.locator("#rooms-list .room-card:not(.is-locked) [data-room-link]").first().click();
    await page.waitForFunction(() => location.hash === "#room=gcse-bidmas");
    await page.locator('#room-view h1').filter({ hasText: "Order of Operations" }).waitFor({ state: "visible" });
    assert.strictEqual(await page.locator("#room-view .room-question").count() > 0, true,
      "clicking Open room should render the first available room and its tasks");
    await page.waitForFunction(() => document.querySelector("#room-view").getBoundingClientRect().top < window.innerHeight,
      null, { timeout: 4000 });
    for (const [id, title, count] of [["ml-matrix-vectors", "Matrices and Vectors", 4], ["ml-linear-regression", "Linear Regression", 3], ["ml-gradient-descent", "Gradient Descent", 5]]) {
      await page.locator(".room-back-link").click();
      await page.locator("#rooms-list").waitFor({ state: "visible" });
      await page.locator(`#rooms-list [data-room-link="${id}"]`).click();
      await page.locator("#room-view h1", { hasText: title }).waitFor({ state: "visible" });
      assert.strictEqual(await page.locator("#room-view .visual-map-card a").count(), count,
        `${title} should show its topic-matched visuals`);
    }
    console.log("AI integration checks passed, including the four-room ML path.");
    await page.close();

    page = await openPage(browser, base, "courses.html");
    assert.strictEqual(await page.locator("[data-ai-global]").count(), 1, "students can ask maths questions from the course roadmap");
    await page.locator('.roadmap-card[data-index="2"] .course-actions > .secondary-link').click();
    await page.waitForURL(/\/topic\/algebra\?from=courses&topic=Algebra/);
    await page.locator("#topic-mount .room-header h1").waitFor({state:"visible"});
    assert.match(await page.locator("#topic-mount .room-header h1").textContent(),/Algebra/,
      "a course button opens its selected topic even when earlier topics are locked");
    assert.strictEqual(await page.locator("#topic-mount .topic-locked-notice").count(),0,
      "the course button does not stop at the earlier-topic lock notice");
    await page.close();

    page = await openPage(browser, base, "courses.html");
    const generalPayloads=[];
    await page.route("**/api/tutor", async route=>{
      generalPayloads.push(JSON.parse(route.request().postData()));
      const text="Use the same operation on both sides. For $a$, write x² and ½.";
      await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,text,provider:"Mock"})});
    });
    await page.locator(".ai-tutor-launcher").click();
    const questionBox=page.locator(".ai-tutor-dock-panel textarea[aria-label='Ask the AI Tutor a maths question']");
    assert.strictEqual(await page.locator(".ai-tutor-dock-panel .ai-tutor-chat-messages").getAttribute("aria-live"),"polite");
    assert.strictEqual(await page.locator(".ai-tutor-dock-panel .ai-tutor-buttons").count(),0,"the global chat has no mode buttons");
    assert.strictEqual(await page.locator(".ai-tutor-dock-panel form").count(),0,"the global chat never relies on form submission");
    await questionBox.fill("Make me a practice question about linear equations.");
    await questionBox.press("Enter");
    await page.locator(".ai-tutor-dock-panel .ai-tutor-chat-message.is-assistant").waitFor({state:"visible"});
    assert.strictEqual(generalPayloads[0].studentQuestion,"Make me a practice question about linear equations.");
    assert.strictEqual(generalPayloads[0].mode,"ask");
    assert.strictEqual(Object.hasOwn(generalPayloads[0],"correctAnswer"),false,"the global chat never sends an answer field");
    const shown=await page.locator(".ai-tutor-dock-panel .ai-tutor-chat-message.is-assistant").last().innerText();
    assert.ok(!shown.includes("$")&&!/\\(?:frac|\(|\[)/.test(shown),"chat formats maths without visible LaTeX");
    const listBox=await page.locator(".ai-tutor-chat-messages").boundingBox();
    const composerBox=await page.locator(".ai-tutor-chat-composer").boundingBox();
    assert.ok(listBox.y+listBox.height<=composerBox.y,"the composer stays beneath the scrollable conversation");
    assert.strictEqual(await page.locator(".ai-tutor-chat-messages .ai-tutor-chat-message").count(),2,"the chat shows the learner and tutor turns");
    await page.close();

    page = await openPage(browser, base, "papers.html");
    await page.waitForFunction(() => document.querySelector("#paper-load-status")?.textContent.startsWith("Ready:"));
    assert.strictEqual(await page.locator("[data-ai-global]").count(), 1, "the global tutor appears on practice papers");
    assert.strictEqual(await page.locator("#paper-mode-choice input[value=untimed]").isChecked(), true, "papers start in untimed tutor-supported practice mode");
    assert.strictEqual(await page.locator("#paper-duration-wrap").isVisible(), false, "untimed practice hides the time limit");
    await page.locator("#paper-start").click();
    await page.locator(".paper-question .ai-tutor").first().waitFor({ state: "attached" });
    const expectedAnswer = await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-paper-active")).questions[0].answer);
    const savedDeadline = await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-paper-active")).deadline);
    await page.locator("[data-paper-response='0']").fill(expectedAnswer);
    await page.reload();
    await page.waitForFunction(() => document.querySelector("#paper-load-status")?.textContent.startsWith("Ready:"));
    assert.strictEqual(await page.locator("[data-paper-response='0']").inputValue(), expectedAnswer, "untimed response autosaves across refresh");
    const paperQuestionCount = await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-paper-active")).questions.length);
    assert.strictEqual(await page.locator(".paper-question .ai-tutor").count(), paperQuestionCount, "untimed restored practice keeps tutor access");
    page.once("dialog", dialog => dialog.accept());
    await page.locator("#paper-submit").click();
    await page.locator(".paper-student-response").first().waitFor({ state: "attached" });
    assert.ok((await page.locator(".paper-student-response").first().textContent()).includes(expectedAnswer),
      "paper review keeps the student's work after re-rendering");
    assert.ok(Number(await page.locator("[data-awarded-mark='0']").inputValue()) > 0, "a stored exact answer gets its automatic mark");
    assert.strictEqual(savedDeadline, 0, "untimed papers have no countdown deadline");
    await page.locator(".paper-question.is-review .ai-tutor").first().waitFor({ state: "attached" });
    await page.close();

    page = await openPage(browser, base, "papers.html");
    await page.waitForFunction(() => document.querySelector("#paper-load-status")?.textContent.startsWith("Ready:"));
    await page.locator("#paper-mode-choice input[value=timed]").check();
    await page.locator("#paper-duration").selectOption("30");
    await page.locator("#paper-start").click();
    await page.locator(".paper-question").first().waitFor({ state: "attached" });
    assert.strictEqual(await page.locator(".paper-question .ai-tutor").count(), 0, "timed papers do not show tutors before submission");
    const timedState = await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-paper-active")));
    await page.locator("[data-paper-response='0']").fill("saved timed answer");
    await page.waitForTimeout(1200);
    await page.reload();
    await page.waitForFunction(() => document.querySelector("#paper-load-status")?.textContent.startsWith("Ready:"));
    assert.strictEqual(await page.locator("[data-paper-response='0']").inputValue(), "saved timed answer", "timed response autosaves across refresh");
    assert.strictEqual(await page.locator(".paper-question .ai-tutor").count(), 0, "a restored timed paper still blocks tutors");
    assert.strictEqual(await page.evaluate(() => document.body.dataset.paperActive), "true", "a restored timed paper keeps its active lock");
    assert.strictEqual(await page.evaluate(() => JSON.parse(localStorage.getItem("mathmaster-paper-active")).deadline), timedState.deadline,
      "the absolute timer deadline survives refresh");
    assert.ok((await page.locator("#paper-clock").textContent()).includes("Time:"), "the timer renders after refresh");
    assert.deepStrictEqual(consoleErrors, [], `learning pages should not log console errors: ${consoleErrors.join(" | ")}`);
    await page.close();

    page = await browser.newPage();
    page.on("console", message => { if (message.type() === "error") consoleErrors.push(`papers fallback: ${message.text()}`); });
    page.on("pageerror", error => consoleErrors.push(`papers fallback: ${error.message}`));
    await page.route("**/js/gcse/index.js", route => route.abort());
    await page.goto(`${base}/papers.html`);
    await page.waitForFunction(() => document.querySelector("#paper-load-fallback")?.hidden === false);
    assert.ok((await page.locator("#paper-load-status").textContent()).includes("Could not load"), "question-bank errors show a useful message");
    await page.close();
    console.log("AI and paper tutor checks passed for global questions and timed/untimed paper flows.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
