"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const locks=require("../js/topic-locks.js");
const topicStyles=fs.readFileSync(path.join(__dirname,"../css/style.css"),"utf8");

const emptyRoomProgress={rooms:{},practiceMode:false};
const noTopicProgress={done:{},passed:{}};
const noRoomLinks={};
const topicCount=25;
const initiallyOpen=Array.from({length:topicCount},(_,index)=>
  locks.isTopicOpen(index,noRoomLinks,emptyRoomProgress,noTopicProgress,true)
);
assert.deepEqual(initiallyOpen,[true,...Array(topicCount-1).fill(false)],"Only topic 1 should be open with empty progress.");

const progress={done:{0:true},passed:{}};
assert.equal(locks.recordQuizResult(0,15,20,true,progress),false,"A score below 80% must fail.");
assert.equal(locks.recordQuizResult(0,20,20,false,progress),false,"A quiz pass must also require the completion tick.");
assert.equal(locks.isTopicOpen(1,noRoomLinks,emptyRoomProgress,progress,true),false,"Failing the first quiz must keep topic 2 locked.");
assert.equal(locks.isTopicOpen(2,noRoomLinks,emptyRoomProgress,progress,true),false,"Failing the first quiz must keep later topics locked.");

assert.equal(locks.recordQuizResult(0,16,20,true,progress),true,"Exactly 80% must pass.");
assert.equal(locks.isTopicOpen(1,noRoomLinks,emptyRoomProgress,progress,true),true,"Exactly 80% should unlock topic 2.");
assert.equal(locks.isTopicOpen(2,noRoomLinks,emptyRoomProgress,progress,true),false,"Passing topic 1 must unlock only topic 2.");

const linkedRooms={0:["gcse-bidmas"]};
const incompleteRoom={rooms:{"gcse-bidmas":{complete:false}},practiceMode:false};
assert.equal(locks.isTopicPassed(0,linkedRooms,incompleteRoom,{done:{0:true},passed:{0:true}}),false,"A linked topic must require the room exam completion.");
incompleteRoom.rooms["gcse-bidmas"].complete=true;
incompleteRoom.rooms["gcse-bidmas"].tasks=[true];
assert.equal(locks.isTopicPassed(0,linkedRooms,incompleteRoom,noTopicProgress),false,
  "A stale linked-room completion flag without submitted answers must not pass its topic.");
incompleteRoom.rooms["gcse-bidmas"].taskAttempts={"0-0":true};
assert.equal(locks.isTopicPassed(0,linkedRooms,incompleteRoom,noTopicProgress),true,
  "A passed linked room with task answers should pass its topic.");

const practiceRoomState={rooms:{"gcse-bidmas":{complete:false}},practiceMode:true};
assert.equal(locks.isTopicOpen(24,linkedRooms,practiceRoomState,noTopicProgress,true),true,"Practice mode should open every topic.");
assert.equal(locks.isTopicPassed(0,linkedRooms,practiceRoomState,noTopicProgress),false,"Practice mode must not mark a topic passed.");
assert.equal(locks.isTopicOpen(1,noRoomLinks,emptyRoomProgress,noTopicProgress,false),true,"TOPIC_LOCKS=false should leave topics open.");

const lockedCard=locks.lockedCard(1,["🍕","Fractions, Decimals & Percentages"],"Basic Arithmetic & Number Skills");
assert.match(lockedCard,/Finish: Basic Arithmetic &amp; Number Skills to unlock/);
assert.match(lockedCard,/locked-topic-placeholder/);
assert.doesNotMatch(lockedCard,/topic-open|<button|<input|tabindex|lesson text|Q1\\./i,"A locked card must not include focusable controls, lesson copy, or questions.");
assert.doesNotMatch(lockedCard,/practice question|exam question|worked example/i);
assert.match(topicStyles,/\.locked-topic-placeholder span\{[^}]*filter:blur\(3px\)/,"Only the locked placeholder content should be blurred.");
assert.doesNotMatch(topicStyles,/\.locked-card\{[^}]*filter:blur/,"The whole locked card must not be blurred.");

const initialRaw={
  rooms:{"gcse-bidmas":{complete:false,tasks:[true]}},
  points:10,
  badges:["First Room"],
  days:["2026-10-04"],
  practiceMode:false
};
const storage={
  value:JSON.stringify(initialRaw),
  getItem(){return this.value;},
  setItem(key,value){assert.equal(key,"mathmaster-rooms");this.value=value;}
};
assert.deepEqual(locks.readRoomProgress(storage),{practiceMode:false,rooms:initialRaw.rooms});
locks.setPracticeMode(storage,true);
const afterToggle=JSON.parse(storage.value);
assert.equal(afterToggle.practiceMode,true);
assert.deepEqual(afterToggle.rooms,initialRaw.rooms);
assert.equal(afterToggle.points,initialRaw.points);
assert.deepEqual(afterToggle.badges,initialRaw.badges);
assert.deepEqual(afterToggle.days,initialRaw.days);
const emptyStorage={value:null,getItem(){return this.value;},setItem(key,value){this.value=value;}};
locks.setPracticeMode(emptyStorage,true);
assert.deepEqual(Object.keys(JSON.parse(emptyStorage.value)).sort(),["badges","days","points","practiceMode","rooms"]);
const invalidStorage={value:"not json",getItem(){return this.value;},setItem(){throw new Error("Corrupt progress must not be overwritten.");}};
assert.throws(()=>locks.setPracticeMode(invalidStorage,true),/Could not update practice mode/);

const appSource=fs.readFileSync(path.join(__dirname,"../js/app.js"),"utf8");
assert.match(appSource,/const TOPIC_LOCKS = true;/,"The page should enable topic locks by default.");
assert.match(appSource,/0:\["gcse-bidmas"\]/,"The arithmetic topic should use its linked room exam.");
assert.match(appSource,/1:\["gcse-fractions","gcse-percentages"\]/,"The fractions and percentages topic should require both linked room exams.");
assert.match(appSource,/2:\["gcse-linear-equations"\]/,"The algebra topic should use its linked room exam.");
assert.match(appSource,/9:\["gcse-statistics"\]/,"The statistics topic should use its linked room exam.");
assert.match(appSource,/14:\["ml-dot-product"\]/,"The vectors topic should use its linked room exam.");
assert.match(appSource,/rooms\.html#room=/,"Linked topics should provide direct links to their Rooms.");
assert.match(appSource,/if\(TOPIC_LOCKS&&!isTopicOpen\(i\)\)\{[\s\S]*?lockedCard/,"The topic renderer must replace locked cards with placeholders.");

const lessons=[];
const window={L:lessons};
const context=vm.createContext({window,L:lessons,console});
for(const file of ["js/data.js","js/more-questions.js"]){
  vm.runInContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),context,{filename:file});
}
for(let index=1;index<=25;index+=1){
  const file="js/lessons/"+String(index).padStart(2,"0")+".js";
  vm.runInContext(fs.readFileSync(path.join(__dirname,"..",file),"utf8"),context,{filename:file});
}
const topics=vm.runInContext("TOPICS",context);
topics.forEach((topic,index)=>{
  const questions=(lessons[index]&&lessons[index].q||topic[5]||[]).concat(window.MORE_QUESTIONS[index]||[]);
  assert.ok(questions.length>=locks.QUIZ_SIZE,`Topic ${index+1} needs at least 20 practice questions.`);
});
console.log("Passed ordered topic lock, failed/exact-80% quiz, linked-room completion, practice-mode, and locked-card checks.");
