"use strict";

const fs = require("fs");
const vm = require("vm");

const source = fs.readFileSync("js/gcse/generators.js", "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(source, context);

const generators = context.window.GEN;
const seeded = context.window.GEN_SEEDED;
const names = Object.keys(generators || {});
if (names.length < 80) throw new Error(`Expected at least 80 generators, found ${names.length}`);
if (typeof seeded !== "function") throw new Error("The seeded RNG helper is missing.");

const areas = new Set();
for (const name of names) {
  const generator = generators[name];
  if (!generator.title || !generator.area || !generator.tier || typeof generator.make !== "function") {
    throw new Error(`Incomplete generator definition: ${name}`);
  }
  areas.add(generator.area);
  const firstRng = seeded(20250308);
  const secondRng = seeded(20250308);
  for (let sample = 0; sample < 200; sample += 1) {
    const question = generator.make(firstRng);
    const repeated = generator.make(secondRng);
    if (JSON.stringify(question) !== JSON.stringify(repeated)) {
      throw new Error(`Seed did not repeat output for ${name}, sample ${sample}`);
    }
    if (!question.q || !question.a || !Array.isArray(question.steps) || !question.steps.length ||
        !question.marks || !["calc", "noncalc"].includes(question.calc)) {
      throw new Error(`Incomplete generated question: ${name}, sample ${sample}`);
    }
    if (String(question.value) !== question.a) {
      throw new Error(`Answer differs from computed value for ${name}: ${question.a} vs ${question.value}`);
    }
    if (!question.steps[question.steps.length - 1].includes(question.a)) {
      throw new Error(`Final check does not confirm answer for ${name}: ${question.a}`);
    }
    const serialized = JSON.stringify(question);
    if (/NaN|undefined|null/.test(serialized)) {
      throw new Error(`Invalid generated text for ${name}, sample ${sample}: ${serialized}`);
    }
  }
}
for (const area of ["Number", "Algebra", "Ratio", "Geometry", "Probability", "Statistics"]) {
  if (!areas.has(area)) throw new Error(`No generators for ${area}`);
}

console.log(`${names.length} generators passed 200 seeded questions each (${names.length * 200} total).`);
