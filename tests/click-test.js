"use strict";

const assert = require("assert");
const fs = require("fs");
const http = require("http");
const path = require("path");
const { chromium } = require("./node_modules/playwright-core");
const { loadVisual, root } = require("./visual-harness");

const CLICK_GENERATORS = [
  "coordinates-read", "shade-fraction", "fraction-number-line",
  "percentages", "plot-line-click", "geometric-transformations", "loci-bisectors"
];
const MIME_TYPES = {
  ".css": "text/css",
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json"
};

function serveWorkspace() {
  const server = http.createServer((request, response) => {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const filename = path.resolve(root, `.${pathname}`);
    if (filename !== root && !filename.startsWith(root + path.sep)) {
      response.writeHead(403).end();
      return;
    }
    fs.readFile(filename, (error, content) => {
      if (error) {
        response.writeHead(404).end();
        return;
      }
      response.writeHead(200, { "content-type": MIME_TYPES[path.extname(filename)] || "application/octet-stream" });
      response.end(content);
    });
  });
  return new Promise(resolve => server.listen(0, "127.0.0.1", () => resolve(server)));
}

function sampleClickSeeds(window, id, count) {
  const generator = window.VISUAL_GENERATORS.find(item => item.id === id);
  assert.ok(generator, `Missing click generator ${id}.`);
  const seeds = [];
  for (let index = 1; index < 100000 && seeds.length < count; index += 1) {
    const seed = (index * 7919 + 37) >>> 0;
    if (generator.make(window.VisualRNG.seeded(seed)).type === "click") seeds.push(seed);
  }
  assert.strictEqual(seeds.length, count, `${id}: could not find ${count} click-mode seeds.`);
  return seeds;
}

function screenPoint(box, viewBox, point, preserveAspectRatio) {
  const [minX, minY, width, height] = viewBox;
  const align = (preserveAspectRatio || "xMidYMid meet").trim().split(/\s+/);
  const scale = align[0] === "none" ?
    null : align[1] === "slice" ?
      Math.max(box.width / width, box.height / height) :
      Math.min(box.width / width, box.height / height);
  if (scale === null) {
    return {
      x: box.x + (point[0] - minX) / width * box.width,
      y: box.y + (point[1] - minY) / height * box.height
    };
  }
  const xAlign = align[0].startsWith("xMin") ? 0 : align[0].startsWith("xMax") ? 1 : 0.5;
  const yAlign = align[0].endsWith("YMin") ? 0 : align[0].endsWith("YMax") ? 1 : 0.5;
  return {
    x: box.x + (box.width - width * scale) * xAlign + (point[0] - minX) * scale,
    y: box.y + (box.height - height * scale) * yAlign + (point[1] - minY) * scale
  };
}

async function setQuestion(page, id, seed, firstForGenerator) {
  await page.evaluate(({ seed: value, first }) => {
    const seedRandom = (value + 0.5) / 0xffffffff;
    window.__visualTestRandomCalls = [];
    if (first) {
      const values = [0, seedRandom];
      window.Math.random = () => {
        const result = values.length ? values.shift() : 0.5;
        window.__visualTestRandomCalls.push(result);
        return result;
      };
    } else {
      window.Math.random = () => {
        window.__visualTestRandomCalls.push(seedRandom);
        return seedRandom;
      };
    }
  }, { seed, first: firstForGenerator });
  if (firstForGenerator) {
    await page.locator("#visual-skill").selectOption(id);
  } else {
    await page.locator("#visual-same-type").click();
  }
  try {
    await page.waitForFunction(({ id: wantedId, seed: wantedSeed }) =>
      document.querySelector("#visual-seed").textContent === `${wantedId} · ${wantedSeed}`,
    { id, seed }, { timeout: 5000 });
  } catch (error) {
    const actual = await page.locator("#visual-seed").innerText();
    const calls = await page.evaluate(() => window.__visualTestRandomCalls);
    throw new Error(`${id} seed ${seed}: expected rendered seed, got "${actual}", random calls ${JSON.stringify(calls)}. ${error.message}`);
  }
  return page.evaluate(({ id: wantedId, seed: wantedSeed }) => {
    const generator = window.VISUAL_GENERATORS.find(item => item.id === wantedId);
    const question = generator.make(window.VisualRNG.seeded(wantedSeed));
    return { target: question.clickTarget, spec: question.spec };
  }, { id, seed });
}

