"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { chromium } = require("./node_modules/playwright-core");
const root = path.resolve(__dirname, "..");
const ids = ["matrix-transform-square", "geometric-transformations", "vectors-grid", "eigenvector-direction",
  "determinant-area", "dot-product-angle", "matrix-vector-grid"];
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

async function checkAtWidth(page, width) {
  return page.evaluate(({ width, ids }) => {
    const host = document.createElement("div");
    host.className = "visual-diagram";
    host.style.cssText = `position:fixed;left:-10000px;top:0;width:${width === 375 ? 298 : 650}px;margin:0;padding:0;overflow:visible`;
    document.body.appendChild(host);
    const overlaps = (a, b) => a.left < b.right - 0.25 && a.right > b.left + 0.25 && a.top < b.bottom - 0.25 && a.bottom > b.top + 0.25;
    const pointInPolygon = (point, points) => {
      let inside = false;
      for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
        const [xi, yi] = points[i], [xj, yj] = points[j];
        if ((yi > point[1]) !== (yj > point[1]) && point[0] < (xj - xi) * (point[1] - yi) / (yj - yi) + xi) inside = !inside;
      }
      return inside;
    };
    const orient = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const crosses = (a, b, c, d) => {
      const o1 = orient(a, b, c), o2 = orient(a, b, d), o3 = orient(c, d, a), o4 = orient(c, d, b);
      return o1 * o2 < 0 && o3 * o4 < 0;
    };
    const svgPoint = (svg, x, y) => {
      const pt = svg.createSVGPoint(); pt.x = x; pt.y = y;
      const p = pt.matrixTransform(svg.getScreenCTM()); return [p.x, p.y];
    };
    const seedValues = Array.from({ length: 20 }, (_, index) => ((index + 1) * 7919 + 105) >>> 0);
    const failures = [];
    for (const id of ids) {
      const generator = window.VISUAL_GENERATORS.find(item => item.id === id);
      for (const seed of seedValues) {
        const question = generator.make(window.VisualRNG.seeded(seed));
        host.innerHTML = question.diagram;
        const svg = host.querySelector("svg");
        const labels = [...svg.querySelectorAll("text.v-label")];
        const boxes = labels.map(node => ({ node, box: node.getBoundingClientRect(), text: node.textContent.trim() }));
        for (let i = 0; i < boxes.length; i += 1) {
          for (let j = i + 1; j < boxes.length; j += 1) {
            if (overlaps(boxes[i].box, boxes[j].box)) failures.push(`${id} seed ${seed}: labels overlap: ${boxes[i].text} / ${boxes[j].text}`);
          }
          const rect = boxes[i].box;
          for (const line of svg.querySelectorAll("line.v-axis,line.v-line")) {
            const x1 = Number(line.getAttribute("x1")), y1 = Number(line.getAttribute("y1"));
            const x2 = Number(line.getAttribute("x2")), y2 = Number(line.getAttribute("y2"));
            const a = svgPoint(svg, x1, y1), b = svgPoint(svg, x2, y2);
            if (Math.abs(a[1] - b[1]) < 1) {
              if (rect.top < a[1] + 1 && rect.bottom > a[1] - 1 && rect.right > Math.min(a[0], b[0]) && rect.left < Math.max(a[0], b[0]))
                failures.push(`${id} seed ${seed}: ${boxes[i].text} overlaps an axis/vector line`);
            } else if (Math.abs(a[0] - b[0]) < 1) {
              if (rect.left < a[0] + 1 && rect.right > a[0] - 1 && rect.bottom > Math.min(a[1], b[1]) && rect.top < Math.max(a[1], b[1]))
                failures.push(`${id} seed ${seed}: ${boxes[i].text} overlaps an axis/vector line`);
            } else {
              const corners = [[rect.left, rect.top], [rect.right, rect.top], [rect.right, rect.bottom], [rect.left, rect.bottom]];
              if (corners.some((c, k) => crosses(a, b, c, corners[(k + 1) % corners.length])))
                failures.push(`${id} seed ${seed}: ${boxes[i].text} overlaps an axis/vector line`);
            }
          }
          for (const polygon of svg.querySelectorAll("polygon.v-outline,polygon.v-region,polygon.v-empty")) {
            const points = polygon.getAttribute("points").trim().split(/\s+/).map(pair => {
              const [x, y] = pair.split(",").map(Number); return svgPoint(svg, x, y);
            });
            const corners = [[rect.left, rect.top], [rect.right, rect.top], [rect.right, rect.bottom], [rect.left, rect.bottom]];
            if (corners.some(point => pointInPolygon(point, points)) || points.some(point => point[0] >= rect.left && point[0] <= rect.right && point[1] >= rect.top && point[1] <= rect.bottom) ||
                points.some((point, index) => corners.some((corner, edge) => crosses(point, points[(index + 1) % points.length], corner, corners[(edge + 1) % corners.length]))))
              failures.push(`${id} seed ${seed}: ${boxes[i].text} overlaps a shape`);
          }
          if (width === 375 && rect.height < 10.9) failures.push(`${id} seed ${seed}: rendered font is only ${rect.height.toFixed(1)}px at 375px`);
        }
        const visible = boxes.filter(item => !item.node.classList.contains("v-tick-label")).map(item => item.text);
        let answerPair = null;
        if (id === "matrix-transform-square" && question.spec.asked === "corner") answerPair = question.spec.image;
        if (id === "geometric-transformations") answerPair = question.spec.image[question.spec.selected];
        if (["vectors-grid", "matrix-vector-grid"].includes(id)) answerPair = question.spec.result;
        const showsPair = answerPair && visible.some(text => text === `(${answerPair[0]},${answerPair[1]})` || text === `(${answerPair[0]}, ${answerPair[1]})`);
        const showsScalar = !answerPair && id !== "matrix-vector-grid" && visible.some(text => text === String(question.answer));
        if (showsPair || showsScalar) failures.push(`${id} seed ${seed}: the requested answer appears in SVG text`);
        if (["matrix-transform-square", "determinant-area"].includes(id) &&
            boxes.filter(item => item.text === "O").length !== 1)
          failures.push(`${id} seed ${seed}: origin must have exactly one O label`);
      }
    }
    host.remove();
    return failures;
  }, { width, ids });
}

