(function(root){
  "use strict";

  const HISTORY_KEY="mathmaster-papers";
  const ACTIVE_KEY="mathmaster-paper-active";
  const escapeHTML=value=>String(value==null?"":value)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const plainText=value=>String(value==null?"":value)
    .replace(/<br\s*\/?>/gi,"\n").replace(/<\/p\s*>/gi,"\n")
    .replace(/<[^>]*>/g,"").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&")
    .replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&divide;/gi,"÷")
    .replace(/&times;/gi,"×").replace(/&minus;/gi,"−").trim();
  const wolframQuestionURL=question=>"https://www.wolframalpha.com/input?i="+encodeURIComponent(question);

  function normaliseMark(value){
    return String(value==null?"":value).trim().toLowerCase()
      .replace(/[−﹣－‐‑‒–—]/g,"-").replace(/[×·]/g,"*").replace(/÷/g,"/")
      .replace(/π/g,"pi").replace(/\s+/g,"");
  }

  function scalarMark(value){
    const text=normaliseMark(value).replace(/(?:cm|mm|km|kg|degrees?|deg|°)$/i,"");
    const fraction=text.match(/^([-+]?\d*\.?\d+)\/([-+]?\d*\.?\d+)$/);
    if(fraction){const denominator=Number(fraction[2]);return denominator===0?null:Number(fraction[1])/denominator;}
    if(/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/.test(text))return Number(text);
    return null;
  }

  function autoMark(expected,submitted){
    if(!String(submitted==null?"":submitted).trim())return false;
    const expectedText=normaliseMark(expected),submittedText=normaliseMark(submitted);
    if(expectedText===submittedText)return true;
    const alternatives=[expectedText];
    if(!expectedText.includes(",")&&!expectedText.includes(";")){
      const equalParts=expectedText.split("=");
      if(equalParts.length===2)alternatives.push(equalParts[1]);
      if(expectedText.includes("≈"))alternatives.push(...expectedText.split("≈"));
    }
    if(!expectedText.includes(",")&&!expectedText.includes(";"))alternatives.push(...expectedText.split("≈"));
    return alternatives.some(candidate=>{
      const clean=candidate.replace(/^[a-z]=/i,"");
      if(clean===submittedText)return true;
      const expectedNumber=scalarMark(clean),submittedNumber=scalarMark(submittedText);
      return expectedNumber!==null&&submittedNumber!==null&&Math.abs(expectedNumber-submittedNumber)<=1e-8;
    });
  }

  function shuffle(items,random){
    const result=items.slice();
    for(let index=result.length-1;index>0;index-=1){
      const other=Math.floor(random()*(index+1));
      [result[index],result[other]]=[result[other],result[index]];
    }
    return result;
  }

  function filterPool(pool,options){
    const scoped=pool.filter(item=>{
      if(options.topicId&&options.topicId!=="all"&&item.topicId!==options.topicId)return false;
      if(options.area&&options.area!=="all"&&item.area!==options.area)return false;
      if(options.subject==="gcse"&&options.tier==="foundation"&&!["F","FH"].includes(item.tier))return false;
      if(options.subject==="gcse"&&options.tier==="higher"&&!["H","FH"].includes(item.tier))return false;
      return true;
    });
    if(options.subject==="ml"&&["easy","medium","hard"].includes(options.level)){
      const wanted=options.level==="easy"?"E":options.level==="medium"?"M":"H";
      const fallbacks=options.level==="easy"?["E","M","H"]:options.level==="medium"?["M","H","E"]:["H","M","E"];
      const available=new Map();
      for(const item of scoped){
        if(!available.has(item.topicId))available.set(item.topicId,new Set());
        available.get(item.topicId).add(item.level);
      }
      const selectedLevel=new Map();
      for(const [topicId,levels] of available){
        selectedLevel.set(topicId,fallbacks.find(level=>levels.has(level))||wanted);
      }
      return scoped.filter(item=>item.level===selectedLevel.get(item.topicId));
    }
    return scoped.filter(item=>{
      if(options.level==="easy"&&item.level!=="E"&&item.level!=="1-3")return false;
      if(options.level==="medium"&&item.level!=="M"&&item.level!=="4-5")return false;
      if(options.level==="hard"&&item.level!=="H"&&item.level!=="6-9")return false;
      return true;
    });
  }

  function pickQuestions(pool,count,options,random){
    const source=pool.slice();
    if(options.subject==="ml"&&(!options.topicId||options.topicId==="all")){
      const byTopic=new Map();
      for(const question of source){
        if(!byTopic.has(question.topicId))byTopic.set(question.topicId,[]);
        byTopic.get(question.topicId).push(question);
      }
      const topicIds=shuffle(Array.from(byTopic.keys()),random);
      const selected=[];
      const rounds=options.level==="hard"?["H","M","E"]:options.level==="medium"?["M","H","E"]:options.level==="easy"?["E","M","H"]:[""];
      for(const topicId of topicIds){
        if(selected.length>=count)break;
        const questions=byTopic.get(topicId);
        let candidates=[];
        for(const level of rounds){
          candidates=level?questions.filter(question=>question.level===level):questions;
          if(candidates.length)break;
        }
        if(candidates.length)selected.push(shuffle(candidates,random)[0]);
      }
      return shuffle(selected,random);
    }
    return shuffle(source,random).slice(0,count);
  }

  function buildGcsePool(banks,topicList){
    const titles=new Map(topicList.map(topic=>[topic.id,plainText(topic.title)]));
    return banks.flatMap(bank=>(bank.questions||[]).map((question,index)=>({
      id:question.id||bank.topic+"-"+String(index+1),
      subject:"gcse",
      topicId:bank.topic,
      topic:titles.get(bank.topic)||bank.topic,
      area:bank.area||"",
      tier:bank.tier||"FH",
      level:question.level||"4-5",
      marks:Math.max(1,Number(question.marks)||1),
      q:plainText(question.q),
      answer:plainText(question.answer),
      explanation:(question.explain||[]).map(plainText).filter(Boolean),
      scheme:(question.scheme||[]).map(plainText).filter(Boolean)
    })));
  }

  function buildMlPool(lessons,topicMetadata){
    return lessons.flatMap((lesson,index)=>{
      const metadata=topicMetadata[index]||[];
      const topic=metadata[1]||"Maths topic "+(index+1);
      const questions=lesson&&Array.isArray(lesson.q)?lesson.q:[];
      return questions.map((question,questionIndex)=>({
        id:"ml-"+String(index+1).padStart(2,"0")+"-"+String(questionIndex+1).padStart(2,"0"),
        subject:"ml",
        topicId:String(index),
        topic:topic,
        area:metadata[2]||"Maths and machine learning",
        tier:"FH",
        level:["E","M","H"].includes(question[4])?question[4]:"M",
        marks:question[4]==="H"?4:question[4]==="E"?2:3,
        q:plainText(question[0]),
        answer:plainText(question[1]),
        hint:plainText(question[2]),
        explanation:plainText(question[3]).split(/\n+/).map(step=>step.replace(/^\d+\.\s*/,"").trim()).filter(Boolean),
        scheme:[]
      }));
    });
  }

  const api={filterPool:filterPool,pickQuestions:pickQuestions,buildGcsePool:buildGcsePool,buildMlPool:buildMlPool,wolframQuestionURL:wolframQuestionURL,autoMark:autoMark};
  root.PAPER_ENGINE=api;
  if(typeof module!=="undefined"&&module.exports)module.exports=api;

  if(typeof document==="undefined"||!document.getElementById("paper-start"))return;

  const byId=id=>document.getElementById(id);
  const assetURL=path=>root.MATH_MASTER_ASSETS?.[path]||path;
  let gcseTopics=[];
  let gcseBanks=[];
  let mlTopics=[];
  let mlLessons=[];
  let activePaper=[];
  let paperResponses=[];
  let timer=null;
  let deadline=0;
  let paperDuration=0;
  let paperMode="untimed";
  let paperSubject="gcse";
  let paperTopic="all";
  let paperTopicLabel="Mixed topics";
  let paperMarks=[];
  let candidateName="";
  let paperSubmitted=false;
  let paperScored=false;
  let savedActivePaper=null;
  try{
    const saved=JSON.parse(localStorage.getItem(ACTIVE_KEY)||"null");
    if(saved&&Array.isArray(saved.questions)&&saved.questions.length)savedActivePaper=saved;
  }catch(_){localStorage.removeItem(ACTIVE_KEY);}
  if(savedActivePaper?.mode==="timed"&&!savedActivePaper.submitted)document.body.dataset.paperActive="true";

  function loadScript(src){
    return new Promise((resolve,reject)=>{
      const script=document.createElement("script");
      script.src=assetURL(src);
      script.onload=resolve;
      script.onerror=()=>reject(new Error("Could not load "+src+"."));
      document.head.appendChild(script);
    });
  }

  async function readList(url,pattern){
    const response=await fetch(assetURL(url));
    if(!response.ok)throw new Error("Could not load "+url+" (HTTP "+response.status+").");
    const files=(await response.text()).split(/\r?\n/).map(line=>line.trim().replace(/^["']|["']$/g,"")).filter(Boolean);
    if(files.some(file=>!pattern.test(file)))throw new Error("The file list "+url+" contains an invalid filename.");
    return files;
  }

  async function loadQuestionBanks(){
    root.L=[];
    root.GCSE=[];
    root.GCSE_BANK=[];
    await loadScript("js/data.js");
    const lessonFiles=Array.from({length:25},(_,index)=>String(index+1).padStart(2,"0")+".js");
    for(const file of lessonFiles)await loadScript("js/lessons/"+file);
    mlTopics=typeof TOPICS!=="undefined"?TOPICS:[];
    mlLessons=root.L||[];
    if(mlTopics.length!==25||mlLessons.filter(Boolean).length!==25)throw new Error("Expected 25 complete maths and ML lesson banks.");

    for(const file of await readList("js/gcse/index.js",/^[\w-]+\.js$/))await loadScript("js/gcse/topics/"+file);
    for(const file of await readList("js/gcse/bank/index.js",/^\d{2}-[\w-]+\.js$/))await loadScript("js/gcse/bank/"+file);
    gcseTopics=root.GCSE||[];
    gcseBanks=root.GCSE_BANK||[];
    if(gcseTopics.length!==91||gcseBanks.length!==91)throw new Error("Expected 91 GCSE topic pages and 91 GCSE question banks.");
  }

  function updateSubjectControls(){
    const subject=byId("paper-subject").value;
    byId("paper-tier-wrap").hidden=subject!=="gcse";
    byId("paper-tier").disabled=subject!=="gcse";
    byId("paper-area-label").textContent=subject==="gcse"?"Area":"Learning pathway";
    byId("paper-area").setAttribute("aria-label",subject==="gcse"?"Filter GCSE topics by area":"Filter maths and ML topics by pathway");
    const topics=subject==="gcse"?gcseTopics:mlTopics.map((topic,index)=>({id:String(index),title:topic[1],area:topic[2]}));
    const areaSelect=byId("paper-area");
    const selectedArea=areaSelect.value;
    const areas=Array.from(new Set(topics.map(topic=>topic.area||"Other"))).sort();
    areaSelect.innerHTML="<option value=\"all\">All areas</option>"+areas.map(area=>"<option value=\""+escapeHTML(area)+"\">"+escapeHTML(area)+"</option>").join("");
    if(areas.includes(selectedArea))areaSelect.value=selectedArea;
    const area=areaSelect.value;
    const topicSelect=byId("paper-topic");
    const selectedTopic=topicSelect.value;
    const eligible=topics.filter(topic=>area==="all"||(topic.area||"Other")===area);
    topicSelect.innerHTML="<option value=\"all\">Mixed paper</option>"+eligible.map(topic=>"<option value=\""+escapeHTML(String(topic.id))+"\">"+escapeHTML(plainText(topic.title))+"</option>").join("");
    if(eligible.some(topic=>String(topic.id)===selectedTopic))topicSelect.value=selectedTopic;
    const level=byId("paper-level");
    level.innerHTML=subject==="gcse"?
      "<option value=\"all\">Mixed difficulty</option><option value=\"easy\">Foundation / grades 1–3</option><option value=\"medium\">Grades 4–5</option><option value=\"hard\">Higher / grades 6–9</option>":
      "<option value=\"all\">Mixed difficulty</option><option value=\"easy\">Easier questions</option><option value=\"medium\">Medium questions</option><option value=\"hard\">Challenge questions</option>";
    updateCountOptions();
  }

  function updateCountOptions(){
    const isMl=byId("paper-subject").value==="ml";
    const select=byId("paper-count");
    const allowed=isMl?["10","20","25"]:["10","20","25","30"];
    const current=select.value;
    select.innerHTML=allowed.map(value=>"<option value=\""+value+"\">"+value+" questions</option>").join("");
    select.value=allowed.includes(current)?current:(isMl?"25":"30");
  }

  function currentPool(){
    const subject=byId("paper-subject").value;
    const all=subject==="gcse"?buildGcsePool(gcseBanks,gcseTopics):buildMlPool(mlLessons,mlTopics);
    const options={
      subject:subject,
      topicId:byId("paper-topic").value,
      area:byId("paper-area").value,
      level:byId("paper-level").value,
      tier:subject==="gcse"?byId("paper-tier")?.value||"all":"all"
    };
    return {pool:filterPool(all,options),options:options};
  }

  function renderHistory(){
    const target=byId("paper-history");
    let records=[];
    try{records=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");}catch(error){
      console.error("Saved practice paper history could not be read.",error);
      target.innerHTML="<p class=\"paper-help\">Saved result history could not be read. New papers can still be completed.</p>";
      return;
    }
    if(!Array.isArray(records)||!records.length){
      target.innerHTML="<p class=\"paper-help\">Your completed papers will appear here on this device.</p>";
      return;
    }
    target.innerHTML=records.slice(-8).reverse().map(record=>"<article class=\"paper-history-item\"><b>"+escapeHTML(new Date(record.date).toLocaleString())+"</b><br>"+escapeHTML(record.subject)+" · "+escapeHTML(record.topic)+" · "+record.earned+"/"+record.total+" marks ("+record.percent+"%)</article>").join("");
  }

  function renderQuestion(question,index){
    const automaticMark=autoMark(question.answer,paperResponses[index]||"");
    const suggestedMark=automaticMark?question.marks:0;
    const storedMark=Number.isFinite(paperMarks[index])?paperMarks[index]:suggestedMark;
    const source=paperSubmitted?
      "<div class=\"paper-review-content\" id=\"paper-review-"+index+"\"><p class=\"paper-student-response\"><b>Your attempt:</b><br>"+escapeHTML(paperResponses[index]||"No response entered.")+"</p><h4>Answer and worked solution</h4><p><b>Answer:</b> "+escapeHTML(question.answer||"No stored answer.")+"</p>"+
      (question.explanation.length?"<ol>"+question.explanation.map(step=>"<li>"+escapeHTML(step)+"</li>").join("")+"</ol>":question.scheme.length?"<ol>"+question.scheme.map(step=>"<li>"+escapeHTML(step)+"</li>").join("")+"</ol>":"<p>No detailed worked solution is stored for this question. Use the official past-paper link or your teacher's mark scheme to check your method.</p>")+ 
      "<p class=\"paper-auto-mark\" role=\"status\">Auto-mark: "+(automaticMark?"answer matched":"no exact match")+". Review your method and adjust the mark if needed.</p><label class=\"paper-mark-label\">Marks earned (0–"+question.marks+")<input class=\"paper-mark-input\" type=\"number\" min=\"0\" max=\""+question.marks+"\" value=\""+storedMark+"\" data-awarded-mark=\""+index+"\" aria-label=\"Marks earned for question "+(index+1)+"\"></label></div>":
      "<div class=\"paper-empty-lines\" aria-hidden=\"true\"></div>";
    const wolframLink=!document.body.dataset.paperActive||paperSubmitted?
      "<a class=\"wolfram-question-link\" href=\""+escapeHTML(wolframQuestionURL(question.q))+"\" target=\"_blank\" rel=\"noopener noreferrer\">Explore this question with Wolfram|Alpha ↗</a>":"";
    return "<article class=\"paper-question"+(paperSubmitted?" is-review":"")+"\" data-paper-question=\""+index+"\"><div class=\"paper-question-header\"><div><h3>Question "+(index+1)+"</h3><span class=\"paper-topic-label\">"+escapeHTML(question.topic)+" · "+escapeHTML(question.level)+"</span></div><span class=\"paper-mark-box\">"+question.marks+" mark"+(question.marks===1?"":"s")+"</span></div><p class=\"paper-prompt\">"+escapeHTML(question.q)+"</p>"+wolframLink+
      (root.VisualMap?root.VisualMap.render({id:question.topicId,title:question.topic,area:question.area}):"")+ 
      (!paperSubmitted?"<label class=\"paper-response-label\" for=\"paper-response-"+index+"\">Your answer and working</label><textarea class=\"paper-response\" id=\"paper-response-"+index+"\" data-paper-response=\""+index+"\" aria-label=\"Your answer and working for question "+(index+1)+"\">"+escapeHTML(paperResponses[index]||"")+"</textarea>":"")+ 
      source+"</article>";
  }

  function attachPaperTutors(){
    if(!root.AITutor)return;
    activePaper.forEach((question,index)=>{
      const card=byId("paper-workspace").querySelector(`[data-paper-question="${index}"]`);
      if(!card)return;
      root.AITutor.attach(card,{
        question:question.q,
        topic:question.topic,
        level:question.level,
        studentAnswer:paperSubmitted?paperResponses[index]||"":"",
        responseElement:paperSubmitted?null:card.querySelector("[data-paper-response]"),
        isBlocked:()=>document.body.dataset.paperActive==="true"
      });
    });
  }

  function renderPaper(){
    const workspace=byId("paper-workspace");
    if(!activePaper.length){workspace.innerHTML="";return;}
    const subject=paperSubject;
    const title=subject==="gcse"?"GCSE Mathematics Practice Paper":"Maths and Machine Learning Challenge Paper";
    const count=activePaper.length;
    const total=activePaper.reduce((sum,question)=>sum+question.marks,0);
    const minutes=paperDuration;
    const timeAllowed=minutes>0?minutes+" minutes":"Untimed practice";
    const topicTitle=paperTopicLabel;
    let previousTopic="";
    const questions=activePaper.map((question,index)=>{
      const section=question.topic===previousTopic?"":"<h2 class=\"paper-section-title\">"+escapeHTML(question.topic)+"</h2>";
      previousTopic=question.topic;
      return section+renderQuestion(question,index);
    }).join("");
    workspace.innerHTML=
      "<section class=\"paper-cover\"><span class=\"paper-code\">MATH MASTER · ORIGINAL PRACTICE · "+(subject==="gcse"?"GCSE":"MATHS + ML")+"</span><h2>"+title+"</h2><p>"+escapeHTML(topicTitle)+"</p>"+
      "<div class=\"paper-cover-grid\"><div><small>Questions</small><strong>"+count+"</strong></div><div><small>Maximum marks</small><strong>"+total+"</strong></div><div><small>Time allowed</small><strong>"+escapeHTML(timeAllowed)+"</strong></div></div>"+
      "<label class=\"paper-candidate\">Candidate name <input type=\"text\" maxlength=\"80\" aria-label=\"Candidate name\" value=\""+escapeHTML(candidateName)+"\"></label>"+
      "<ul class=\"paper-instructions\"><li>Show your working in the answer spaces.</li><li>Your work saves automatically on this device.</li><li>Timed mode blocks tutor help until you submit.</li><li>This is original practice material, not an official exam-board paper.</li></ul></section>"+
      "<div class=\"paper-exam-bar\"><strong>"+escapeHTML(title)+"</strong><span class=\"paper-clock\" id=\"paper-clock\" aria-live=\"off\">"+(minutes>0?"Time: "+minutes+":00":"Untimed practice")+"</span><span>Question "+count+" · "+total+" marks</span></div>"+
      questions+
      (!paperSubmitted?"<div class=\"paper-actions\"><button id=\"paper-submit\" class=\"paper-submit\" type=\"button\">Submit paper and view answers</button></div>":"<div class=\"paper-actions\"><button id=\"paper-save-score\" class=\"paper-save-score\" type=\"button\">Finish self-marking and save score</button><button id=\"paper-print-review\" class=\"paper-secondary\" type=\"button\">Print paper and review</button></div>");
    byId("paper-print").disabled=false;
    attachPaperTutors();
  }

  function saveActivePaper(){
    if(!activePaper.length||paperScored){
      localStorage.removeItem(ACTIVE_KEY);
      return;
    }
    const state={
      version:1,questions:activePaper,responses:paperResponses,marks:paperMarks,
      subject:paperSubject,area:byId("paper-area").value,tier:byId("paper-tier").value,
      topic:paperTopic,level:byId("paper-level").value,count:byId("paper-count").value,
      mode:paperMode,duration:paperDuration,deadline:deadline,submitted:paperSubmitted,candidateName:candidateName
    };
    try{localStorage.setItem(ACTIVE_KEY,JSON.stringify(state));}
    catch(_){byId("paper-message").textContent="Your browser could not save this paper. Check available device storage.";}
  }

  function updateModeChoice(){
    const timed=byId("paper-mode-choice").querySelector('input[name="paper-mode"]:checked')?.value==="timed";
    byId("paper-duration-wrap").hidden=!timed;
    byId("paper-duration").disabled=!timed;
  }

  function startTimer(){
    if(timer)clearInterval(timer);
    const clock=byId("paper-clock");
    if(paperDuration<=0){
      deadline=0;
      timer=null;
      clock.textContent="Untimed practice";
      clock.classList.remove("is-low");
      document.body.dataset.paperActive="false";
      saveActivePaper();
      return;
    }
    if(!deadline)deadline=Date.now()+paperDuration*60*1000;
    document.body.dataset.paperActive="true";
    saveActivePaper();
    const update=()=>{
      const seconds=Math.max(0,Math.ceil((deadline-Date.now())/1000));
      clock.textContent="Time: "+String(Math.floor(seconds/60)).padStart(2,"0")+":"+String(seconds%60).padStart(2,"0");
      clock.classList.toggle("is-low",seconds<=300);
      if(seconds===0)submitPaper(true);
    };
    update();
    timer=setInterval(update,1000);
  }

  function startPaper(){
    if(activePaper.length&&!paperScored&&!window.confirm("Start a new paper and discard the current paper and its answers?"))return;
    const selected=currentPool();
    const count=Number(byId("paper-count").value);
    if(selected.pool.length<count){
      byId("paper-message").setAttribute("role","alert");
      byId("paper-message").textContent="This selection has only "+selected.pool.length+" questions. Choose a wider topic or a different difficulty.";
      return;
    }
    const random=Math.random;
    activePaper=pickQuestions(selected.pool,count,selected.options,random);
    if(activePaper.length!==count){
      byId("paper-message").setAttribute("role","alert");
      byId("paper-message").textContent="Not enough questions are available to build this paper. Change the topic, difficulty, or question count.";
      return;
    }
    paperSubmitted=false;
    paperScored=false;
    paperResponses=[];
    paperMarks=[];
    candidateName="";
    paperSubject=selected.options.subject;
    paperTopic=selected.options.topicId;
    paperTopicLabel=paperTopic==="all"?"Mixed topics":activePaper[0].topic;
    paperMode=byId("paper-mode-choice").querySelector('input[name="paper-mode"]:checked')?.value||"untimed";
    paperDuration=paperMode==="timed"?Number(byId("paper-duration").value):0;
    deadline=paperDuration>0?Date.now()+paperDuration*60*1000:0;
    document.body.dataset.paperActive=paperDuration>0?"true":"false";
    byId("paper-message").setAttribute("role","status");
    byId("paper-message").textContent=paperDuration>0
      ?"Timed paper started. Your answers and timer save automatically on this device."
      :"Untimed practice started. Ask the tutor for help whenever you need it.";
    renderPaper();
    saveActivePaper();
    startTimer();
    byId("paper-workspace").scrollIntoView({behavior:"smooth",block:"start"});
  }

  function submitPaper(timeExpired){
    if(!activePaper.length||paperSubmitted)return;
    const responses=activePaper.map((_,index)=>document.querySelector(`[data-paper-response="${index}"]`));
    const unanswered=responses.filter(input=>!input||!input.value.trim()).length;
    if(!timeExpired&&unanswered&&!window.confirm("You have "+unanswered+" unanswered question(s). Submit and reveal the answers anyway?"))return;
    if(timer){clearInterval(timer);timer=null;}
    paperResponses=responses.map((input,index)=>input?input.value:(paperResponses[index]||""));
    paperMarks=activePaper.map((question,index)=>autoMark(question.answer,paperResponses[index])?question.marks:0);
    document.body.dataset.paperActive="false";
    paperSubmitted=true;
    renderPaper();
    if(timeExpired)byId("paper-message").textContent="Time is up. Your saved work is ready to review and mark.";
    else byId("paper-message").textContent="Answers and worked solutions are shown. Review the automatic marks, adjust them fairly and save your score.";
    saveActivePaper();
  }

  function saveScore(){
    const inputs=Array.from(document.querySelectorAll("[data-awarded-mark]"));
    const byTopic={};
    let earned=0;
    activePaper.forEach((question,index)=>{
      const input=inputs.find(item=>Number(item.dataset.awardedMark)===index);
      const mark=Math.max(0,Math.min(question.marks,Math.floor(Number(input&&input.value)||0)));
      earned+=mark;
      const score=byTopic[question.topic]||(byTopic[question.topic]={earned:0,total:0});
      score.earned+=mark;
      score.total+=question.marks;
    });
    const total=activePaper.reduce((sum,question)=>sum+question.marks,0);
    const subject=paperSubject==="gcse"?"GCSE maths":"Maths and machine learning";
    const selectedTopic=paperTopicLabel;
    const result={date:new Date().toISOString(),subject:subject,topic:selectedTopic,earned:earned,total:total,percent:Math.round(earned/total*100)};
    let history=[];
    try{
      const saved=JSON.parse(localStorage.getItem(HISTORY_KEY)||"[]");
      if(Array.isArray(saved))history=saved;
    }catch(error){console.error("Saved paper history was invalid; starting a new history.",error);}
    history.push(result);
    localStorage.setItem(HISTORY_KEY,JSON.stringify(history.slice(-20)));
    paperScored=true;
    localStorage.removeItem(ACTIVE_KEY);
    const breakdown=Object.entries(byTopic).map(([topic,score])=>"<li>"+escapeHTML(topic)+": "+score.earned+"/"+score.total+"</li>").join("");
    byId("paper-message").textContent="Result saved to this device.";
    const summary=document.createElement("section");
    summary.className="paper-score";
    summary.setAttribute("aria-live","polite");
    summary.innerHTML="<h2>Paper result</h2><p class=\"paper-score-value\">"+earned+" / "+total+" marks · "+result.percent+"%</p><p>"+escapeHTML(subject)+" · "+escapeHTML(selectedTopic)+"</p><h3>Marks by topic</h3><ul class=\"paper-topic-scores\">"+breakdown+"</ul>";
    byId("paper-workspace").appendChild(summary);
    byId("paper-save-score").disabled=true;
    byId("paper-save-score").textContent="Score saved";
    renderHistory();
  }

  function bindControls(){
    ["paper-subject","paper-area","paper-tier"].forEach(id=>byId(id).addEventListener("change",()=>{updateSubjectControls();}));
    byId("paper-topic").addEventListener("change",updateCountOptions);
    byId("paper-mode-choice").addEventListener("change",updateModeChoice);
    byId("paper-start").addEventListener("click",startPaper);
    byId("paper-print").addEventListener("click",()=>window.print());
    byId("paper-workspace").addEventListener("click",event=>{
      if(event.target.id==="paper-submit")submitPaper(false);
      if(event.target.id==="paper-save-score")saveScore();
      if(event.target.id==="paper-print-review")window.print();
    });
    byId("paper-workspace").addEventListener("input",event=>{
      const response=event.target.closest("[data-paper-response]");
      if(response){paperResponses[Number(response.dataset.paperResponse)]=response.value;saveActivePaper();return;}
      const mark=event.target.closest("[data-awarded-mark]");
      if(mark){paperMarks[Number(mark.dataset.awardedMark)]=Number(mark.value);saveActivePaper();return;}
      if(event.target.matches(".paper-candidate input")){candidateName=event.target.value.slice(0,80);saveActivePaper();}
    });
    window.addEventListener("beforeunload",saveActivePaper);
  }

  function restoreActivePaper(){
    if(!savedActivePaper)return false;
    const state=savedActivePaper;
    if(state.version!==1||!state.questions.every(question=>question&&typeof question.q==="string"&&typeof question.answer==="string")){
      localStorage.removeItem(ACTIVE_KEY);
      savedActivePaper=null;
      return false;
    }
    paperSubject=state.subject==="ml"?"ml":"gcse";
    byId("paper-subject").value=paperSubject;
    updateSubjectControls();
    if(Array.from(byId("paper-area").options).some(option=>option.value===state.area))byId("paper-area").value=state.area;
    updateSubjectControls();
    if(Array.from(byId("paper-topic").options).some(option=>option.value===state.topic))byId("paper-topic").value=state.topic;
    if(Array.from(byId("paper-tier").options).some(option=>option.value===state.tier))byId("paper-tier").value=state.tier;
    if(Array.from(byId("paper-level").options).some(option=>option.value===state.level))byId("paper-level").value=state.level;
    if(Array.from(byId("paper-count").options).some(option=>option.value===String(state.count)))byId("paper-count").value=String(state.count);
    paperMode=state.mode==="timed"?"timed":"untimed";
    paperTopic=String(state.topic||"all");
    byId("paper-mode-choice").querySelector(`input[name="paper-mode"][value="${paperMode}"]`).checked=true;
    updateModeChoice();
    if(state.duration&&Array.from(byId("paper-duration").options).some(option=>option.value===String(state.duration)))byId("paper-duration").value=String(state.duration);
    paperDuration=paperMode==="timed"?Number(state.duration)||30:0;
    activePaper=state.questions;
    paperTopicLabel=paperTopic==="all"?"Mixed topics":(activePaper[0]?.topic||"Selected topic");
    paperResponses=Array.isArray(state.responses)?state.responses:[];
    paperMarks=Array.isArray(state.marks)?state.marks:[];
    deadline=Number(state.deadline)||0;
    paperSubmitted=Boolean(state.submitted);
    paperScored=false;
    candidateName=String(state.candidateName||"").slice(0,80);
    document.body.dataset.paperActive=paperDuration>0&&!paperSubmitted?"true":"false";
    renderPaper();
    if(paperSubmitted){
      byId("paper-message").textContent="Your submitted paper has been restored. Review and finish marking when you are ready.";
    }else{
      byId("paper-message").textContent=paperDuration>0
        ?"Your timed paper has been restored. The countdown continued while this page was closed."
        :"Your untimed paper has been restored. Your saved answers are ready to continue.";
      startTimer();
    }
    savedActivePaper=null;
    return true;
  }

  async function initialize(){
    bindControls();
    renderHistory();
    await loadQuestionBanks();
    for(const id of ["paper-subject","paper-area","paper-tier","paper-topic","paper-level","paper-count","paper-start"])byId(id).disabled=false;
    byId("paper-mode-choice").disabled=false;
    byId("paper-mode-choice").querySelectorAll("input[name='paper-mode']").forEach(input=>input.disabled=false);
    updateModeChoice();
    updateSubjectControls();
    byId("paper-load-status").textContent="Ready: "+gcseBanks.length+" GCSE topic banks with "+gcseBanks.reduce((sum,bank)=>sum+bank.questions.length,0)+" questions, plus 25 maths/ML lessons.";
    restoreActivePaper();
    byId("paper-start").focus({preventScroll:true});
  }

  initialize().catch(error=>{
    byId("paper-load-status").setAttribute("role","alert");
    byId("paper-load-status").textContent="Could not load the paper question banks. You can still use the official paper links below or the GCSE Question Bank.";
    byId("paper-load-fallback").hidden=false;
  });
})(typeof window!=="undefined"?window:globalThis);