async function clickSvgPoint(page, localPoint, useTouch) {
  const svg = page.locator("#visual-diagram svg");
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = "auto";
  });
  await svg.evaluate(element => element.scrollIntoView({ block: "center", inline: "nearest" }));
  await page.evaluate(point => {
    const element = document.querySelector("#visual-diagram svg");
    const parent = element.closest(".visual-diagram");
    const box = element.getBoundingClientRect();
    const parentBox = parent.getBoundingClientRect();
    const values = (element.getAttribute("viewBox") || "0 0 400 260").split(/[ ,]+/).map(Number);
    const align = (element.getAttribute("preserveAspectRatio") || "xMidYMid meet").trim().split(/\s+/);
    const scale = align[1] === "slice" ?
      Math.max(box.width / values[2], box.height / values[3]) :
      Math.min(box.width / values[2], box.height / values[3]);
    const xAlign = align[0].startsWith("xMin") ? 0 : align[0].startsWith("xMax") ? 1 : 0.5;
    const screenX = box.x + (box.width - values[2] * scale) * xAlign + (point[0] - values[0]) * scale;
    const centerX = parentBox.left + parent.clientLeft + parent.clientWidth / 2;
    const maxScroll = parent.scrollWidth - parent.clientWidth;
    parent.scrollLeft = Math.max(0, Math.min(maxScroll, parent.scrollLeft + screenX - centerX));
  }, localPoint);
  await svg.evaluate(element => element.scrollIntoView({ block: "center", inline: "nearest" }));
  const geometry = await page.evaluate(point => {
    const element = document.querySelector("#visual-diagram svg");
    const box = element.getBoundingClientRect();
    const viewBox = (element.getAttribute("viewBox") || "0 0 400 260").split(/[ ,]+/).map(Number);
    const preserve = element.getAttribute("preserveAspectRatio");
    const align = (preserve || "xMidYMid meet").trim().split(/\s+/);
    if (align[0] === "none") {
      return {
        x: box.x + (point[0] - viewBox[0]) / viewBox[2] * box.width,
        y: box.y + (point[1] - viewBox[1]) / viewBox[3] * box.height
      };
    }
    const scale = align[1] === "slice" ?
      Math.max(box.width / viewBox[2], box.height / viewBox[3]) :
      Math.min(box.width / viewBox[2], box.height / viewBox[3]);
    const xAlign = align[0].startsWith("xMin") ? 0 : align[0].startsWith("xMax") ? 1 : 0.5;
    const yAlign = align[0].endsWith("YMin") ? 0 : align[0].endsWith("YMax") ? 1 : 0.5;
    return {
      x: box.x + (box.width - viewBox[2] * scale) * xAlign + (point[0] - viewBox[0]) * scale,
      y: box.y + (box.height - viewBox[3] * scale) * yAlign + (point[1] - viewBox[1]) * scale
    };
  }, localPoint);
  await page.evaluate(point => {
    window.__lastVisualPointer = null;
    window.__lastVisualClick = {
      point,
      scrollY: window.scrollY,
      viewportHeight: window.innerHeight,
      box: (() => {
        const box = document.querySelector("#visual-diagram svg").getBoundingClientRect();
        return { x: box.x, y: box.y, width: box.width, height: box.height };
      })()
    };
    document.addEventListener("pointerup", event => {
      window.__lastVisualPointer = {
        clientX: event.clientX, clientY: event.clientY, pointerType: event.pointerType,
        isPrimary: event.isPrimary, button: event.button, target: event.target.tagName
      };
    }, { capture: true, once: true });
  }, geometry);
  if (useTouch) await page.touchscreen.tap(geometry.x, geometry.y);
  else await page.mouse.click(geometry.x, geometry.y);
  return await page.evaluate(() => ({
    pointer: window.__lastVisualPointer,
    click: window.__lastVisualClick,
    svg: (() => {
      const box = document.querySelector("#visual-diagram svg").getBoundingClientRect();
      const parent = document.querySelector("#visual-diagram svg").closest(".visual-diagram");
      return { x: box.x, y: box.y, width: box.width, height: box.height, scrollLeft: parent.scrollLeft };
    })()
  }));
}