async function run() {
  fs.mkdirSync(path.join(root, "artifacts"), { recursive: true });
  const server = await serve();
  const base = `http://127.0.0.1:${server.address().port}`;
  const executablePath = ["/usr/bin/chromium", "/usr/bin/google-chrome", "/usr/bin/google-chrome-stable"].find(fs.existsSync);
  const browser = await chromium.launch({ headless: true, ...(executablePath ? { executablePath } : {}) });
  try {
    let total = 0;
    for (const width of [375, 1280]) {
      const page = await browser.newPage({ viewport: { width, height: width === 375 ? 812 : 900 }, isMobile: width === 375, hasTouch: width === 375 });
      await page.goto(`${base}/visual.html?generator=${ids[0]}`, { waitUntil: "networkidle" });
      await page.waitForFunction(() => window.VISUAL_READY === true);
      if (width === 375) assert.ok(await page.locator("#visual-diagram").evaluate(node => node.scrollWidth <= node.clientWidth + 1),
        "mobile diagrams must fit without horizontal scrolling");
      const failures = await checkAtWidth(page, width);
      total += ids.length * 20;
      assert.deepEqual(failures, [], failures.slice(0, 12).join("\n"));
      await page.addStyleTag({ content: ".site-menu,.skip-link,.ai-tutor-launcher,.ai-tutor-dock,#visual-support,.visual-actions,.visual-secondary-actions,.visual-question-card [data-ai-tutor]{display:none!important}.visual-question-card{margin:0!important}" });
      for (const id of ids) {
        await page.locator("#visual-skill").selectOption(id);
        await page.waitForFunction(expected => document.querySelector("#visual-seed")?.textContent.startsWith(expected), id);
        if (width === 375) assert.ok(await page.locator("#visual-diagram").evaluate(node => node.scrollWidth <= node.clientWidth + 1),
          `${id} must fit without horizontal scrolling at 375px`);
        await page.locator(".visual-question-card").screenshot({ path: path.join(root, "artifacts", `visual-labels-${id}-${width}.png`) });
      }
      await page.close();
    }
    console.log(`Visual labels passed ${total} generator/seed/viewport renders (${ids.length} generators × 20 seeds × 2 widths): no label-box, axis, or shape collisions; fonts ≥11px at 375px; answers are not printed. Saved ${ids.length * 2} screenshots.`);
  } finally {
    await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}

run().catch(error => { console.error(error.stack || error); process.exitCode = 1; });
