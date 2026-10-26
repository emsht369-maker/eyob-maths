"use strict";

const assert = require("assert");
const { loadVisual } = require("./visual-harness");

const minimumVariety = new Set([
  "normal-distribution", "bearings", "sigmoid-graph", "pythagoras", "right-trigonometry",
  "distance-time", "graph-transformations", "function-graphs", "speed-time",
  "conversion-graph", "scatter-graph"
]);
const minimumGcseVariety = new Set([
  "place-value-rounding", "negative-thermometer", "bidmas-tree", "algebra-tiles",
  "completing-square", "iteration-staircase", "inequality-region", "factor-tree",
  "prime-sieve", "sequence-term-graph", "loci-bisectors", "nets-solids", "volume-solids",
  "plans-elevations", "symmetry", "congruence-similarity", "sine-cosine-rules",
  "sine-area", "3d-pythagoras", "compound-measures", "two-way-tables", "capture-recapture"
]);

function hasOutOfViewBox(svg) {
  const roots = [...svg.matchAll(/<svg\b[^>]*viewBox="([^"]+)"[^>]*>([\s\S]*?)<\/svg>/g)];
  if (!roots.length) return true;
  for (const root of roots) {
    const [minX, minY, width, height] = root[1].split(/\s+/).map(Number);
    if (![minX, minY, width, height].every(Number.isFinite) || width <= 0 || height <= 0) return true;
    const attrs = [...root[2].matchAll(/\b(x|y|cx|cy|x1|y1|x2|y2)="(-?\d+(?:\.\d+)?)"/g)];
    for (const [, name, raw] of attrs) {
      const value = Number(raw);
      if (!Number.isFinite(value)) return true;
      if (["x", "cx", "x1", "x2"].includes(name) && (value < minX - 0.01 || value > minX + width + 0.01)) return true;
      if (["y", "cy", "y1", "y2"].includes(name) && (value < minY - 0.01 || value > minY + height + 0.01)) return true;
    }
  }
  return false;
}

(async () => {
  const window = await loadVisual();
  const generators = window.VISUAL_GENERATORS;
  assert.strictEqual(generators.length, window.VISUAL_GENERATOR_FILES.length, "Every manifest entry must register exactly one generator.");
  for (const generator of generators) {
    const patterns = new Set();
    for (let index = 0; index < 300; index += 1) {
      const seed = (index * 7919 + 37) >>> 0;
      const question = generator.make(window.VisualRNG.seeded(seed));
      question.seed = seed;
      assert.ok(question && typeof question === "object", `${generator.id}: missing question object.`);
      assert.ok(question.prompt && question.diagram && question.solutionDiagram, `${generator.id}: missing prompt or SVG.`);
      assert.ok(Array.isArray(question.explainSteps) && question.explainSteps.length > 0, `${generator.id}: missing explanation steps.`);
      assert.ok(question.hint && question.explainSteps.length >= 3 && question.explainSteps.length <= 6, `${generator.id}: missing hint or has an invalid explanation length.`);
      assert.ok(question.answer !== undefined && question.answer !== null && String(question.answer).trim(), `${generator.id}: missing answer.`);
      for (const svg of [question.diagram, question.solutionDiagram]) {
        assert.match(svg, /<svg\b[^>]*role="img"/, `${generator.id}: SVG must have role=img.`);
        assert.match(svg, /<svg\b[^>]*aria-label="[^"]+"/, `${generator.id}: SVG is missing aria-label.`);
        assert.ok(!hasOutOfViewBox(svg), `${generator.id}: an SVG element is outside the viewBox.`);
      }
      if (question.type === "mc") {
        assert.ok(question.options.length >= 3 && question.options.length <= 4, `${generator.id}: expected three or four answer options.`);
        assert.strictEqual(new Set(question.options.map(option => option.value)).size, question.options.length, `${generator.id}: duplicate options.`);
        assert.strictEqual(question.options.filter(option => option.correct).length, 1, `${generator.id}: must have one correct option.`);
        assert.ok(question.options.filter(option => !option.correct).every(option => option.value !== String(question.answer)), `${generator.id}: a distractor equals the answer.`);
        assert.ok(question.options.every(option => option.content || option.svg), `${generator.id}: option has no text or SVG.`);
        for (const option of question.options.filter(option => option.svg)) {
          assert.match(option.svg, /<svg\b[^>]*role="img"/, `${generator.id}: SVG option must have role=img.`);
          assert.match(option.svg, /<svg\b[^>]*aria-label="[^"]+"/, `${generator.id}: SVG option needs aria-label.`);
          assert.ok(!hasOutOfViewBox(option.svg), `${generator.id}: an answer-option SVG is outside the viewBox.`);
        }
      }
      if (question.type === "click") assert.ok(question.clickTarget, `${generator.id}: click question has no target.`);
      assert.ok(window.VisualChecker.correct(question.answer, question.answer, { accept: question.accept, tolerance: question.tolerance }), `${generator.id}: answer does not pass its own checker.`);
      const serialized = JSON.stringify(question);
      assert.ok(!/\b(?:undefined|NaN)\b/.test(serialized), `${generator.id}: generated undefined or NaN.`);
      patterns.add(JSON.stringify(question.spec));
    }
    assert.ok(patterns.size >= 5, `${generator.id}: fewer than five parameter patterns.`);
    if (minimumVariety.has(generator.id)) {
      assert.ok(patterns.size >= 60, `${generator.id}: expected at least 60 patterns, got ${patterns.size}.`);
    }
    if (minimumGcseVariety.has(generator.id)) {
      assert.ok(patterns.size >= 40, `${generator.id}: expected at least 40 GCSE patterns, got ${patterns.size}.`);
    }
    console.log(`${generator.id}: 300 questions, ${patterns.size} parameter patterns`);
  }
  console.log("All visual generator checks passed.");
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
