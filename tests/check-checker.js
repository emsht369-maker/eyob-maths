"use strict";

const assert = require("assert");
const fs = require("fs");
const vm = require("vm");
const context = vm.createContext({ window: {} });
vm.runInContext(fs.readFileSync("js/visual/checker.js", "utf8"), context);
const checker = context.window.VisualChecker;

const cases = [
  ["1/2", "0.5", true], ["2/4", "1/2", true], ["3/6", "0.5", true], ["1/3", "0.3333333333", true, 1e-8],
  ["−5", "-5", true], ["−2.5", "-2.5", true], ["1,000", "1000", true], ["  42 ", "42", true],
  ["5 cm", "5", true], ["5", "5 m", true], ["12kg", "12", true], ["25%", "25", true],
  ["£4.50", "4.5", true], ["$8", "8", true], ["3,500.25", "3500.25", true], ["x=5", "5", true],
  ["7", "x=7", true], ["8/4", "2.0", true], ["-3/2", "−1.5", true], ["0.25", "1/4", true],
  ["3.14159", "3.1416", true, 0.00002], ["6", "6.000000001", true, 1e-8], ["y = 2x + 1", "y=2x+1", true],
  ["right", "RIGHT", true], ["<", " < ", true], ["3", "", false], ["0", " ", false],
  ["5", "6", false], ["1/2", "0.6", false], ["1/3", "0.34", false], ["-4", "4", false],
  ["x=5", "x=6", false], ["100 cm", "1 m", false], ["5 kg", "5 g", false], ["12%", "12.1%", false],
  ["1,000", "1,001", false], ["2/3", "3/2", false], ["3.5", "3", false], ["answer", "answering", false],
  ["1/2", "2/4", true], ["50%", "0.5", false], ["90°", "90", true], ["-0.75", "−3/4", true],
  ["0.2", "1/5", true], ["8 m", "8m", true], ["5", "5 cm", true], ["10", "10%", true],
  ["x=0", "0", true], ["2,000", "2,000.0", true], ["1.25", "5/4", true], ["2.25", "9/4", true],
  ["0.1", "1/10", true], ["-12", "−12", true], ["1,234.5", "1234.5", true], ["30°", "30deg", true],
  ["2", "2.0001", false], ["1000", "1,000.1", false], ["3/4", "0.7", false], ["14", "−14", false],
  ["", "0", false], ["undefined", "", false], ["1", "NaN", false], ["0.5", "50", false],
  ["y=1/2x+1", "y=0.5x+1", true], ["2.50", "2.5", true]
];

for (const [expected, submitted, result, tolerance] of cases) {
  assert.strictEqual(checker.correct(expected, submitted, { tolerance }), result, `${JSON.stringify([expected, submitted])}`);
}
assert.strictEqual(checker.correct("blue", "azure", { accept: ["azure"] }), true);
console.log(`Passed ${cases.length + 1} smart answer checker cases.`);
