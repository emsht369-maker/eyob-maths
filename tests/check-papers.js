"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const papers=require("../js/papers/engine.js");
const root=path.resolve(__dirname,"..");
const window={L:[],GCSE:[],GCSE_BANK:[]};
const context=vm.createContext({window,globalThis:window,L:window.L,console,Math,Date,JSON});

vm.runInContext(fs.readFileSync(path.join(root,"js/data.js"),"utf8"),context);
for(let index=1;index<=25;index+=1){
  const file=path.join(root,"js/lessons",String(index).padStart(2,"0")+".js");
  vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:file});
}
const metadata=vm.runInContext("TOPICS",context);
for(const file of fs.readFileSync(path.join(root,"js/gcse/index.js"),"utf8").split(/\r?\n/).filter(Boolean)){
  const name=file.trim().replace(/^["']|["']$/g,"");
  vm.runInContext(fs.readFileSync(path.join(root,"js/gcse/topics",name),"utf8"),context,{filename:name});
}
for(const file of fs.readFileSync(path.join(root,"js/gcse/bank/index.js"),"utf8").split(/\r?\n/).filter(Boolean)){
  const name=file.trim().replace(/^["']|["']$/g,"");
  vm.runInContext(fs.readFileSync(path.join(root,"js/gcse/bank",name),"utf8"),context,{filename:name});
}

assert.equal(metadata.length,25,"All 25 maths/ML topics must be available.");
assert.equal(window.L.filter(Boolean).length,25,"All 25 lesson banks must load.");
assert.equal(window.GCSE.length,91,"All 91 GCSE topic descriptions must load.");
assert.equal(window.GCSE_BANK.length,91,"All 91 GCSE question banks must load.");

const gcsePool=papers.buildGcsePool(window.GCSE_BANK,window.GCSE);
const mlPool=papers.buildMlPool(window.L,metadata);
assert.equal(gcsePool.length,3640,"The practice paper should include all banked GCSE questions.");
assert.equal(new Set(gcsePool.map(item=>item.id)).size,gcsePool.length,"GCSE question IDs must be unique.");
assert.ok(gcsePool.every(item=>item.q&&item.answer&&item.marks>0&&item.explanation.length>0),"Every GCSE question needs a prompt, answer, marks, and explanation.");
assert.equal(new Set(gcsePool.map(item=>item.topicId)).size,91,"All GCSE topics must be represented.");
assert.equal(new Set(mlPool.map(item=>item.topicId)).size,25,"All ML topics must be represented.");
assert.ok(mlPool.length>=600,"Lesson banks should provide enough questions for mixed and focused papers.");
assert.ok(mlPool.every(item=>item.q&&item.answer&&item.marks>0&&item.explanation.length>0),"Every ML question needs a prompt, answer, marks, and explanation.");
const alphaPrompt="Solve 2x + 3 = 11";
assert.equal(papers.wolframQuestionURL(alphaPrompt),"https://www.wolframalpha.com/input?i=Solve%202x%20%2B%203%20%3D%2011","Wolfram|Alpha links should encode the actual paper question.");
assert.equal(papers.autoMark("24","24"),true,"auto-mark accepts an exact stored answer");
assert.equal(papers.autoMark("x = 4","4"),true,"auto-mark accepts an equivalent equation result");
assert.equal(papers.autoMark("1/2","0.5"),true,"auto-mark accepts an equivalent fraction");
assert.equal(papers.autoMark("1, 2","12"),false,"auto-mark does not collapse separate values into a false match");
assert.equal(papers.autoMark("24",""),false,"auto-mark does not award marks for an empty response");

const random=(()=>{
  let seed=731;
  return ()=>((seed=(seed*48271)%2147483647)-1)/2147483646;
})();
const mixedGcseOptions={subject:"gcse",topicId:"all",area:"all",level:"all",tier:"all"};
const mixedGcse=papers.filterPool(gcsePool,mixedGcseOptions);
assert.equal(mixedGcse.length,3640,"Mixed GCSE selection should span the complete bank.");
const gcsePaper=papers.pickQuestions(mixedGcse,30,mixedGcseOptions,random);
assert.equal(gcsePaper.length,30,"A mixed GCSE paper should have the requested length.");
assert.equal(new Set(gcsePaper.map(item=>item.id)).size,30,"A GCSE paper should not repeat questions.");

const foundationOptions={subject:"gcse",topicId:"all",area:"all",level:"easy",tier:"foundation"};
const foundation=papers.filterPool(gcsePool,foundationOptions);
assert.ok(foundation.length>=20,"Foundation filtering should leave a useful question pool.");
assert.ok(foundation.every(item=>["F","FH"].includes(item.tier)&&item.level==="1-3"),"Foundation filtering must respect topic tier and question grade.");
const oneGcseTopic=gcsePool.find(item=>item.topicId);
const focusedGcse=papers.pickQuestions(papers.filterPool(gcsePool,{...mixedGcseOptions,topicId:oneGcseTopic.topicId}),10,mixedGcseOptions,random);
assert.equal(focusedGcse.length,10,"Focused GCSE papers should select the requested topic.");
assert.ok(focusedGcse.every(item=>item.topicId===oneGcseTopic.topicId),"Focused GCSE papers must not mix in other topics.");

const mixedMlOptions={subject:"ml",topicId:"all",area:"all",level:"all",tier:"all"};
const mlPaper=papers.pickQuestions(papers.filterPool(mlPool,mixedMlOptions),25,mixedMlOptions,random);
assert.equal(mlPaper.length,25,"A full mixed ML paper should contain one question for each subject.");
assert.equal(new Set(mlPaper.map(item=>item.topicId)).size,25,"A full mixed ML paper should cover every subject exactly once.");
const challengeOptions={...mixedMlOptions,level:"hard"};
const challengePool=papers.filterPool(mlPool,challengeOptions);
const challengePaper=papers.pickQuestions(challengePool,25,challengeOptions,random);
assert.equal(challengePaper.length,25,"A challenge paper should still cover every ML subject.");
const topicIdsWithHard=new Set(mlPool.filter(item=>item.level==="H").map(item=>item.topicId));
assert.ok(challengePaper.every(item=>item.level==="H"||!topicIdsWithHard.has(item.topicId)),"Challenge papers should use hard questions where present and fall back only if that topic has none.");
const focusedMlOptions={...mixedMlOptions,topicId:"2"};
const focusedMl=papers.pickQuestions(papers.filterPool(mlPool,focusedMlOptions),20,focusedMlOptions,random);
assert.equal(focusedMl.length,20,"Focused ML papers should support a single lesson topic.");
assert.ok(focusedMl.every(item=>item.topicId==="2"),"Focused ML papers must remain on the selected topic.");

console.log("Passed paper source coverage: 91 GCSE topics / 3,640 questions and 25 maths/ML topics / "+mlPool.length+" questions.");
console.log("Passed mixed, Foundation, topic-focused, and challenge paper selection checks.");
