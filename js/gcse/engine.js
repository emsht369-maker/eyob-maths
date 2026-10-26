(function(){
  "use strict";
  const STORAGE_KEY="mathmaster-gcse";
  const root=document.body;
  const page=root.dataset.page;
  const resources=[
    ["BBC Bitesize GCSE Maths","https://www.bbc.co.uk/bitesize/subjects/zqhs34j","Clear GCSE topic lessons and revision."],
    ["Corbettmaths","https://corbettmaths.com/","Short lessons, worksheets and practice."],
    ["Maths Genie","https://www.mathsgenie.co.uk/","GCSE topic practice arranged by grade."],
    ["Save My Exams","https://www.savemyexams.com/gcse/maths/","Revision notes and exam practice; some content may need an account."],
    ["Dr Frost Maths","https://www.drfrostmaths.com/","Interactive practice and teacher-made resources."],
    ["Physics and Maths Tutor GCSE Maths","https://www.physicsandmathstutor.com/maths-revision/gcse/","Topic notes, worksheets and exam questions."],
    ["AQA past papers","https://www.aqa.org.uk/find-past-papers-and-mark-schemes","Official AQA papers and mark schemes."],
    ["Pearson Edexcel past papers","https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html","Official Pearson Edexcel past papers."],
    ["OCR past papers","https://www.ocr.org.uk/qualifications/past-paper-finder/","Official OCR past-paper finder."]
  ];
  const readProgress=()=>{
    try{
      const value=JSON.parse(localStorage.getItem(STORAGE_KEY)||"{}");
      if(!value||typeof value!=="object"||Array.isArray(value))throw new Error("Saved progress has an invalid format.");
      return Object.assign({answers:{},examDate:"",mocks:[],points:0,badges:[],practiceMode:false,currentSteps:{},learned:{}},value);
    }catch(error){
      if(error instanceof SyntaxError){
        console.error("Saved GCSE progress is not valid JSON. Starting with empty progress.",error);
        return {answers:{},examDate:"",mocks:[],points:0,badges:[],practiceMode:false,currentSteps:{},learned:{}};
      }
      throw error;
    }
  };
  let state=readProgress(),topics=[],mockTimer=null;
  try{
    const roomState=JSON.parse(localStorage.getItem("mathmaster-rooms")||"null");
    if(roomState&&typeof roomState.practiceMode==="boolean")state.practiceMode=roomState.practiceMode;
  }catch(error){}
  const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const safe=(value)=>String(value==null?"":value);
  const resourceLinks=topic=>{
    const decoded=document.createElement("textarea");
    decoded.innerHTML=topic.title;
    const title=decoded.value.trim();
    const term=encodeURIComponent(title);
    const siteSearch=domain=>`https://www.google.com/search?q=${encodeURIComponent(`site:${domain} "${title}" GCSE maths`)}`;
    const earlierSearches=[
      ["BBC Bitesize",siteSearch("bbc.co.uk/bitesize")],
      ["Corbettmaths",`https://corbettmaths.com/?s=${term}`],
      ["Maths Genie",siteSearch("mathsgenie.co.uk")],
      ["Save My Exams",siteSearch("savemyexams.com/gcse/maths")],
      ["Dr Frost Maths",siteSearch("drfrostmaths.com")],
      ["Physics and Maths Tutor",siteSearch("physicsandmathstutor.com/maths-revision/gcse")],
      ["AQA past papers",siteSearch("aqa.org.uk")],
      ["Edexcel past papers",siteSearch("qualifications.pearson.com")],
      ["OCR past papers",siteSearch("ocr.org.uk")],
      ["Khan Academy",`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(title+" GCSE maths")}`]
    ].map(([label,url])=>[label,url,"Search the earlier topic resource list for "+title+"."]);
    const groups=window.buildGCSEResourceGroups(title,topic.area,topic.links);
    groups.push({title:"Earlier topic searches",items:earlierSearches});
    return `<p>These grouped links include resources for <b>${safe(title)}</b>. Check your exam board and tier when choosing a past paper.</p><div class="resource-groups">${window.renderResourceGroups(groups)}</div><p class="gcse-subtle">Past-paper availability can differ by exam board.</p>`;
  };
  const assetURL=path=>window.MATH_MASTER_ASSETS?.[path]||path;
  function loadTopics(){
    fetch(assetURL("js/gcse/index.js")).then(response=>{
      if(!response.ok)throw new Error("Could not load the GCSE topic list.");
      return response.text();
    }).then(text=>{
      const files=text.split(/\r?\n/).map(line=>line.trim().replace(/^["']|["']$/g,"")).filter(Boolean);
      if(files.some(file=>!/^[\w-]+\.js$/.test(file)))throw new Error("The GCSE topic list contains an invalid file name.");
      return files.reduce((chain,file)=>chain.then(()=>new Promise((resolve,reject)=>{
          const script=document.createElement("script");
          script.src=assetURL("js/gcse/topics/"+file);
          script.onload=resolve;
          script.onerror=()=>reject(new Error("Could not load GCSE topic: "+file));
          document.head.appendChild(script);
        })),Promise.resolve());
    }).then(()=>{
      topics=window.GCSE||[];
      state.learned=state.learned||{};
      topics.forEach(topic=>{
        if((topic.practice||[]).some((_,index)=>questionAttempted(topic,"practice",index)))state.learned[topic.id]=true;
      });
      save();
      if(page==="topics")renderTopics();
      if(page==="mock")prepareMock();
      updateProgress();
      routeTopicFromHash();
    }).catch(error=>{
      const target=document.querySelector("main");
      if(target)target.insertAdjacentHTML("afterbegin",`<p class="gcse-wrong" role="alert">${safe(error.message)}</p>`);
    });
  }
  function renderGlobalResources(){
    const target=document.querySelector("#global-resources");
    if(target){
      const revision=resources.slice(0,6),papers=resources.slice(6);
      target.innerHTML=`<div class="gcse-resource-groups"><section><h3>Learn and practise</h3><div class="gcse-resource-grid">${revision.map(([name,url,description])=>`<a class="gcse-resource-card" target="_blank" rel="noopener" href="${url}"><b>${name}</b><span>${description}</span><small>Open resource ↗</small></a>`).join("")}</div></section><section><h3>Official exam-board past papers</h3><div class="gcse-resource-grid">${papers.map(([name,url,description])=>`<a class="gcse-resource-card gcse-board-card" target="_blank" rel="noopener" href="${url}"><b>${name}</b><span>${description}</span><small>Open official papers ↗</small></a>`).join("")}</div><p class="gcse-subtle">Use the exam board shown on your school timetable. Try the matching board's papers first.</p></section></div>`;
    }
  }
  const escapeMarkup=value=>String(value==null?"":value).replace(/[&<>"']/g,char=>({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;"}[char]));
  function questionAttempted(topic,type,index){
    const answer=state.answers[`${topic.id}:${type}:${index}`];
    return Boolean(answer&&(answer.attempted||answer.right>0||answer.wrong>0));
  }
  function previousQuestionsAttempted(topic,type,index){
    const questions=topic[type]||[];
    return questions.slice(0,index).every((_,questionIndex)=>questionAttempted(topic,type,questionIndex));
  }
  function topicQuestionsComplete(topic){
    return ["practice","exam"].every(type=>(topic[type]||[]).every((_,index)=>questionAttempted(topic,type,index)));
  }
  function isTopicUnlocked(index){
    return state.practiceMode||index===0||topicQuestionsComplete(topics[index-1]);
  }
  function normalizedAnswer(value){
    return String(value==null?"":value).trim().toLowerCase()
      .replace(/&nbsp;/gi," ").replace(/&times;/gi,"×").replace(/&divide;/gi,"÷")
      .replace(/&minus;/gi,"−").replace(/&#39;|&apos;/gi,"'")
      .replace(/[\u2010-\u2015]/g,"-").replace(/\u2212/g,"-")
      .replace(/×/g,"*").replace(/÷/g,"/").replace(/\s+/g,"").replace(/,/g,"");
  }
  function expectedAnswerFor(topic,type,index,question){
    if(question.a!==undefined)return question.a;
    if(type==="exam"){
      const target=normalizedAnswer(question.q.replace(/<[^>]*>/g," "));
      const matchingPractice=(topic.practice||[]).find(item=>normalizedAnswer(item.q.replace(/<[^>]*>/g," "))===target&&item.a!==undefined);
      if(matchingPractice)return matchingPractice.a;
    }
    return null;
  }
  function canAutoMark(expected){
    if(expected===null)return false;
    const text=String(expected).replace(/<[^>]*>/g," ").replace(/&(?:nbsp|times|divide|minus);/gi," ").trim();
    return text.length<=32&&!/[.;]/.test(text);
  }
  function isGCSEAnswerCorrect(expected,submitted){
    const expectedText=normalizedAnswer(expected.replace(/<[^>]*>/g," "));
    const submittedText=normalizedAnswer(submitted);
    if(!submittedText)return false;
    if(expectedText===submittedText)return true;
    const parseNumber=value=>{
      const raw=value.replace(/^(?:about|approximately|approx\.?|~)/,"");
      const isPercentage=raw.endsWith("%");
      const numericText=raw.slice(0,isPercentage?-1:undefined).replace(/[£$€]/g,"");
      let number=null;
      if(/^-?\d+(?:\.\d+)?$/.test(numericText))number=Number(numericText);
      else{
        const fraction=numericText.match(/^(-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)$/);
        if(fraction)number=Number(fraction[1])/Number(fraction[2]);
      }
      return number===null?null:number/(isPercentage?100:1);
    };
    const expectedNumber=parseNumber(expectedText),submittedNumber=parseNumber(submittedText);
    return expectedNumber!==null&&submittedNumber!==null&&Math.abs(expectedNumber-submittedNumber)<1e-8;
  }
  function isQuestionOpen(topic,type,index){
    if(type==="exam"&&!(topic.practice||[]).every((_,practiceIndex)=>questionAttempted(topic,"practice",practiceIndex)))return false;
    return previousQuestionsAttempted(topic,type,index);
  }
  function questionProgressMarkup(topic,type,index,question){
    const key=`${topic.id}:${type}:${index}`;
    const saved=state.answers[key];
    const expected=expectedAnswerFor(topic,type,index,question);
    if(questionAttempted(topic,type,index)){
      const correct=Boolean(saved.correct??saved.right);
      return `<details class="gcse-question gcse-question-reviewed"><summary>${correct?"✅":"↺"} ${type==="exam"?"Exam":"Practice"} ${index+1} · ${correct?"Correct":"Answered; review"}</summary><p>${question.q}</p><p class="gcse-mark-feedback ${correct?"gcse-correct":"gcse-wrong"}">${correct?`Correct! ${saved.pointsEarned?`+${saved.pointsEarned} points earned.`:"Points already earned for this question."}`:"Not correct yet. No points earned; review the solution."}</p>${expected!==null?`<div class="gcse-answer"><b>Answer:</b> ${expected}</div>`:""}${type==="exam"?`<div class="gcse-scheme"><b>Mark scheme:</b> ${question.scheme}</div>`:""}</details>`;
    }
    if(!isQuestionOpen(topic,type,index))return `<article class="gcse-question gcse-question-locked" aria-disabled="true"><h3>🔒 ${type==="exam"?"Exam":"Practice"} ${index+1}</h3><p>Answer the previous step to unlock this question.</p></article>`;
    return questionMarkup(question,index,type,topic,expected);
  }
  function questionMarkup(question,index,type,topic,expected){
    const key=`${topic.id}:${type}:${index}`;
    const marks=question.marks||1;
    const saved=state.answers[key];
    const plainQuestion=String(question.q).replace(/<[^>]*>/g," ").replace(/&nbsp;/gi," ").replace(/&amp;/gi,"&").replace(/&lt;/gi,"<").replace(/&gt;/gi,">").replace(/&times;/gi,"×").replace(/&minus;/gi,"−").replace(/&divide;/gi,"÷").replace(/\s+/g," ").trim();
    const wolframURL=`https://www.wolframalpha.com/input?i=${encodeURIComponent(plainQuestion)}`;
    const autoMark=canAutoMark(expected);
    const submission=autoMark
      ?`<button type="button" data-check-gcse-answer="${index}">Submit answer</button>`
      :`<button type="button" class="alt" data-reveal="scheme">Show mark scheme</button><p class="gcse-subtle">Check your final answer against the mark scheme, then record your result.</p><button type="button" data-self-mark="correct" data-index="${index}">I got it right</button> <button type="button" class="alt" data-self-mark="wrong" data-index="${index}">Not correct yet</button>`;
    const answer=expected!==null?`<div class="gcse-answer" hidden><b>Answer:</b> ${expected}</div>`:"";
    const scheme=type==="exam"?`<div class="gcse-scheme" hidden><b>Mark scheme (${marks} marks):</b> ${question.scheme}</div>`:"";
    return `<article class="gcse-question" data-question-type="${type}" data-question-key="${escapeMarkup(key)}" data-question-index="${index}"><b>${type==="exam"?"Exam":"Practice"} ${index+1}</b> <span class="gcse-subtle">(${marks} mark${marks===1?"":"s"})</span><p>${question.q}</p><a class="wolfram-question-link" href="${safe(wolframURL)}" target="_blank" rel="noopener noreferrer">Check this question with Wolfram|Alpha ↗</a><label class="gcse-answer-label">Your answer and working<textarea class="gcse-answer-input" rows="3" placeholder="Try it first. Write your method and answer here." aria-label="Your answer and working for ${type} question ${index+1}">${escapeMarkup(saved?.response||"")}</textarea></label>${type==="practice"?`<button class="alt" data-reveal="hint">Need a hint?</button><div class="gcse-hint" hidden>${question.hint}</div>`:""}${submission}${answer}${scheme}<p class="gcse-mark-feedback" aria-live="polite"></p></article>`;
  }
  function topicStepKeys(topic){
    return ["learn",...(topic.practice||[]).map((_,index)=>`practice-${index}`),...(topic.exam||[]).map((_,index)=>`exam-${index}`),"links"];
  }
  function topicStepAllowed(topic,step){
    if(step==="learn")return true;
    if(step==="links")return topicQuestionsComplete(topic);
    const match=step.match(/^(practice|exam)-(\d+)$/);
    if(!match)return false;
    const index=Number(match[2]),questions=topic[match[1]]||[];
    if(match[1]==="practice"&&index===0&&!state.learned?.[topic.id])return false;
    return index<questions.length&&isQuestionOpen(topic,match[1],index);
  }
  function nextTopicStep(topic,step){
    const steps=topicStepKeys(topic),index=steps.indexOf(step);
    const next=steps[index+1];
    return next&&topicStepAllowed(topic,next)?next:step;
  }
  function stepLabel(topic,step){
    if(step==="learn")return "Learn";
    if(step==="links")return "Study links";
    const match=step.match(/^(practice|exam)-(\d+)$/);
    return `${match[1]==="practice"?"Practice":"Exam"} ${Number(match[2])+1}`;
  }
  function setTopicStep(topic,step){
    state.currentSteps=state.currentSteps||{};
    state.currentSteps[topic.id]=step;
    save();
    history.replaceState(history.state,"",`#topic=${encodeURIComponent(topic.id)}&step=${encodeURIComponent(step)}`);
  }
  function showTopic(topic,pushRoute=true,requestedStep=null,answerFeedback=null){
    const list=document.querySelector("#topic-list"),view=document.querySelector("#topic-view");
    list.hidden=true;view.hidden=false;
    document.body.classList.add("gcse-topic-open");
    if(pushRoute)history.pushState({gcseTopic:true},"","#topic="+encodeURIComponent(topic.id));
    const topicIndex=topics.indexOf(topic);
    if(!isTopicUnlocked(topicIndex)){
      view.innerHTML=`<a class="gcse-topic-back" href="#gcse-topics">← All GCSE topics</a><section class="gcse-locked-page"><h1 tabindex="-1">🔒 ${topic.title} is locked</h1><p>Complete every question in ${topics[topicIndex-1]?.title||"the previous topic"} to unlock this topic, or enable practice mode.</p></section>`;
      view.querySelector("h1").focus();
      return;
    }
    const savedStep=state.currentSteps?.[topic.id]||"learn";
    const activeStep=topicStepAllowed(topic,requestedStep||savedStep)
      ?(requestedStep||savedStep)
      :topicStepKeys(topic).find(step=>topicStepAllowed(topic,step))||"learn";
    setTopicStep(topic,activeStep);
    const examples=Array.isArray(topic.example)?topic.example:[topic.example];
    const visualPractice=window.VisualMap?window.VisualMap.render({title:topic.title,area:topic.area,description:topic.idea}):"";
    const steps=topicStepKeys(topic);
    const sidebar=steps.map((step,index)=>{
      const allowed=topicStepAllowed(topic,step),complete=step==="learn"
        ?Boolean(state.learned?.[topic.id])
        :step==="links"?topicQuestionsComplete(topic)
          :questionAttempted(topic,step.split("-")[0],Number(step.split("-")[1]));
      const current=step===activeStep;
      const item=`<span class="gcse-step-number">${String(index+1).padStart(2,"0")}</span><span class="gcse-step-copy"><strong>${escapeMarkup(stepLabel(topic,step))}</strong><small>${complete?"Complete":allowed?"Ready":"Locked"}</small></span>`;
      return `<li class="gcse-step-item${complete?" is-complete":""}${current?" is-current":""}${allowed?"":" is-locked"}">${allowed?`<a href="#topic=${encodeURIComponent(topic.id)}&step=${encodeURIComponent(step)}" data-gcse-step="${step}"${current?' aria-current="step"':""}>${item}</a>`:`<span class="gcse-step-locked" aria-disabled="true">${item}</span>`}</li>`;
    }).join("");
    const visualMarkup=activeStep==="learn"?visualPractice:"";
    let content="";
    if(activeStep==="learn"){
      content=`<section class="gcse-card gcse-current-step"><h2 tabindex="-1">Learn · ${topic.title}</h2><h3>The idea</h3>${topic.idea}<h3>Worked example${examples.length>1?"s":""}</h3>${examples.map(example=>`<div>${example}</div>`).join("<hr>")}<h3>Mistakes to avoid</h3>${topic.mistakes}<h3>Key words</h3><ul class="gcse-keys">${topic.key.map(item=>`<li><b>${item[0]}</b>: ${item[1]}</li>`).join("")}</ul></section>`;
    }else if(activeStep==="links"){
      content=`<section class="gcse-resource-section gcse-current-step"><h2 tabindex="-1">Study links · ${topic.title}</h2>${resourceLinks(topic)}<p><a class="gcse-practice-link" href="questions.html?topic=${encodeURIComponent(topic.id)}">More practice on this topic in the Question Bank ↗</a></p></section>`;
    }else{
      const [type,indexText]=activeStep.split("-"),index=Number(indexText),question=topic[type][index];
      const allPractice=(topic.practice||[]).every((_,practiceIndex)=>questionAttempted(topic,"practice",practiceIndex));
      const heading=type==="practice"?"Practice":"Exam";
      content=`<section class="gcse-current-step gcse-card" aria-label="${heading} step ${index+1}"><h2 tabindex="-1">${heading} · Question ${index+1} of ${topic[type].length}</h2><p class="gcse-subtle">${type==="exam"&&!allPractice?"Complete the practice steps to unlock the exam.":`Answer this step to unlock the next. Correct answers earn points.`}</p>${questionProgressMarkup(topic,type,index,question)}</section>`;
    }
    const completeMarkup=topicQuestionsComplete(topic)?`<section class="gcse-topic-complete" role="status"><span aria-hidden="true">🏆</span><div><strong>TOPIC COMPLETE</strong><p>Every step is answered. ${topicIndex<topics.length-1?"The next GCSE topic is now unlocked.":"You completed the GCSE topic path."}</p></div></section>`:"";
    const stepIndex=steps.indexOf(activeStep),previousStep=steps.slice(0,stepIndex).reverse().find(step=>topicStepAllowed(topic,step)),nextCandidate=steps[stepIndex+1],nextStep=nextCandidate&&topicStepAllowed(topic,nextCandidate)?nextCandidate:null;
    const nextControl=activeStep==="learn"&&topic.practice.length
      ?`<a class="gcse-entry gcse-step-next" href="#topic=${encodeURIComponent(topic.id)}&step=practice-0" data-gcse-step="practice-0" data-complete-learn>Start Practice →</a>`
      :nextStep?`<a class="gcse-entry gcse-step-next" href="#topic=${encodeURIComponent(topic.id)}&step=${encodeURIComponent(nextStep)}" data-gcse-step="${nextStep}">${escapeMarkup(stepLabel(topic,nextStep))} →</a>`:"";
    const navigation=`<nav class="gcse-topic-footer" aria-label="Step navigation">${previousStep?`<a class="gcse-entry gcse-step-previous" href="#topic=${encodeURIComponent(topic.id)}&step=${encodeURIComponent(previousStep)}" data-gcse-step="${previousStep}">← ${escapeMarkup(stepLabel(topic,previousStep))}</a>`:"<span></span>"}${nextControl}</nav>`;
    const feedbackMarkup=answerFeedback?`<p class="gcse-mark-feedback ${answerFeedback.correct?"gcse-correct":"gcse-wrong"}" role="status">${answerFeedback.correct?`✅ Correct! ${answerFeedback.pointsEarned?`+${answerFeedback.pointsEarned} points earned.`:"Points already earned for this question."}`:"❌ Not correct yet. No points earned; review the answer and keep practising."}</p>`:"";
    view.innerHTML=`<a class="gcse-topic-back" href="#gcse-topics">← All GCSE topics</a><header class="gcse-topic-header"><span class="gcse-subtle">GCSE · ${topic.area} · ${topic.tier} · Grades ${topic.grade}</span><h1 tabindex="-1">${topic.title}</h1><p>${topic.idea}</p><div class="gcse-topic-progress" role="status">${["practice","exam"].reduce((sum,type)=>sum+(topic[type]||[]).filter((_,index)=>questionAttempted(topic,type,index)).length,0)} / ${(topic.practice||[]).length+(topic.exam||[]).length} questions attempted · ⭐ ${state.points} points · ${state.badges.length?`🏅 ${state.badges.join(", ")}`:"No badges yet"}</div></header><div class="gcse-topic-layout"><aside class="gcse-topic-sidebar" aria-label="Topic steps"><strong>Topic steps</strong><ol>${sidebar}</ol><p>${["practice","exam"].reduce((sum,type)=>sum+(topic[type]||[]).filter((_,index)=>questionAttempted(topic,type,index)).length,0)} of ${(topic.practice||[]).length+(topic.exam||[]).length} questions attempted</p></aside><div class="gcse-topic-main">${visualMarkup}${feedbackMarkup}${content}${completeMarkup}${navigation}${topicIndex<topics.length-1&&topicQuestionsComplete(topic)?`<a class="gcse-entry gcse-next-topic" href="#topic=${encodeURIComponent(topics[topicIndex+1].id)}">Next topic →</a>`:""}</div></div>`;
    if(activeStep==="learn"){
      const card=view.querySelector(".gcse-current-step");
      if(card)window.AITutor?.attach(card,{question:`Explain ${topic.title} simply. ${topic.idea} Worked examples: ${examples.join(" ")}`,topic:topic.title,level:topic.tier});
    }else if(activeStep.startsWith("practice-")||activeStep.startsWith("exam-")){
      const [type,indexText]=activeStep.split("-"),index=Number(indexText),question=topic[type][index];
      const card=view.querySelector(".gcse-question:not(.gcse-question-locked)");
      if(card)window.AITutor?.attach(card,{question:question.q,studentAnswer:state.answers[`${topic.id}:${type}:${index}`]?.response||"",topic:topic.title,level:topic.tier,responseElement:card.querySelector(".gcse-answer-input")});
    }
    view.querySelector(activeStep==="learn"?"h1":".gcse-current-step h2")?.focus({preventScroll:true});
    view.scrollIntoView({behavior:"smooth"});
  }
  function renderTopics(){
    const target=document.querySelector("#topic-list");
    if(!target)return;
    const search=document.querySelector("#gcse-search").value.trim().toLowerCase();
    const tier=document.querySelector("#gcse-tier").value,grade=document.querySelector("#gcse-grade").value,area=document.querySelector("#gcse-area").value;
    const found=topics.filter(topic=>(tier==="All"||topic.tier==="FH"||topic.tier===tier)&&(grade==="All"||topic.grade===grade)&&(area==="All"||topic.area===area)&&(topic.title+" "+topic.idea+" "+topic.area).toLowerCase().includes(search));
    const areas=[...new Set(topics.map(topic=>topic.area))];
    target.innerHTML=areas.map(name=>{
      const items=found.filter(topic=>topic.area===name);
      return items.length?`<h2>${name}</h2><div class="gcse-topic-list">${items.map(topic=>{
        const index=topics.indexOf(topic),locked=!isTopicUnlocked(index),done=topicQuestionsComplete(topic);
        const previous=topics[index-1];
        return `<button class="gcse-topic${locked?" is-locked":""}" data-topic="${escapeMarkup(topic.id)}" ${locked?"disabled":""}><h3>${locked?"🔒 ":done?"✅ ":""}${String(index+1).padStart(2,"0")} · ${topic.title}</h3><small>${locked?"Finish "+escapeMarkup(previous?.title||"the previous topic")+" to unlock":done?"Topic complete":"Open step-by-step topic"} · ${topic.tier} · Grades ${topic.grade}</small></button>`;
      }).join("")}</div>`:"";
    }).join("")||"<p>No topics match these filters.</p>";
  }
  function closeTopicView(){
    document.body.classList.remove("gcse-topic-open");
    document.querySelector("#topic-view").hidden=true;
    document.querySelector("#topic-list").hidden=false;
    renderTopics();
  }
  function routeTopicFromHash(){
    const match=location.hash.match(/^#topic=([^&]+)(?:&step=([^&]+))?$/);
    if(!match){
      if(document.body.classList.contains("gcse-topic-open"))closeTopicView();
      return;
    }
    let id="";
    try{id=decodeURIComponent(match[1]);}catch(error){id=match[1];}
    const topic=topics.find(item=>item.id===id);
    let step=null;
    if(match[2])try{step=decodeURIComponent(match[2]);}catch(error){step=match[2];}
    if(topic)showTopic(topic,false,step);
  }
  function updateProgress(){
    const answers=Object.values(state.answers),right=answers.reduce((sum,value)=>sum+value.right,0),wrong=answers.reduce((sum,value)=>sum+value.wrong,0),attempted=right+wrong;
    const text=document.querySelector("#gcse-progress-text"),bar=document.querySelector("#gcse-progress-bar");
    if(text)text.textContent=`${right} questions marked right · ${attempted} attempted`;
    const points=document.querySelector("#gcse-points-count");
    if(points)points.textContent=`⭐ ${state.points} points earned`;
    if(bar)bar.style.width=(attempted?100*right/attempted:0)+"%";
    const wrongByTopic={};
    answers.forEach(answer=>{if(answer.topicId)wrongByTopic[answer.topicId]=(wrongByTopic[answer.topicId]||0)+answer.wrong;});
    const totals=topics.map(topic=>({title:topic.title,wrong:wrongByTopic[topic.id]||0})).filter(topic=>topic.wrong>0).sort((a,b)=>b.wrong-a.wrong).slice(0,5);
    const weak=document.querySelector("#gcse-weak");
    if(weak)weak.innerHTML=`<h3>My weak topics</h3>${totals.length?totals.map(item=>`<p>${item.title}: ${item.wrong} wrong answers</p>`).join(""):"<p>No wrong answers recorded yet. Keep practising.</p>"}`;
    updateDailyPlan();
  }
  function updateDailyPlan(){
    const date=state.examDate,daysTarget=document.querySelector("#days-left"),plan=document.querySelector("#daily-plan");
    if(!daysTarget||!plan)return;
    const exam=date?new Date(date+"T00:00:00"):null,now=new Date();now.setHours(0,0,0,0);
    const days=exam?Math.max(0,Math.ceil((exam-now)/86400000)):0;
    daysTarget.textContent=date?(days?`${days} days left.`:"Your exam date is today or has passed."):"Choose your exam date to see a daily plan.";
    const completed=new Set(Object.values(state.answers).filter(answer=>answer.right>0).map(answer=>answer.topicId));
    const remaining=topics.filter(topic=>!completed.has(topic.id));
    if(!remaining.length){
      plan.textContent="You have marked every topic as right. Review your weak topics.";
      return;
    }
    if(!date){
      plan.textContent="Choose your exam date above to get a manageable daily topic target.";
      return;
    }
    if(!days){
      plan.textContent="Your exam is today or has passed. Focus on a short review of your weak topics or try a mock paper.";
      return;
    }
    const perDay=Math.max(1,Math.ceil(remaining.length/days));
    const decodeTitle=title=>{
      const decoder=document.createElement("textarea");
      decoder.innerHTML=title;
      return decoder.value;
    };
    if(perDay>8){
      const firstTopics=remaining.slice(0,5).map(topic=>decodeTitle(topic.title)).join(", ");
      plan.textContent=`You have ${remaining.length} topics and ${days} days left, so a full review may not fit. Prioritise weak topics and practise a mock paper. A good place to start: ${firstTopics}.`;
      return;
    }
    const firstTopics=remaining.slice(0,perDay).map(topic=>decodeTitle(topic.title)).join(", ");
    plan.textContent=`Study ${perDay} topic${perDay===1?"":"s"} each day. Start with: ${firstTopics}.`;
  }
  function exportProgress(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="mathmaster-gcse-progress.json";document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function initTopicPage(){
    ["#gcse-search","#gcse-tier","#gcse-grade","#gcse-area"].forEach(selector=>document.querySelector(selector).addEventListener("input",renderTopics));
    const practiceMode=document.querySelector("#gcse-practice-mode");
    practiceMode.checked=state.practiceMode;
    practiceMode.addEventListener("change",()=>{
      state.practiceMode=practiceMode.checked;
      save();
      try{const roomState=JSON.parse(localStorage.getItem("mathmaster-rooms")||"{}");roomState.practiceMode=state.practiceMode;localStorage.setItem("mathmaster-rooms",JSON.stringify(roomState));}catch(error){}
      renderTopics();routeTopicFromHash();
    });
    document.querySelector("#topic-list").addEventListener("click",event=>{
      const button=event.target.closest("[data-topic]");
      if(button&&!button.disabled){const topic=topics.find(item=>item.id===button.dataset.topic);if(topic){history.pushState({gcseTopic:true},"","#topic="+encodeURIComponent(topic.id));showTopic(topic,false);}}
    });
    document.querySelector("#topic-view").addEventListener("click",event=>{
      const back=event.target.closest(".gcse-topic-back,.gcse-topic-footer a[href='#gcse-topics']");
      if(back){event.preventDefault();if(location.hash.startsWith("#topic=")&&history.state?.gcseTopic)history.back();else{history.replaceState(null,"",location.pathname+location.search+"#gcse-topics");closeTopicView();}return;}
      const stepLink=event.target.closest("[data-gcse-step]");
      if(stepLink){
        event.preventDefault();
        const topicMatch=location.hash.match(/^#topic=([^&]+)/);
        let topicId="";
        try{topicId=decodeURIComponent(topicMatch?.[1]||"");}catch(error){topicId=topicMatch?.[1]||"";}
        const topic=topics.find(item=>item.id===topicId);
        if(topic&&stepLink.hasAttribute("data-complete-learn")){
          state.learned=state.learned||{};
          state.learned[topic.id]=true;
          save();
        }
        if(topic&&topicStepAllowed(topic,stepLink.dataset.gcseStep)){
          setTopicStep(topic,stepLink.dataset.gcseStep);
          showTopic(topic,false,stepLink.dataset.gcseStep);
        }
        return;
      }
      const reveal=event.target.closest("[data-reveal]");
      if(reveal){const card=reveal.closest(".gcse-question");const selector=reveal.dataset.reveal==="hint"?".gcse-hint":reveal.dataset.reveal==="scheme"?".gcse-scheme":".gcse-answer";const panel=card.querySelector(selector);panel.hidden=!panel.hidden;if(reveal.dataset.reveal==="hint"&&!panel.hidden&&!panel.dataset.aiReady){panel.dataset.aiReady="true";const [topicId,type]=card.dataset.questionKey.split(":");const topic=topics.find(item=>item.id===topicId),question=topic?.[type]?.[Number(card.dataset.questionIndex)];if(question){const fallback=document.createElement("p");fallback.textContent=question.steps?.[0]||question.explain?.[0]||question.hint||"Start by writing down the information given.";panel.replaceChildren(fallback);const mount=document.createElement("div");mount.className="gcse-ai-hint";panel.append(mount);const tutor=window.AITutor?.attach(mount,{question:question.q,topic:topic.title,level:topic.tier,practiceQuestion:true});const hint=[...(tutor?.querySelectorAll("button")||[])].find(button=>button.textContent.trim()==="Give me a hint");const response=tutor?.querySelector(".ai-tutor-answer");if(hint&&response){hint.click();new MutationObserver(()=>{if(!response.hidden&&response.textContent.trim())fallback.textContent=response.textContent.trim();}).observe(response,{childList:true,subtree:true,characterData:true,attributes:true});}}}return;}
      const submit=event.target.closest("[data-check-gcse-answer],[data-self-mark]");
      if(submit){
        const card=submit.closest(".gcse-question"),input=card.querySelector(".gcse-answer-input"),feedback=card.querySelector(".gcse-mark-feedback");
        const [topicId,type]=card.dataset.questionKey.split(":");
        const topic=topics.find(item=>item.id===topicId);
        const index=Number(card.dataset.questionIndex);
        const currentQuestion=topic?.[type]?.[index];
        if(!input.value.trim()){feedback.textContent="Write an answer before unlocking the next step.";feedback.className="gcse-mark-feedback gcse-wrong";input.focus();return;}
        if(!topic||!currentQuestion)return;
        const expected=expectedAnswerFor(topic,type,index,currentQuestion);
        const correct=submit.dataset.selfMark
          ?submit.dataset.selfMark==="correct"
          :canAutoMark(expected)&&isGCSEAnswerCorrect(expected,input.value);
        const previous=state.answers[card.dataset.questionKey]||{topicId,right:0,wrong:0};
        const pointsEarned=correct&&previous.right===0?10:0;
        state.answers[card.dataset.questionKey]={...previous,topicId,attempted:true,response:input.value,correct,pointsEarned,right:previous.right+(correct?1:0),wrong:previous.wrong+(correct?0:1)};
        if(pointsEarned){
          state.points+=pointsEarned;
          window.dispatchEvent(new CustomEvent("mm2:points",{detail:{pointsEarned,source:"gcse-topic"}}));
          if(!state.badges.includes("First Correct Answer"))state.badges.push("First Correct Answer");
        }
        if(correct)window.MathMasterFeedback?.correct();
        window.MathMasterFeedback?.answered(correct,pointsEarned);
        state.answerFeedback={topicId,correct,pointsEarned};
        const activeStep=`${type}-${index}`;
        const nextStep=nextTopicStep(topic,activeStep);
        state.currentSteps=state.currentSteps||{};
        state.currentSteps[topic.id]=nextStep;
        save();updateProgress();showTopic(topic,false,nextStep,state.answerFeedback?.topicId===topicId?state.answerFeedback:null);
      }
    });
    const dateInput=document.querySelector("#exam-date");
    dateInput.value=state.examDate||"";
    dateInput.addEventListener("change",()=>{state.examDate=dateInput.value;save();updateDailyPlan();});
    document.querySelector("#gcse-export").addEventListener("click",exportProgress);
    document.querySelector("#gcse-reset").addEventListener("click",()=>{
      if(confirm("Reset all GCSE progress, exam date, and mock results?")){
        state={answers:{},examDate:"",mocks:[],points:0,badges:[],practiceMode:false,currentSteps:{},learned:{}};save();dateInput.value="";practiceMode.checked=false;updateProgress();renderTopics();
      }
    });
    window.addEventListener("hashchange",routeTopicFromHash);
    window.addEventListener("popstate",routeTopicFromHash);
    renderGlobalResources();updateProgress();
  }
  const formulas={
    "Foundation · memorise":[["Area of a rectangle","A = l × w. Example: 5 × 3 = 15."],["Area of a triangle","A = ½bh. Example: ½ × 4 × 6 = 12."],["Area of a parallelogram","A = bh. Example: 4 × 3 = 12."],["Area of a trapezium","A = ½(a+b)h. Example: ½(3+5)×4 = 16."],["Circumference of a circle","C = 2πr. Example: r=2 gives 4π."],["Area of a circle","A = πr². Example: r=3 gives 9π."],["Speed, distance, time","s=d/t. Example: 100 km ÷ 2 h = 50 km/h."]],
    "Higher · memorise":[["Quadratic formula","x = (−b ± √(b²−4ac))/(2a). Example: x²−1=0 gives ±1."],["Sine rule","a/sin A = b/sin B. Example: a=10, A=30°, B=90° gives b=20."],["Cosine rule","a²=b²+c²−2bc cos A. Example: b=3, c=4, A=90° gives a=5."],["Area of a triangle using sine","A=½ab sin C. Example: ½×4×5×sin 30°=5."],["Circle arc length","Arc = (θ/360)×2πr. Example: θ=90°, r=2 gives π."],["Circle sector area","Area = (θ/360)×πr². Example: θ=90°, r=2 gives π."]],
    "Foundation · given on paper":[["Prism volume","Volume = cross-section area × length. Example: 6 × 4 = 24."],["Cylinder volume","V=πr²h. Example: r=2,h=3 gives 12π."],["Pythagoras","a²+b²=c². Example: 3²+4²=5²."],["Density","density=mass/volume. Example: 20 g ÷ 4 cm³=5 g/cm³."]],
    "Higher · given on paper":[["Cone volume","V=⅓πr²h. Example: r=3,h=4 gives 12π."],["Sphere volume","V=⁴⁄₃πr³. Example: r=3 gives 36π."],["Sphere surface area","A=4πr². Example: r=2 gives 16π."],["Compound interest","New amount=P(1±r/100)ⁿ. Example: £100 grows by 10% once to £110."]]
  };
  function initFormulas(){
    const target=document.querySelector("#formula-lists");
    target.innerHTML=Object.entries(formulas).map(([heading,items],group)=>`<section><h2>${heading}</h2><button data-cover="${group}">Cover and test me</button><div data-formula-group="${group}">${items.map(item=>`<div class="gcse-formula-item"><b class="formula-answer">${item[0]}: ${item[1]}</b></div>`).join("")}</div></section>`).join("");
    target.addEventListener("click",event=>{
      const button=event.target.closest("[data-cover]");if(!button)return;
      const group=target.querySelector(`[data-formula-group="${button.dataset.cover}"]`),hidden=button.dataset.hidden!=="true";
      group.querySelectorAll(".formula-answer").forEach(item=>item.classList.toggle("gcse-cover",hidden));
      button.dataset.hidden=String(hidden);button.textContent=hidden?"Show formulas":"Cover and test me";
    });
  }
  function initWords(){
    const words=[["Work out","Calculate the answer.","Show the steps and the final answer."],["Show that","Prove a stated result.","Write enough working to reach the given result."],["Hence","Use the answer or method from an earlier part.","Make the link clear; do not start from scratch."],["Estimate","Find a sensible approximate answer.","Round values first and show the estimate."],["Write down","Give the answer with little or no working.","Check the requested form."],["Prove","Give a complete mathematical argument.","Use clear steps that must always be true."],["Explain","Give a reason in words.","Link your reason to the maths."],["Give a reason","Support the answer with a fact or calculation.","State the relevant rule or evidence."],["Simplify","Write an equivalent expression in its simplest form.","Collect terms or reduce fully."],["Expand","Remove brackets by multiplying each term.","Show all products and collect terms."],["Factorise","Write an expression as a product of factors.","Check by expanding."],["Solve","Find every value that makes the equation true.","Show working and check solutions."]];
    document.querySelector("#exam-words").innerHTML=`<h2>Command words</h2>${words.map(word=>`<article class="gcse-card"><h3>${word[0]}</h3><p>${word[1]}</p><p><b>Examiner wants:</b> ${word[2]}</p></article>`).join("")}`;
    document.querySelector("#exam-tips").innerHTML="<h2>Exam rules and tips</h2><ul><li>Show your working, even when you use a calculator.</li><li>Check that units match. Include units in your answer when needed.</li><li>If no accuracy is given, give decimal answers to 3 significant figures.</li><li>On a non-calculator paper, write exact fractions and surds where suitable. Check each arithmetic step.</li><li>On a calculator paper, type brackets carefully and keep full values until the final step.</li><li>Use the last 5 minutes to check unanswered questions, signs, units, rounding, and that each answer matches the question.</li></ul>";
  }
  let mockQuestions=[];
  function prepareMock(){
    const button=document.querySelector("#mock-start");
    button.addEventListener("click",startMock);
    document.querySelector("#mock-paper").addEventListener("click",event=>{
      const reveal=event.target.closest("[data-mock-scheme]");
      if(reveal){document.querySelector(`#scheme-${reveal.dataset.mockScheme}`).hidden=false;}
      if(event.target.id==="mock-submit")finishMock();
    });
    renderMockHistory();
  }
  function renderMockHistory(){
    const target=document.querySelector("#mock-results");
    if(target&&state.mocks.length)target.innerHTML=`<h2>Past mock results</h2>${state.mocks.slice(-10).reverse().map(result=>`<p>${new Date(result.date).toLocaleDateString()}: ${result.earned} / ${result.total}</p>`).join("")}`;
  }
  function startMock(){
    if(mockTimer)clearInterval(mockTimer);
    const pool=topics.flatMap(topic=>topic.exam.map((question,index)=>({topic,question,index})));
    if(pool.length<30){document.querySelector("#mock-paper").textContent="At least 30 exam questions must be loaded to build a mock.";return;}
    const shuffled=pool.slice();
    for(let index=shuffled.length-1;index>0;index--){
      const other=Math.floor(Math.random()*(index+1));
      [shuffled[index],shuffled[other]]=[shuffled[other],shuffled[index]];
    }
    mockQuestions=shuffled.slice(0,30);
    const total=mockQuestions.reduce((sum,item)=>sum+item.question.marks,0),duration=Number(document.querySelector("#mock-time").value)*60;
    document.querySelector("#mock-total").textContent=`${total} marks`;
    document.querySelector("#mock-results").textContent="";
    document.querySelector("#mock-paper").innerHTML=mockQuestions.map((item,index)=>`<article class="gcse-question"><b>Q${index+1} · ${item.topic.title} · ${item.question.marks} marks</b><p>${item.question.q}</p>${window.VisualMap?window.VisualMap.render({id:item.topic.id,title:item.topic.title,area:item.topic.area,description:item.topic.idea}):""}<label>Marks earned (0–${item.question.marks}) <input type="number" min="0" max="${item.question.marks}" value="0" data-mock-mark="${index}"></label><button data-mock-scheme="${index}">Show mark scheme</button><div id="scheme-${index}" class="gcse-scheme" hidden>${item.question.scheme}</div></article>`).join("")+"<button id=\"mock-submit\">Finish and score</button>";
    let left=duration;
    const clock=document.querySelector("#mock-clock");
    const tick=()=>{clock.textContent=`${Math.floor(left/60)}:${String(left%60).padStart(2,"0")} left`;if(left<=0){clearInterval(mockTimer);finishMock();}left--;};
    tick();mockTimer=setInterval(tick,1000);
  }
  function finishMock(){
    const submit=document.querySelector("#mock-submit");
    if(!mockQuestions.length||(submit&&submit.disabled))return;
    if(submit)submit.disabled=true;
    if(mockTimer){clearInterval(mockTimer);mockTimer=null;}
    const marks=[...document.querySelectorAll("[data-mock-mark]")],byTopic={},earned=marks.reduce((sum,input,index)=>{
      const value=Math.max(0,Math.min(mockQuestions[index].question.marks,Number(input.value)||0)),topic=mockQuestions[index].topic.title,entry=byTopic[topic]||(byTopic[topic]={earned:0,total:0});
      entry.earned+=value;entry.total+=mockQuestions[index].question.marks;return sum+value;
    },0),total=mockQuestions.reduce((sum,item)=>sum+item.question.marks,0);
    const result={date:new Date().toISOString(),earned,total,byTopic};
    state.mocks.push(result);save();
    document.querySelector("#mock-results").innerHTML=`<h2>Mock result: ${earned} / ${total}</h2>${Object.entries(byTopic).map(([title,score])=>`<p>${title}: ${score.earned} / ${score.total}</p>`).join("")}`;
    const results=document.querySelector("#mock-results");
    results.insertAdjacentHTML("beforeend",mockQuestions.map((item,index)=>
      `<article class="gcse-question mock-review-question"><h3>Review ${index+1}: ${item.topic.title}</h3><p>${item.question.q}</p><p>Marks earned: ${Number(document.querySelector(`[data-mock-mark="${index}"]`)?.value)||0} / ${item.question.marks}</p><p><b>Answer:</b> ${item.question.a}</p></article>`
    ).join(""));
    results.querySelectorAll(".mock-review-question").forEach((card,index)=>{
      const item=mockQuestions[index];
      window.AITutor?.attach(card,{
        question:item.question.q,
        studentAnswer:String(document.querySelector(`[data-mock-mark="${index}"]`)?.value||""),
        topic:item.topic.title,
        level:item.topic.tier
      });
    });
  }
  if(page==="topics")initTopicPage();
  if(page==="formulas")initFormulas();
  if(page==="words")initWords();
  if(page==="mock")prepareMock();
  if(page==="topics"||page==="mock")loadTopics();
})();
