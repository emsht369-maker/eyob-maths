const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");

const root=path.resolve(__dirname,"..");
const window={L:[]};
const context={window,L:window.L};
vm.createContext(context);

for(const file of ["js/data.js","js/more-questions.js"]){
  vm.runInContext(fs.readFileSync(path.join(root,file),"utf8"),context,{filename:file});
}

for(let index=1;index<=25;index++){
  const file=path.join(root,"js","lessons",String(index).padStart(2,"0")+".js");
  if(fs.existsSync(file)){
    vm.runInContext(fs.readFileSync(file,"utf8"),context,{filename:path.relative(root,file)});
  }
}

const appSource=fs.readFileSync(path.join(root,"js","app.js"),"utf8");
const explanationStart=appSource.indexOf("function explainQuestion(question){");
const explanationEnd=appSource.indexOf("\nconst qsOf=",explanationStart);
if(explanationStart<0||explanationEnd<0)throw new Error("Could not find the app question explanation helper.");
vm.runInContext(appSource.slice(explanationStart,explanationEnd),context,{filename:"js/app.js explanation helper"});
const explainQuestion=vm.runInContext("explainQuestion",context);

const topics=vm.runInContext("TOPICS",context);
const failures=[];
console.log("Topic | Sections | Examples | Questions | With runtime explanation");

topics.forEach((topic,index)=>{
  const lesson=window.L[index]||{};
  const questions=(lesson.q||topic[5]||[]).concat(window.MORE_QUESTIONS[index]||[]);
  const normalized=questions.map(question=>({
    hint:question[2]||"Use the topic rule to work one step at a time.",
    explanation:explainQuestion(question)
  }));
  const sections=Array.isArray(lesson.s)?lesson.s:[];
  const examples=Array.isArray(lesson.e)?lesson.e:[];
  const explained=normalized.filter(question=>question.explanation.trim()).length;
  console.log(`${String(index+1).padStart(2,"0")} ${topic[1]} | ${sections.length} | ${examples.length} | ${questions.length} | ${explained}`);

  if(index===21){
    if(sections.length!==9)failures.push(`${index+1}: expected Before you start, seven goal sections, and Going further`);
    const goalSections=sections.filter(section=>/class="la-goal"/.test(section[1]||""));
    if(goalSections.length!==7)failures.push(`${index+1}: expected a teaching section for every learning goal`);
    if(goalSections.some(section=>(section[1].match(/Practise this/g)||[]).length!==1||
      !/Read the notes:/.test(section[1])||!/Common mistake:/.test(section[1]))){
      failures.push(`${index+1}: a goal section is missing its practice, notes, or mistake content`);
    }
  }else if(sections.length<6||sections.length>8){
    failures.push(`${index+1}: expected 6–8 lesson sections`);
  }
  if(examples.length<5)failures.push(`${index+1}: fewer than 5 worked examples`);
  if(questions.length<35)failures.push(`${index+1}: fewer than 35 practice questions`);
  if(normalized.some(question=>!question.hint.trim()||!question.explanation.trim())){
    failures.push(`${index+1}: a question is missing a hint or explanation`);
  }
});

if(failures.length){
  console.error("\nLesson checks failed:");
  failures.forEach(failure=>console.error("- "+failure));
  process.exitCode=1;
}else{
  console.log("\nAll lesson checks passed.");
}
