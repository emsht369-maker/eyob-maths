"use strict";

const fs = require("fs");
const path = require("path");
const vm = require("vm");

const root = path.resolve(__dirname, "..");
const bankDir = path.join(root, "js/gcse/bank");
const indexPath = path.join(bankDir, "index.js");
const topicIndexPath = path.join(root, "js/gcse/index.js");
const files = fs.readFileSync(indexPath, "utf8").split(/\r?\n/)
  .map(line => line.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean);
const existingTopicFiles = fs.readFileSync(topicIndexPath, "utf8").split(/\r?\n/)
  .map(line => line.trim().replace(/^["']|["']$/g, ""))
  .filter(Boolean);
const expectedTopics = new Map();
for (const file of existingTopicFiles) {
  const source = fs.readFileSync(path.join(root, "js/gcse/topics", file), "utf8");
  const match = source.match(/\.push\((\{.*\})\);/s);
  if (!match) throw new Error(`Cannot read existing topic metadata: ${file}`);
  const topic = JSON.parse(match[1]);
  expectedTopics.set(topic.id, { area: topic.area, tier: topic.tier });
}
const ids = new Set();
const topicIds = new Set();
const summary = [];

for (const file of files) {
  if (!/^\d{2}-[\w-]+\.js$/.test(file)) throw new Error(`Invalid bank filename: ${file}`);
  const context = vm.createContext({ window: {} });
  vm.runInContext(fs.readFileSync(path.join(bankDir, file), "utf8"), context);
  const topics = context.window.GCSE_BANK || [];
  if (topics.length !== 1) throw new Error(`${file} must add exactly one topic`);
  const topic = topics[0];
  if (topicIds.has(topic.topic)) throw new Error(`Duplicate bank topic: ${topic.topic}`);
  topicIds.add(topic.topic);
  const expected = expectedTopics.get(topic.topic);
  if (!expected) throw new Error(`Bank topic is not in the existing topic index: ${topic.topic}`);
  if (topic.area !== expected.area || topic.tier !== expected.tier) {
    throw new Error(`Topic metadata mismatch for ${topic.topic}`);
  }
  if (!["Number", "Algebra", "Ratio", "Geometry", "Probability", "Statistics"].includes(topic.area) ||
      !["F", "H", "FH"].includes(topic.tier)) {
    throw new Error(`Invalid topic metadata: ${topic.topic}`);
  }
  if (topic.questions.length < 40) throw new Error(`${topic.topic} has fewer than 40 questions`);
  const levels = topic.questions.reduce((counts, question) => {
    counts[question.level] = (counts[question.level] || 0) + 1;
    return counts;
  }, {});
  if (levels["1-3"] !== 12 || levels["4-5"] !== 16 ||
      (levels["6-7"] || 0) + (levels["8-9"] || 0) !== 12) {
    throw new Error(`${topic.topic} does not have the required 12/16/12 level spread`);
  }
  for (const question of topic.questions) {
    if (ids.has(question.id)) throw new Error(`Duplicate question id: ${question.id}`);
    ids.add(question.id);
    if (!question.q || !question.answer || !Array.isArray(question.explain) ||
        question.explain.length < 3 || question.explain.length > 8 ||
        !Array.isArray(question.scheme) || !question.marks || !question.mistake || !question.why) {
      throw new Error(`Incomplete question: ${question.id}`);
    }
    if (!question.explain[0].toLowerCase().includes("question asks")) {
      throw new Error(`First explanation step does not state the task and method: ${question.id}`);
    }
    if (question.scheme.length !== question.marks) {
      throw new Error(`Mark-scheme line count mismatch: ${question.id}`);
    }
    if (!question.hint || !question.tags || !["AO1", "AO2", "AO3"].includes(question.ao) ||
        !["calc", "noncalc"].includes(question.calc) ||
        !["1-3", "4-5", "6-7", "8-9"].includes(question.level)) {
      throw new Error(`Invalid question fields: ${question.id}`);
    }
  }
  summary.push(`${topic.topic}: ${topic.questions.length}`);
}

if (topicIds.size !== expectedTopics.size) {
  const missing = [...expectedTopics.keys()].filter(id => !topicIds.has(id));
  throw new Error(`Bank has ${topicIds.size} topics but the source has ${expectedTopics.size}. Missing: ${missing.join(", ")}`);
}

console.log(summary.join("\n"));
console.log(`TOTAL: ${topicIds.size} topics, ${ids.size} questions`);
