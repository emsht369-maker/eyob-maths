"use strict";

const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const engine=require("../js/rooms/engine.js");
const roomFiles=require("../js/rooms/index.js");
const root=path.resolve(__dirname,"..");
const dispatchedEvents=[];
globalThis.dispatchEvent=event=>{dispatchedEvents.push(event);return true;};
const window={ROOMS_DATA:{makePool:engine.makePool},ROOMS:[]};
const context=vm.createContext({window,globalThis:window});

for(const file of roomFiles){
  vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
}

const rooms=window.ROOMS;
const errors=[];
const allQuestionIds=new Set();
const roomIds=new Set();

function expect(condition,message){
  if(!condition)errors.push(message);
}

expect(engine.EXAM_SIZE>=21,"EXAM_SIZE must be at least 21.");
expect(engine.EXAM_SIZE===25,"Phase 1 exams must contain 25 questions.");
expect(engine.PASS_MARK===0.8,"PASS_MARK must be 0.8.");
expect(rooms.length===9,"The room paths must load all nine rooms.");

for(const room of rooms){
  expect(!roomIds.has(room.id),"Duplicate room id: "+room.id);
  roomIds.add(room.id);
  expect(Boolean(room.id),"A room is missing its id.");
  expect(["gcse","ml"].includes(room.path),room.id+" has an invalid path.");
  expect(Number.isInteger(room.order)&&room.order>0,room.id+" has an invalid order.");
  expect(room.tasks.length>=4&&room.tasks.length<=6,room.id+" must have 4 to 6 tasks.");
  expect(room.examPool.length>=40,room.id+" needs at least 40 exam questions.");
  expect(Array.isArray(room.objectives)&&room.objectives.length>=3,room.id+" needs three objectives.");
  expect(Boolean(room.next===null||typeof room.next==="string"),room.id+" needs a valid next value.");
  for(const task of room.tasks){
    expect(Boolean(task.title&&task.story&&task.learn&&task.example),room.id+" has an incomplete task.");
    expect(Array.isArray(task.questions)&&task.questions.length>0,room.id+" has a task without questions.");
    for(const question of task.questions){
      expect(Boolean(question.q&&question.answer!==undefined&&question.answer!==""),room.id+" has a task question without an answer.");
      expect(Array.isArray(question.explain)&&question.explain.length>=3,room.id+" has a task question without a full explanation.");
      expect(Boolean(question.hint),room.id+" has a task question without a hint.");
    }
  }
  for(const question of room.examPool){
    expect(Boolean(question.id&&question.q&&question.answer!==undefined&&question.answer!==""),room.id+" has an exam question without an id or answer.");
    expect(Array.isArray(question.explain)&&question.explain.length>=3,room.id+" has an exam question without a full explanation.");
    expect(["M","H","VH"].includes(question.level),room.id+" has an invalid exam level.");
    expect(!allQuestionIds.has(question.id),"Duplicate exam question id: "+question.id);
    allQuestionIds.add(question.id);
  }
}

for(const pathName of ["gcse","ml"]){
  const pathRooms=rooms.filter(room=>room.path===pathName).sort((a,b)=>a.order-b.order);
  expect(pathRooms.length>0,"Missing "+pathName+" path.");
  pathRooms.forEach((room,index)=>{
    expect(room.order===index+1,pathName+" room order is not consecutive.");
    expect(room.next===(pathRooms[index+1]?pathRooms[index+1].id:null),room.id+" has a broken next link.");
  });
}

const emptyState={rooms:{},practiceMode:false};
for(const room of rooms){
  const first=room.order===1;
  expect(engine.isRoomOpen(rooms,emptyState,room)===first,room.id+" has the wrong initial lock state.");
  const direct=engine.roomAccess(rooms,emptyState,room.id);
  expect(direct.allowed===first,room.id+" direct-link interaction access does not match the path rule.");
}

const gcseFirst=rooms.find(room=>room.id==="gcse-bidmas");
const gcseSecond=rooms.find(room=>room.id==="gcse-fractions");
const dotProduct=rooms.find(room=>room.id==="ml-dot-product");
expect(rooms.filter(room=>room.path==="ml").length===4,"The ML path should include four connected rooms.");
const mlRooms=rooms.filter(room=>room.path==="ml").sort((a,b)=>a.order-b.order);
expect(mlRooms.map(room=>room.id).join(",")==="ml-dot-product,ml-matrix-vectors,ml-linear-regression,ml-gradient-descent","The ML learning path order is unclear or incomplete.");
const threeDimensionalTask=dotProduct.tasks.find(task=>task.title==="Three dimensions and direction");
expect(!threeDimensionalTask.questions.some(question=>question.q==="Find (1, 2, 3) · (4, 5, 6)."),
  "The 3D dot-product practice question must not repeat its worked example.");
