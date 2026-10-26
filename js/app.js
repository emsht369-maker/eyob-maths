const TOPIC_LOCKS = true;
const $=s=>document.querySelector(s);
const isTopicPage=Boolean(document.querySelector("#topic-mount"));
const topicRoot=()=>$("#topic-mount");
const topicSlug=name=>String(name).toLowerCase().startsWith("basic arithmetic")?"basic-arithmetic":String(name).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/&/g,"and").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const assetURL=path=>window.MATH_MASTER_ASSETS?.[path]?"/"+window.MATH_MASTER_ASSETS[path]:(isTopicPage?"/"+path:path);
const escapeTopicText=value=>String(value==null?"":value).replace(/[&<>"']/g,char=>({
  "&":"&amp;",
  "<":"&lt;",
  ">":"&gt;",
  "\"":"&quot;",
  "'":"&#39;"
})[char]);
const load=()=>{try{return JSON.parse(localStorage.getItem("mathmaster")||"{}")}catch(e){return{}}};
const savedProgress=load();
const S=Object.assign({done:{},passed:{},days:[],sub:{}},savedProgress);
const TOPIC_ROOM_LINKS={
  0:["gcse-bidmas"],
  1:["gcse-fractions","gcse-percentages"],
  2:["gcse-linear-equations"],
  9:["gcse-statistics"],
  14:["ml-dot-product"]
};
const COURSE_PATH=[0,2,4,5,8,14,7,23,21];
const TOPIC_ROOM_TITLES={
  "gcse-bidmas":"Order of Operations (BIDMAS)",
  "gcse-fractions":"Fractions: Add and Subtract",
  "gcse-percentages":"Percentages of an Amount",
  "gcse-linear-equations":"Solving Linear Equations",
  "gcse-statistics":"Mean, Median, Mode and Range",
  "ml-dot-product":"Dot Product of Two Vectors"
};
const ACTIVITY_KEY="mathmaster_activity";
const loadActivity=()=>{try{return JSON.parse(localStorage.getItem(ACTIVITY_KEY)||"{}")}catch(e){return{}}};
const ACTIVITY=Object.assign({lastTopic:null,questionLog:{}},loadActivity());
if(!ACTIVITY.questionLog||typeof ACTIVITY.questionLog!=="object")ACTIVITY.questionLog={};
if(!ACTIVITY.practiceSets||typeof ACTIVITY.practiceSets!=="object")ACTIVITY.practiceSets={};
if(!ACTIVITY.practiceRounds||typeof ACTIVITY.practiceRounds!=="object")ACTIVITY.practiceRounds={};
if(!ACTIVITY.practiceHistory||typeof ACTIVITY.practiceHistory!=="object")ACTIVITY.practiceHistory={};
if(!ACTIVITY.practiceResults||typeof ACTIVITY.practiceResults!=="object")ACTIVITY.practiceResults={};
if(!ACTIVITY.topicExamResults||typeof ACTIVITY.topicExamResults!=="object")ACTIVITY.topicExamResults={};
if(!ACTIVITY.topicQuizzes||typeof ACTIVITY.topicQuizzes!=="object")ACTIVITY.topicQuizzes={};
if(!ACTIVITY.answerRewards||typeof ACTIVITY.answerRewards!=="object")ACTIVITY.answerRewards={};
if(!ACTIVITY.readingRewards||typeof ACTIVITY.readingRewards!=="object")ACTIVITY.readingRewards={};
if(!Number.isFinite(ACTIVITY.points))ACTIVITY.points=0;
if(!Array.isArray(ACTIVITY.badges))ACTIVITY.badges=[];
const save=()=>{try{localStorage.setItem("mathmaster",JSON.stringify(S))}catch(e){}};
const saveActivity=()=>{try{localStorage.setItem(ACTIVITY_KEY,JSON.stringify(ACTIVITY))}catch(e){}};
if(savedProgress.lastTopic!==undefined||savedProgress.questionLog!==undefined){
  if(ACTIVITY.lastTopic===null&&Number.isInteger(savedProgress.lastTopic))ACTIVITY.lastTopic=savedProgress.lastTopic;
  if(savedProgress.questionLog&&typeof savedProgress.questionLog==="object"){
    ACTIVITY.questionLog=Object.assign({},savedProgress.questionLog,ACTIVITY.questionLog);
  }
  delete S.lastTopic;
  delete S.questionLog;
  save();
  saveActivity();
}
let filter="all",level="all",query="";
let lessonsLoaded=false;
let activeTopicQuiz=null;
const params=new URLSearchParams(window.location.search);
const isFastMlPath=params.get("path")==="ml-fast";
const topicPathSlug=window.location.pathname.match(/^\/topic\/([^/]+)\/?$/)?.[1]||"";
const legacyTopicId=params.get("id")?.trim()||"";
const routeSlug=topicPathSlug||legacyTopicId;
const requestedTopic=params.get("topic")?.trim()||"";
const isCourseLaunch=params.get("from")==="courses";
const requestedTopicIndex=isCourseLaunch
  ?TOPICS.findIndex(topic=>topic[1].trim().toLowerCase()===requestedTopic.toLowerCase())
  :-1;
if(isFastMlPath){
  filter="core";
  const nextStepFlow=$("#next-step-flow");
  if(nextStepFlow)nextStepFlow.hidden=false;
}
if(requestedTopic)query=requestedTopic.toLowerCase();
window.L={};

function getTopicRoomProgress(){
  return window.TOPIC_LOCKS_API.readRoomProgress(localStorage);
}

function wolframQuestionLink(question){
  const plainQuestion=String(question==null?"":question)
    .replace(/<br\s*\/?>/gi," ")
    .replace(/<[^>]*>/g," ")
    .replace(/&nbsp;/gi," ")
    .replace(/&amp;/gi,"&")
    .replace(/&lt;/gi,"<")
    .replace(/&gt;/gi,">")
    .replace(/&times;/gi,"×")
    .replace(/&minus;/gi,"−")
    .replace(/&divide;/gi,"÷")
    .replace(/\s+/g," ").trim();
  const url="https://www.wolframalpha.com/input?i="+encodeURIComponent(plainQuestion);
  return `<a class="wolfram-question-link" href="${escapeTopicText(url)}" target="_blank" rel="noopener noreferrer">Check this question with Wolfram|Alpha ↗</a>`;
}

function isTopicPassed(index){
  if(isFastMlPath)return Boolean(S.done[index]&&S.passed[index]);
  if(!TOPIC_LOCKS){
    if(!S.passed[index])return false;
    for(let previous=0;previous<index;previous++){
      if(!S.passed[previous])return false;
    }
    return true;
  }
  return window.TOPIC_LOCKS_API.isTopicPassed(index,TOPIC_ROOM_LINKS,getTopicRoomProgress(),S);
}

function isTopicOpen(index){
  const roomProgress=getTopicRoomProgress();
  if(isCourseLaunch&&index===requestedTopicIndex){
    const position=COURSE_PATH.indexOf(index);
    return position>=0&&(roomProgress.practiceMode||position===0||COURSE_PATH.slice(0,position).every(isTopicPassed));
  }
  if(isFastMlPath){
    if(!TOPICS[index])return false;
    if(TOPICS[index][2]!=="core")return roomProgress.practiceMode||TOPICS.every((topic,topicIndex)=>topic[2]!=="core"||isTopicPassed(topicIndex));
    const previousCore=TOPICS.slice(0,index).reduce((previous,topic,topicIndex)=>
      topic[2]==="core"?topicIndex:previous,-1);
    return previousCore<0||isTopicPassed(previousCore)||roomProgress.practiceMode;
  }
  return window.TOPIC_LOCKS_API.isTopicOpen(index,TOPIC_ROOM_LINKS,roomProgress,S,TOPIC_LOCKS);
}

const isTopicFinished=index=>isFastMlPath?Boolean(S.done[index]&&S.passed[index]):TOPIC_LOCKS?isTopicPassed(index):Boolean(S.done[index]||S.passed[index]);
const todayKey=()=>new Date().toLocaleDateString("en-CA");
function recordQuestionAnswer(key){
  const date=todayKey();
  if(!Array.isArray(ACTIVITY.questionLog[date]))ACTIVITY.questionLog[date]=[];
  if(!ACTIVITY.questionLog[date].includes(key))ACTIVITY.questionLog[date].push(key);
  saveActivity();
  updateTodayStats();
}

