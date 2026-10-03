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
      return Object.assign({answers:{},examDate:"",mocks:[]},value);
    }catch(error){
      if(error instanceof SyntaxError){
        console.error("Saved GCSE progress is not valid JSON. Starting with empty progress.",error);
        return {answers:{},examDate:"",mocks:[]};
      }
      throw error;
    }
  };
  let state=readProgress(),topics=[],mockTimer=null;
  const save=()=>localStorage.setItem(STORAGE_KEY,JSON.stringify(state));
  const safe=(value)=>String(value==null?"":value);
  const resourceLinks=topic=>{
    const decoded=document.createElement("textarea");
    decoded.innerHTML=topic.title;
    const title=decoded.value.trim();
    const term=encodeURIComponent(title);
    const siteSearch=domain=>`https://www.google.com/search?q=${encodeURIComponent(`site:${domain} "${title}" GCSE maths`)}`;
    const links=[
      ["BBC Bitesize",siteSearch("bbc.co.uk/bitesize")],
      ["Corbettmaths",`https://corbettmaths.com/?s=${term}`],
      ["Maths Genie",siteSearch("mathsgenie.co.uk")],
      ["Save My Exams",siteSearch("savemyexams.com/gcse/maths")],
      ["Dr Frost Maths",siteSearch("drfrostmaths.com")],
      ["Physics and Maths Tutor",siteSearch("physicsandmathstutor.com/maths-revision/gcse")],
      ["AQA past papers",siteSearch("aqa.org.uk")],
      ["Edexcel past papers",siteSearch("qualifications.pearson.com")],
      ["OCR past papers",siteSearch("ocr.org.uk")]
    ];
    links.push(["Khan Academy",`https://www.khanacademy.org/search?page_search_query=${encodeURIComponent(title+" GCSE maths")}`]);
    return `<p>These links search for <b>${safe(title)}</b> on each study site. Past-paper links search the official exam-board site for this topic.</p><div class="gcse-topic-resources">${links.map(([label,url])=>`<a target="_blank" rel="noopener" href="${url}" aria-label="Search ${safe(title)} on ${label}">${label}<span>${safe(title)}</span></a>`).join("")}</div><p class="gcse-subtle">Check your exam board and tier in any search results. Past-paper availability can differ by board.</p>`;
  };
  function loadTopics(){
    fetch("js/gcse/index.js").then(response=>{
      if(!response.ok)throw new Error("Could not load the GCSE topic list.");
      return response.text();
    }).then(text=>{
      const files=text.split(/\r?\n/).map(line=>line.trim().replace(/^["']|["']$/g,"")).filter(Boolean);
      if(files.some(file=>!/^[\w-]+\.js$/.test(file)))throw new Error("The GCSE topic list contains an invalid file name.");
      return files.reduce((chain,file)=>chain.then(()=>new Promise((resolve,reject)=>{
          const script=document.createElement("script");
          script.src="js/gcse/topics/"+file;
          script.onload=resolve;
          script.onerror=()=>reject(new Error("Could not load GCSE topic: "+file));
          document.head.appendChild(script);
        })),Promise.resolve());
    }).then(()=>{
      topics=window.GCSE||[];
      if(page==="topics")renderTopics();
      if(page==="mock")prepareMock();
      updateProgress();
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
  function questionMarkup(question,index,type,topic){
    const key=`${topic.id}:${type}:${index}`;
    const marks=question.marks||1;
    const answer=type==="practice"?`<div class="gcse-answer" hidden><b>Answer:</b> ${question.a}</div>`:`<div class="gcse-scheme" hidden><b>Mark scheme (${marks} marks):</b> ${question.scheme}</div>`;
    return `<article class="gcse-question"><b>${type==="exam"?"Exam":"Practice"} ${index+1}</b> <span class="gcse-subtle">(${marks} mark${marks===1?"":"s"})</span><p>${question.q}</p>${type==="practice"?`<label class="gcse-answer-label">Your answer and working<textarea class="gcse-answer-input" rows="3" placeholder="Try it first. Write your method and answer here." aria-label="Your answer and working for practice question ${index+1}"></textarea></label><button class="alt" data-reveal="hint">Need a hint?</button>`:""}<button data-reveal="${type==="practice"?"answer":"scheme"}">${type==="practice"?"Check the answer":"Show mark scheme"}</button>${type==="practice"?`<div class="gcse-hint" hidden>${question.hint}</div>`:""}${answer}<div class="gcse-marking"><button data-mark="right" data-key="${key}">I got it right</button><button class="alt" data-mark="wrong" data-key="${key}">I got it wrong</button></div><p class="gcse-mark-feedback" aria-live="polite"></p></article>`;
  }
  function showTopic(topic){
    const list=document.querySelector("#topic-list"),view=document.querySelector("#topic-view");
    list.hidden=true;view.hidden=false;
    const examples=Array.isArray(topic.example)?topic.example:[topic.example];
    view.innerHTML=`<button id="back-to-topics">← All topics</button><h2>${topic.title}</h2><p><b>${topic.area}</b> · ${topic.tier} · Grades ${topic.grade}</p><p><a class="gcse-practice-link" href="questions.html?topic=${encodeURIComponent(topic.id)}">More practice on this topic in the Question Bank ↗</a></p><section class="gcse-card"><h3>The idea</h3>${topic.idea}</section><section class="gcse-card"><h3>Worked example${examples.length>1?"s":""}</h3>${examples.map(example=>`<div>${example}</div>`).join("<hr>")}</section><section class="gcse-card"><h3>Mistakes to avoid</h3>${topic.mistakes}</section><section class="gcse-card"><h3>Key words</h3><ul class="gcse-keys">${topic.key.map(item=>`<li><b>${item[0]}</b>: ${item[1]}</li>`).join("")}</ul></section><section class="gcse-resource-section"><h3>Study links for ${topic.title}</h3>${resourceLinks(topic)}</section><section><h3>Practice</h3><p class="gcse-subtle">Write your method first. Then check the answer and mark your own work.</p>${topic.practice.map((question,index)=>questionMarkup(question,index,"practice",topic)).join("")}</section><section><h3>Exam questions</h3>${topic.exam.map((question,index)=>questionMarkup(question,index,"exam",topic)).join("")}</section>`;
    view.scrollIntoView({behavior:"smooth"});
  }
  function renderTopics(){
    const target=document.querySelector("#topic-list");
    if(!target)return;
    const search=document.querySelector("#gcse-search").value.trim().toLowerCase();
    const tier=document.querySelector("#gcse-tier").value,grade=document.querySelector("#gcse-grade").value,area=document.querySelector("#gcse-area").value;
    const found=topics.filter(topic=>(tier==="All"||topic.tier==="FH"||topic.tier===tier)&&(grade==="All"||topic.grade===grade)&&(area==="All"||topic.area===area)&&(topic.title+" "+topic.idea+" "+topic.area).toLowerCase().includes(search));
    const areas=["Number","Algebra","Ratio","Geometry","Probability","Statistics"];
    target.innerHTML=areas.map(name=>{
      const items=found.filter(topic=>topic.area===name);
      return items.length?`<h2>${name}</h2><div class="gcse-topic-list">${items.map(topic=>`<button class="gcse-topic" data-topic="${topic.id}"><h3>${topic.title}</h3><small>${topic.tier} · Grades ${topic.grade}</small></button>`).join("")}</div>`:"";
    }).join("")||"<p>No topics match these filters.</p>";
  }
  function updateProgress(){
    const answers=Object.values(state.answers),right=answers.reduce((sum,value)=>sum+value.right,0),wrong=answers.reduce((sum,value)=>sum+value.wrong,0),attempted=right+wrong;
    const text=document.querySelector("#gcse-progress-text"),bar=document.querySelector("#gcse-progress-bar");
    if(text)text.textContent=`${right} questions marked right · ${attempted} attempted`;
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
    const perDay=days?Math.max(1,Math.ceil(remaining.length/days)):remaining.length;
    plan.textContent=remaining.length?`Study ${perDay} topic${perDay===1?"":"s"} each day. Start with: ${remaining.slice(0,perDay).map(topic=>topic.title).join(", ")}.`:"You have marked every topic as right. Review your weak topics.";
  }
  function exportProgress(){
    const blob=new Blob([JSON.stringify(state,null,2)],{type:"application/json"});
    const url=URL.createObjectURL(blob),link=document.createElement("a");
    link.href=url;link.download="mathmaster-gcse-progress.json";document.body.appendChild(link);link.click();link.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }
  function initTopicPage(){
    ["#gcse-search","#gcse-tier","#gcse-grade","#gcse-area"].forEach(selector=>document.querySelector(selector).addEventListener("input",renderTopics));
    document.querySelector("#topic-list").addEventListener("click",event=>{
      const button=event.target.closest("[data-topic]");
      if(button){const topic=topics.find(item=>item.id===button.dataset.topic);if(topic)showTopic(topic);}
    });
    document.querySelector("#topic-view").addEventListener("click",event=>{
      if(event.target.id==="back-to-topics"){document.querySelector("#topic-view").hidden=true;document.querySelector("#topic-list").hidden=false;return;}
      const reveal=event.target.closest("[data-reveal]");
      if(reveal){const card=reveal.closest(".gcse-question");const selector=reveal.dataset.reveal==="hint"?".gcse-hint":reveal.dataset.reveal==="scheme"?".gcse-scheme":".gcse-answer";const panel=card.querySelector(selector);panel.hidden=!panel.hidden;return;}
      const marker=event.target.closest("[data-mark]");
      if(marker){
        const [topicId]=marker.dataset.key.split(":");
        const topic=state.answers[marker.dataset.key]||(state.answers[marker.dataset.key]={topicId,right:0,wrong:0});
        topic[marker.dataset.mark]++;
        const card=marker.closest(".gcse-question");
        card.querySelectorAll("[data-mark]").forEach(button=>button.disabled=true);
        const feedback=card.querySelector(".gcse-mark-feedback");
        feedback.textContent=marker.dataset.mark==="right"?"Nice work. Your result has been saved.":"That is how practice helps. Review the answer, then try a similar question.";
        card.classList.toggle("gcse-question-correct",marker.dataset.mark==="right");
        card.classList.toggle("gcse-question-review",marker.dataset.mark==="wrong");
        save();updateProgress();
      }
    });
    const dateInput=document.querySelector("#exam-date");
    dateInput.value=state.examDate||"";
    dateInput.addEventListener("change",()=>{state.examDate=dateInput.value;save();updateDailyPlan();});
    document.querySelector("#gcse-export").addEventListener("click",exportProgress);
    document.querySelector("#gcse-reset").addEventListener("click",()=>{
      if(confirm("Reset all GCSE progress, exam date, and mock results?")){
        state={answers:{},examDate:"",mocks:[]};save();dateInput.value="";updateProgress();
      }
    });
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
    document.querySelector("#mock-paper").innerHTML=mockQuestions.map((item,index)=>`<article class="gcse-question"><b>Q${index+1} · ${item.topic.title} · ${item.question.marks} marks</b><p>${item.question.q}</p><label>Marks earned (0–${item.question.marks}) <input type="number" min="0" max="${item.question.marks}" value="0" data-mock-mark="${index}"></label><button data-mock-scheme="${index}">Show mark scheme</button><div id="scheme-${index}" class="gcse-scheme" hidden>${item.question.scheme}</div></article>`).join("")+"<button id=\"mock-submit\">Finish and score</button>";
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
  }
  if(page==="topics")initTopicPage();
  if(page==="formulas")initFormulas();
  if(page==="words")initWords();
  if(page==="mock")prepareMock();
  if(page==="topics"||page==="mock")loadTopics();
})();