async function clickShadePart(page, index, useTouch) {
  const cell = page.locator(`#visual-diagram [data-shade-part="${index}"]`);
  // Center click targets so a sticky header or the floating tutor cannot
  // intercept taps when Playwright's minimal scroll lands them at the viewport edge.
  await cell.evaluate(element => element.scrollIntoView({ block: "center", inline: "center", behavior: "instant" }));
  const box = await cell.boundingBox();
  assert.ok(box, `Clickable shade part ${index} has no visible bounds.`);
  if (useTouch) await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  else await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

async function chooseTargets(page, target, spec, useTouch, wrong) {
  if (target.type === "shade") {
    const expected = spec.kind === "shade-fraction" ?
      spec.shaded : Array.from({ length: spec.percent }, (_, index) => index);
    if (!wrong) {
      for (const index of expected) await clickShadePart(page, index, useTouch);
      return;
    }
    const outside = Array.from({ length: target.parts }, (_, index) => index).find(index => !expected.includes(index));
    if (target.count === 1) {
      await clickShadePart(page, outside, useTouch);
      await clickShadePart(page, outside, useTouch);
      return;
    }
    const chosen = expected.slice(0, target.count - 2).concat(outside);
    for (const index of chosen) await clickShadePart(page, index, useTouch);
    return;
  }
  const range = target.range || { minX: -5, maxX: 5, minY: -4, maxY: 4 };
  if (target.type === "point") {
    const coordinate = wrong ?
      [target.x >= 0 ? range.minX : range.maxX, target.y >= 0 ? range.minY : range.maxY] :
      [target.x, target.y];
    const pixel = await page.evaluate(({ coordinate: point, range: gridRange }) =>
      window.VisualSVG.mapPoint(point[0], point[1], gridRange), { coordinate, range });
    await clickSvgPoint(page, pixel, useTouch);
    return;
  }
  if (target.type === "points") {
    const points = wrong ? [[range.maxX, range.maxY], [range.minX, range.minY]] : target.points;
    for (const point of points) {
      const pixel = await page.evaluate(({ point: coordinate, gridRange }) =>
        window.VisualSVG.mapPoint(coordinate[0], coordinate[1], gridRange), { point, gridRange: range });
      await clickSvgPoint(page, pixel, useTouch);
    }
    return;
  }
  if (target.type === "numberline") {
    const value = wrong ? (target.value < 0.5 ? 1 : 0) : target.value;
    await clickSvgPoint(page, [24 + 352 * value, 128], useTouch);
    return;
  }
  throw new Error(`No browser click strategy for target type ${target.type}.`);
}

async function checkAttempt(page, id, seed, target, spec, useTouch, wrong) {
  await chooseTargets(page, target, spec, useTouch, wrong);
  if (id === "shade-fraction") {
    const cell = page.locator("#visual-diagram [data-shade-part]");
    const box = await cell.first().boundingBox();
    const svgInfo = await page.locator("#visual-diagram svg").evaluate(svg => ({
      width: svg.getBoundingClientRect().width,
      cssWidth: getComputedStyle(svg).width,
      className: svg.getAttribute("class"),
      viewBox: svg.getAttribute("viewBox")
    }));
    assert.ok(box && box.width >= 44 && box.height >= 44,
      `Fraction-bar touch target ${box ? `${box.width}x${box.height}` : "missing"} must be at least 44px (${JSON.stringify(svgInfo)}).`);
  }
  if (spec.kind === "percentages" && spec.shade) {
    const cell = page.locator("#visual-diagram [data-shade-part]");
    const box = await cell.first().boundingBox();
    assert.ok(box && box.width >= 44 && box.height >= 44,
      `Percentage-grid touch target ${box ? `${box.width}x${box.height}` : "missing"} must be at least 44px.`);
  }
  if (wrong) {
    await page.locator("#visual-submit").click();
    await page.waitForFunction(() => document.querySelector("#visual-feedback").textContent.startsWith("Not quite"), null, { timeout: 5000 })
      .catch(async error => {
        const details = await page.evaluate(() => ({
          feedback: document.querySelector("#visual-feedback").textContent,
          answer: document.querySelector("#visual-click-answer")?.textContent,
          stored: document.querySelector("#visual-click-answer")?.dataset.value,
          pointer: window.__lastVisualPointer,
          click: window.__lastVisualClick
        }));
        throw new Error(`${id} seed ${seed}: wrong click did not score as wrong: ${JSON.stringify(details)}. ${error.message}`);
      });
    return false;
  }
  await page.locator("#visual-submit").click();
  await page.waitForFunction(() => document.querySelector("#visual-feedback").textContent.startsWith("Correct."), null, { timeout: 5000 })
    .catch(async error => {
      const details = await page.evaluate(() => ({
        feedback: document.querySelector("#visual-feedback").textContent,
        answer: document.querySelector("#visual-click-answer")?.textContent,
        stored: document.querySelector("#visual-click-answer")?.dataset.value,
        pointer: window.__lastVisualPointer,
        click: window.__lastVisualClick
      }));
      throw new Error(`${id} seed ${seed}: correct click did not score as correct: ${JSON.stringify(details)}. ${error.message}`);
    });
  return true;
}

(async () => {
  const harness = await loadVisual();
  const samples = new Map(CLICK_GENERATORS.map(id => [id, sampleClickSeeds(harness, id, 20)]));
  const browserPath = [process.env.CHROME_BIN, "/usr/bin/google-chrome", "/usr/bin/chromium", "/usr/bin/chromium-browser"]
    .find(candidate => candidate && fs.existsSync(candidate));
  assert.ok(browserPath, "No local Chrome or Chromium executable was found.");
  const server = await serveWorkspace();
  const { port } = server.address();
  const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ["--no-sandbox"] });
  const screenshots = path.join(root, "audit", "visual-shots3");
  fs.mkdirSync(screenshots, { recursive: true });
  try {
    for (const viewport of [{ width: 1280, height: 900, touch: false }, { width: 390, height: 844, touch: true }]) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        deviceScaleFactor: 1,
        isMobile: viewport.touch,
        hasTouch: viewport.touch
      });
      const page = await context.newPage();
      await page.goto(`http://127.0.0.1:${port}/visual.html`, { waitUntil: "load" });
      await page.waitForFunction(() => window.VISUAL_READY === true);
      if (!viewport.touch) {
        const firstSeed = await page.locator("#visual-seed").textContent();
        assert.strictEqual(await page.locator("#visual-next").isDisabled(), false, "practice can skip to the next question");
        assert.strictEqual(await page.locator("#visual-next").textContent(), "Skip question", "the next action is clear before answering");
        await page.locator("#visual-next").click();
        await page.waitForFunction(seed => document.querySelector("#visual-seed").textContent !== seed, firstSeed);
      }
      await page.locator("#visual-theme").check();
      for (const id of CLICK_GENERATORS) {
        let firstForGenerator = true;
        for (let index = 0; index < samples.get(id).length; index += 1) {
          const seed = samples.get(id)[index];
          const { target, spec } = await setQuestion(page, id, seed, firstForGenerator);
          firstForGenerator = false;
          assert.ok(target, `${id} seed ${seed}: click target missing.`);
          await checkAttempt(page, id, seed, target, spec, viewport.touch, true);
          const correctQuestion = await setQuestion(page, id, seed, false);
          assert.ok(correctQuestion.target, `${id} seed ${seed}: click target missing after retry.`);
          await checkAttempt(page, id, seed, correctQuestion.target, correctQuestion.spec, viewport.touch, false);
          if (index === 0 && viewport.touch) {
            await page.screenshot({ path: path.join(screenshots, `${id}-390-light.png`), fullPage: true });
          }
        }
        console.log(`${id}: 20 correct and 20 wrong real-pointer tests at ${viewport.width}px.`);
      }
      await context.close();
    }
    console.log("All click-target desktop and touch-browser tests passed.");
  } finally {
    await browser.close();
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