const failedState={rooms:{"gcse-bidmas":{complete:false,tasks:gcseFirst.tasks.map(()=>true)}},practiceMode:false};
expect(!engine.isRoomOpen(rooms,failedState,gcseSecond),"Completing tasks without passing the exam must not unlock the next room.");
failedState.rooms["gcse-bidmas"].attempts=1;
failedState.rooms["gcse-bidmas"].lastScore=19;
expect(!engine.roomAccess(rooms,failedState,gcseSecond.id).allowed,"A failed exam must keep the next room locked.");
failedState.rooms["gcse-bidmas"].lastScore=20;
failedState.rooms["gcse-bidmas"].complete=20/engine.EXAM_SIZE>=engine.PASS_MARK;
failedState.rooms["gcse-bidmas"].taskAttempts=Object.fromEntries(gcseFirst.tasks.flatMap((task,taskIndex)=>
  task.questions.map((_,questionIndex)=>[taskIndex+"-"+questionIndex,true])
));
expect(engine.isRoomOpen(rooms,failedState,gcseSecond),"Passing at exactly 80% must unlock the next room.");
const staleCompletion={rooms:{"gcse-bidmas":{
  complete:true,
  tasks:gcseFirst.tasks.map(()=>true),
  taskAttempts:{}
}},practiceMode:false};
expect(!engine.isRoomOpen(rooms,staleCompletion,gcseSecond),"Stale task flags without submitted answers must not unlock the next room.");
expect(!engine.roomComplete(gcseFirst,staleCompletion.rooms["gcse-bidmas"]),
  "A stale completion flag must not count as a completed room without every submitted answer.");
expect(engine.roomAccess(rooms,emptyState,"gcse-statistics").previous.id==="gcse-linear-equations","Locked page must identify the previous room.");
const taskRecord={tasks:[],complete:false};
assert.equal(engine.canOpenTask(gcseFirst,taskRecord,0),true,"The first task should be open.");
assert.equal(engine.canOpenTask(gcseFirst,taskRecord,1),false,"The next task should stay locked until the prior task is complete.");
const staleTaskRecord={tasks:gcseFirst.tasks.map(()=>true),complete:false,taskAttempts:{}};
assert.equal(engine.canOpenTask(gcseFirst,staleTaskRecord,1),false,"Stale task-completion booleans without submitted answers must not unlock the next task.");
const multiQuestionTask={id:"sequence-test",tasks:[{questions:[{},{}]},{questions:[{}]}]};
assert.equal(engine.canOpenQuestion(multiQuestionTask,taskRecord,0,0),true,"The first question should be open.");
assert.equal(engine.canOpenQuestion(multiQuestionTask,taskRecord,0,1),false,"The next question should stay locked until an answer is submitted.");
taskRecord.taskAttempts={"0-0":true};
assert.equal(engine.canOpenQuestion(multiQuestionTask,taskRecord,0,1),true,"Submitting any answer should open the next question.");
assert.equal(engine.canOpenQuestion(multiQuestionTask,taskRecord,0,2),false,"Questions after the next one must remain locked.");
taskRecord.taskAttempts["0-1"]=true;
assert.equal(engine.taskDone(multiQuestionTask,taskRecord,0),true,"A task is complete only after every question has been attempted.");
assert.equal(engine.tasksComplete(multiQuestionTask,taskRecord),false,"The room stays incomplete while its next task is unanswered.");
assert.equal(engine.canOpenTask(multiQuestionTask,taskRecord,1),true,"Submitting every question should open the following task.");
taskRecord.taskAttempts["1-0"]=true;
assert.equal(engine.tasksComplete(multiQuestionTask,taskRecord),true,"The room is complete only after every task question has been attempted.");
const rewardState={points:0,badges:[]},rewardRecord={};
assert.equal(engine.awardCorrectAnswer(rewardState,rewardRecord,"question-1"),10,"A correct answer should earn points.");
assert.equal(engine.awardCorrectAnswer(rewardState,rewardRecord,"question-1"),0,"The same correct answer must not earn points twice.");
assert.equal(rewardState.points,10,"Points should be stored once.");
assert.ok(rewardState.badges.includes("First Correct Answer"),"The first correct answer should earn a badge.");
assert.equal(dispatchedEvents.at(-1)?.type,"mm2:points","A correct answer should notify the shared points UI.");
assert.equal(dispatchedEvents.at(-1)?.detail.pointsEarned,10,"The points event should include the earned reward.");
const practiceState={rooms:{},practiceMode:true};
expect(rooms.every(room=>engine.roomAccess(rooms,practiceState,room.id).allowed),"Practice mode should unlock every room.");

