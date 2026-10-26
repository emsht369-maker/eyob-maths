"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("./node_modules/playwright-core");
const root = path.resolve(__dirname, "..");
const screenshots = path.join(root, "artifacts");
const mime = { ".css": "text/css", ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml" };

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
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

async function run() {
  fs.mkdirSync(screenshots, { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"].find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  const scenarios = [
    { width: 375, height: 812, isMobile: true, hasTouch: true, kind: "room" },
    { width: 375, height: 812, isMobile: false, hasTouch: false, kind: "lesson" },
    { width: 1280, height: 900, isMobile: false, hasTouch: true, kind: "room" },
    { width: 1280, height: 900, isMobile: false, hasTouch: false, kind: "lesson" }
  ];
  let sendCount = 0;
  try {
    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: { width: scenario.width, height: scenario.height },
        isMobile: scenario.isMobile,
        hasTouch: scenario.hasTouch,
        deviceScaleFactor: 1
      });
      const page = await context.newPage();
      page.setDefaultTimeout(12000);
      await page.addInitScript(() => {
        if (sessionStorage.getItem("ai-chat-test-initialized") !== "1") {
          sessionStorage.clear();
          sessionStorage.setItem("ai-chat-test-initialized", "1");
        }
        localStorage.setItem("mathmaster-ai", JSON.stringify({
          workerUrl: "https://math-master-ai-tutor.example.workers.dev",
          usage: { date: new Date().toISOString().slice(0, 10), count: 0 }
        }));
      });
      await page.route("**/js/ai/config.js", route => {
        const source = fs.readFileSync(path.join(root, "js/ai/config.js"), "utf8")
          .replace(/WORKER_URL: "[^"]+"/, 'WORKER_URL: "https://math-master-ai-tutor.example.workers.dev"');
        return route.fulfill({ status: 200, contentType: "text/javascript", body: source });
      });
      await page.goto(scenario.kind === "room"
        ? `${base}/rooms.html#room=gcse-bidmas`
        : `${base}/index.html?topic=Algebra&from=courses`);
      const lessonLocator = scenario.kind === "room"
        ? page.locator("#room-view h1")
        : page.locator("#dlg[open] .room-header h2");
      await lessonLocator.waitFor({ state: "visible" });
      await page.waitForFunction(() => {
        const y = window.scrollY;
        if (window.__lastStudyScrollY === y) window.__stableStudyScrollFrames = (window.__stableStudyScrollFrames || 0) + 1;
        else { window.__lastStudyScrollY = y; window.__stableStudyScrollFrames = 0; }
        return window.__stableStudyScrollFrames >= 5;
      }, null, { timeout: 8000 });
      const lessonBefore = (await lessonLocator.innerText()).trim();
      const pageUrlBefore = page.url();
      const pageScrollBefore = await page.evaluate(() => window.scrollY);
      const answerBox = scenario.kind === "room" ? page.locator("#task-answer-0-0") : null;
      if (answerBox) await answerBox.fill("student working stays here");
      const answerBefore = answerBox ? await answerBox.inputValue() : null;

      const requests = [];
      await page.route("**/api/tutor", async route => {
        const payload = JSON.parse(route.request().postData());
        requests.push(payload);
        await new Promise(resolve => setTimeout(resolve, 120));
        if (payload.studentQuestion === "simulate error") {
          return route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ ok: false, error: "provider detail" }) });
        }
        const text = requests.length === 1
          ? "Use $a$ and $ad - bc$. For a fraction, write \\frac{1}{2}; the power is x^2. A safe <script>word</script> stays text."
          : "Use the same method with one small example. ".repeat(32);
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ ok: true, text, provider: "Mock" }) });
      });

      const click = async locator => scenario.hasTouch ? locator.tap() : locator.click();
      await click(page.locator(".ai-tutor-launcher"));
      const panel = page.locator(".ai-tutor-dock-panel");
      const input = panel.locator("textarea[aria-label='Ask the AI Tutor a maths question']");
      await input.waitFor({ state: "visible" });
      assert.strictEqual(page.url(), pageUrlBefore, "opening chat must not navigate");
      const pageScrollAfterOpen = await page.evaluate(() => window.scrollY);
      assert.ok(pageScrollAfterOpen > 0 || pageScrollBefore < 5,
        `opening chat must not jump the study page to the top (${scenario.width}px ${scenario.kind})`);
      assert.strictEqual(await page.evaluate(() => document.activeElement.getAttribute("aria-label")), "Ask the AI Tutor a maths question",
        "focus moves to the composer without scrolling the page");
      assert.strictEqual(await panel.locator("button:not([type='button'])").count(), 0, "all panel buttons are non-submit buttons");
      assert.strictEqual(await panel.locator("form, a[href='#']").count(), 0, "chat has no submitting form or hash link");
      assert.strictEqual(await panel.locator("textarea").count(), 1, "the chat uses one free-text box");
      assert.strictEqual(await input.getAttribute("maxlength"), "1000", "the chat input keeps its character limit");
      assert.strictEqual(await panel.locator(".ai-tutor-chat-messages").getAttribute("aria-live"), "polite");
      assert.strictEqual(await panel.locator(".ai-tutor-new-chat").isVisible(), true);
      assert.strictEqual(await panel.locator(".ai-tutor-close").isVisible(), true);
      assert.strictEqual(await panel.locator(".ai-tutor-buttons").count(), 0, "the general chat has no mode picker");

      const panelBox = await panel.boundingBox();
      if (scenario.width === 375) {
        assert.ok(panelBox.width >= 370, "mobile chat should span the screen width");
        assert.ok(panelBox.height <= scenario.height * 0.81, "mobile chat should stay within 80dvh");
      } else {
        assert.ok(panelBox.width <= 420, `desktop chat should be about 400px wide (measured ${panelBox.width})`);
        assert.ok(panelBox.height <= scenario.height * 0.71, "desktop chat should stay within 70dvh");
      }
      const composer = panel.locator(".ai-tutor-chat-composer");
      const messages = panel.locator(".ai-tutor-chat-messages");
      const composerBox = await composer.boundingBox();
      const messagesBox = await messages.boundingBox();
      assert.ok(messagesBox.y + messagesBox.height <= composerBox.y + 1, "the input stays beneath the message list");
      assert.ok(composerBox.y + composerBox.height <= scenario.height, "the composer stays visible at the bottom of the panel");
      await input.fill("line one");
      await input.press("Shift+Enter");
      assert.ok((await input.inputValue()).includes("\n"), "Shift+Enter inserts a line break");
      await input.fill("Explain how to rearrange a formula.");
      assert.strictEqual(await panel.locator(".ai-tutor-char-count").textContent(), "35/1000");

      await click(lessonLocator);
      assert.strictEqual(await panel.isVisible(), true, "a click outside the panel must not close it");
      assert.strictEqual(page.url(), pageUrlBefore, "an outside click must not navigate");
      assert.strictEqual((await lessonLocator.innerText()).trim(), lessonBefore, "opening chat keeps the active lesson unchanged");
      await input.press("Enter");
      await panel.locator(".ai-tutor-thinking").waitFor({ state: "visible" });
      assert.strictEqual(await panel.locator(".ai-tutor-send").isDisabled(), true, "Send is disabled while waiting");
      await panel.locator(".ai-tutor-chat-message.is-assistant").first().waitFor({ state: "visible" });
      await page.waitForFunction(() => document.querySelector(".ai-tutor-send")?.disabled === false);
      sendCount += 1;
      assert.strictEqual(requests[0].studentQuestion, "Explain how to rearrange a formula.");
      assert.strictEqual(await panel.locator(".ai-tutor-chat-message").count(), 2);
      const firstReply = panel.locator(".ai-tutor-chat-message.is-assistant").last();
      const replyText = await firstReply.innerText();
      assert.ok(!replyText.includes("$") && !/\\(?:frac|sqrt|\(|\[)/.test(replyText), "rendered reply has no raw dollar or LaTeX syntax");
      assert.strictEqual(await panel.locator(".ai-tutor-chat-message script").count(), 0, "model text is inserted as text, never executable HTML");
      const list = await messages.boundingBox();
      const newest = await firstReply.boundingBox();
      assert.ok(newest.y >= list.y && newest.y + newest.height <= list.y + list.height + 1, "newest reply is visible at the bottom");
      assert.strictEqual(page.url(), pageUrlBefore, "sending must not navigate");
      assert.strictEqual((await lessonLocator.innerText()).trim(), lessonBefore, "sending leaves the active lesson open");
      if (answerBox) assert.strictEqual(await answerBox.inputValue(), answerBefore, "sending preserves room work");
      assert.ok((await page.evaluate(() => window.scrollY)) > 0 || pageScrollBefore < 5,
        "sending must not jump the study page to the top");
      assert.match(await panel.locator(".ai-tutor-privacy").innerText(), /Do not enter personal details\. The tutor may be wrong\./);

      if (scenario.width === 375) {
        await page.screenshot({ path: path.join(screenshots, "ai-tutor-375.png"), fullPage: false });
      }
      if (scenario.width === 1280) {
        await page.screenshot({ path: path.join(screenshots, "ai-tutor-1280.png"), fullPage: false });
      }

      await input.fill("Give a longer explanation.");
      await input.press("Enter");
      await panel.locator(".ai-tutor-thinking").waitFor({ state: "visible" });
      await page.waitForFunction(() => [...document.querySelectorAll(".ai-tutor-chat-message.is-assistant:not(.ai-tutor-thinking)")].length >= 2);
      await page.waitForFunction(() => document.querySelector(".ai-tutor-send")?.disabled === false);
      sendCount += 1;
      const scrollList = messages;
      assert.ok(await scrollList.evaluate(node => node.scrollHeight > node.clientHeight), "long chat messages are scrollable");
      await scrollList.evaluate(node => { node.scrollTop = 0; node.dispatchEvent(new Event("scroll")); });
      await input.fill("One more step");
      await input.press("Enter");
      await panel.locator(".ai-tutor-thinking").waitFor({ state: "visible" });
      await page.waitForFunction(() => [...document.querySelectorAll(".ai-tutor-chat-message.is-assistant:not(.ai-tutor-thinking)")].length >= 3);
      await page.waitForFunction(() => document.querySelector(".ai-tutor-send")?.disabled === false);
      sendCount += 1;
      assert.ok(await scrollList.evaluate(node => node.scrollTop < 8), "new messages do not pull a reader away from older chat");

      await page.goto(`${base}/${scenario.kind === "room" ? "courses.html" : "rooms.html#room=gcse-bidmas"}`);
      await page.locator("[data-ai-global] .ai-tutor-dock-panel").waitFor({ state: "visible" });
      assert.strictEqual(await page.locator(".ai-tutor-chat-message").count(), 6, "chat history and open state survive same-tab navigation");
      await page.locator(".ai-tutor-new-chat").click();
      assert.strictEqual(await page.locator(".ai-tutor-chat-message").count(), 0, "New chat clears the current conversation");
      assert.deepStrictEqual(await page.evaluate(() => JSON.parse(sessionStorage.getItem("math-master-ai-chat")).messages), []);
      await page.evaluate(() => localStorage.setItem("mathmaster-ai", JSON.stringify({
        workerUrl: "https://math-master-ai-tutor.example.workers.dev",
        usage: { date: new Date().toISOString().slice(0, 10), count: 30 }
      })));
      await input.fill("Question after the old local limit");
      await input.press("Enter");
      await page.waitForFunction(() => [...document.querySelectorAll(".ai-tutor-chat-message.is-assistant:not(.ai-tutor-thinking)")].length === 1);
      assert.strictEqual(requests.length, 4, "a saved legacy usage count does not block tutor requests");
      sendCount += 1;
      await page.evaluate(() => localStorage.setItem("mathmaster-ai", JSON.stringify({
        workerUrl: "https://math-master-ai-tutor.example.workers.dev",
        usage: { date: new Date().toISOString().slice(0, 10), count: 0 }
      })));
      await input.fill("simulate error");
      await input.press("Enter");
      await page.waitForFunction(() => [...document.querySelectorAll(".ai-tutor-chat-message.is-assistant:not(.ai-tutor-thinking)")].length === 1);
      assert.match(await panel.locator(".ai-tutor-chat-message.is-assistant").last().innerText(), /could not reply just now/i);
      sendCount += 1;
      await page.locator(".ai-tutor-new-chat").click();
      await page.keyboard.press("Escape");
      assert.strictEqual(await page.locator(".ai-tutor-dock-panel").isHidden(), true, "Escape closes the panel");
      await click(page.locator(".ai-tutor-launcher"));
      assert.strictEqual(await page.locator(".ai-tutor-dock-panel").isVisible(), true);
      await click(page.locator(".ai-tutor-close"));
      assert.strictEqual(await page.locator(".ai-tutor-dock-panel").isHidden(), true, "the X button closes the panel");
      await context.close();
    }
    assert.equal(sendCount, 16, "four viewport/input combinations each sent three normal messages and one error-path message");
    console.log("AI chat passed 4 viewport/input combinations; sent 16 mocked messages; mobile and desktop screenshots saved to artifacts/.");
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