function getTopicExam(index){
  const questions=[
    ...(HARD_TOPIC_EXAMS[index]||[]),
    ...((window.MORE_QUESTIONS&&window.MORE_QUESTIONS[index])||[]),
    ...(TOPIC_EXAMS[index]||[]),
    ...(TOPICS[index][5]||[]),
    ...(WORKED_EXAMPLES[index]||[]).map(([question,,answer])=>[question,answer])
  ];
  const unique=[];
  const seen=new Set();
  for(const question of questions){
    if(!seen.has(question[0])){
      seen.add(question[0]);
      unique.push(question.slice(0,2));
    }
  }
  return unique.slice(0,21);
}
const TIER={core:"⭐ ML core",useful:"Useful",later:"Later"};
const LEVEL_LABEL={all:"All levels",beginner:"Beginner",intermediate:"Intermediate",advanced:"Advanced"};
const TOPIC_LEVELS={
  beginner:new Set([0,1,2,3,4,5,6,7,8,9]),
  intermediate:new Set([10,11,12,13,14,15,16,17,18,19,20,21,22]),
  advanced:new Set([23,24,25,26,27,28,29])
};
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
const UNIVERSITY_COURSES={
  7:[["LINK MIT — 18.01SC: Single Variable Calculus","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"],["LINK COURSERA / IMPERIAL — Mathematics for Machine Learning Specialization","https://www.coursera.org/specializations/mathematics-machine-learning"],["LINK COURSERA / IMPERIAL — Multivariate Calculus for Machine Learning","https://www.coursera.org/learn/multivariate-calculus-machine-learning"]],
  8:[["LINK MIT — 18.600: Probability and Random Variables","https://ocw.mit.edu/courses/18-600-probability-and-random-variables-fall-2019/"],["LINK HARVARD — Stat 110: Introduction to Probability","https://stat110.hsites.harvard.edu/"]],
  9:[["LINK MIT — 18.05: Introduction to Probability and Statistics","https://ocw.mit.edu/courses/18-05-introduction-to-probability-and-statistics-spring-2022/"],["LINK MIT — 18.650: Statistics for Applications","https://ocw.mit.edu/courses/18-650-statistics-for-applications-fall-2016/"]],
  10:[["LINK MIT — 18.06: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],["LINK COURSERA / IMPERIAL — Mathematics for Machine Learning Specialization","https://www.coursera.org/specializations/mathematics-machine-learning"]],
  11:[["LINK MIT — 18.781: Theory of Numbers","https://ocw.mit.edu/courses/18-781-theory-of-numbers-spring-2012/"],["LINK MIT — 18.782: Introduction to Arithmetic Geometry","https://ocw.mit.edu/courses/18-782-introduction-to-arithmetic-geometry-fall-2013/download/"]],
  12:[["LINK MIT — 18.310: Principles of Discrete Applied Mathematics","https://ocw.mit.edu/courses/18-310-principles-of-discrete-applied-mathematics-fall-2013/"]],
  13:[["LINK MIT — 18.01SC: Single Variable Calculus (sequences and series)","https://ocw.mit.edu/courses/18-01sc-single-variable-calculus-fall-2010/"]],
  14:[["LINK MIT — 18.04: Complex Variables with Applications","https://ocw.mit.edu/courses/18-04-complex-variables-with-applications-spring-2018/"]],
  15:[["LINK MIT — 18.06: Linear Algebra (vectors and matrices)","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],["LINK COURSERA / IMPERIAL — Mathematics for Machine Learning Specialization","https://www.coursera.org/specializations/mathematics-machine-learning"]],
  16:[["LINK MIT — 18.02SC: Multivariable Calculus (3D coordinates)","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"]],
  17:[["LINK MIT — 18.06: Linear Algebra (linear transformations)","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"]],
  18:[["LINK MIT — 18.310: Principles of Discrete Applied Mathematics","https://ocw.mit.edu/courses/18-310-principles-of-discrete-applied-mathematics-fall-2013/"]],
  19:[["LINK MIT — 18.701: Algebra I","https://ocw.mit.edu/courses/18-701-algebra-i-fall-2010/"]],
  20:[["LINK MIT — 18.782: Introduction to Arithmetic Geometry","https://ocw.mit.edu/courses/18-782-introduction-to-arithmetic-geometry-fall-2013/download/"]],
  21:[["LINK MIT — 18.06: Linear Algebra","https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/"],["LINK STANFORD — Math 51: Linear Algebra and Multivariable Calculus","https://web.stanford.edu/class/math51/"],["LINK COURSERA / IMPERIAL — Mathematics for Machine Learning Specialization","https://www.coursera.org/specializations/mathematics-machine-learning"]],
  22:[["LINK MIT — 18.02SC: Multivariable Calculus","https://ocw.mit.edu/courses/18-02sc-multivariable-calculus-fall-2010/"],["LINK COURSERA / IMPERIAL — Multivariate Calculus for Machine Learning","https://www.coursera.org/learn/multivariate-calculus-machine-learning"],["LINK COURSERA / IMPERIAL — Mathematics for Machine Learning Specialization","https://www.coursera.org/specializations/mathematics-machine-learning"]],
  23:[["LINK MIT — 18.03SC: Differential Equations","https://ocw.mit.edu/courses/18-03sc-differential-equations-fall-2011/"]],
  24:[["LINK MIT — 18.330: Introduction to Numerical Analysis","https://ocw.mit.edu/courses/18-330-introduction-to-numerical-analysis-spring-2004/"],["LINK COURSERA / IMPERIAL — Mathematics for Machine Learning Specialization","https://www.coursera.org/specializations/mathematics-machine-learning"]]
};
const GCSE_MATH_RESOURCES=[
  ["LINK GCSE RESOURCE — BBC Bitesize Maths lessons","https://www.bbc.co.uk/bitesize"],
  ["LINK GCSE RESOURCE — Oak National Academy lessons","https://www.thenational.academy"],
  ["LINK GCSE RESOURCE — Corbettmaths videos and practice","https://www.corbettmaths.com"],
  ["LINK GCSE RESOURCE — Maths Genie past papers","https://www.mathsgenie.co.uk"]
];
const SUPPLEMENTARY_RESOURCES={
  0:GCSE_MATH_RESOURCES,
  1:GCSE_MATH_RESOURCES,
  2:GCSE_MATH_RESOURCES,
  3:GCSE_MATH_RESOURCES,
  4:GCSE_MATH_RESOURCES,
  5:GCSE_MATH_RESOURCES,
  6:GCSE_MATH_RESOURCES,
  7:[["LINK BOOK — Mathematics for Machine Learning","https://mml-book.com/"]],
  9:[["LINK BOOK — Mathematics for Machine Learning (PCA/statistics background)","https://mml-book.com/"]],
  10:[["LINK BOOK — Mathematics for Machine Learning","https://mml-book.com/"]],
  15:[["LINK BOOK — Mathematics for Machine Learning","https://mml-book.com/"]],
  21:[["LINK BOOK — Mathematics for Machine Learning","https://mml-book.com/"]],
  22:[["LINK BOOK — Mathematics for Machine Learning","https://mml-book.com/"]],
  24:[["LINK BOOK — Mathematics for Machine Learning","https://mml-book.com/"]]
};
const subs=i=>TOPICS[i][4].split(" · ");
const subDone=i=>subs(i).filter((_,j)=>S.sub[i+"-"+j]).length;
function explainQuestion(question){
  return question[3]||"<p>No worked solution yet. Try the hint and check the topic examples.</p>";
}
const qsOf=i=>{
  const questions=(L[i]?L[i].q:TOPICS[i][5]).concat(window.MORE_QUESTIONS&&window.MORE_QUESTIONS[i]||[]);
  return questions.map((question,index)=>[question[0],question[1],question[2]||"Use the topic rule to work one step at a time.",explainQuestion(question),question[4]||(["E","M","H"][index<10?0:index<25?1:2])]);
};
const PRACTICE_POOLS=new Map();
function practiceQuestionId(question){
  const value=`${question[0]}\u0000${question[1]}`;
  let hash=2166136261;
  for(let index=0;index<value.length;index+=1){
    hash^=value.charCodeAt(index);
    hash=Math.imul(hash,16777619);
  }
  return (hash>>>0).toString(36);
}
function practiceQuestionPool(index){
  if(PRACTICE_POOLS.has(index))return PRACTICE_POOLS.get(index);
  const questions=[
    ...(L[index]?L[index].q:TOPICS[index][5]||[]),
    ...((window.MORE_QUESTIONS&&window.MORE_QUESTIONS[index])||[]),
    ...(HARD_TOPIC_EXAMS[index]||[]),
    ...(TOPIC_EXAMS[index]||[]),
    ...(WORKED_EXAMPLES[index]||[]).map(([question,,answer])=>[question,answer])
  ];
  const generator=window.MORE_QUESTION_GENERATORS&&window.MORE_QUESTION_GENERATORS[index];
  if(generator){
    for(let variation=0;variation<25;variation+=1){
      generator(variation).forEach((question,questionIndex)=>{
        const explained=window.MATH_EXPLANATIONS
          ?window.MATH_EXPLANATIONS.create(index,questionIndex,question,"generated")
          :"";
        questions.push([...question,explained,"M"]);
      });
    }
  }
  const variationGenerator=window.PRACTICE_VARIATION_GENERATOR;
  if(variationGenerator){
    for(let variation=1;variation<=500;variation+=1){
      variationGenerator(index,variation).forEach((question,questionIndex)=>{
        const explained=window.MATH_EXPLANATIONS
          ?window.MATH_EXPLANATIONS.create(index,questionIndex,question,"generated")
          :"";
        questions.push([...question,explained,"M"]);
      });
    }
  }
  const unique=new Map();
  questions.forEach((question,questionIndex)=>{
    if(!question||question.length<2||!String(question[0]).trim()||question[1]==null)return;
    const normalized=[
      String(question[0]),String(question[1]),
      question[2]||"Use the topic rule and work one step at a time.",
      question[3]||"",question[4]||(["E","M","H"][questionIndex%3])
    ];
    const id=practiceQuestionId(normalized);
    if(!unique.has(id))unique.set(id,normalized);
  });
  PRACTICE_POOLS.set(index,unique);
  return unique;
}
function currentPracticeQuestions(index){
  const pool=practiceQuestionPool(index);
  const savedIds=ACTIVITY.practiceSets[index];
  if(Array.isArray(savedIds)&&savedIds.length){
    const savedQuestions=savedIds.map(id=>pool.get(id));
    if(savedQuestions.every(Boolean))return savedQuestions;
    delete ACTIVITY.practiceSets[index];
    saveActivity();
  }
  return qsOf(index);
}
function createNextPracticeSet(index){
  const pool=practiceQuestionPool(index);
  const previous=currentPracticeQuestions(index);
  const seenIds=new Set(Array.isArray(ACTIVITY.practiceHistory[index])?ACTIVITY.practiceHistory[index]:[]);
  previous.forEach(question=>seenIds.add(practiceQuestionId(question)));
  const round=(Number(ACTIVITY.practiceRounds[index])||0)+1;
  let candidates=[...pool.entries()].filter(([id])=>!seenIds.has(id));
  if(candidates.length===0){
    seenIds.clear();
    candidates=[...pool.entries()];
  }
  let randomState=((index+1)*2654435761+round*2246822519)>>>0;
  const random=()=>{
    randomState=(randomState+0x6D2B79F5)>>>0;
    let value=randomState;
    value=Math.imul(value^(value>>>15),value|1);
    value^=value+Math.imul(value^(value>>>7),value|61);
    return ((value^(value>>>14))>>>0)/4294967296;
  };
  for(let position=candidates.length-1;position>0;position-=1){
    const swap=Math.floor(random()*(position+1));
    [candidates[position],candidates[swap]]=[candidates[swap],candidates[position]];
  }
  const selected=candidates.slice(0,35);
  if(selected.length<35){
    const remaining=[...pool.entries()].filter(([id])=>!selected.some(([chosenId])=>chosenId===id));
    for(let position=remaining.length-1;position>0;position-=1){
      const swap=Math.floor(random()*(position+1));
      [remaining[position],remaining[swap]]=[remaining[swap],remaining[position]];
    }
    selected.push(...remaining.slice(0,35-selected.length));
  }
  if(selected.length<35){
    throw new Error(`Only ${selected.length} distinct reviewed questions are available for ${TOPICS[index][1]}.`);
  }
  ACTIVITY.practiceSets[index]=selected.map(([id])=>id);
  ACTIVITY.practiceRounds[index]=round;
  ACTIVITY.practiceHistory[index]=[...new Set([...seenIds,...selected.map(([id])=>id)])];
  saveActivity();
  return selected.map(([,question])=>question);
}
function renderPracticePanel(index,questions){
  const round=Number(ACTIVITY.practiceRounds[index])||0;
  const keyFor=question=>`topic-${index}-practice-${practiceQuestionId(question)}`;
  const currentIndex=questions.findIndex(question=>!ACTIVITY.practiceResults[keyFor(question)]?.checked);
  const completed=questions.map((question,questionIndex)=>{
    const result=ACTIVITY.practiceResults[keyFor(question)];
    if(!result?.checked)return "";
    return `<details class="practice-question-review"><summary>${result.correct?"✅":"↺"} Question ${questionIndex+1} · ${result.correct?"Correct":"Answered; review"}</summary><p>${question[0]}</p><p class="check-result ${result.correct?"is-correct":"is-wrong"}" role="status">${result.correct?`Correct! ${result.pointsEarned?`+${result.pointsEarned} points earned.`:"Points already earned for this question."}`:"Not correct yet. No points earned; review the answer and try again."}</p><p>Your answer: ${escapeTopicText(result.answer||"")}</p><p>Correct answer: ${question[1]}</p><div>${question[3]||explainQuestion(question)}</div></details>`;
  }).join("");
  const status=currentIndex<0
    ?"Set complete. Your answers are saved; review any step or load a fresh set."
    :`Question ${currentIndex+1} of ${questions.length}`;
  return `<div class="practice-set-heading" data-practice-topic="${index}"><div><span class="room-kicker">ROOM STEP 2 · PRACTICE</span><h2 tabindex="-1">Practice</h2><p class="practice-set-status" role="status">${status}</p><progress class="mm-practice-progress" max="${questions.length}" value="${currentIndex<0?questions.length:currentIndex}" aria-label="Practice set progress"></progress></div><button type="button" class="gcse-entry" data-new-practice="${index}" ${currentIndex>=0?"disabled":""}>New set</button></div>
    <p class="room-task-intro">This set has ${questions.length} questions for this topic. Check each answer for instant feedback, then open completed questions to review the answer and worked steps. Finish the set to unlock another round.</p>
    ${completed}
    ${currentIndex>=0?qHTML(questions[currentIndex],currentIndex+1,keyFor(questions[currentIndex])):`<p class="practice-set-complete" role="status">🎉 Practice set complete. Correct answers: ${questions.filter(question=>ACTIVITY.practiceResults[keyFor(question)]?.correct).length}/${questions.length} · ${ACTIVITY.points} points</p>`}
    ${currentIndex>=0&&currentIndex+1<questions.length?`<p class="practice-question-locked" aria-disabled="true">🔒 ${questions.length-currentIndex-1} more question${questions.length-currentIndex===2?"":"s"} ready after this answer.</p>`:""}`;
}

function buildTopicMiniLesson(index,notes){
  const examples=qsOf(index).slice(0,3).map(([question,answer,hint,explanation],exampleIndex)=>`
    <details class="topic-mini-lesson-example">
      <summary>Example ${exampleIndex+1}: ${question}</summary>
      <p><strong>Try this:</strong> ${hint||"Work through the question one step at a time."}</p>
      <div>${explanation||""}</div>
      <p class="example-answer"><strong>Answer:</strong> ${answer}</p>
    </details>
  `).join("");
  return `<section class="topic-mini-lesson" aria-label="${escapeTopicText(notes.title)} quick lesson">
    <h3>Learn with examples</h3>
    <p>${notes.key}</p>
    <p>Open an example to see a useful first step and its answer. Then try a similar question in Practice.</p>
    ${examples}
  </section>`;
}

function topicFlowStep(hash){
  if(hash==="practice")return 1;
  if(hash==="exam"||hash==="hard-exam")return 2;
  return 0;
}
function setTopicFlowStep(step,scroll=true){
  const shell=topicRoot().querySelector(".topic-page-shell");
  if(!shell)return;
  const safeStep=Math.max(0,Math.min(2,Number(step)||0));
  const panels=[...shell.querySelectorAll(".topic-flow-panel")];
  panels.forEach((panel,index)=>{panel.hidden=index!==safeStep;});
  const progress=shell.querySelector("[data-topic-flow-progress]");
  if(progress){
    progress.value=safeStep+1;
    progress.setAttribute("aria-valuenow",String(safeStep+1));
  }
  const label=shell.querySelector("[data-topic-flow-label]");
  if(label)label.textContent=`Room step ${safeStep+1} of 3`;
  const back=shell.querySelector("[data-topic-back]");
  if(back)back.disabled=safeStep===0;
  const next=shell.querySelector("[data-topic-next]");
  if(next)next.textContent=safeStep===0?"Start room →":safeStep===1?"Open the challenge →":"Finish room";
  const hash=["learn","practice","hard-exam"][safeStep];
  if(location.hash!==`#${hash}`)history.replaceState(null,"",`#${hash}`);
  if(scroll){
    const active=panels[safeStep];
    active?.scrollIntoView({behavior:"smooth",block:"start"});
    active?.querySelector("h2,h3")?.focus({preventScroll:true});
  }
}
function attachTopicAI(index,questions){
  if(!window.AITutor)return;
  const cards=[...document.querySelectorAll("#room-tab-practice .q")];
  const questionByKey=new Map(questions.map(question=>[`topic-${index}-practice-${practiceQuestionId(question)}`,question]));
  cards.forEach((card,questionIndex)=>{
    const question=questionByKey.get(card.dataset.questionKey);
    if(!question)return;
    window.AITutor.attach(card,{
      question:question[0],
      topic:TOPICS[index][1],
      level:LEVEL_LABEL[getTopicLevel(index)],
      compact:true,
      practiceQuestion:true,
      responseElement:card.querySelector(".answer-input"),
      isBlocked:()=>Boolean(document.querySelector("#room-tab-exam:not([hidden])"))
    });
  });
  document.querySelectorAll("#room-tab-practice .practice-question-review").forEach((card,questionIndex)=>{
    const question=questions[questionIndex];
    const result=question&&ACTIVITY.practiceResults[`topic-${index}-practice-${practiceQuestionId(question)}`];
    if(!question||!result)return;
    window.AITutor.attach(card,{question:question[0],studentAnswer:result.answer||"",topic:TOPICS[index][1],level:LEVEL_LABEL[getTopicLevel(index)],compact:true});
  });
}
function attachTopicReviewAI(index){
  if(!window.AITutor)return;
  const title=TOPICS[index][1],level=LEVEL_LABEL[getTopicLevel(index)];
  const quiz=activeTopicQuiz?.index===index&&activeTopicQuiz.submitted?activeTopicQuiz:null;
  if(quiz)document.querySelectorAll("#room-tab-quiz .topic-quiz-review").forEach((card,questionIndex)=>{
    const question=quiz.questions[questionIndex];
    if(!question)return;
    window.AITutor.attach(card,{question:question[0],studentAnswer:quiz.answers[questionIndex]||"",topic:title,level,compact:true});
  });
  const exam=getTopicExam(index);
  document.querySelectorAll("#room-tab-exam [data-topic-exam] .practice-question-review").forEach((card,questionIndex)=>{
    const question=exam[questionIndex],result=ACTIVITY.topicExamResults[index]?.[questionIndex];
    if(!question||!result)return;
    window.AITutor.attach(card,{question:question[0],studentAnswer:result.answer||"",topic:title,level,compact:true});
  });
}
function getTopicLevel(index){
  if(TOPIC_LEVELS.beginner.has(index))return "beginner";
  if(TOPIC_LEVELS.intermediate.has(index))return "intermediate";
  return "advanced";
}

function normalizeAnswerText(value){
  return String(value==null?"":value)
    .trim()
    .toLowerCase()
    .replace(/[\u2010-\u2015]/g,"-")
    .replace(/\u2212/g,"-")
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
  const raw=normalizeAnswerText(value).replace(/^(?:about|approximately|approx\.?|~)/,"");
  if(!raw||raw==="infinity")return null;
  const isPercentage=raw.endsWith("%");
  const numericText=raw.slice(0,isPercentage?-1:undefined).replace(/[€$£]/g,"");
  if(!numericText)return null;
  let number=null;
  if(numericText.includes("pi")){
    const piValue=numericText.replace(/pi/g,"");
    if(piValue===""||piValue==="1")number=Math.PI;
    else if(/^[\d.]+$/.test(piValue))number=Number(piValue)*Math.PI;
  }
  if(number===null&&numericText.includes("/")){
    const [left,right]=numericText.split("/");
    if(left && right && /^-?[\d.]+$/.test(left) && /^-?[\d.]+$/.test(right)){
      number=Number(left)/Number(right);
    }
  }
  if(number===null&&/^-?[\d.]+$/.test(numericText))number=Number(numericText);
  return number===null?null:number/(isPercentage?100:1);
}

function isAnswerCorrect(expected,submitted){
  const expectedText=normalizeAnswerText(expected);
  const submittedText=normalizeAnswerText(submitted);
  if(!submittedText)return false;
  if(expectedText===submittedText)return true;

  const expectedNumber=parseComparableNumber(expected);
  const submittedNumber=parseComparableNumber(submitted);
  if(expectedNumber!=null&&submittedNumber!=null)return Math.abs(expectedNumber-submittedNumber)<1e-8;

  const stripEquation = value => value.replace(/^\s*\(?\s*\w\s*=\s*/i, "").replace(/\s+/g, "");
  if((expectedText.includes("=")||submittedText.includes("=")) && stripEquation(expectedText)===stripEquation(submittedText))return true;

  const compact = value => value.replace(/[\[\]{}()]/g,"").replace(/\s+/g,"");
  return compact(expectedText)===compact(submittedText);
}

function loadLessons(){
  return Promise.all(Array.from({length:25},(_,i)=>i).map(i=>new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    const path="js/lessons/"+String(i+1).padStart(2,"0")+".js";
    s.src=assetURL(path);
    s.onload=resolve;
    s.onerror=()=>reject(new Error(`Could not load lesson file ${s.src}`));
    document.head.appendChild(s);
  }))).then(()=>new Promise((resolve,reject)=>{const s=document.createElement("script");s.src=assetURL("js/linear-algebra-sections.js");s.onload=()=>{window.MIT_LINEAR_SECTIONS=Object.fromEntries(Object.entries(window.MIT_LINEAR_SECTIONS||{}).map(([index,sections])=>[index,sections.map(([code,title,summary,formula,page])=>({code,title,summary,formula,page}))]));resolve();};s.onerror=()=>reject(new Error(`Could not load MIT section guide ${s.src}`));document.head.appendChild(s);}));
}

function buildStudySummary(topic, index){
  const keyIdeas = topic[3] ? topic[3].split(". ") : [];
  const firstIdea = keyIdeas[0] ? keyIdeas[0].trim() : "Master the core idea and how it connects to previous topics.";
  const mainTopics = subs(index).slice(0, 4);
  return {
    index,
    title: topic[1],
    key: firstIdea,
    bullets: mainTopics.length ? mainTopics : ["Learn the main definition", "Practise with examples", "Check your understanding with questions"]
  };
}

function buildTopicRoadmap(index){
  const previous=index>0?TOPICS[index-1][1]:"Start here";
  const next=index<TOPICS.length-1?TOPICS[index+1][1]:"Learning path complete";
  const previousStatus=index===0?"Your foundation":isTopicFinished(index-1)?"Passed":"Finish the previous topic first";
  const currentStatus=isTopicFinished(index)?"Passed":"Study, practise, then take the assessment";
  const nextStatus=index<TOPICS.length-1?"Recommended after this topic":"You reached the final topic";
  return `<ol class="topic-roadmap">
    <li><span>Before</span><strong>${previous}</strong><small>${previousStatus}</small></li>
    <li class="roadmap-current"><span>Step ${index+1} of ${TOPICS.length}</span><strong>${TOPICS[index][1]}</strong><small>${currentStatus}</small></li>
    <li><span>Next</span><strong>${next}</strong><small>${nextStatus}</small></li>
  </ol>`;
}

function buildWorkedExamples(index){
  return (WORKED_EXAMPLES[index]||[]).map(([question,steps,answer],exampleIndex)=>`
    <details class="worked-example">
      <summary>Example ${exampleIndex+1}: ${question}</summary>
      <p><strong>Steps:</strong> ${steps}</p>
      <p class="example-answer"><strong>Answer:</strong> ${answer}</p>
    </details>
  `).join("");
}

function buildTopicLinkGroups(index,topic){
  const groups=(window.TOPIC_LINKS[String(index)]?.groups||[])
    .map(group=>({
      title:group.title,
      items:group.items
    }))
    .filter(group=>group.items.length);
  const lesson=window.L[index]||{};
  if(Array.isArray(lesson.v)&&lesson.v.length){
    let videos=groups.find(group=>group.title==="Videos");
    if(!videos){
      videos={title:"Videos",items:[]};
      groups.splice(1,0,videos);
    }
    videos.items.push(...lesson.v.map(([title,url])=>[title,url,"Video search for "+title+"."]));
  }
  if(Array.isArray(lesson.k)&&lesson.k.length){
    groups.push({title:"More links",items:lesson.k.map(([title,url])=>[title,url,"Additional study resource for this topic."])});
  }
  if(topic.links&&Array.isArray(topic.links.groups)&&topic.links.groups.length){
    groups.unshift(...topic.links.groups);
  }else if(Array.isArray(topic.links)&&topic.links.length){
    groups.unshift({title:"Additional topic links",items:topic.links.map(link=>[link[0],link[1],link[2]||"Additional links for this topic."])});
  }
  const oldStudy=window.MATH_RESOURCES.study[index]||[];
  const additionalStudy=[];
  oldStudy.forEach(([title,url])=>{
    const existing=groups.flatMap(group=>group.items).find(link=>link[1]===url);
    if(existing){
      existing[0]=title;
    }else{
      additionalStudy.push([title,url,"Previously listed study resource for this topic."]);
    }
  });
  if(additionalStudy.length)groups.push({title:"Earlier topic links",items:additionalStudy});
  const oldCourses=window.MATH_RESOURCES.courses[index]||[];
  if(oldCourses.length){
    let university=groups.find(group=>group.title==="University courses");
    if(!university){
      university={title:"University courses",items:[]};
      groups.push(university);
    }
    oldCourses.forEach(([title,url])=>{
      const existing=university.items.find(link=>link[1]===url);
      if(existing){
        existing[0]=title;
      }else{
        university.items.push([title,url,"Previously listed university course for this topic."]);
      }
    });
  }
  return groups.map(group=>({
    ...group,
    items:group.items.filter(item=>!String(item[0]).includes("Wolfram|Alpha"))
  })).filter(group=>group.items.length);
}

function buildTopicPractice(index){
  return qsOf(index).slice(0,3).map((question,questionIndex)=>
    qHTML(question,questionIndex+1,`topic-${index}-extra-practice-${questionIndex}`)
  ).join("");
}

function buildCardTopicExam(index){
  const exam=getTopicExam(index);
  const results=ACTIVITY.topicExamResults[index]||{};
  const currentIndex=exam.findIndex((_,questionIndex)=>!results[questionIndex]?.checked);
  const score=Object.values(results).filter(result=>result.correct).length;
  const reviews=exam.map(([question,answer],questionIndex)=>{
    const result=results[questionIndex];
    return result?.checked?`<details class="practice-question-review"><summary>${result.correct?"✅":"↺"} Question ${questionIndex+1} · ${result.correct?"Correct":"Answered; review"}</summary><p>${question}</p><p class="check-result ${result.correct?"is-correct":"is-wrong"}" role="status">${result.correct?`Correct! ${result.pointsEarned?`+${result.pointsEarned} points earned.`:"Points already earned for this question."}`:"Not correct yet. No points earned; review the answer and try again."}</p><p>Your answer: ${escapeTopicText(result.answer||"")}</p><p>Correct answer: ${answer}</p></details>`:"";
  }).join("");
  const current=currentIndex<0?"":`<label class="exam-question mm-question"><strong class="mm-question-number">Q${currentIndex+1} of ${exam.length}</strong><span class="mm-question-prompt">${exam[currentIndex][0]}</span><span>Your answer<input type="text" class="exam-answer" data-exam-index="${currentIndex}" autocomplete="off" aria-label="Answer to exam question ${currentIndex+1}" value="${escapeTopicText(results[currentIndex]?.answer||"")}"></span><button type="button" class="gcse-entry mm-button mm-button-primary submit-exam" data-exam-submit="${currentIndex}">Submit</button></label>`;
  const result=currentIndex<0?`<p class="exam-result ${score===exam.length?"is-correct":"is-wrong"}" role="status">${score===exam.length?`✅ Challenge passed: ${score}/${exam.length}.`:`${score}/${exam.length} correct. Review and retry to pass.`} ${TOPIC_LOCKS?"Pass the topic quiz or linked room exam to unlock the next topic.":"Your progress is saved."}</p>${score<exam.length?`<button type="button" class="gcse-entry" data-exam-retake="${index}">Retry hard exam</button>`:""}`:"";
  return `<div class="topic-content" data-topic-exam="${index}">
    <p class="exam-instructions">Answer each question to unlock the next. Correct answers earn points. ${exam.length} questions total.</p>
    ${reviews}${current}${currentIndex>=0?`<p class="practice-question-locked" aria-disabled="true">🔒 ${exam.length-currentIndex-1} more question${exam.length-currentIndex===2?"":"s"} locked.</p>`:""}${result}
  </div>`;
}

function startTopicQuiz(index,retake=false){
  const saved=ACTIVITY.topicQuizzes[index];
  if(!retake&&saved&&Array.isArray(saved.questions)&&saved.questions.length===window.TOPIC_LOCKS_API.QUIZ_SIZE&&!saved.submitted){
    activeTopicQuiz=saved;
    return;
  }
  const pool=qsOf(index).slice();
  for(let i=pool.length-1;i>0;i-=1){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  activeTopicQuiz={
    index:index,
    questions:pool.slice(0,window.TOPIC_LOCKS_API.QUIZ_SIZE),
    answers:[],
    correct:[],
    current:0,
    submitted:false,
    score:0,
    passed:false
  };
  ACTIVITY.topicQuizzes[index]=activeTopicQuiz;
  saveActivity();
}

function renderTopicQuiz(index){
  if(!activeTopicQuiz||activeTopicQuiz.index!==index)startTopicQuiz(index);
  const quiz=activeTopicQuiz;
  if(quiz.questions.length!==window.TOPIC_LOCKS_API.QUIZ_SIZE){
    return `<p class="mut" role="alert">This topic needs at least ${window.TOPIC_LOCKS_API.QUIZ_SIZE} practice questions before its quiz is available.</p>`;
  }
  const review=quiz.submitted?quiz.questions.map((question,questionIndex)=>{
    const correct=quiz.correct[questionIndex]===true;
    return `<li class="topic-quiz-review ${correct?"correct":"incorrect"}"><p><strong>Q${questionIndex+1}.</strong> ${question[0]}</p>${wolframQuestionLink(question[0])}<p>Your answer: ${escapeTopicText(quiz.answers[questionIndex]||"No answer")}</p><p>Correct answer: ${question[1]}</p><p>${question[3]||explainQuestion(question)}</p></li>`;
  }).join(""):"";
  const result=quiz.submitted?`<div class="topic-quiz-result" role="status"><strong>${quiz.score}/${quiz.questions.length} (${Math.round(quiz.score/quiz.questions.length*100)}%)</strong> · ${quiz.passed||isTopicPassed(index)?"Topic passed. The next topic is unlocked.":S.done[index]?"Not yet. You need at least 16 correct answers.":"Not yet. Tick “I finished this topic” and score at least 16/20."}</div>`:"";
  const question=quiz.questions[quiz.current];
  const currentQuestion=question?`<label class="topic-quiz-question mm-question"><strong class="mm-question-number">Q${quiz.current+1} of ${quiz.questions.length}</strong><span class="mm-question-prompt">${question[0]}</span><span>Your answer<input type="text" class="topic-quiz-answer" data-quiz-index="${quiz.current}" autocomplete="off" aria-label="Answer to quiz question ${quiz.current+1}" value="${escapeTopicText(quiz.answers[quiz.current]||"")}"></span><button type="button" class="gcse-entry mm-button mm-button-primary topic-quiz-submit" data-topic-quiz-submit="${index}">Submit</button></label><p class="topic-quiz-progress" role="status">${quiz.current} of ${quiz.questions.length} answers submitted · ${quiz.score} correct</p>`:"";
  return `<div class="topic-quiz" data-topic-quiz="${index}">
    <p class="exam-instructions">20 random questions, one step at a time. Submit an answer to unlock the next. You need at least 16 correct answers and must tick “I finished this topic”.</p>
    ${quiz.lastFeedback?`<p class="check-result ${quiz.lastFeedback.correct?"is-correct":"is-wrong"}" role="status">${quiz.lastFeedback.correct?`✅ Correct! ${quiz.lastFeedback.pointsEarned?`+${quiz.lastFeedback.pointsEarned} points earned.`:"Points already earned for this question."}`:"❌ Not correct yet. No points earned; review the answer and keep practising."}</p>`:""}
    ${!quiz.submitted?currentQuestion:""}
    ${result}
    ${quiz.submitted?`<ol class="topic-quiz-review-list">${review}</ol><button type="button" class="gcse-entry topic-quiz-retake" data-topic-quiz-retake="${index}">Retake quiz with new questions</button>`:""}
  </div>`;
}

function finishTopicQuiz(index,container){
  if(!activeTopicQuiz||activeTopicQuiz.index!==index||activeTopicQuiz.submitted)return;
  const questionIndex=activeTopicQuiz.current;
  const input=container.querySelector(`[data-quiz-index="${questionIndex}"]`);
  const answer=input?input.value.trim():"";
  if(!answer){input?.focus();return;}
  const question=activeTopicQuiz.questions[questionIndex];
  const correct=isAnswerCorrect(question[1],answer);
  activeTopicQuiz.answers[questionIndex]=answer;
  activeTopicQuiz.correct[questionIndex]=correct;
  activeTopicQuiz.score+=Number(correct);
  recordQuestionAnswer(`topic-${index}-quiz-${questionIndex}`);
  const rewardKey=`topic-${index}-quiz-${practiceQuestionId(question)}`;
  let pointsEarned=0;
  if(correct&&!ACTIVITY.answerRewards[rewardKey]){
    ACTIVITY.answerRewards[rewardKey]=true;
    ACTIVITY.points+=10;
    pointsEarned=10;
    emitMM2Points(pointsEarned,"topic-quiz");
    if(!ACTIVITY.badges.includes("First Correct Answer"))ACTIVITY.badges.push("First Correct Answer");
  }
  if(correct)window.MathMasterFeedback?.correct();
  window.MathMasterFeedback?.answered(correct,pointsEarned);
  activeTopicQuiz.lastFeedback={correct,pointsEarned};
  activeTopicQuiz.current+=1;
  if(activeTopicQuiz.current>=activeTopicQuiz.questions.length){
    activeTopicQuiz.submitted=true;
    activeTopicQuiz.passed=window.TOPIC_LOCKS_API.recordQuizResult(
      index,
      activeTopicQuiz.score,
      activeTopicQuiz.questions.length,
      Boolean(S.done[index]),
      S
    );
    announceMM2Completion(`topic-quiz:${index}:${Date.now()}`,{type:"topic-quiz",topic:TOPICS[index][1],message:"You finished the topic quiz."});
    save();
    if(!isTopicPage)render();
    else{
      const status=$("#room-completion-status");
      if(status){
        status.textContent=isTopicFinished(index)?"✓ Passed":"In progress";
        status.classList.toggle("room-completed",isTopicFinished(index));
      }
    }
    updateTodayStats();
    renderTodayQuestions();
  }
  saveActivity();
  updateTopicPoints();
  container.outerHTML=renderTopicQuiz(index);
  attachTopicReviewAI(index);
}

function updateTopicPoints(){
  const points=topicRoot()?.querySelector("[data-topic-points]");
  if(points)points.textContent=`⭐ ${ACTIVITY.points} points earned`;
  const navPoints=document.querySelector("[data-nav-points]");
  if(navPoints){navPoints.setAttribute("aria-label",`${ACTIVITY.points} points`);navPoints.querySelector("span").textContent=ACTIVITY.points;}
}

function readingRewardId(file){
  try{const url=new URL(file,location.origin);return url.origin===location.origin?`${url.pathname}${url.search}`:url.href;}catch(_){return String(file||"");}
}
window.MathMasterReading=Object.freeze({
  isRead(file){return Boolean(ACTIVITY.readingRewards[readingRewardId(file)]);},
  finish(file){
    const id=readingRewardId(file);
    if(!id||ACTIVITY.readingRewards[id])return false;
    ACTIVITY.readingRewards[id]=true;
    ACTIVITY.points+=10;
    saveActivity();
    updateTopicPoints();
    emitMM2Points(10,"reading-complete");
    document.querySelectorAll("[data-reading-id]").forEach(link=>{
      if(link.dataset.readingId===id&&link.classList.contains("resource-read"))link.textContent="Read ✓";
    });
    return true;
  }
});

function getNextTopicIndex(){
  for(let i=0;i<TOPICS.length;i++){
    if(isFastMlPath&&TOPICS[i][2]!=="core")continue;
    if(!isTopicFinished(i)&&isTopicOpen(i))return i;
  }
  return -1;
}

function getRecommendedTopicIndex(){
  if(!TOPIC_LOCKS){
    let lastFinished=-1;
    TOPICS.forEach((_,index)=>{if(isTopicFinished(index))lastFinished=index});
    return lastFinished<TOPICS.length-1?lastFinished+1:-1;
  }
  for(let index=0;index<TOPICS.length;index++){
    if(isFastMlPath&&TOPICS[index][2]!=="core")continue;
    if(isTopicOpen(index)&&!isTopicFinished(index))return index;
  }
  return -1;
}

function updateTopicLockControls(){
  const settings=$("#topic-lock-settings");
  const toggle=$("#topic-practice-mode");
  const banner=$("#topic-practice-banner");
  const status=$("#topic-lock-status");
  const practiceMode=getTopicRoomProgress().practiceMode;
  if(settings)settings.hidden=!TOPIC_LOCKS;
  if(toggle)toggle.checked=practiceMode;
  if(banner){
    banner.hidden=!TOPIC_LOCKS||!practiceMode;
    banner.textContent="Practice mode: locks are off";
  }
  if(status)status.textContent=isFastMlPath
    ?"ML maths path: core topics unlock in order. Pass each assessment to open the next."
    :practiceMode
      ?"All topics are open for practice. Pass each topic quiz to record completion."
      :"Pass the current topic assessment to unlock the next topic.";
}

function updateTodayStats(){
  let streak=0,date=new Date();
  while(S.days.includes(date.toLocaleDateString("en-CA"))){streak++;date.setDate(date.getDate()-1)}
  renderSharedHeader(streak);
  const topicCount=TOPICS.reduce((total,_,index)=>total+Number(isTopicFinished(index)),0);
  if($("#today-streak"))$("#today-streak").textContent=streak;
  if($("#today-topics-done"))$("#today-topics-done").textContent=topicCount;
  if($("#today-questions-count"))$("#today-questions-count").textContent=Array.isArray(ACTIVITY.questionLog[todayKey()])?ACTIVITY.questionLog[todayKey()].length:0;
  const nextIndex=getNextTopicIndex();
  const suggestedIndex=nextIndex<0?0:nextIndex;
  if($("#next-topic-title"))$("#next-topic-title").textContent=nextIndex<0?"Learning path complete":TOPICS[suggestedIndex][1];
  if($("#next-topic-copy"))$("#next-topic-copy").textContent=nextIndex<0?"You have completed this learning path. Choose a topic to review.":"Pass this topic assessment to unlock the next topic.";
  if($("#next-level-tag"))$("#next-level-tag").textContent=nextIndex<0?"Complete":LEVEL_LABEL[getTopicLevel(suggestedIndex)];
  const coreDone=TOPICS.reduce((total,topic,index)=>total+Number(topic[2]==="core"&&isTopicFinished(index)),0);
  if($("#core-progress-value"))$("#core-progress-value").textContent=String(coreDone)+"/12";
  const startButton=$("#start-next-topic");
  if(startButton){
    startButton.textContent=nextIndex<0?"Learning path complete":"Start your next lesson";
    startButton.disabled=nextIndex<0;
  }
  updateTopicLockControls();
}

function emitMM2Points(pointsEarned,source){
  if(pointsEarned>0)window.dispatchEvent(new CustomEvent("mm2:points",{detail:{pointsEarned,source}}));
}
function announceMM2Completion(id,detail={}){
  let completed=[];
  try{completed=JSON.parse(localStorage.getItem("mm2-completions")||"[]");}catch(error){completed=[];}
  if(completed.includes(id))return;
  completed.push(id);
  try{localStorage.setItem("mm2-completions",JSON.stringify(completed.slice(-100)));}catch(error){}
  window.dispatchEvent(new CustomEvent("mm2:complete",{detail:{id,points:ACTIVITY.points,badge:ACTIVITY.badges.at(-1)||"First Correct Answer",...detail}}));
}

function renderSharedHeader(streakValue){
  window.MathMasterSharedHeader?.render(streakValue);
}

function render(){
  const searchInput=$("#search");
  if(searchInput && searchInput.value!==query){searchInput.value=query;}
  if(!$("#grid")){updateTodayStats();return;}
  const recommendedIndex=getRecommendedTopicIndex();
  $("#grid").innerHTML=TOPICS.map((t,i)=>({t,i}))
    .filter(({t,i})=>(filter==="all"||filter==="completed"||t[2]===filter)&&(filter!=="completed"||isTopicFinished(i))&&(level==="all"||getTopicLevel(i)===level)&&(t[1]+" "+t[4]).toLowerCase().includes(query))
    .map(({t,i})=>{
      if(TOPIC_LOCKS&&!isTopicOpen(i)){
        return window.TOPIC_LOCKS_API.lockedCard(i,t,TOPICS[i-1][1]);
      }
      const done=isTopicFinished(i);
      const isFullLesson=Boolean(L[i]);
      const progress=subs(i).length?Math.round(subDone(i)/subs(i).length*100):0;
      const topicType=t[2]==="core"?"⭐ ML core":TIER[t[2]];
      const lessonLabel=isFullLesson?"Full lesson":lessonsLoaded?"Summary":i<4?"Loading lesson…":"Summary";
      return `<article class="card compact-card ${done?"done":""}">
      <span class="card-topline">
        <span class="em">${t[0]}</span>
        <span class="topic-badges"><small class="level-badge">${LEVEL_LABEL[getTopicLevel(i)]}</small><small class="key-badge">${topicType}</small></span>
      </span>
      <h3>${i+1}. ${t[1]}</h3>
      ${done?'<span class="completed-badge" aria-label="Topic passed">✓ Passed</span>':""}
      ${i===recommendedIndex?'<span class="recommended-badge">Recommended next</span>':""}
      <div class="card-progress-copy"><span>Subtopics</span><span>${subDone(i)}/${subs(i).length}</span></div>
      <div class="card-progress" role="progressbar" aria-label="${t[1]} subtopic progress" aria-valuemin="0" aria-valuemax="${subs(i).length}" aria-valuenow="${subDone(i)}"><span style="width:${progress}%"></span></div>
      <div class="card-meta"><small class="lesson-label">${lessonLabel}</small><small>${qsOf(i).length} practice questions</small></div>
      <a class="topic-open gcse-entry" data-i="${i}" href="/topic/${topicSlug(t[1])}">Open topic</a>
      </article>`;
    }).join("")||"<p class='mut'>No topics found.</p>";
  updateTodayStats();
}

function qHTML(q,n,key=""){
  const saved=key.startsWith("topic-")&&key.includes("-practice-")?ACTIVITY.practiceResults[key]:null;
  const savedAnswer=saved&&typeof saved.answer==="string"?escapeTopicText(saved.answer):"";
  const checked=Boolean(saved&&saved.checked);
  const correct=checked&&Boolean(saved.correct);
  const result=correct?`✓ Correct answer ${saved?.pointsEarned?`· +${saved.pointsEarned} points`:"· Points already earned"}`:"✗ Not yet. Try again. You can use a hint or reveal the worked steps.";
  return `<article class="q mm-question" data-question-key="${key}"><header class="mm-question-header"><b class="mm-question-number">Q${n}</b><div class="mm-question-prompt">${q[0]}</div></header><label class="answer-label"><span>Your answer</span><textarea class="answer-input" rows="2" placeholder="Write your answer here..." aria-label="Your answer to question ${n}">${savedAnswer}</textarea></label><div class="btns mm-question-actions">`+
    `<button class="rev alt mm-button mm-button-secondary" type="button">Hint</button><button class="check-answer mm-button mm-button-primary" type="button">Submit</button><button class="explain-answer mm-button mm-button-ghost" type="button">${correct?"Hide answer":"Show answer"}</button><div class="a hint mm-question-hint" hidden>💡 ${q[2]||"Break the problem into smaller steps and recall the rule or formula from the lesson."}</div>`+
    `</div><div class="check-result mm-question-feedback${correct?" is-correct":checked?" is-wrong":""}" role="status" aria-live="polite"${checked?"":" hidden"}>${checked?result:""}</div><section class="a answer mm-question-final"${correct?"":" hidden"}><strong>Final answer:</strong> <span class="answer-value">${q[1]}</span></section><section class="a explanation mm-question-steps"${correct?"":" hidden"}><p class="mm-revealed-note"${correct?" hidden":""}>No points for a revealed answer.</p>${q[3]||explainQuestion(q)}${wolframQuestionLink(q[0])}</section></article>`;
}

function quickQuestionSkill(question){
  const prompt=String(question[0]||"").toLowerCase();
  const skills=[
    ["fractions",/fraction|\b\d+\s*\/\s*\d+\b/],
    ["percentages",/percent|%/],
    ["ratio",/ratio|share|proportion/],
    ["probability",/probability|\bp\(|chance|coin|die|dice|counter/],
    ["statistics",/mean|median|mode|variance|deviation|correlation|quartile|frequency/],
    ["graphs",/gradient|slope|graph|coordinate|midpoint|intercept|line through/],
    ["geometry",/triangle|angle|area|perimeter|circle|rectangle|square|volume|hypotenuse/],
    ["calculus",/differentiat|integrat|derivative|\bd\/dx|∫|gradient descent/],
    ["algebra",/solve|equation|factoris|expand|simplif|\bx\s*=|\bx\s*\+|\bx\s*−/],
    ["powers",/power|index|indices|root|log|\^|squared|cubed/],
    ["vectors",/vector|dot product|eigen|matrix|determinant|transpose/],
    ["rounding",/round|nearest hundred|nearest ten/],
    ["prime factors",/prime factor/],
    ["common factors",/highest common factor|greatest common factor|\bhcf\b|\bgcf\b/],
    ["multiples",/multiple|lowest common multiple|\blcm\b/],
    ["parity",/even|odd/],
    ["arithmetic",/calculate|work out|\d\s*[+×÷−-]\s*\d/],
    ["number",/factor|prime|hcf|gcf|lcm/]
  ];
  return (skills.find(([,pattern])=>pattern.test(prompt))||["skill-"+prompt.slice(0,32)])[0];
}

function studentQuickLevel(){
  if(level!=="all")return level;
  const next=getNextTopicIndex();
  const last=Number.isInteger(ACTIVITY.lastTopic)?ACTIVITY.lastTopic:-1;
  return getTopicLevel(next>=0?next:last>=0?last:0);
}

function renderTodayQuestions(){
  const target=$("#today-questions");
  if(!lessonsLoaded){
    target.innerHTML="<p class=\"mut\">Preparing three quick questions for your level…</p>";
    return;
  }
  const today=todayKey();
  if(!ACTIVITY.quickQuestionHistory||typeof ACTIVITY.quickQuestionHistory!=="object")ACTIVITY.quickQuestionHistory={date:today,seen:[],selected:[]};
  const history=ACTIVITY.quickQuestionHistory;
  if(!Array.isArray(history.seen))history.seen=[];
  if(!Array.isArray(history.selected))history.selected=[];
  if(history.date!==today){history.date=today;history.selected=[];}
  const allQuestions=[];
  const targetLevel=studentQuickLevel();
  TOPICS.forEach((_,topicIndex)=>{
    if(isFastMlPath&&TOPICS[topicIndex][2]!=="core")return;
    if(TOPIC_LOCKS&&!isTopicOpen(topicIndex))return;
    qsOf(topicIndex).forEach((question,questionIndex)=>{
      const questionLevel=question[4]==="E"?"beginner":question[4]==="H"?"advanced":"intermediate";
      if(questionLevel!==targetLevel)return;
      const key=`topic-${topicIndex}-question-${questionIndex}`;
      allQuestions.push({question,topicIndex,questionIndex,key,skill:quickQuestionSkill(question)});
    });
  });
  let chosen=[];
  const saved=(history.selected||[]).map(key=>allQuestions.find(item=>item.key===key)).filter(Boolean);
  if(saved.length===3&&new Set(saved.map(item=>item.skill)).size===3){
    chosen=saved;
  }else{
      const pickFrom=allQuestions.filter(item=>!history.seen.includes(item.key));
    while(chosen.length<3&&pickFrom.length){
      const skills=new Set(chosen.map(item=>item.skill));
      const distinct=pickFrom.filter(item=>!skills.has(item.skill));
      const candidates=distinct;
      if(!candidates.length)break;
      const item=candidates[Math.floor(Math.random()*candidates.length)];
      chosen.push(item);
      pickFrom.splice(pickFrom.indexOf(item),1);
    }
    history.selected=chosen.map(item=>item.key);
    history.seen=[...new Set([...history.seen,...history.selected])];
    saveActivity();
  }
  target.innerHTML=chosen.map(({question,topicIndex,questionIndex,skill},index)=>
    `<article class="today-question"><small>${TOPICS[topicIndex][0]} ${TOPICS[topicIndex][1]} · ${skill}</small>${qHTML(question,index+1,`topic-${topicIndex}-question-${questionIndex}`)}</article>`
  ).join("")||"<p class=\"mut\">You have practised every quick question at this level. Open a topic for more practice.</p>";
}

function openLinkedTopic(){
  if(!requestedTopic)return;
  const topicIndex=requestedTopicIndex>=0?requestedTopicIndex:TOPICS.findIndex(topic=>topic[1].trim().toLowerCase()===requestedTopic.toLowerCase());
  if(topicIndex<0)return;
  if(!isTopicPage){const courseLaunch=isCourseLaunch?`?from=courses&topic=${encodeURIComponent(TOPICS[topicIndex][1])}`:"";window.location.assign(`/topic/${topicSlug(TOPICS[topicIndex][1])}${courseLaunch}${location.hash||""}`);return;}
  query="";
  render();
  openTopic(topicIndex);
}

function openTopic(i){
  if(!Number.isInteger(i)||i<0||i>=TOPICS.length)return;
  if(TOPIC_LOCKS&&!isTopicOpen(i)){
    if(!isTopicPage){
      const status=$("#topic-lock-status");
      if(status)status.textContent=`${TOPICS[i][1]} is locked. Complete the previous required assessment first.`;
      $("#grid")?.scrollIntoView({behavior:"smooth",block:"start"});
      return;
    }
    const coursePosition=COURSE_PATH.indexOf(i);
    const prerequisiteIndex=isCourseLaunch&&coursePosition>0?COURSE_PATH[coursePosition-1]:i-1;
    const returnLink=isCourseLaunch?"/courses.html":isFastMlPath?"/rooms.html?path=ml#rooms-list":"/index.html#topics";
    const returnLabel=isCourseLaunch?"Back to courses":"Back to topics";
    topicRoot().innerHTML=`<div class="topic-locked-notice"><h1 tabindex="-1">🔒 ${TOPICS[i][1]} is locked</h1><p>Finish and pass ${TOPICS[prerequisiteIndex]?.[1]||"the previous topic"} first.</p><a class="gcse-entry" href="${returnLink}">${returnLabel}</a></div>`;
    topicRoot().querySelector("h1").focus();
    return;
  }
  if(!isTopicPage){window.location.assign(`/topic/${topicSlug(TOPICS[i][1])}${isFastMlPath?"?path=ml-fast":""}`);return;}
  ACTIVITY.lastTopic=i;
  saveActivity();
  updateTodayStats();
  activeTopicQuiz=null;
  const t=TOPICS[i],l=L[i]||{},qs=qsOf(i);
  const notes=buildStudySummary(t,i);
  const rawSections=Array.isArray(l.s)?l.s:[];
  const mlSection=rawSections.find(section=>/machine learning/i.test(section[0]));
  const learnSections=rawSections.filter(section=>!(/machine learning/i.test(section[0])));
  if(!learnSections.length)learnSections.push([notes.title,buildTopicMiniLesson(i,notes)]);
  const visualPractice=window.VisualMap?window.VisualMap.render({title:t[1],area:t[4],description:t[3],topics:t[4]}):"";
  const baseExamples=WORKED_EXAMPLES[i]||[];
  const topicExamples=[...baseExamples.map(([question,steps,answer],n)=>`<details class="worked-example"><summary>Example ${n+1}: ${question}</summary><div class="sol"><p>${steps}</p><p class="example-answer"><strong>Answer:</strong> ${answer}</p></div></details>`),...(l.e||[]).map((e,n)=>`<details class="worked-example"><summary>Example ${baseExamples.length+n+1}: ${e[0]}</summary><div class="sol">${e[1]}</div></details>`)];
  const learnGoalCount=subs(i).length;
  const taskMarkup=learnSections.map(([title,body],taskIndex)=>{
    const goalStart=Math.floor(taskIndex*learnGoalCount/learnSections.length);
    const goalEnd=Math.floor((taskIndex+1)*learnGoalCount/learnSections.length);
    const goalIndexes=goalEnd>goalStart?Array.from({length:goalEnd-goalStart},(_,offset)=>goalStart+offset):learnGoalCount?[Math.min(learnGoalCount-1,Math.floor(taskIndex*learnGoalCount/learnSections.length))]:[];
    const isDone=goalIndexes.length>0&&goalIndexes.every(goalIndex=>Boolean(S.sub[i+"-"+goalIndex]));
    const pdf=String(body).match(/href=["']([^"']+\.pdf(?:#[^"']*)?)["']/i)?.[1];
    return `<article class="learn-task-card${isDone?" is-done":""}" id="learn-task-${i}-${taskIndex}" data-learn-task-card="${taskIndex}" data-goal-indexes="${goalIndexes.join(",")}"><header class="mm-task-header"><span class="room-kicker">TASK ${taskIndex+1}</span><h3>${escapeTopicText(title)}</h3></header><div class="learn-task-body">${body}</div>${topicExamples[taskIndex]?`<div class="learn-task-example">${topicExamples[taskIndex]}</div>`:""}${pdf?`<a class="mm-button mm-button-secondary learn-task-notes" href="${escapeTopicText(pdf)}">Read in the notes</a>`:""}</article>`;
  }).join("");
  const navMarkup=learnSections.map(([title],taskIndex)=>{
    const goalStart=Math.floor(taskIndex*learnGoalCount/learnSections.length);
    const goalEnd=Math.floor((taskIndex+1)*learnGoalCount/learnSections.length);
    const goalIndexes=goalEnd>goalStart?Array.from({length:goalEnd-goalStart},(_,offset)=>goalStart+offset):learnGoalCount?[Math.min(learnGoalCount-1,Math.floor(taskIndex*learnGoalCount/learnSections.length))]:[];
    const isDone=goalIndexes.length>0&&goalIndexes.every(goalIndex=>Boolean(S.sub[i+"-"+goalIndex]));
    return `<a class="learn-task-link${isDone?" is-done":""}" href="#learn-task-${i}-${taskIndex}" data-learn-task-link="${taskIndex}"><span class="learn-task-number">${isDone?"✓":taskIndex+1}</span><span>${escapeTopicText(title)}</span></a>`;
  }).join("");
  const laSections=i===2?(window.MIT_LINEAR_SECTIONS?.[21]||[]):[];
  const laMarkup=laSections.length?`<section class="mit-section-guide" aria-labelledby="mit-section-guide-title"><h3 id="mit-section-guide-title">MIT 18.06 ZoomNotes sections</h3><p>Short guides linked to the original lecture notes. Use the existing MIT question practice list to try related problems.</p><div class="mit-section-grid">${laSections.map(section=>`<article class="mit-section-card"><h4>${escapeTopicText(section.code)} · ${escapeTopicText(section.title)}</h4><p>${escapeTopicText(section.summary)}</p><p class="mit-section-formula"><strong>Key relation:</strong> ${escapeTopicText(section.formula)}</p><a class="mm-button mm-button-secondary" href="/assets/mit-linear-algebra/4d876a9159e32543eb0d73b4d4382f4c_MIT18_06S10ZoomNotes.pdf#page=${section.page}">Open notes · page ${section.page}</a> <a href="#practice">Related MIT questions</a></article>`).join("")}</div></section>`:"";
  const lessonContent=`<div class="learn-task-layout"><aside class="learn-task-sidebar" aria-label="Learning tasks"><div class="learn-task-progress"><strong>Tasks</strong><span data-learn-task-count>${subDone(i)}/${learnGoalCount} goals</span><progress data-learn-task-progress max="${learnGoalCount}" value="${subDone(i)}" aria-label="Learning goal progress"></progress></div><nav>${navMarkup}</nav></aside><div class="learn-task-list">${taskMarkup}${mlSection?`<aside class="mm-callout learn-ml-callout"><strong>Where this is used in machine learning</strong>${mlSection[1]}</aside>`:""}${laMarkup}</div></div>`;
  const examples=topicExamples.slice(learnSections.length).join("");
  const hasLinkedRoom=Boolean(TOPIC_ROOM_LINKS[i]&&TOPIC_ROOM_LINKS[i].length);
  const practiceQs=currentPracticeQuestions(i);
  const resourceGroups=buildTopicLinkGroups(i,t);
  const resourceCount=new Set(resourceGroups.flatMap(group=>group.items.map(item=>item[1]))).size;
  const calculusExamGroups=new Map();
  (i===7?(window.CALCULUS_PDF_RESOURCES||[]).filter(item=>item.category==="Exams"):[]).forEach(item=>{
    const match=item.title.match(/^(Exam \d+|Final exam) — (question paper|solutions)$/i);
    if(!match)return;
    const group=calculusExamGroups.get(match[1])||{title:match[1],question:null,solutions:null};
    group[match[2]==="question paper"?"question":"solutions"]=item;
    calculusExamGroups.set(match[1],group);
  });
  const calculusExamMarkup=calculusExamGroups.size?`<section class="topic-exam-papers" aria-labelledby="topic-exam-papers-title"><div class="topic-exam-papers-heading"><span class="room-kicker">MIT 18.01SC · FULL PAPERS</span><h3 id="topic-exam-papers-title">Calculus exam papers</h3><p>Open a full question paper or its worked solutions. The PDF reader lets you zoom and move through pages.</p></div><div class="topic-exam-paper-list">${[...calculusExamGroups.values()].map(group=>`<article class="topic-exam-paper"><strong>${escapeTopicText(group.title)}</strong><div>${group.question?`<a class="mm-button mm-button-primary" href="/assets/mit-calculus/${encodeURIComponent(group.question.file)}">Open question paper ↗</a>`:""}${group.solutions?`<a class="mm-button mm-button-secondary" href="/assets/mit-calculus/${encodeURIComponent(group.solutions.file)}">Open solutions ↗</a>`:""}</div></article>`).join("")}</div></section>`:"";
  const checked=subDone(i);
  const linkedRoomLinks=(TOPIC_ROOM_LINKS[i]||[]).map(roomId=>
    `<a href="rooms.html#room=${encodeURIComponent(roomId)}">${TOPIC_ROOM_TITLES[roomId]||"Open linked room"}</a>`
  ).join(" · ");
  const root=topicRoot();
  root.innerHTML=`<div class="room-shell ${isTopicPage?"topic-page-shell":""}" data-topic-index="${i}">
    <header class="room-header">
      <nav class="topic-breadcrumb" aria-label="Breadcrumb"><a href="${isFastMlPath?"/rooms.html?path=ml#rooms-list":"/index.html#topics"}">${isFastMlPath?"ML path":"Math Master"}</a> / Topic ${String(i+1).padStart(2,"0")} / ${t[1]}</nav>
      <span class="room-kicker">MATH MASTER <span aria-hidden="true">/</span> TOPIC ${String(i+1).padStart(2,"0")}</span>
      <h1 tabindex="-1">${t[0]} ${i+1}. ${t[1]}</h1>
      <p>${t[3]}</p>
      <div class="room-meta"><span>${LEVEL_LABEL[getTopicLevel(i)]} level</span><span>${TIER[t[2]]}</span><span>Guided room</span><span data-topic-points>⭐ ${ACTIVITY.points} points earned</span><span>🏅 ${ACTIVITY.badges.length} badges</span><span id="room-completion-status" class="${isTopicFinished(i)?"room-completed":""}" role="status">${isTopicFinished(i)?"✓ Passed":"In progress"}</span></div>
      <div class="room-progress"><div class="room-progress-copy"><span>Topic progress</span><strong>${checked}/${subs(i).length} learning goals</strong></div><div class="room-progress-track"><span style="width:${subs(i).length?checked/subs(i).length*100:0}%"></span></div></div>
      ${isTopicFinished(i)?`<div class="topic-completion-reward" role="status"><span aria-hidden="true">🏆</span><div><strong>Topic complete</strong><p>You passed this topic and unlocked your next step.</p></div><span class="room-pill">Mastery earned</span></div>`:""}
    </header>
    <div class="room-content">
      <section class="room-panel topic-flow-panel" id="room-tab-learn">
        <div class="topic-room-step"><span class="room-kicker">ROOM STEP 1 · LEARN THE IDEA</span><h2 tabindex="-1">Start with the idea</h2></div>
        <div class="room-briefing"><p>${notes.key}</p><h3>By the end of this room</h3><ul>${notes.bullets.map(item=>`<li>${item}</li>`).join("")}</ul><p class="room-goal">Learn the idea, practise it, then try the challenge. Your place is saved as you go.</p></div>
        <div class="topic-ai-guide" data-topic-ai-guide></div>
        ${lessonContent}
        ${examples?`<details class="topic-flow-extra"><summary>See a worked example</summary><div>${examples}</div></details>`:""}
        <details class="topic-flow-extra"><summary>Learning goals</summary>
        <ol class="topic-goals">${subs(i).map((x,j)=>`<li id="goal-${i}-${j}"><label class="ck"><input type="checkbox" data-s="${i}-${j}" ${S.sub[i+"-"+j]?"checked":""}> ${x}</label></li>`).join("")}</ol></details>
        <details class="topic-flow-extra" id="room-tab-links"><summary>Study resources <span class="resource-count">${resourceCount}</span></summary><p class="room-task-intro">Optional notes, videos and original papers for this topic.</p>${i===2?`<aside class="mm-callout" aria-label="How to use the MIT Algebra PDFs"><strong>MIT problem sets and exams</strong><p>Try each assignment first (use the <a href="https://ocw.mit.edu/courses/18-06-linear-algebra-spring-2010/pages/assignments/" target="_blank" rel="noopener noreferrer">MIT assignment list</a>), then open the worked solutions. For exams, open Questions first, then Solutions.</p></aside>`:""}<div class="resource-groups">${window.renderResourceGroups(resourceGroups)}</div></details>
        ${TOPIC_LOCKS&&hasLinkedRoom?`<p class="topic-assessment-note">Pass the Hard Exam in each linked room to complete this topic:<br>${linkedRoomLinks}</p>`:`<p><label class="finish-topic"><input type="checkbox" id="dn" ${(TOPIC_LOCKS?S.done[i]:isTopicFinished(i))?"checked":""}> <b>I finished this topic</b></label></p>`}
      </section>
      <section class="room-panel topic-flow-panel" id="room-tab-practice" hidden>
        <div class="topic-room-step"><span class="room-kicker">ROOM STEP 2 · PRACTISE</span></div>
        ${renderPracticePanel(i,practiceQs)}
        ${TOPIC_LOCKS&&!hasLinkedRoom?`<section class="topic-assessment-area" id="room-tab-quiz" aria-labelledby="topic-assessment-title"><h3 id="topic-assessment-title">Topic quiz · 20 questions</h3>${renderTopicQuiz(i)}</section>`:""}
      </section>
      <section class="room-panel topic-flow-panel" id="room-tab-exam" hidden>
        <div class="topic-room-step"><span class="room-kicker">ROOM STEP 3 · YOUR CHALLENGE</span><h2 tabindex="-1">Show what you can do</h2></div>
        ${calculusExamMarkup}
        <p class="room-task-intro">${TOPIC_LOCKS?"Try this extra challenge. Passing it does not replace the topic assessment.":"Take this challenge when you are ready. You can review your work and try again."}</p>
        ${buildCardTopicExam(i)}
      </section>
      ${isTopicPage?`<nav class="topic-flow-controls" aria-label="Room steps"><button type="button" class="topic-flow-back" data-topic-back disabled>← Back</button><div class="topic-flow-meter"><strong data-topic-flow-label>Room step 1 of 3</strong><progress data-topic-flow-progress max="3" value="1" aria-label="Room progress" aria-valuemin="1" aria-valuemax="3" aria-valuenow="1"></progress></div><button type="button" class="topic-flow-next" data-topic-next>Start room →</button></nav>`:""}
    </div>
  </div>`;
  attachTopicAI(i,practiceQs);
  attachTopicReviewAI(i);
  window.AITutor?.attach(root.querySelector("[data-topic-ai-guide]"),{
    question:`Explain ${t[1]} for a ${LEVEL_LABEL[getTopicLevel(i)].toLowerCase()} learner. Topic summary: ${notes.key} Learning goals: ${notes.bullets.join(" ")}`,
    topic:t[1],
    level:LEVEL_LABEL[getTopicLevel(i)],
    compact:true
  });
  if(isTopicPage){document.title=`${t[1]} | Math Master`;const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=t[3];}
  if(isTopicPage){
    const initialHash=location.hash.slice(1);
    setTopicFlowStep(topicFlowStep(initialHash),Boolean(location.hash));
    if(initialHash==="examples"||initialHash==="links"){
      const extra=topicRoot().querySelector(initialHash==="examples"?".topic-flow-extra:first-of-type":"#room-tab-links");
      if(extra)extra.open=true;
    }
  }
  const finishTopic=$("#dn");
  if(finishTopic)finishTopic.onchange=e=>{
    S.done[i]=e.target.checked;
    if(activeTopicQuiz&&activeTopicQuiz.index===i&&activeTopicQuiz.submitted){
      activeTopicQuiz.passed=window.TOPIC_LOCKS_API.recordQuizResult(
        i,activeTopicQuiz.score,activeTopicQuiz.questions.length,Boolean(S.done[i]),S
      );
    }
    save();
    render();
    const status=$("#room-completion-status");
    if(status){
      status.textContent=isTopicFinished(i)?"✓ Passed":S.done[i]?"Finished · pass the quiz":"In progress";
      status.classList.toggle("room-completed",isTopicFinished(i));
    }
    e.target.checked=Boolean(S.done[i]);
    const quizPanel=$("#room-tab-quiz .topic-quiz");
    if(quizPanel&&activeTopicQuiz&&activeTopicQuiz.submitted){quizPanel.outerHTML=renderTopicQuiz(i);attachTopicReviewAI(i);}
    updateTodayStats();
    renderTodayQuestions();
  };
  root.querySelector("h1")?.focus({preventScroll:true});
}

document.addEventListener("click",e=>{
  const topicBack=e.target.closest("[data-topic-back]");
  if(topicBack){setTopicFlowStep(topicFlowStep(location.hash.slice(1))-1);return;}
  const topicNext=e.target.closest("[data-topic-next]");
  if(topicNext){
    const step=topicFlowStep(location.hash.slice(1));
    if(step<2){setTopicFlowStep(step+1);return;}
    const index=Number(topicNext.closest(".topic-page-shell")?.dataset.topicIndex);
    if(Number.isInteger(index)&&isTopicOpen(index+1)){
      window.location.assign(`/topic/${topicSlug(TOPICS[index+1][1])}${isFastMlPath?"?path=ml-fast":""}`);
    }else{
      window.location.assign(isFastMlPath?"/rooms.html?path=ml#rooms-list":"/index.html#topics");
    }
    return;
  }
  const sectionGo=e.target.closest("[data-section-go]");
  if(sectionGo){
    if(isTopicPage){
      setTopicFlowStep(sectionGo.dataset.sectionGo==="practice"?1:sectionGo.dataset.sectionGo==="exam"?2:0);
      return;
    }
  }
  const newPractice=e.target.closest("[data-new-practice]");
  if(newPractice){
    const index=Number(newPractice.dataset.newPractice);
    try{
      const questions=createNextPracticeSet(index);
      const panel=$(`#room-tab-practice`);
      if(panel){
        panel.innerHTML=renderPracticePanel(index,questions);
        attachTopicAI(index,questions);
        setTopicFlowStep(1,false);
        panel.querySelector(".answer-input")?.focus({preventScroll:true});
        panel.scrollIntoView({behavior:"smooth",block:"start"});
      }
    }catch(error){
      console.error("Could not create a fresh practice set:",error);
      const status=newPractice.closest(".practice-set-heading")?.querySelector(".practice-set-status");
      if(status)status.textContent="A fresh set could not be created. Please try again.";
    }
    return;
  }
  const roomTab=e.target.closest(".room-tab");
  if(roomTab){
    const room=roomTab.closest(".room-shell");
    room.querySelectorAll(".room-tab").forEach(tab=>{
      const selected=tab===roomTab;
      tab.classList.toggle("active",selected);
      tab.setAttribute("aria-selected",String(selected));
    });
    room.querySelectorAll(".room-panel").forEach(panel=>{panel.hidden=panel.id!==roomTab.getAttribute("aria-controls")});
    roomTab.scrollIntoView({behavior:"smooth",block:"nearest",inline:"center"});
    return;
  }

  const c=e.target.closest(".topic-open");
  if(c&&!isTopicPage){
    e.preventDefault();
    try{sessionStorage.setItem("mathmaster-topic-list-scroll",String(window.scrollY));}catch(error){}
    openTopic(Number(c.dataset.i));
    return;
  }

  const quizSubmit=e.target.closest(".topic-quiz-submit");
  if(quizSubmit){
    const quizPanel=quizSubmit.closest(".topic-quiz");
    finishTopicQuiz(Number(quizSubmit.dataset.topicQuiz),quizPanel);
    return;
  }
  const quizRetake=e.target.closest(".topic-quiz-retake");
  if(quizRetake){
    const index=Number(quizRetake.dataset.topicQuizRetake);
    startTopicQuiz(index,true);
    const panel=quizRetake.closest(".topic-quiz");
    panel.outerHTML=renderTopicQuiz(index);
    return;
  }

  const submitExam=e.target.closest("[data-exam-submit]");
  if(submitExam){
    const panel=submitExam.closest("[data-topic-exam]");
    const idx=Number(panel.dataset.topicExam);
    const exam=getTopicExam(idx);
    const questionIndex=Number(submitExam.dataset.examSubmit);
    const input=panel.querySelector(`.exam-answer[data-exam-index="${questionIndex}"]`);
    const answer=input?.value.trim()||"";
    if(!answer){input?.focus();return;}
    const [question,expected]=exam[questionIndex];
    const correct=isAnswerCorrect(expected,answer);
    const results=ACTIVITY.topicExamResults[idx]||(ACTIVITY.topicExamResults[idx]={});
    results[questionIndex]={checked:true,answer,correct,pointsEarned:0};
    recordQuestionAnswer(`topic-${idx}-exam-${questionIndex}`);
    const rewardKey=`topic-${idx}-hard-exam-${practiceQuestionId([question,expected])}`;
    if(correct&&!ACTIVITY.answerRewards[rewardKey]){
      ACTIVITY.answerRewards[rewardKey]=true;
      ACTIVITY.points+=10;
      results[questionIndex].pointsEarned=10;
      emitMM2Points(results[questionIndex].pointsEarned,"hard-exam");
      if(!ACTIVITY.badges.includes("First Correct Answer"))ACTIVITY.badges.push("First Correct Answer");
    }
    if(correct)window.MathMasterFeedback?.correct();
    window.MathMasterFeedback?.answered(correct,results[questionIndex].pointsEarned);
    saveActivity();
    updateTopicPoints();
    const completed=Object.keys(results).length===exam.length;
    const score=Object.values(results).filter(result=>result.correct).length;
    if(completed&&score===exam.length&&!TOPIC_LOCKS){
      S.passed[idx]=true;S.done[idx]=true;save();
    }
    panel.outerHTML=buildCardTopicExam(idx);
    attachTopicReviewAI(idx);
    const nextAnswer=document.querySelector(`#room-tab-exam [data-topic-exam="${idx}"] .exam-answer`);
    if(nextAnswer){
      nextAnswer.focus({preventScroll:true});
      nextAnswer.closest(".exam-question")?.scrollIntoView({behavior:"smooth",block:"center"});
    }else{
      document.querySelector(`#room-tab-exam [data-topic-exam="${idx}"] .exam-result`)?.scrollIntoView({behavior:"smooth",block:"center"});
    }
    return;
  }
  const retryExam=e.target.closest("[data-exam-retake]");
  if(retryExam){
    const index=Number(retryExam.dataset.examRetake);
    delete ACTIVITY.topicExamResults[index];
    saveActivity();
    const panel=retryExam.closest("[data-topic-exam]");
    panel.outerHTML=buildCardTopicExam(index);
    return;
  }

  const check=e.target.closest(".check-answer");
  if(check){
    const q=check.closest(".q") || check.parentElement;
    const answerInput=q ? q.querySelector(".answer-input") : null;
    const result=q ? q.querySelector(".check-result") : null;
    const answerPanel=q ? q.querySelector(".a.answer") : null;
    const answerText=q ? q.querySelector(".answer-value") : null;
    const userInput=answerInput?answerInput.value:"";
    const expectedAnswer=answerText ? answerText.textContent : "";
    if(!userInput.trim()){
      if(result){
        result.hidden=false;
        result.textContent="Enter your answer first, then check it.";
        result.style.color="#b42318";
      }
      return;
    }
    const correct=isAnswerCorrect(expectedAnswer, userInput);
    if(userInput.trim()&&q&&q.dataset.questionKey)recordQuestionAnswer(q.dataset.questionKey);
    let pointsEarned=0;
    if(correct&&q&&!q.dataset.answerRevealed&&q.dataset.questionKey&&!ACTIVITY.answerRewards[q.dataset.questionKey]){
      ACTIVITY.answerRewards[q.dataset.questionKey]=true;
      ACTIVITY.points+=10;
      pointsEarned=10;
      emitMM2Points(pointsEarned,"practice");
      if(!ACTIVITY.badges.includes("First Correct Answer"))ACTIVITY.badges.push("First Correct Answer");
      saveActivity();
    }
    if(correct)window.MathMasterFeedback?.correct();
    window.MathMasterFeedback?.answered(correct,pointsEarned);
    if(q&&q.closest("#room-tab-practice")){
      q.dataset.attempted="true";
      if(q.dataset.questionKey){
        ACTIVITY.practiceResults[q.dataset.questionKey]={answer:userInput,checked:true,correct,pointsEarned};
        saveActivity();
      }
      updateTopicPoints();
      const practicePanel=q.closest("#room-tab-practice");
      const practiceTopic=Number(practicePanel.querySelector("[data-practice-topic]")?.dataset.practiceTopic);
      const setQuestions=currentPracticeQuestions(practiceTopic);
      if(setQuestions.every(question=>ACTIVITY.practiceResults[`topic-${practiceTopic}-practice-${practiceQuestionId(question)}`]?.checked))announceMM2Completion(`practice-set:${practiceTopic}:${Number(ACTIVITY.practiceRounds[practiceTopic])||0}`,{type:"practice-set",topic:TOPICS[practiceTopic]?.[1],message:"You finished this practice set."});
      practicePanel.innerHTML=renderPracticePanel(practiceTopic,currentPracticeQuestions(practiceTopic));
      attachTopicAI(practiceTopic,currentPracticeQuestions(practiceTopic));
      const nextQuestion=practicePanel.querySelector(".q:not(.practice-question-review) .answer-input");
      if(nextQuestion){
        nextQuestion.focus({preventScroll:true});
        nextQuestion.closest(".q")?.scrollIntoView({behavior:"smooth",block:"center"});
      }else{
        practicePanel.querySelector(".practice-set-complete")?.scrollIntoView({behavior:"smooth",block:"center"});
      }
      return;
    }
    if(result){
      result.hidden=false;
      result.textContent=correct?`✓ Correct answer ${pointsEarned?`· +${pointsEarned} points`:"· Points already earned"}`:"✗ Not yet. Try again. You can use a hint or reveal the worked steps.";
      result.classList.toggle("is-correct",correct);
      result.classList.toggle("is-wrong",!correct);
    }
    updateTopicPoints();
    const explanation=q&&q.querySelector(".explanation");
    if(correct){
      if(answerPanel)answerPanel.hidden=false;
      if(explanation)explanation.hidden=false;
      const showButton=q?.querySelector(".explain-answer");
      if(showButton)showButton.textContent="Hide answer";
    }else{
      if(answerPanel)answerPanel.hidden=true;
      if(explanation)explanation.hidden=true;
      const showButton=q?.querySelector(".explain-answer");
      if(showButton)showButton.textContent="Show answer";
    }
    return;
  }
  const explain=e.target.closest(".explain-answer");
  if(explain){
    const question=explain.closest(".q");
    const content=question?.querySelector(".explanation");
    if(!content)return;
    content.hidden=!content.hidden;
    if(!content.hidden)question.dataset.answerRevealed="true";
    const answer=question.querySelector(".a.answer");
    if(answer)answer.hidden=content.hidden;
    const note=content.querySelector(".mm-revealed-note");
    if(note)note.hidden=content.hidden||question.querySelector(".check-result")?.classList.contains("is-correct");
    explain.textContent=content.hidden?"Show answer":"Hide answer";
    return;
  }
  if(e.target.matches(".rev.alt")){
    const answer=e.target.closest(".q")?.querySelector(".a.hint")||e.target.nextElementSibling;
    if(answer){answer.hidden=!answer.hidden;e.target.textContent=answer.hidden?"Hint":"Hide hint";}
  }
  const ch=e.target.closest(".chip");
  if(ch){
    if(ch.dataset.f){
      filter=ch.dataset.f;
      document.querySelectorAll("#chips .chip").forEach(x=>x.classList.toggle("on",x===ch));
    }
    if(ch.dataset.level){
      level=ch.dataset.level;
      document.querySelectorAll("#level-chips .chip").forEach(x=>x.classList.toggle("on",x===ch));
    }
    render();
  }
});
window.addEventListener("hashchange",()=>{
  if(!isTopicPage)return;
  const hash=location.hash.slice(1);
  if(["learn","examples","links","practice","hard-exam","exam","quiz"].includes(hash)){
    setTopicFlowStep(topicFlowStep(hash),false);
    if(hash==="examples"||hash==="links"){
      const extra=topicRoot().querySelector(hash==="examples"?".topic-flow-extra:first-of-type":"#room-tab-links");
      if(extra)extra.open=true;
    }
  }
});
document.addEventListener("keydown",e=>{
  const current=e.target.closest(".room-tab");
  if(!current)return;
  const tabs=[...current.closest('[role="tablist"]').querySelectorAll(".room-tab")];
  const index=tabs.indexOf(current);
  const next=e.key==="ArrowRight"?tabs[(index+1)%tabs.length]
    :e.key==="ArrowLeft"?tabs[(index-1+tabs.length)%tabs.length]
    :e.key==="Home"?tabs[0]
    :e.key==="End"?tabs[tabs.length-1]
    :null;
  if(next){
    e.preventDefault();
    next.focus();
    next.click();
  }
});
document.addEventListener("change",e=>{
  if(e.target.dataset.s){
    S.sub[e.target.dataset.s]=e.target.checked;
    save();
    render();
    const topicIndex=Number(e.target.dataset.s.split("-")[0]);
    const total=subs(topicIndex).length;
    const checked=subDone(topicIndex);
    const progress=topicRoot().querySelector(".room-progress");
    if(progress){
      progress.querySelector(".room-progress-copy strong").textContent=`${checked}/${total} learning goals`;
      progress.querySelector(".room-progress-track span").style.width=`${total?checked/total*100:0}%`;
    }
    const taskProgress=topicRoot().querySelector("[data-learn-task-progress]");
    if(taskProgress){taskProgress.value=checked;taskProgress.setAttribute("aria-valuenow",String(checked));}
    const taskCount=topicRoot().querySelector("[data-learn-task-count]");
    if(taskCount)taskCount.textContent=`${checked}/${total} goals`;
    topicRoot().querySelectorAll("[data-learn-task-card]").forEach(card=>{
      const indexes=(card.dataset.goalIndexes||"").split(",").filter(Boolean).map(Number);
      const done=indexes.length>0&&indexes.every(goalIndex=>Boolean(S.sub[topicIndex+"-"+goalIndex]));
      card.classList.toggle("is-done",done);
      const link=topicRoot().querySelector(`[data-learn-task-link="${card.dataset.learnTaskCard}"]`);
      if(link){link.classList.toggle("is-done",done);link.querySelector(".learn-task-number").textContent=done?"✓":String(Number(card.dataset.learnTaskCard)+1);}
    });
  }
});
window.addEventListener("pageshow",event=>{
  if(!TOPIC_LOCKS)return;
  render();
  renderTodayQuestions();
  updateTodayStats();
  const navigation=performance.getEntriesByType("navigation")[0];
  if(!isTopicPage&&(event.persisted||navigation?.type==="back_forward")){try{const saved=Number(sessionStorage.getItem("mathmaster-topic-list-scroll"));if(Number.isFinite(saved))setTimeout(()=>window.scrollTo(0,saved),80);}catch(error){}}
});
window.addEventListener("storage",event=>{
  if(TOPIC_LOCKS&&event.key==="mathmaster-rooms"){
    render();
    renderTodayQuestions();
    updateTodayStats();
  }
});
$("#search").oninput=e=>{query=e.target.value.toLowerCase().trim();render()};
$("#today").onclick=()=>{const d=new Date().toLocaleDateString("en-CA");if(!S.days.includes(d))S.days.push(d);save();render()};
$("#start-next-topic").onclick=()=>{
  const i=getNextTopicIndex();
  if(i>=0)openTopic(i);
};
const practiceToggle=$("#topic-practice-mode");
if(practiceToggle)practiceToggle.addEventListener("change",event=>{
  const enabled=event.target.checked;
  if(enabled&&!window.confirm("Unlock every topic for practice? This turns off topic locks until you switch it off.")){
    event.target.checked=false;
    return;
  }
  try{
    window.TOPIC_LOCKS_API.setPracticeMode(localStorage,enabled);
    render();
    renderTodayQuestions();
  }catch(error){
    event.target.checked=!enabled;
    const status=$("#topic-lock-status");
    if(status)status.textContent="Could not save practice mode: "+error.message;
  }
});
if(isFastMlPath){
  document.querySelectorAll("#chips .chip").forEach(chip=>chip.classList.toggle("on",chip.dataset.f==="core"));
}
render();renderTodayQuestions();
if(isTopicPage&&location.pathname==="/topic.html"){
  if(!routeSlug){
    window.location.replace(isFastMlPath?"/rooms.html?path=ml#rooms-list":"/index.html#topics");
  }else{
    let decodedRouteSlug="";
    try{decodedRouteSlug=decodeURIComponent(routeSlug);}catch(error){decodedRouteSlug="";}
    const topicIndex=TOPICS.findIndex((topic,index)=>
      topicSlug(topic[1])===decodedRouteSlug||String(index)===decodedRouteSlug||String(index+1)===decodedRouteSlug
    );
    if(topicIndex<0)window.location.replace("/404.html");
    else window.location.replace(`/topic/${topicSlug(TOPICS[topicIndex][1])}${location.hash}`);
  }
}
if(isTopicPage&&topicPathSlug){
  let decodedRouteSlug="";
  try{decodedRouteSlug=decodeURIComponent(topicPathSlug);}catch(error){decodedRouteSlug="";}
  const topicIndex=TOPICS.findIndex(topic=>topicSlug(topic[1])===decodedRouteSlug);
  if(topicIndex<0){window.location.replace("/404.html");}else{window.__requestedTopicIndex=topicIndex;}
}
function finishLessonLoading(){
  loadLessons().then(()=>{
  lessonsLoaded=true;
  render();
  renderTodayQuestions();
  if(Number.isInteger(window.__requestedTopicIndex))openTopic(window.__requestedTopicIndex);else openLinkedTopic();
  }).catch(error=>{
  lessonsLoaded=true;
  render();
  renderTodayQuestions();
  console.error("Lesson loading failed:",error);
  if(Number.isInteger(window.__requestedTopicIndex))openTopic(window.__requestedTopicIndex);else openLinkedTopic();
  });
}
renderSharedHeader();
const readerScript=document.createElement("script");
readerScript.src="/js/pdf-reader.js";
document.head.append(readerScript);
const rewardScript=document.createElement("script");
rewardScript.src="/js/mm2-rewards.js";
document.head.append(rewardScript);
if(isTopicPage||requestedTopic){
  finishLessonLoading();
}else if("requestIdleCallback" in window){
  window.requestIdleCallback(finishLessonLoading,{timeout:1600});
}else{
  window.setTimeout(finishLessonLoading,600);
}