const numericCases=[
  ["5","5",true],[" 5 ","5",true],["x=5","5",true],["X = 5","5",true],
  ["−5","-5",true],["–5","-5",true],["—5","-5",true],["-5","−5",true],
  ["1,000","1000",true],["1000","1,000",true],["1,000 cm","1000",true],
  ["12cm","12",true],["12 m","12",true],["5kg","5",true],["25%","25",false],
  ["25%","0.25",true],["12.5%","12.5",false],
  ["£12","12",true],["0.5","1/2",true],["1/2","0.5",true],["2/4","1/2",true],
  ["3/6","1/2",true],["1.25","5/4",true],["-0.75","−3/4",true],
  ["0.333333","1/3",true],["2.5000","2.5",true],["  3 / 4  ","0.75",true],
  ["6.02","6",false],["4","5",false],["","5",false],["   ","5",false],
  ["not 5","5",false],["x=6","5",false],["1/0","5",false],["£12","13",false],
  ["1,001","1000",false],["5kg","6",false],["0.49","1/2",false],["-5","5",false]
];
for(let value=0;value<12;value+=1){
  const answer=String(1000+value*17);
  numericCases.push([answer,answer,true]);
  numericCases.push([answer.replace(/\B(?=(\d{3})+(?!\d))/g,","),answer,true]);
  numericCases.push([String(Number(answer)+1),answer,false]);
}
for(const [response,answer,expected] of numericCases){
  assert.equal(engine.checkAnswer({answer:answer,accept:[],tolerance:0},response),expected,"Answer checker failed for "+JSON.stringify(response)+" against "+JSON.stringify(answer));
}
assert.equal(engine.checkAnswer({answer:"accepted",accept:["another phrase"],type:"text"},"another phrase"),true,"accept[] alternative was not accepted.");
assert.equal(engine.checkAnswer({answer:"10",tolerance:0.01},"10.005"),true,"Numeric tolerance was not applied.");
assert.equal(engine.checkAnswer({answer:"10",tolerance:0.01},"10.02"),false,"Numeric tolerance accepted a value outside its limit.");
assert.ok(numericCases.length+3>=60,"Answer checker must be tested with at least 60 cases.");
for(const room of rooms){
  for(const task of room.tasks){
    for(const question of task.questions){
      const finalStep=question.explain[question.explain.length-1];
      const results=finalStep.match(/[−-]?\d+(?:\.\d+)?(?:\/\d+)?/g)||[];
      expect(results.length>0&&engine.checkAnswer({answer:question.answer,accept:question.accept,tolerance:question.tolerance},results[results.length-1]),room.id+" explanation does not end with its stored result: "+question.q);
    }
  }
  for(const question of room.examPool){
    const finalStep=question.explain[question.explain.length-1];
    const results=finalStep.match(/[−-]?\d+(?:\.\d+)?(?:\/\d+)?/g)||[];
    expect(results.length>0&&engine.checkAnswer({answer:question.answer,accept:question.accept,tolerance:question.tolerance},results[results.length-1]),room.id+" exam explanation does not end with its stored result: "+question.q);
  }
}

const sampleExam=engine.selectExam(gcseFirst,[],12345);
const levelCounts=sampleExam.reduce((counts,item)=>{counts[item.level]=(counts[item.level]||0)+1;return counts;},{});
assert.equal(sampleExam.length,25,"A selected exam must contain 25 questions.");
assert.deepEqual(levelCounts,{M:8,H:10,VH:7},"Exam must contain the required level mix.");
const nextExam=engine.selectExam(gcseFirst,sampleExam.map(item=>item.id),54321);
for(const level of ["M","H","VH"]){
  const eligible=gcseFirst.examPool.filter(item=>item.level===level);
  const oldIds=new Set(sampleExam.filter(item=>item.level===level).map(item=>item.id));
  const freshIds=new Set(eligible.filter(item=>!oldIds.has(item.id)).map(item=>item.id));
  const selectedFresh=nextExam.filter(item=>item.level===level&&!oldIds.has(item.id));
  expect(selectedFresh.length===Math.min(freshIds.size,engine.EXAM_LEVELS[level]),"Retake should use every available unseen "+level+" question before repeats.");
}
const modeQuestion=rooms.find(room=>room.id==="gcse-statistics").tasks[2].questions[1];
assert.equal(engine.checkAnswer(modeQuestion,"6"),true,"Either valid mode should be accepted.");

if(errors.length){
  console.error(errors.join("\n"));
  process.exitCode=1;
}else{
  console.log("Passed room structure, 60+ answer-checker cases, lock/direct-link access checks, 80% pass boundary, and seeded exam selection. Locked room previews do not grant task or exam access.");
  console.log("Loaded "+rooms.length+" rooms; each has "+rooms[0].tasks.length+" tasks and at least 40 exam questions.");
}
