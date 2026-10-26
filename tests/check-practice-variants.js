"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const window={};
vm.runInNewContext(
  fs.readFileSync(path.join(__dirname,"../js/practice-variants.js"),"utf8"),
  {window}
);

assert.equal(typeof window.PRACTICE_VARIATION_GENERATOR,"function");
const expectedFirstVariation=[
  ["15","0","3"],
  ["9","1/2","15"],
  ["x = 3","5","x = 3"],
  ["3","13","4"],
  ["9 cm²","12 cm","174°"],
  ["5/13","12/13","√2/2"],
  ["27","3","3"],
  ["18","22","13.5"],
  ["1/2","1/2","8"],
  ["5","4","5"],
  ["8","6","6"],
  ["1","6","Yes"],
  ["{5}","3","False"],
  ["24","3","3"],
  ["10","3 − 3i","3"],
  ["15","10","5"],
  ["3","(5, 2)","3"],
  ["(5, 2)","(-3, 3)","(0, 3)"],
  ["10","2","4"],
  ["3 and 4","12","12"],
  ["360°","6 cm","9 cm²"],
  ["5","9","9"],
  ["27","3","18"],
  ["6","6","3"],
  ["12 km/h","5","300"]
];
for(let topicIndex=0;topicIndex<25;topicIndex+=1){
  assert.equal(
    JSON.stringify(window.PRACTICE_VARIATION_GENERATOR(topicIndex,1).map(question=>question[1])),
    JSON.stringify(expectedFirstVariation[topicIndex]),
    `Topic ${topicIndex+1} has an incorrect answer in its first generated variation.`
  );
  const prompts=new Set();
  for(let variation=1;variation<=500;variation+=1){
    const questions=window.PRACTICE_VARIATION_GENERATOR(topicIndex,variation);
    assert.equal(questions.length,3,`Topic ${topicIndex+1} should generate three questions per variation.`);
    for(const question of questions){
      assert.ok(question[0].trim(),`Topic ${topicIndex+1} has an empty question.`);
      assert.ok(String(question[1]).trim(),`Topic ${topicIndex+1} has an empty answer.`);
      assert.ok(question[2].trim(),`Topic ${topicIndex+1} has no hint.`);
      assert.doesNotMatch(`${question[0]} ${question[1]}`,/undefined|NaN/);
      prompts.add(question[0]);
    }
  }
  assert.ok(prompts.size>=500,`Topic ${topicIndex+1} has only ${prompts.size} varied question prompts.`);
}

console.log("All 25 topics generate 500 safe parameter patterns with non-empty questions, answers, and hints.");
