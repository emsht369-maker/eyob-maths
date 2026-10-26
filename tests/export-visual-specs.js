"use strict";

const fs = require("fs");
const path = require("path");
const { loadVisual, root } = require("./visual-harness");

(async () => {
  const window = await loadVisual();
  const rows = [];
  for (const generator of window.VISUAL_GENERATORS) {
    for (let index = 0; index < 60; index += 1) {
      const seed = (index * 104729 + 271) >>> 0;
      const question = generator.make(window.VisualRNG.seeded(seed));
      rows.push({ generator: generator.id, seed, spec: question.spec, answer: question.answer });
    }
  }
  const output = path.join(root, "audit", "visual-specs.json");
  fs.mkdirSync(path.dirname(output), { recursive: true });
  fs.writeFileSync(output, JSON.stringify(rows, null, 2) + "\n");
  console.log(`Exported ${rows.length} seeded question specs to audit/visual-specs.json.`);
})().catch(error => {
  console.error(error.stack || error);
  process.exitCode = 1;
});
