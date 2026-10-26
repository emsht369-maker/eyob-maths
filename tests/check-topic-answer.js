"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const app=fs.readFileSync(path.join(__dirname,"../js/app.js"),"utf8");
const start=app.indexOf("function normalizeAnswerText(value){");
const end=app.indexOf("\nfunction loadLessons(){",start);
assert.ok(start>=0&&end>start,"Could not locate the topic answer-checking helpers.");

const context=vm.createContext({});
vm.runInContext(app.slice(start,end),context,{filename:"js/app.js answer checker"});
const check=vm.runInContext("isAnswerCorrect",context);

for(const negative of ["-5","−5","–5","—5"]){
  assert.equal(check("−5",negative),true,`Expected ${negative} to match negative five.`);
  assert.equal(check(negative,"−5"),true,`Expected Unicode negative five to match ${negative}.`);
  assert.equal(check("−5","5"),false,"Positive five must not match negative five.");
  assert.equal(check("5","−5"),false,"Negative five must not match positive five.");
}

assert.equal(check("About 10,000","10000"),true,"Approximate answers should still accept the numeric value.");
assert.equal(check("x = 5","5"),true,"An equation answer should still accept its value.");
assert.equal(check("y = 2x + 1","y=2x+1"),true,"Equivalent equation formatting should still be accepted.");
assert.equal(check("5","50"),false,"A number embedded in a larger number must not be accepted.");
assert.equal(check("","8"),false,"A missing expected answer must never match the student's answer.");
assert.equal(check("25%","25"),false,"A percentage must not be confused with the same whole-number value.");
assert.equal(check("25%","0.25"),true,"Equivalent percentage and decimal values should be accepted.");

console.log("Passed topic answer sign, formatting, equation, and false-substring checks.");
