"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const VisualMap = require("../js/visual/map.js");

const root = path.resolve(__dirname, "..");
const pages = ["index.html", "gcse.html", "questions.html", "gcse-mock.html", "papers.html", "rooms.html"];
for (const page of pages) {
  const html = fs.readFileSync(path.join(root, page), "utf8");
  assert.match(html, /css\/visual-map\.css/, `${page} does not load Visual Map styles.`);
  assert.match(html, /js\/visual\/map\.js/, `${page} does not load Visual Map.`);
}

for (const file of ["js/app.js", "js/gcse/engine.js", "js/gcse/questions-engine.js", "js/papers/engine.js", "js/rooms/engine.js"]) {
  assert.match(fs.readFileSync(path.join(root, file), "utf8"), /VisualMap\.render/,
    `${file} does not render mapped visual practice.`);
}
assert.match(fs.readFileSync(path.join(root, "js/visual/engine.js"), "utf8"), /get\("generator"\)/,
  "Visual Lab does not open a selected mapped generator.");

const card = VisualMap.render({ title: "Geometry", area: "Geometry" });
assert.equal((card.match(/href="visual\.html\?generator=/g) || []).length, 3,
  "A mapped topic should offer three direct visual-practice links.");
const mlCard = VisualMap.render({ id: "ml-dot-product", path: "ml", title: "Dot Product of Two Vectors", area: "Linear algebra" });
assert.equal((mlCard.match(/href="visual\.html\?generator=/g) || []).length, 8,
  "An ML room should offer eight relevant visual-practice links.");
for (const id of ["dot-product-angle", "vectors-grid", "matrix-vector-grid", "gradient-descent", "sigmoid-graph", "regression", "matrix-transform-square", "eigenvector-direction"])
  assert.ok(mlCard.includes(`generator=${id}`), `ML room is missing ${id} visual practice.`);
for (const [roomId, expected] of Object.entries({
  "ml-matrix-vectors": ["matrix-vector-grid", "matrix-transform-square", "determinant-area", "eigenvector-direction"],
  "ml-linear-regression": ["regression", "scatter-graph", "function-graphs"],
  "ml-gradient-descent": ["gradient-descent", "function-minimum", "tangent-slope", "contour-gradient", "partial-contour-slope"]
})) {
  const card = VisualMap.render({ id: roomId, path: "ml", title: roomId, area: "Machine learning" });
  for (const id of expected) assert.ok(card.includes(`generator=${id}`), `${roomId} is missing ${id} visual practice.`);
}
console.log("Visual practice links are wired into all five requested learning surfaces.");
