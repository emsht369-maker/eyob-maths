const { chromium } = require("../tests/node_modules/playwright-core");

const base = process.env.QA_BASE || "http://127.0.0.1:8766";
const outDir = "docs/redesign-screens";
const fs = require("node:fs");

(async () => {
  fs.mkdirSync(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: "/usr/bin/google-chrome", args: ["--no-sandbox", "--disable-crash-reporter", "--disable-breakpad"] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  await page.addInitScript(() => {
    localStorage.setItem("mathmaster-rooms", JSON.stringify({ practiceMode: true, rooms: {} }));
    localStorage.setItem("mathmaster", JSON.stringify({ sub: { "0-0": true } }));
  });
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", message => { if (message.type() === "error") errors.push(message.text()); });
  await page.goto(base, { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  const topicNames = [...fs.readFileSync("js/data.js", "utf8").matchAll(/^\["[^"]*","([^\"]+)"/gm)].map(match => match[1]);
  const slug = name => name.toLowerCase().startsWith("basic arithmetic") ? "basic-arithmetic" : name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  const routes = [...new Set(topicNames.map(name => `/topic/${slug(name)}`))];
  await page.screenshot({ path: `${outDir}/final-home-1280.png`, fullPage: true });
  await page.setViewportSize({ width: 360, height: 800 });
  await page.screenshot({ path: `${outDir}/final-home-360.png`, fullPage: true });
  await page.setViewportSize({ width: 1280, height: 900 });
  const results = [];
  for (const route of routes) {
    await page.goto(`${base}${route}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(350);
    const topic = await page.locator("h1").first().innerText().catch(() => route);
    const result = { route, topic, errors: [], overflow: false, iframes: 0, questions: 0, hiddenAnswers: true, resources: 0, mitSectionCards: 0, brokenLinks: [] };
    const dimensions = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, inner: innerWidth }));
    result.overflow = dimensions.width > dimensions.inner + 1;
    await page.setViewportSize({ width: 360, height: 800 });
    result.mobileOverflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    await page.setViewportSize({ width: 1280, height: 900 });
    result.iframes = await page.locator("iframe").count();
    result.questions = await page.locator(".mm-question").count();
    result.hiddenAnswers = (await page.locator(".mm-question-final").evaluateAll(nodes => nodes.every(node => node.hidden)));
    result.legacyProgressLoaded = route.endsWith("/basic-arithmetic") ? await page.locator('[data-s="0-0"]').isChecked().catch(() => false) : undefined;
    result.mitSectionCards = await page.locator(".mit-section-card").count();
    const localLinks = await page.locator('.resource-groups a[href^="/"]').evaluateAll(nodes => [...new Set(nodes.map(node => node.getAttribute("href")))]).catch(() => []);
    result.resources = localLinks.length;
    for (const href of localLinks) {
      const response = await page.request.head(new URL(href, base).href).catch(() => null);
      if (!response || response.status() >= 400) result.brokenLinks.push(href);
    }
    if (route.includes("basic-arithmetic")) await page.screenshot({ path: `${outDir}/final-topic-learn-1280.png`, fullPage: true });
    results.push(result);
  }
  const basic = routes.find(route => route.includes("basic-arithmetic"));
  const linearAlgebra = routes.find(route => route.endsWith("/linear-algebra"));
  if (linearAlgebra) {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto(`${base}${linearAlgebra}#learn`, { waitUntil: "domcontentloaded" }); await page.waitForTimeout(400);
    await page.screenshot({ path: `${outDir}/phase6-linear-algebra-1280.png`, fullPage: true });
    const sectionCount = await page.locator(".mit-section-card").count();
    await page.setViewportSize({ width: 360, height: 800 });
    await page.screenshot({ path: `${outDir}/phase6-linear-algebra-360.png`, fullPage: true });
    results.push({ route: linearAlgebra, mitSectionCards: sectionCount, viewport: 360, overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1) });
  }
  if (basic) {
    for (const [label, hash] of [["practice", "practice"], ["challenge", "exam"], ["links", "links"]]) {
      await page.goto(`${base}${basic}#${hash}`, { waitUntil: "domcontentloaded" }); await page.waitForTimeout(300);
      await page.screenshot({ path: `${outDir}/final-topic-${label}-1280.png`, fullPage: true });
    }
    await page.setViewportSize({ width: 360, height: 800 });
    for (const [label, hash] of [["learn", "learn"], ["practice", "practice"], ["challenge", "exam"], ["links", "links"]]) {
      await page.goto(`${base}${basic}#${hash}`, { waitUntil: "domcontentloaded" }); await page.waitForTimeout(300);
      await page.screenshot({ path: `${outDir}/final-topic-${label}-360.png`, fullPage: true });
    }
    const mobile = await page.evaluate(() => ({ width: document.documentElement.scrollWidth, inner: innerWidth }));
    results.push({ route: basic, viewport: 360, overflow: mobile.width > mobile.inner + 1 });
    await page.evaluate(() => window.openReader?.("/assets/mit-linear-algebra/4d876a9159e32543eb0d73b4d4382f4c_MIT18_06S10ZoomNotes.pdf#page=24", 24));
    await page.waitForTimeout(1500);
    await page.screenshot({ path: `${outDir}/final-reader-360.png`, fullPage: true });
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.screenshot({ path: `${outDir}/final-reader-1280.png`, fullPage: true });
    results.push({ readerPages: await page.locator(".mm-pdf-page").count(), readerOpen: await page.locator("#mm-pdf-reader[open]").count() === 1 });
    const pageInput = page.locator("[data-pdf-page]");
    await pageInput.fill("30"); await pageInput.dispatchEvent("change"); await page.waitForTimeout(300);
    const readerJump = await pageInput.inputValue();
    await page.locator("[data-pdf-back]").click();
    results.push({ readerJump, readerClosed: await page.locator("#mm-pdf-reader[open]").count() === 0 });
  }
  const report = { routes: routes.length, results, errors };
  fs.writeFileSync(`${outDir}/qa-all-topics.json`, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
  if (errors.length || results.some(result => result.overflow || result.iframes || result.brokenLinks?.length || result.hiddenAnswers === false)) process.exitCode = 1;
})().catch(error => { console.error(error); process.exit(1); });
