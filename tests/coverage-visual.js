"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const sandbox = { ROOMS: [], ROOMS_DATA: { makePool: () => [] }, console };
sandbox.window = sandbox;
vm.createContext(sandbox);

const runFile = file => vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), sandbox, { filename: file });
runFile("js/data.js");
const topics = vm.runInContext("TOPICS", sandbox);
const gcseFiles = fs.readFileSync(path.join(root, "js/gcse/index.js"), "utf8").match(/"[^"]+\.js"/g) || [];
gcseFiles.forEach(value => runFile(`js/gcse/topics/${value.slice(1, -1)}`));
const roomsFiles = fs.readFileSync(path.join(root, "js/rooms/index.js"), "utf8").match(/"[^"]+\.js"/g) || [];
roomsFiles.forEach(value => runFile(value.slice(1, -1)));
runFile("js/visual/map.js");

const generatorFiles = fs.readFileSync(path.join(root, "js/visual/index.js"), "utf8").match(/"[^"]+\.js"/g) || [];
const generatorIds = new Set(generatorFiles.flatMap(value => {
  const file = path.join(root, "js/visual/generators", value.slice(1, -1));
  const source = fs.readFileSync(file, "utf8");
  return [...source.matchAll(/id:\s*"([^"]+)"/g)].map(match => match[1]);
}));

const records = [
  ...topics.map((topic, index) => ({ id: String(index), title: topic[1], area: topic[4], description: topic[3] })),
  ...sandbox.GCSE.map(topic => ({ id: topic.id, title: topic.title, area: topic.area, description: topic.idea })),
  ...sandbox.ROOMS.map(room => ({
    id: room.id, title: room.title, area: room.area, description: room.blurb,
    topics: (room.objectives || []).join(" ")
  }))
];
assert.equal(topics.length, 25, "Expected 25 main topics.");
assert.equal(sandbox.GCSE.length, 91, "Expected 91 GCSE topics.");
assert.equal(sandbox.ROOMS.length, 9, "Expected 9 rooms.");

const uncovered = [];
for (const record of records) {
  const ids = sandbox.VisualMap.idsFor(record);
  if (!ids.length) {
    uncovered.push(`${record.title} (${record.id})`);
    continue;
  }
  assert.ok(ids.length >= 3, `${record.title} has fewer than three visual generators.`);
  ids.forEach(id => assert.ok(generatorIds.has(id), `${record.title} maps to missing generator ${id}.`));
}

assert.ok(uncovered.every(title => /proof|definition|command words/i.test(title)),
  `Only definition/proof topics may be intentionally unillustrated: ${uncovered.join(", ")}`);
console.log(`Mapped ${records.length - uncovered.length}/${records.length} topics, GCSE topics and rooms to at least 3 existing generators.`);
console.log(`No-useful-picture topics: ${uncovered.length ? uncovered.join("; ") : "none"}`);
