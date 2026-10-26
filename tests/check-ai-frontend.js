"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("./node_modules/playwright-core");
const root = path.resolve(__dirname, "..");
const MIME = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml" };

function serve() {
  const server = http.createServer((request, response) => {
    const file = path.resolve(root, `.${decodeURIComponent(new URL(request.url, "http://localhost").pathname)}`);
    if (!file.startsWith(root + path.sep)) return response.writeHead(403).end();
    fs.readFile(file, (error, content) => {
      if (error) return response.writeHead(404).end();
      response.writeHead(200, { "Content-Type": MIME[path.extname(file)] || "application/octet-stream" });
      response.end(content);
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function boot(page, base, enabled = true) {
  await page.route("**/js/ai/config.js", route => {
    const source = fs.readFileSync(path.join(root, "js/ai/config.js"), "utf8");
    const configured = source
      .replace("const AI_ENABLED = true;", `const AI_ENABLED = ${enabled};`)
      .replace(/WORKER_URL: "[^"]+"/, 'WORKER_URL: "http://localhost:8000"');
    return route.fulfill({ status: 200, contentType: "text/javascript", body: configured });
  });
  await page.goto(`${base}/index.html`);
  await page.waitForFunction(() => document.querySelectorAll("#today-questions .today-question").length === 3);
  assert.strictEqual(await page.locator(".pathway-card").count(), 2, "home offers two clear study paths");
  assert.strictEqual(await page.locator(".pathway-gcse .pathway-link").getAttribute("href"), "gcse.html",
    "the GCSE path opens GCSE study");
  assert.strictEqual(await page.locator(".pathway-ml .pathway-link").getAttribute("href"), "index.html?path=ml-fast#topics",
    "the ML path opens the focused ML roadmap");
  assert.strictEqual(await page.locator("#next-step-flow").isVisible(), false,
    "the general ML next step stays out of the path chooser");
  assert.strictEqual(await page.locator("#ai-settings").count(), 0, "students do not configure the Worker URL");
  assert.strictEqual(await page.locator("#rnd, #rq").count(), 0, "home has only one quick-question section");
  assert.strictEqual(await page.locator(".feature-grid").count(), 0, "home omits the three marketing cards");
  assert.strictEqual(await page.locator("#consts, #syms").count(), 0, "constants and symbols moved out of the home page");
  assert.strictEqual(await page.locator("#today-plan li").count(), 3, "the home page shows one three-part daily plan");
  assert.deepStrictEqual(await page.locator("#today-plan li strong").allTextContents(), ["20 minutes:", "30 minutes:", "10 minutes:"],
    "the daily plan is 20/30/10 minutes");
  assert.strictEqual(await page.locator("#topic-practice-mode").isVisible(), true, "all-topics practice mode is clear on the home page");
  assert.strictEqual(await page.locator("#today-questions .wolfram-question-link").evaluateAll(links =>
    links.every(link => link.closest(".explanation") && link.closest(".explanation").hidden)), true,
  "home-page Wolfram links only appear inside the hidden Explain content");
  assert.strictEqual(await page.locator("#today-questions .today-question").count(), 3, "the home page selects three quick questions");
  assert.strictEqual(await page.locator("#today-questions .today-question small").evaluateAll(nodes =>
    new Set(nodes.map(node => node.textContent.split("·").at(-1).trim())).size), 3,
  "the daily quick questions come from three different skills");
  await page.keyboard.press("Tab");
  assert.strictEqual(await page.evaluate(() => document.activeElement.classList.contains("skip-link")), true,
    "keyboard users can reach the skip link first");
  if (enabled) {
    await page.locator("[data-ai-global] .ai-tutor-launcher").click();
    assert.strictEqual(await page.locator("[data-ai-global] textarea[aria-label='Ask the AI Tutor a maths question']").isVisible(), true,
      "the global tutor shows its question box as soon as it opens");
    assert.strictEqual(await page.locator("[data-ai-global] .ai-tutor-send").isVisible(), true,
      "the global tutor shows its chat send button beside the input");
    await page.locator("[data-ai-global] .ai-tutor-close").click();
    assert.strictEqual(await page.locator("[data-ai-global] .ai-tutor-dock-panel").isHidden(), true,
      "the Close button closes the global tutor");
  }
  await page.goto(`${base}/index.html?path=ml-fast#topics`);
  await page.waitForFunction(() => document.querySelector("#next-step-flow")?.hidden === false);
  assert.strictEqual(await page.locator("#topic-practice-mode").isChecked(), false,
    "the ML path leaves the global practice-mode setting unchanged");
  assert.strictEqual(await page.evaluate(() => window.TOPIC_LOCKS_API.readRoomProgress(localStorage).practiceMode), false,
    "the ML path does not change saved practice mode");
  assert.strictEqual(await page.locator("#grid .card:not(.locked-card)").count(),
    await page.evaluate(() => TOPICS.filter(topic => topic[2] === "core").length),
    "the ML path shows every core topic as available");
  assert.strictEqual(await page.locator("#next-topic-title").textContent(), "Basic Arithmetic & Number Skills",
    "the ML path recommends the first core topic");
  await page.evaluate(() => {
    document.body.innerHTML = `<main><article id="question"></article><section id="qb-exam-panel" hidden><button id="qb-submit-exam">Submit</button></section><button id="mock-submit" hidden>Finish</button><section id="visual-exam-panel" hidden><div id="visual-exam-review" hidden></div></section></main>`;
    localStorage.clear();
  });
  await page.evaluate(() => {
    window.requestCount = 0;
    window.requestPayloads = [];
    window.__blocked = false;
    window.fetch = async (_url, options) => {
      window.requestCount += 1;
      const payload = JSON.parse(options.body);
      window.requestPayloads.push(payload);
      const text = payload.mode === "similar"
        ? "Question: What is 6 × 7?\nANSWER: 42\nSTEPS: Multiply 6 by 7."
        : "<script>window.injected = true</script>\nA helpful answer.";
      return new Response(JSON.stringify({ ok: true, text, provider: "Mock" }), { status: 200 });
    };
    localStorage.setItem("mathmaster-ai", JSON.stringify({
      workerUrl: "http://localhost:8000",
      usage: { date: new Date().toISOString().slice(0, 10), count: 0 }
    }));
  });
}

async function attach(page, options = {}) {
  await page.evaluate(({ blocked }) => { window.__blocked = Boolean(blocked); }, options);
  return page.evaluate(({ roomLocked }) => window.AITutor.attach(document.querySelector("#question"), {
    question: "What is 4 + 5?",
    correctAnswer: "9",
    topic: "Arithmetic",
    isBlocked: () => window.__blocked,
    roomLocked
  }), options);
}

async function run() {
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"]
    .find(candidate => fs.existsSync(candidate));
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    const page = await browser.newPage();
    await boot(page, base);
    await attach(page, { roomLocked: true });
    assert.strictEqual(await page.locator(".ai-tutor").count(), 0, "locked rooms have no tutor panel");
    await attach(page, { blocked: true });
    assert.strictEqual(await page.locator(".ai-tutor").count(), 0, "blocked test contexts have no tutor panel");
    await page.evaluate(() => {
      document.body.dataset.page = "mock";
      document.querySelector("#mock-submit").hidden = false;
    });
    await attach(page);
    assert.strictEqual(await page.locator(".ai-tutor").count(), 0, "a running mock has no tutor panel");
    await page.evaluate(() => {
      document.body.dataset.page = "";
      document.querySelector("#mock-submit").hidden = true;
      document.querySelector("#qb-exam-panel").hidden = false;
    });
    await attach(page);
    assert.strictEqual(await page.locator(".ai-tutor").count(), 0, "a running timed Question Bank exam has no tutor panel");
    await page.evaluate(() => {
      document.querySelector("#qb-exam-panel").hidden = true;
      document.querySelector("#visual-exam-panel").hidden = false;
    });
    await attach(page);
    assert.strictEqual(await page.locator(".ai-tutor").count(), 0, "a running Visual Lab test has no tutor panel");
    await page.evaluate(() => { document.querySelector("#visual-exam-panel").hidden = true; });
    await attach(page);
    assert.strictEqual(await page.locator(".ai-tutor").count(), 1, "practice contexts show the tutor panel");
    await page.locator(".ai-tutor-buttons button", { hasText: "Teach me the idea" }).click();
    await page.locator(".ai-tutor-answer").waitFor({ state: "visible" });
    assert.strictEqual(await page.evaluate(() => window.injected), undefined, "AI HTML is not executed");
    assert.ok((await page.locator(".ai-tutor-answer").textContent()).includes("<script>"), "AI HTML is shown as plain text");
    assert.strictEqual(await page.evaluate(() => window.requestCount), 1);
    assert.strictEqual(await page.evaluate(() => Object.hasOwn(window.requestPayloads[0], "correctAnswer")), false,
      "the page's stored answer is never sent to the AI");
    await page.evaluate(() => { window.__blocked = true; });
    await page.locator(".ai-tutor-buttons button", { hasText: "Give me a hint" }).click();
    assert.strictEqual(await page.evaluate(() => window.requestCount), 1, "an already-open panel cannot send after a test starts");
    assert.ok((await page.locator(".ai-tutor-status").last().textContent()).includes("off during a test"));
    await page.evaluate(() => { window.__blocked = false; });

    await page.evaluate(() => {
      localStorage.setItem("mathmaster-ai", JSON.stringify({
        workerUrl: "http://localhost:8000",
        usage: { date: new Date().toISOString().slice(0, 10), count: 30 }
      }));
    });
    await page.locator(".ai-tutor-buttons button", { hasText: "Give me a hint" }).click();
    await page.locator(".ai-tutor-answer").waitFor({ state: "visible" });
    await page.waitForFunction(() => window.requestCount === 2);
    assert.strictEqual(await page.evaluate(() => window.requestCount), 2, "a saved legacy usage count does not block tutor requests");

    await page.evaluate(() => {
      localStorage.setItem("mathmaster-ai", JSON.stringify({
        workerUrl: "http://localhost:8000",
        usage: { date: new Date().toISOString().slice(0, 10), count: 0 }
      }));
    });
    await page.locator(".ai-tutor-buttons button", { hasText: "Similar question" }).click();
    await page.locator(".ai-tutor button", { hasText: "Generate an AI practice question" }).click();
    await page.locator(".ai-tutor-answer").waitFor({ state: "visible" });
    assert.ok((await page.locator(".ai-tutor-answer").textContent()).includes("AI practice question (not verified)"));
    assert.ok(!(await page.locator(".ai-tutor-answer").textContent()).includes("42"), "generated solutions are removed before display");
    assert.ok(!(await page.locator(".ai-tutor-answer").textContent()).includes("STEPS:"), "generated worked steps are removed before display");
    await page.locator(".ai-tutor textarea[aria-label='Your working or attempt']").fill("6 × 7 = 42");
    await page.locator("[data-ai-check-submit]").click();
    await page.locator(".ai-tutor-answer").waitFor({ state: "visible" });
    const checkPayload = await page.evaluate(() => window.requestPayloads.at(-1));
    assert.strictEqual(checkPayload.mode, "check");
    assert.strictEqual(checkPayload.question, "What is 6 × 7?", "AI checks the generated question, not the original exercise");
    assert.strictEqual(checkPayload.studentWorking, "6 × 7 = 42");
    assert.strictEqual(Object.hasOwn(checkPayload, "correctAnswer"), false);

    await page.locator(".ai-tutor-buttons button", { hasText: "Ask a question" }).click();
    const askInput = page.locator(".ai-tutor textarea[aria-label='Ask the AI Tutor a maths question']");
    await askInput.fill("Why do we use a common denominator?");
    assert.ok(await askInput.locator("xpath=following-sibling::small").isVisible(), "privacy note sits next to the learner question input");
    assert.strictEqual(await askInput.getAttribute("maxlength"), "1000");
    await page.locator("[data-ai-ask-submit]").click();
    const askPayload = await page.evaluate(() => window.requestPayloads.at(-1));
    assert.strictEqual(askPayload.studentQuestion, "Why do we use a common denominator?");
    assert.strictEqual(Object.hasOwn(askPayload, "correctAnswer"), false);
    const replaceQuestion = page.locator(".ai-tutor button.ai-tutor-replace-question").first();
    assert.strictEqual(await replaceQuestion.isVisible(), true, "the tutor offers a clear way to replace a submitted question");
    assert.strictEqual(await replaceQuestion.textContent(), "Ask another question", "the tutor labels the follow-up action clearly");
    await replaceQuestion.click();
    assert.strictEqual(await askInput.evaluate(input => input.selectionStart === 0 && input.selectionEnd === input.value.length), true,
      "Replace question selects the existing text so the learner can type another question");
    await askInput.fill("How do I compare fractions?");
    await page.locator("[data-ai-ask-submit]").click();
    assert.strictEqual((await page.evaluate(() => window.requestPayloads.at(-1))).studentQuestion,
      "How do I compare fractions?", "the same tutor box accepts a replacement question");
    const workingInput = page.locator(".ai-tutor textarea[aria-label='Your working or attempt']");
    assert.strictEqual(await workingInput.getAttribute("maxlength"), "1800");
    const keys = await page.evaluate(() => Object.keys(localStorage));
    assert.deepStrictEqual(keys, ["mathmaster-ai"], "unverified AI practice is not stored in progress or mistakes");

    await page.evaluate(() => window.AITutor.attach(document.querySelector("#question"), { general: true, topic: "Maths" }));
    const directAsk = page.locator("#question [data-ai-tutor] textarea[aria-label='Ask the AI Tutor a maths question']");
    await directAsk.fill("What does a common denominator mean?");
    await directAsk.press("Control+Enter");
    assert.strictEqual((await page.evaluate(() => window.requestPayloads.at(-1))).studentQuestion,
      "What does a common denominator mean?", "Ctrl+Enter submits a general tutor question");

    const disabledPage = await browser.newPage();
    await boot(disabledPage, base, false);
    await attach(disabledPage);
    assert.strictEqual(await disabledPage.locator(".ai-tutor").count(), 0, "AI_ENABLED false hides the panel");
    assert.strictEqual(await disabledPage.evaluate(() => window.requestCount), 0);
    assert.strictEqual(await disabledPage.locator("[data-ai-global]").count(), 0, "AI_ENABLED false hides the site-wide tutor");
    console.log("AI front-end checks passed.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
