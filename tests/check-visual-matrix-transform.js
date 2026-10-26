"use strict";

const assert = require("node:assert/strict");
const { loadVisual } = require("./visual-harness");

const matrices = [
  [[0, 0], [0, 0]], [[-2, 1], [3, -1]], [[1, 2], [0, 1]]
];
const random = (() => {
  let state = 0x51a7c0de;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return Math.floor(state / 4294967296 * 7) - 3;
  };
})();
while (matrices.length < 20) matrices.push([[random(), random()], [random(), random()]]);

(async () => {
  const window = await loadVisual();
  const generator = window.VISUAL_GENERATORS.find(item => item.id === "matrix-transform-square");
  assert.ok(generator, "matrix-transform-square generator is registered");
  let zeroEntries = 0, negativeEntries = 0, shearMatrices = 0;

  matrices.forEach((matrix, index) => {
    zeroEntries += matrix.flat().filter(value => value === 0).length;
    negativeEntries += matrix.flat().filter(value => value < 0).length;
    if (matrix[0][1] !== 0 || matrix[1][0] !== 0) shearMatrices += 1;
    const targetChoice = index % 3;
    const requestedIndex = [1, 3, 2][targetChoice];
    const values = [1, 0, 0, ...matrix.flat(), targetChoice];
    const rng = () => 0.5;
    rng.seed = index + 1;
    rng.int = () => values.shift();
    rng.pick = items => items[0];
    const question = generator.make(rng);
    const transform = question.diagram.match(/<polygon class="v-empty matrix-original"[^>]*data-vertices="([^"]+)"[^>]*points="([^"]+)"/);
    const image = question.diagram.match(/<polygon class="v-region matrix-image"[^>]*data-vertices="([^"]+)"[^>]*points="([^"]+)"/);
    assert.ok(transform && image, `case ${index + 1}: diagram contains the original and image squares`);
    const originalCoordinates = transform[1].split(";").map(pair => pair.split(",").map(Number));
    const imageCoordinates = image[1].split(";").map(pair => pair.split(",").map(Number));
    const originalScreen = transform[2].trim().split(/\s+/).map(pair => pair.split(",").map(Number));
    const imageScreen = image[2].trim().split(/\s+/).map(pair => pair.split(",").map(Number));
    const transformed = originalCoordinates.map(([x, y]) => [matrix[0][0] * x + matrix[0][1] * y || 0,
      matrix[1][0] * x + matrix[1][1] * y || 0]);
    assert.deepEqual(imageCoordinates, transformed, `case ${index + 1}: drawn image corners come from matrix multiplication`);
    assert.deepEqual(imageScreen[0], originalScreen[0], `case ${index + 1}: both shapes share the same origin pixel`);
    assert.equal(JSON.stringify(question.spec.image), JSON.stringify(transformed[requestedIndex]), `case ${index + 1}: stored requested answer matches matrix product`);
    assert.equal(String(question.answer), transformed[requestedIndex].join(","));
    assert.ok(question.accept.includes(`(${transformed[requestedIndex][0]}, ${transformed[requestedIndex][1]})`));
    assert.ok(question.accept.includes(`${transformed[requestedIndex][0]},${transformed[requestedIndex][1]}`));
    assert.ok(question.accept.includes(`(${transformed[requestedIndex][0]},${transformed[requestedIndex][1]})`));
    for (const submitted of [
      `(${transformed[requestedIndex][0]}, ${transformed[requestedIndex][1]})`,
      `${transformed[requestedIndex][0]},${transformed[requestedIndex][1]}`,
      `(${transformed[requestedIndex][0]},${transformed[requestedIndex][1]})`
    ]) assert.ok(window.VisualChecker.correct(question.answer, submitted, { accept: question.accept }),
      `case ${index + 1}: accepts coordinate format ${submitted}`);

    const [ox, oy] = originalScreen[0];
    const xScale = originalScreen[1][0] - ox;
    const yScale = oy - originalScreen[3][1];
    assert.ok(Math.abs(xScale - yScale) < 1e-8, `case ${index + 1}: x and y use one pixel scale`);
    for (const [x, y] of imageScreen) {
      assert.ok(x >= 44 && x <= 372 && y >= 18 && y <= 230,
        `case ${index + 1}: image corner (${x}, ${y}) is within the fitted drawing area`);
    }
    assert.match(question.prompt, /acts on column vectors: \(x, y\) → \(ax \+ by, cx \+ dy\)/);
    assert.equal(JSON.stringify(question.promptMatrix), JSON.stringify(matrix));
    assert.match(question.diagram, /aria-label="[^"]+"/);
    assert.match(question.diagram, /<desc>[^<]+<\/desc>/);
    for (const corner of ["O", "A(1,0)", "B(0,1)", "C(1,1)"])
      assert.ok(question.diagram.includes(`>${corner}<`), `case ${index + 1}: original corner ${corner} is labelled`);
    assert.match(question.diagram, /<desc>The outline is the unit square; the shaded polygon is its image under the displayed matrix\.<\/desc>/);
    assert.match(question.prompt, /→/);
    assert.equal(question.answerPlaceholder, question.spec.asked === "area" ? "Write the area scale factor" : "Write your answer as (x, y)");
    const imageCornerLabels = [...question.diagram.matchAll(/<text[^>]*class="[^"]*v-image-corner-label[^"]*"[^>]*>([^<]+)<\/text>/g)].map(match => match[1]);
    assert.ok(!imageCornerLabels.includes(["", "A′", "C′", "B′"][requestedIndex]),
      "the requested image corner is not labelled in the question diagram");
  });

  const areaMatrices = Array.from({ length: 5 }, (_, i) => matrices[i]);
  for (const [index, matrix] of areaMatrices.entries()) {
    const values = [1, 0, 0, ...matrix.flat(), index % 3];
    const rng = () => 0.1;
    rng.seed = index + 100;
    rng.int = () => values.shift();
    rng.pick = items => items[0];
    const question = generator.make(rng);
    const det = matrix[0][0] * matrix[1][1] - matrix[0][1] * matrix[1][0];
    assert.equal(question.spec.asked, "area");
    assert.equal(String(question.answer), String(Math.abs(det)));
    assert.equal(question.spec.matrix.flat().join(","), matrix.flat().join(","));
    assert.equal(question.answerPlaceholder, "Write the area scale factor");
    assert.ok(!question.diagram.includes(`Area scale factor = ${Math.abs(det)}`), "the requested area answer is not annotated on the question diagram");
  }

  assert.ok(zeroEntries > 0 && negativeEntries > 0 && shearMatrices > 0, "the 20 matrices include zero, negative, and shear entries");
  console.log(`Matrix transform passed ${matrices.length} corner cases and ${areaMatrices.length} area cases (including ${zeroEntries} zero entries, ${negativeEntries} negative entries, and ${shearMatrices} shears): shared origin, equal x/y scale, in-bounds corners, matrix-derived answers, varied corners, and accepted formats.`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
