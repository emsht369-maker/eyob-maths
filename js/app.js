const $=s=>document.querySelector(s);
const load=()=>{try{return JSON.parse(localStorage.getItem("mathmaster")||"{}")}catch(e){return{}}};
const S=Object.assign({done:{},days:[],sub:{}},load());
const save=()=>{try{localStorage.setItem("mathmaster",JSON.stringify(S))}catch(e){}};
window.L={};
const TIER={core:"⭐ ML core",useful:"Useful",later:"Later"};
const KA=["arithmetic","pre-algebra","algebra","algebra","geometry","trigonometry","algebra2","calculus-1","statistics-probability","statistics-probability","linear-algebra","computing/computer-science/cryptography","algebra","precalculus","precalculus","linear-algebra","precalculus","geometry","statistics-probability","algebra2","geometry","linear-algebra","multivariable-calculus","differential-equations","calculus-1"].map(x=>x.startsWith("computing")?"https://www.khanacademy.org/"+x:"https://www.khanacademy.org/math/"+x);
const W3AI=[
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_probability.asp","AI Probability"],
  ["ai_algebra.asp","Linear Algebra"],
  ["ai_linear.asp","Linear Functions"],
  ["ai_graphics.asp","AI Graphics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_probability.asp","AI Probability"],
  ["ai_statistics_descriptive.asp","Descriptive Statistics"],
  ["ai_matrices.asp","AI Matrices"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_vectors.asp","AI Vectors"],
  ["ai_linear_graphs.asp","ML Linear Graphs"],
  ["ai_graphics.asp","AI Graphics"],
  ["ai_probability.asp","AI Probability"],
  ["ai_algebra.asp","Linear Algebra"],
  ["ai_graphics.asp","AI Graphics"],
  ["ai_algebra.asp","Linear Algebra"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_mathematics.asp","AI Mathematics"],
  ["ai_training.asp","ML Training"]
].map(([path,title])=>[`https://www.w3schools.com/ai/${path}`,title]);
const STUDY_RESOURCES=[
  [["Math Is Fun: Numbers","https://www.mathsisfun.com/numbers/index.html"],["OpenStax: Prealgebra","https://openstax.org/details/books/prealgebra-2e"]],
  [["Math Is Fun: Fractions","https://www.mathsisfun.com/fractions.html"],["OpenStax: Prealgebra","https://openstax.org/details/books/prealgebra-2e"]],
  [["Paul's Online Notes: Algebra","https://tutorial.math.lamar.edu/Classes/Alg/Alg.aspx"],["OpenStax: College Algebra","https://openstax.org/details/books/college-algebra-2e"]],
  [["Desmos Graphing Calculator","https://www.desmos.com/calculator"],["OpenStax: Precalculus","https://openstax.org/details/books/precalculus-2e"]],
  [["GeoGebra Geometry","https://www.geogebra.org/geometry"],["Math Is Fun: Geometry","https://www.mathsisfun.com/geometry/index.html"]],
  [["Math Is Fun: Trigonometry","https://www.mathsisfun.com/algebra/trigonometry.html"],["OpenStax: Precalculus","https://openstax.org/details/books/precalculus-2e"]],
  [["Math Is Fun: Exponents","https://www.mathsisfun.com/exponent.html"],["OpenStax: College Algebra","https://openstax.org/details/books/college-algebra-2e"]],
  [["Paul's Online Notes: Calculus I","https://tutorial.math.lamar.edu/Classes/CalcI/CalcI.aspx"],["OpenStax: Calculus Volume 1","https://openstax.org/details/books/calculus-volume-1"]],
  [["StatQuest","https://www.statquest.org/"],["OpenStax: Introductory Statistics","https://openstax.org/details/books/introductory-statistics-2e"]],
  [["StatQuest","https://www.statquest.org/"],["OpenStax: Introductory Statistics","https://openstax.org/details/books/introductory-statistics-2e"]],
  [["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],["3Blue1Brown: Linear Algebra","https://www.3blue1brown.com/topics/linear-algebra"]],
  [["Wolfram MathWorld: Number Theory","https://mathworld.wolfram.com/NumberTheory.html"],["Math Is Fun: Number Theory","https://www.mathsisfun.com/numbers/number-theory.html"]],
  [["Math Is Fun: Sets","https://www.mathsisfun.com/sets/sets-introduction.html"],["Wolfram MathWorld: Logic","https://mathworld.wolfram.com/Logic.html"]],
  [["Paul's Online Notes: Series","https://tutorial.math.lamar.edu/Classes/CalcII/SeriesIntro.aspx"],["OpenStax: Calculus Volume 1","https://openstax.org/details/books/calculus-volume-1"]],
  [["Math Is Fun: Complex Numbers","https://www.mathsisfun.com/numbers/complex-numbers.html"],["Paul's Online Notes: Complex Numbers","https://tutorial.math.lamar.edu/Classes/Alg/ComplexNumbers.aspx"]],
  [["3Blue1Brown: Linear Algebra","https://www.3blue1brown.com/topics/linear-algebra"],["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"]],
  [["OpenStax: Precalculus","https://openstax.org/details/books/precalculus-2e"],["Desmos Graphing Calculator","https://www.desmos.com/calculator"]],
  [["Math Is Fun: Transformations","https://www.mathsisfun.com/geometry/transformations.html"],["GeoGebra Graphing Calculator","https://www.geogebra.org/graphing"]],
  [["Math Is Fun: Combinations and Permutations","https://www.mathsisfun.com/combinatorics/combinations-permutations.html"],["OpenStax: Introductory Statistics","https://openstax.org/details/books/introductory-statistics-2e"]],
  [["Paul's Online Notes: Polynomials","https://tutorial.math.lamar.edu/Classes/Alg/Polynomials.aspx"],["OpenStax: College Algebra","https://openstax.org/details/books/college-algebra-2e"]],
  [["Wolfram MathWorld: Non-Euclidean Geometry","https://mathworld.wolfram.com/Non-EuclideanGeometry.html"],["GeoGebra Geometry","https://www.geogebra.org/geometry"]],
  [["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],["3Blue1Brown: Linear Algebra","https://www.3blue1brown.com/topics/linear-algebra"]],
  [["Paul's Online Notes: Calculus III","https://tutorial.math.lamar.edu/Classes/CalcIII/CalcIII.aspx"],["OpenStax: Calculus Volume 1","https://openstax.org/details/books/calculus-volume-1"]],
  [["Paul's Online Notes: Differential Equations","https://tutorial.math.lamar.edu/Classes/DE/DE.aspx"],["OpenStax: Calculus Volume 1","https://openstax.org/details/books/calculus-volume-1"]],
  [["Google: Machine Learning Crash Course","https://developers.google.com/machine-learning/crash-course"],["StatQuest","https://www.statquest.org/"]]
];
const MIT_RESOURCES=[
  null,null,null,
  ["MIT OpenCourseWare: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Probability and Statistics","https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/"],
  ["MIT OpenCourseWare: Probability and Statistics","https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/"],
  ["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],
  ["MIT OpenCourseWare: Discrete Applied Mathematics","https://ocw.mit.edu/courses/18-310-principles-of-discrete-applied-mathematics-fall-2013/"],
  ["MIT OpenCourseWare: Discrete Applied Mathematics","https://ocw.mit.edu/courses/18-310-principles-of-discrete-applied-mathematics-fall-2013/"],
  ["MIT OpenCourseWare: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],
  null,
  ["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],
  ["MIT OpenCourseWare: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],
  ["MIT OpenCourseWare: Discrete Applied Mathematics","https://ocw.mit.edu/courses/18-310-principles-of-discrete-applied-mathematics-fall-2013/"],
  null,
  ["MIT OpenCourseWare: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],
  ["MIT OpenCourseWare: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"],
  ["MIT OpenCourseWare: Differential Equations","https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/"],
  ["MIT OpenCourseWare: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"]
];
const subs=i=>TOPICS[i][4].split(" · ");
const subDone=i=>subs(i).filter((_,j)=>S.sub[i+"-"+j]).length;
const qsOf=i=>(L[i]?L[i].q:TOPICS[i][5]).concat(window.MORE_QUESTIONS&&window.MORE_QUESTIONS[i]||[]);
let filter="all",query="";

function normalizeAnswerText(value){
  return String(value==null?"":value)
    .trim()
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g,"-")
    .replace(/×/g,"*")
    .replace(/÷/g,"/")
    .replace(/\s+/g,"")
    .replace(/,/g,"")
    .replace(/\u00b0/g,"deg")
    .replace(/π/g,"pi")
    .replace(/∞/g,"infinity")
    .replace(/\^/g,"^");
}

function parseComparableNumber(value){
  const raw=normalizeAnswerText(value).replace(/[%€$£]/g,"");
  if(!raw||raw==="infinity")return null;
  if(raw.includes("pi")){
    const piValue=raw.replace(/pi/g,"");
    if(piValue===""||piValue==="1")return Math.PI;
    if(/^[\d.]+$/.test(piValue))return Number(piValue)*Math.PI;
  }
  if(raw.includes("/")){
    const [left,right]=raw.split("/");
    if(left && right && /^-?[\d.]+$/.test(left) && /^-?[\d.]+$/.test(right)){
      return Number(left)/Number(right);
    }
  }
  if(/^-?[\d.]+$/.test(raw))return Number(raw);
  return null;
}

function isAnswerCorrect(expected,submitted){
  const expectedText=normalizeAnswerText(expected);
  const submittedText=normalizeAnswerText(submitted);
  if(!submittedText)return false;
  if(expectedText===submittedText)return true;

  const expectedNumber=parseComparableNumber(expected);
  const submittedNumber=parseComparableNumber(submitted);
  if(expectedNumber!=null&&submittedNumber!=null && Math.abs(expectedNumber-submittedNumber)<1e-8)return true;

  const stripEquation = value => value.replace(/^\s*\(?\s*\w\s*=\s*/i, "").replace(/\s+/g, "");
  if((expectedText.includes("=")||submittedText.includes("=")) && stripEquation(expectedText)===stripEquation(submittedText))return true;

  const compact = value => value.replace(/[\[\]{}()]/g,"").replace(/\s+/g,"");
  return compact(expectedText)===compact(submittedText) || expectedText.includes(submittedText) || submittedText.includes(expectedText);
}

function loadLessons(){
  return Promise.all(TOPICS.map((_,i)=>new Promise(r=>{
    const s=document.createElement("script");
    s.src="js/lessons/"+String(i+1).padStart(2,"0")+".js";
    s.onload=s.onerror=r;document.head.appendChild(s);
  })));
}

function render(){
  $("#grid").innerHTML=TOPICS.map((t,i)=>({t,i}))
    .filter(({t})=>(filter==="all"||t[2]===filter)&&(t[1]+" "+t[4]).toLowerCase().includes(query))
    .map(({t,i})=>`<button class="card ${S.done[i]?"done":""}" data-i="${i}">
      <span class="em">${t[0]}</span><b>${i+1}. ${t[1]}</b>
      <small class="tag ${t[2]}">${TIER[t[2]]}</small>
      <small class="meta">${L[i]?"📖 Full lesson":"📄 Summary"} · ${subDone(i)}/${subs(i).length} studied</small></button>`).join("")||"<p class='mut'>No topics found.</p>";
  const n=Object.values(S.done).filter(Boolean).length;
  $("#pct").textContent=n+"/"+TOPICS.length;
  $("#fill").style.width=(n/TOPICS.length*100)+"%";
  let s=0,d=new Date();
  while(S.days.includes(d.toLocaleDateString("en-CA"))){s++;d.setDate(d.getDate()-1)}
  $("#streak").textContent=s;
}

function qHTML(q,n){
  return `<div class="q"><b>Q${n}.</b> ${q[0]}<label class="answer-label">Your answer<textarea class="answer-input" rows="2" placeholder="Write your answer here..." aria-label="Your answer to question ${n}"></textarea></label><div class="btns">`+
    (q[2]?`<button class="rev alt">Hint</button><div class="a hint" hidden>💡 ${q[2]}</div>`:"")+
    `<button class="check-answer">Check answer</button><button class="rev">Answer</button><div class="a answer" hidden>${q[1]}</div><div class="check-result" hidden></div></div></div>`;
}

function openTopic(i){
  const t=TOPICS[i],l=L[i]||{},qs=qsOf(i),topicSearch=encodeURIComponent(t[1]+" maths"),nm=encodeURIComponent(t[1]+" maths explained");
  $("#dlg").innerHTML=`<button class="x" aria-label="Close" onclick="$('#dlg').close()">✕</button>
    <h3>${t[0]} ${i+1}. ${t[1]}</h3><small class="tag ${t[2]}">${TIER[t[2]]}</small>
    <p>${t[3]}</p>
    <h4>Important links</h4>
    <div class="links"><a href="${KA[i]}" target="_blank" rel="noopener">📚 Khan Academy course: ${t[1]}</a>
    <a href="https://www.khanacademy.org/search?page_search_query=${topicSearch}" target="_blank" rel="noopener">🔎 Search this topic on Khan Academy</a>
    <a href="${W3AI[i][0]}" target="_blank" rel="noopener">🤖 W3Schools AI: ${W3AI[i][1]}</a>
    <a href="https://www.youtube.com/results?search_query=${nm}" target="_blank" rel="noopener">▶ Video lessons: ${t[1]}</a></div>
    <h4>More free study resources</h4>
    <div class="links">${STUDY_RESOURCES[i].map(([title,url])=>`<a href="${url}" target="_blank" rel="noopener">${title}</a>`).join("")}
    ${MIT_RESOURCES[i]?`<a href="${MIT_RESOURCES[i][1]}" target="_blank" rel="noopener">${MIT_RESOURCES[i][0]}</a>`:""}</div>
    ${l.s?l.s.map(s=>`<h4>${s[0]}</h4>${s[1]}`).join(""):`<p class="mut">📌 The full lesson for this topic is coming soon. Use the links above for now.</p>`}
    ${l.e?`<h4>Worked examples (click to open)</h4>`+l.e.map(e=>`<details><summary>${e[0]}</summary><div class="sol">${e[1]}</div></details>`).join(""):""}
    <h4>Practice: ${qs.length} questions</h4>${qs.map((q,k)=>qHTML(q,k+1)).join("")}
    <h4>Checklist: ${subs(i).length} subtopics</h4>
    ${subs(i).map((x,j)=>`<label class="ck"><input type="checkbox" data-s="${i}-${j}" ${S.sub[i+"-"+j]?"checked":""}> ${x}</label>`).join("")}
    <p><label><input type="checkbox" id="dn" ${S.done[i]?"checked":""}> <b>I finished this topic</b></label></p>`;
  $("#dn").onchange=e=>{S.done[i]=e.target.checked;save();render()};
  $("#dlg").showModal();
}

document.addEventListener("click",e=>{
  const c=e.target.closest(".card");if(c)openTopic(+c.dataset.i);
  const check=e.target.closest(".check-answer");
  if(check){
    const q=check.closest(".q") || check.closest("#rq") || check.parentElement;
    const answerInput=q ? q.querySelector(".answer-input") : null;
    const result=q ? q.querySelector(".check-result") : null;
    const answerText=q ? q.querySelector(".a.answer") : null;
    const userInput=answerInput?answerInput.value:"";
    const expectedAnswer=answerText ? answerText.textContent : "";
    const correct=isAnswerCorrect(expectedAnswer || userInput, userInput);
    if(result){
      result.hidden=false;
      result.textContent=correct?"✅ Correct! Great work.":"❌ Not quite — try again or reveal the answer.";
      result.style.color=correct?"#0b8a3d":"#b42318";
    }
    return;
  }
  if(e.target.classList.contains("rev")){const a=e.target.nextElementSibling;a.hidden=!a.hidden}
  const ch=e.target.closest(".chip");
  if(ch){filter=ch.dataset.f;document.querySelectorAll(".chip").forEach(x=>x.classList.toggle("on",x===ch));render()}
});
document.addEventListener("change",e=>{
  if(e.target.dataset.s){S.sub[e.target.dataset.s]=e.target.checked;save();render()}
});
$("#dlg").addEventListener("click",e=>{if(e.target.id==="dlg")e.target.close()});
$("#search").oninput=e=>{query=e.target.value.toLowerCase().trim();render()};
$("#today").onclick=()=>{const d=new Date().toLocaleDateString("en-CA");if(!S.days.includes(d))S.days.push(d);save();render()};
$("#rnd").onclick=()=>{
  const i=Math.floor(Math.random()*TOPICS.length),qs=qsOf(i),q=qs[Math.floor(Math.random()*qs.length)];
  $("#rq").innerHTML=`<small class="tag">${TOPICS[i][0]} ${TOPICS[i][1]}</small><p>${q[0]}</p>`+
    `<label class="answer-label">Your answer<textarea class="answer-input" rows="2" placeholder="Write your answer here..." aria-label="Your answer"></textarea></label>`+
    (q[2]?`<button class="rev alt">Hint</button><div class="a hint" hidden>💡 ${q[2]}</div>`:"")+
    `<button class="check-answer">Check answer</button><button class="rev">Answer</button><div class="a answer" hidden>${q[1]}</div><div class="check-result" hidden></div>`;
};
$("#consts").innerHTML=CONSTS.map(c=>`<span><b>${c[0]}</b>${c[1]}</span>`).join("");
$("#syms").innerHTML=SYM.map(c=>`<span><b>${c[0]}</b>${c[1]}</span>`).join("");
render();$("#rnd").click();
loadLessons().then(()=>{render();$("#rnd").click()});
