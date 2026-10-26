"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const root=path.resolve(__dirname,"..");
const read=file=>fs.readFileSync(path.join(root,file),"utf8");

const question="Solve 3x + 2 = 11";
const expected="https://www.wolframalpha.com/input?i="+encodeURIComponent(question);
assert.equal(new URL(expected).searchParams.get("i"),question,"The URL must preserve the exact question text.");

const surfaces=[
  ["Topics","js/app.js",/wolframQuestionLink\(q\[0\]\)/,/Check this question with Wolfram\|Alpha/],
  ["GCSE topics","js/gcse/engine.js",/wolframQuestionLink|wolfram-question-link/,/Check this question with Wolfram\|Alpha/],
  ["GCSE Question Bank practice and exam review","js/gcse/questions-engine.js",/https:\/\/www\.wolframalpha\.com\/input\?i=\$\{encodeURIComponent\(plainQuestion\)\}/,/Check this question with Wolfram\|Alpha/],
  ["Rooms tasks and exam review","js/rooms/engine.js",/wolframQuestionLink\(question\.q\)/,/Check this question with Wolfram\|Alpha/],
  ["Practice Papers","js/papers/engine.js",/wolframQuestionURL\(question\.q\)/,/Explore this question with Wolfram\|Alpha/]
];
for(const [name,file,queryPattern,labelPattern] of surfaces){
  const source=read(file);
  assert.match(source,queryPattern,`${name} must make its Wolfram|Alpha query from the question text.`);
  assert.match(source,labelPattern,`${name} must show its per-question Wolfram|Alpha link.`);
}
const roomEngine=read("js/rooms/engine.js");
assert.ok(roomEngine.indexOf("function wolframQuestionLink")>roomEngine.indexOf("function escapeHTML"),"The shared Rooms question-link helper must be in the engine scope.");
assert.ok(roomEngine.indexOf("function wolframQuestionLink")<roomEngine.indexOf("function roomNext("),"The Rooms helper must be outside the question-pool builder and available to rendering.");
assert.doesNotMatch(read("js/gcse/questions-engine.js").match(/function addExamMarkup[\s\S]*?function startExam/)[0],/wolfram-question-link/,"The live timed GCSE exam must not show a solver link.");
assert.doesNotMatch(read("js/rooms/engine.js").match(/function renderExam\(room,record\)[\s\S]*?function renderResult/)[0],/wolframQuestionLink/,"The live locked Rooms exam must not show a solver link.");

const sharedStyles=read("css/style.css");
assert.match(sharedStyles,/a,\s*a:visited,\s*a:hover,\s*a:focus,\s*a:focus-visible,\s*a:active\{[^}]*color:\s*#60a5fa!important/i,"Every link state must use blue text, after page-specific stylesheet rules.");
for(const file of ["css/gcse.css","css/questions.css","css/rooms.css","css/papers.css"]){
  assert.ok(read(file).length>0,`${file} should remain present.`);
}
console.log("Passed Wolfram|Alpha question links and blue styling checks for all learning surfaces.");
