(function() {
  "use strict";

  const STORAGE_KEY = "mathmaster-gcse-bank";
  const AREAS = ["Number", "Algebra", "Ratio", "Geometry", "Probability", "Statistics"];
  const EMPTY_STATE = () => ({
    questionsDone: 0,
    marksEarned: 0,
    areaStats: {},
    topicStats: {},
    mistakes: [],
    streak: 0,
    lastDay: "",
    dailyDone: []
  });

  function readState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_STATE();
    try {
      const parsed = JSON.parse(raw);
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        throw new Error("Saved question bank progress has an invalid format.");
      }
      const base = EMPTY_STATE();
      return Object.assign(base, parsed);
    } catch (error) {
      if (error instanceof SyntaxError) {
        console.error("Saved question bank progress is not valid JSON.", error);
        return EMPTY_STATE();
      }
      throw error;
    }
  }

  let state = readState();
  let staticBank = [];
  let topics = [];
  let topicTitles = {};
  let activeQueue = [];
  let activeIndex = 0;
  let sessionName = "Practice";
  let examQueue = [];
  let examTimer = null;
  let examSubmitted = false;

  const byId = id => document.getElementById(id);
  const escapeHtml = value => String(value == null ? "" : value)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const today = () => new Date().toISOString().slice(0, 10);
  const dateSeed = text => {
    let hash = 2166136261;
    for (let index = 0; index < text.length; index += 1) {
      hash ^= text.charCodeAt(index);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  };
  const titleFromId = id => String(id).replace(/-/g, " ").replace(/\b\w/g, letter => letter.toUpperCase());
  const topicTitle = id => topicTitles[id] || titleFromId(id);

  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = () => reject(new Error(`Could not load ${src}.`));
      document.head.appendChild(script);
    });
  }

  async function readFileList(url) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Could not load ${url} (HTTP ${response.status}).`);
    return (await response.text()).split(/\r?\n/)
      .map(line => line.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }

  async function loadData() {
    const topicFiles = await readFileList("js/gcse/index.js");
    for (const file of topicFiles) {
      if (!/^[\w-]+\.js$/.test(file)) throw new Error(`Invalid topic file name: ${file}`);
      await loadScript(`js/gcse/topics/${file}`);
    }
    topics = window.GCSE || [];
    topicTitles = Object.fromEntries(topics.map(topic => [topic.id, topic.title]));
    const bankFiles = await readFileList("js/gcse/bank/index.js");
    for (const file of bankFiles) {
      if (!/^\d{2}-[\w-]+\.js$/.test(file)) throw new Error(`Invalid bank file name: ${file}`);
      await loadScript(`js/gcse/bank/${file}`);
    }
    staticBank = window.GCSE_BANK || [];
    if (topics.length !== 91 || staticBank.length !== topics.length) {
      throw new Error(`Expected 91 topic files and 91 bank files; loaded ${topics.length} and ${staticBank.length}.`);
    }
    fillTopicOptions();
    renderDashboard();
    setStatus(`Loaded ${staticBank.length} topics and ${generatorCount()} question generators.`);
    if (new URLSearchParams(window.location.search).has("topic") && byId("qb-topic").value !== "All") {
      startFromFilters();
    }
  }

  function generatorCount() {
    return Object.keys(window.GEN || {}).length;
  }

  function fillTopicOptions() {
    const select = byId("qb-topic");
    const entries = [];
    for (const topic of staticBank) {
      entries.push({ id: topic.topic, title: topicTitle(topic.topic), area: topic.area });
    }
    for (const [id, generator] of Object.entries(window.GEN || {})) {
      entries.push({ id, title: generator.title, area: generator.area });
    }
    const unique = new Map(entries.map(item => [item.id, item]));
    const sorted = [...unique.values()].sort((a, b) => a.title.localeCompare(b.title));
    select.innerHTML = `<option value="All">All topics</option>${sorted.map(item =>
      `<option value="${escapeHtml(item.id)}" data-area="${escapeHtml(item.area)}">${escapeHtml(item.title)} · ${escapeHtml(item.area)}</option>`
    ).join("")}`;
    const requestedTopic = new URLSearchParams(window.location.search).get("topic");
    if (requestedTopic && unique.has(requestedTopic)) {
      select.value = requestedTopic;
      byId("qb-area").value = unique.get(requestedTopic).area;
    }
  }

  function setStatus(message, isError) {
    const target = byId("qb-status");
    if (!target) return;
    target.textContent = message;
    target.classList.toggle("qb-wrong", Boolean(isError));
  }

  function currentFilters(overrides) {
    return Object.assign({
      area: byId("qb-area").value,
      topic: byId("qb-topic").value,
      tier: byId("qb-tier").value,
      level: byId("qb-level").value,
      calc: byId("qb-calc").value,
      minMarks: Number(byId("qb-min-marks").value) || 1,
      maxMarks: Number(byId("qb-max-marks").value) || 6,
      source: byId("qb-source").value
    }, overrides || {});
  }

  function matches(question, filters) {
    const tierMatch = filters.tier === "All" || question.tier === "FH" || question.tier === filters.tier;
    return (filters.area === "All" || question.area === filters.area) &&
      (filters.topic === "All" || question.topic === filters.topic) &&
      tierMatch &&
      (filters.level === "All" || question.level === filters.level) &&
      (filters.calc === "All" || question.calc === filters.calc) &&
      question.marks >= filters.minMarks &&
      question.marks <= filters.maxMarks &&
      (!filters.topicSet || filters.topicSet.has(question.topic));
  }

  function staticQuestion(topic, question) {
    return {
      id: question.id,
      topic: topic.topic,
      topicTitle: topicTitle(topic.topic),
      area: topic.area,
      tier: topic.tier,
      level: question.level,
      calc: question.calc,
      marks: question.marks,
      q: question.q,
      a: question.answer,
      explain: question.explain,
      scheme: question.scheme,
      hint: question.hint,
      mistake: question.mistake,
      why: question.why,
      source: "static"
    };
  }

  function generatorQuestion(id, generator, index, seed) {
    const rng = window.GEN_SEEDED(dateSeed(`${seed}:${id}:${index}`));
    const made = generator.make(rng);
    const level = generator.tier === "H" ? "6-7" : generator.tier === "F" ? "1-3" : "4-5";
    const scheme = Array.from({ length: made.marks }, (_, mark) =>
      mark === made.marks - 1 ? `A1 for the correct answer, ${made.a}.` : "M1 for a valid method.");
    return {
      id: `gen:${id}:${index}:${seed}`,
      topic: id,
      topicTitle: generator.title,
      area: generator.area,
      tier: generator.tier,
      level,
      calc: made.calc,
      marks: made.marks,
      q: made.q,
      a: made.a,
      explain: made.steps,
      scheme,
      hint: made.steps[0],
      mistake: "Using the right operation with the wrong values.",
      why: "That changes the calculation. Match each value to the method before working it out.",
      source: "generator"
    };
  }

  function shuffle(items, rng) {
    for (let index = items.length - 1; index > 0; index -= 1) {
      const other = Math.floor(rng() * (index + 1));
      [items[index], items[other]] = [items[other], items[index]];
    }
    return items;
  }

  function buildPool(filters, count, seed) {
    const rng = window.GEN_SEEDED(dateSeed(String(seed)));
    const pool = [];
    if (filters.source !== "generators") {
      for (const topic of staticBank) {
        for (const item of topic.questions) {
          const question = staticQuestion(topic, item);
          if (matches(question, filters)) pool.push(question);
        }
      }
    }
    if (filters.source !== "static") {
      for (const [id, generator] of Object.entries(window.GEN || {})) {
        const base = {
          topic: id,
          area: generator.area,
          tier: generator.tier,
          level: generator.tier === "H" ? "6-7" : generator.tier === "F" ? "1-3" : "4-5",
          calc: "All",
          marks: 1
        };
        if (filters.area !== "All" && base.area !== filters.area) continue;
        if (filters.topic !== "All" && filters.topic !== id) continue;
        if (filters.topicSet && !filters.topicSet.has(id)) continue;
        if (filters.tier !== "All" && base.tier !== filters.tier && base.tier !== "FH") continue;
        if (filters.level !== "All" && base.level !== filters.level) continue;
        for (let sample = 0; sample < Math.max(4, Math.ceil(count / 3)); sample += 1) {
          pool.push(generatorQuestion(id, generator, sample, seed));
        }
      }
      for (let index = pool.length - 1; index >= 0; index -= 1) {
        if (pool[index].source === "generator" && !matches(pool[index], filters)) pool.splice(index, 1);
      }
    }
    return shuffle(pool, rng);
  }

  function pickQuestions(filters, count, seed) {
    const pool = buildPool(filters, count, seed);
    if (!pool.length) return [];
    const chosen = pool.slice(0, count);
    while (chosen.length < count) chosen.push(pool[chosen.length % pool.length]);
    return chosen;
  }

  function resourcesMarkup(question) {
    const term = encodeURIComponent(question.topicTitle);
    return `<div class="qb-resources"><b>Resources:</b><a target="_blank" rel="noopener" href="https://www.youtube.com/results?search_query=${term}">YouTube search</a><a target="_blank" rel="noopener" href="https://www.khanacademy.org/search?page_search_query=${term}">Khan Academy search</a><a target="_blank" rel="noopener" href="https://corbettmaths.com/?s=${term}">Corbettmaths search</a></div>`;
  }

  function listMarkup(items) {
    return `<ol class="qb-steps">${items.map(item => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`;
  }

  function practiceMarkup(question, index) {
    const numberButtons = Array.from({ length: question.marks }, (_, mark) =>
      `<button class="qb-secondary" data-earn="${mark}" aria-pressed="false">Tick ${escapeHtml((question.scheme[mark] || "").match(/^[MABC]\d/)?.[0] || `mark ${mark + 1}`)}</button>`).join("");
    return `<article class="qb-question" data-question="${escapeHtml(question.id)}">
      <h3>${escapeHtml(question.topicTitle)} · ${index + 1} of ${activeQueue.length}</h3>
      <p class="qb-muted">${escapeHtml(question.area)} · ${escapeHtml(question.tier)} · ${escapeHtml(question.level)} · ${question.marks} mark${question.marks === 1 ? "" : "s"} · ${question.calc === "calc" ? "Calculator" : "Non-calculator"}</p>
      <p>${escapeHtml(question.q)}</p>
      ${resourcesMarkup(question)}
      <div class="qb-actions">
        <button data-reveal="hint">Hint</button>
        <button class="qb-secondary" data-reveal="stuck">I am stuck</button>
        <button class="qb-secondary" data-reveal="answer">Show answer</button>
        <button class="qb-secondary" data-reveal="explain">Show full explanation</button>
        <button class="qb-secondary" data-reveal="scheme">Show mark scheme</button>
        <button class="qb-secondary" data-reveal="mistake">Show common mistake</button>
      </div>
      <div class="qb-panel" data-panel="hint" hidden>${escapeHtml(question.hint || question.explain[0] || "")}</div>
      <div class="qb-panel" data-panel="stuck" hidden>${listMarkup((question.explain || []).slice(0, 1))}</div>
      <div class="qb-panel" data-panel="answer" hidden><b>Answer:</b> ${escapeHtml(question.a)}</div>
      <div class="qb-panel" data-panel="explain" hidden>${listMarkup(question.explain || [])}</div>
      <div class="qb-panel" data-panel="scheme" hidden>${listMarkup(question.scheme || [])}</div>
      <div class="qb-panel" data-panel="mistake" hidden><b>Common mistake:</b> ${escapeHtml(question.mistake)}<br><b>Why it is wrong:</b> ${escapeHtml(question.why)}</div>
      <p class="qb-muted">Tick one button for each mark you earned.</p>
      <div class="qb-marking">${numberButtons}<span data-earned-count>0 / ${question.marks} marks</span></div>
      <button data-save-mark>Save my marks</button>
    </article>`;
  }

  function startPractice(queue, label) {
    if (!queue.length) {
      setStatus("No questions match those choices. Try a wider filter.", true);
      return;
    }
    if (examTimer) clearInterval(examTimer);
    examTimer = null;
    activeQueue = queue;
    activeIndex = 0;
    sessionName = label || "Practice";
    byId("qb-exam-panel").hidden = true;
    byId("qb-practice-panel").hidden = false;
    byId("qb-next").hidden = true;
    byId("qb-feedback").textContent = "";
    renderPractice();
    setStatus(`${sessionName}: ${queue.length} question${queue.length === 1 ? "" : "s"}.`);
    byId("qb-practice-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function renderPractice() {
    byId("qb-position").textContent = `${sessionName} · Question ${activeIndex + 1} of ${activeQueue.length}`;
    byId("qb-practice-question").innerHTML = practiceMarkup(activeQueue[activeIndex], activeIndex);
    byId("qb-feedback").textContent = "";
    byId("qb-next").hidden = true;
  }

  function localDateString(date) {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 10);
  }

  function updateStreak() {
    const date = localDateString(new Date());
    if (state.lastDay !== date) {
      const previous = new Date();
      previous.setDate(previous.getDate() - 1);
      state.streak = state.lastDay === localDateString(previous) ? state.streak + 1 : 1;
      state.lastDay = date;
    }
    if (!state.dailyDone.includes(date)) state.dailyDone.push(date);
  }

  function scheduleMistake(question) {
    const existing = state.mistakes.find(item => item.key === question.id);
    const intervals = [1, 3, 7, 14];
    const stage = existing ? Math.min(existing.stage + 1, intervals.length - 1) : 0;
    const due = new Date();
    due.setDate(due.getDate() + intervals[stage]);
    const item = {
      key: question.id,
      topic: question.topic,
      topicTitle: question.topicTitle,
      area: question.area,
      stage,
      due: localDateString(due),
      wrongCount: (existing ? existing.wrongCount : 0) + 1,
      question
    };
    if (existing) Object.assign(existing, item);
    else state.mistakes.push(item);
  }

  function saveQuestionResult(question, earned) {
    const score = Math.max(0, Math.min(question.marks, earned));
    state.questionsDone += 1;
    state.marksEarned += score;
    const area = state.areaStats[question.area] || (state.areaStats[question.area] = { earned: 0, possible: 0, done: 0 });
    area.earned += score;
    area.possible += question.marks;
    area.done += 1;
    const topic = state.topicStats[question.topic] || (state.topicStats[question.topic] = {
      title: question.topicTitle, area: question.area, earned: 0, possible: 0, done: 0, wrong: 0
    });
    topic.title = question.topicTitle;
    topic.area = question.area;
    topic.earned += score;
    topic.possible += question.marks;
    topic.done += 1;
    if (score < question.marks) {
      topic.wrong += 1;
      scheduleMistake(question);
    } else {
      state.mistakes = state.mistakes.filter(item => item.key !== question.id);
    }
    updateStreak();
  }

  function finishPracticeQuestion(card) {
    if (card.dataset.saved === "true") return;
    const question = activeQueue[activeIndex];
    const earned = card.querySelectorAll("[data-earn][aria-pressed='true']").length;
    saveQuestionResult(question, earned);
    card.dataset.saved = "true";
    card.querySelectorAll("[data-earn]").forEach(button => { button.disabled = true; });
    card.querySelector("[data-save-mark]").disabled = true;
    byId("qb-feedback").textContent = earned === question.marks ?
      `Saved: ${earned} out of ${question.marks}. Great work.` :
      `Saved: ${earned} out of ${question.marks}. This question is in your mistake book.`;
    byId("qb-next").hidden = false;
    save();
    renderDashboard();
    renderMistakes();
  }

  function addExamMarkup(question, index) {
    return `<article class="qb-question qb-exam-question" data-exam-index="${index}">
      <h3>${index + 1}. ${escapeHtml(question.topicTitle)} · ${question.marks} marks</h3>
      <p class="qb-muted">${escapeHtml(question.area)} · ${escapeHtml(question.tier)} · ${question.calc === "calc" ? "Calculator" : "Non-calculator"}</p>
      <p>${escapeHtml(question.q)}</p>
      ${resourcesMarkup(question)}
      <label>Marks earned (0-${question.marks}) <input class="qb-mark-input" type="number" min="0" max="${question.marks}" value="0" data-exam-mark="${index}"></label>
      <details><summary>Show mark scheme</summary>${listMarkup(question.scheme || [])}</details>
    </article>`;
  }

  function startExam() {
    const filters = currentFilters({ calc: byId("qb-exam-calc").value });
    const count = Math.max(20, Math.min(30, Number(byId("qb-count").value) || 25));
    examQueue = pickQuestions(filters, count, `exam-${Date.now()}`);
    if (!examQueue.length) {
      setStatus("No questions match the exam settings. Try a wider filter.", true);
      return;
    }
    byId("qb-practice-panel").hidden = true;
    byId("qb-exam-panel").hidden = false;
    byId("qb-exam-results").innerHTML = "";
    byId("qb-exam-questions").innerHTML = examQueue.map(addExamMarkup).join("");
    examSubmitted = false;
    byId("qb-submit-exam").disabled = false;
    const seconds = Math.max(60, examQueue.reduce((sum, question) => sum + question.marks, 0) * 60);
    let left = seconds;
    const tick = () => {
      byId("qb-clock").textContent = `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} left`;
      if (left <= 0) {
        finishExam();
        return;
      }
      left -= 1;
    };
    tick();
    if (examTimer) clearInterval(examTimer);
    examTimer = setInterval(tick, 1000);
    setStatus(`Timed exam: ${examQueue.length} questions. There is about one minute per mark.`);
    byId("qb-exam-panel").scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function roughGrade(percentage) {
    if (percentage >= 85) return "8-9";
    if (percentage >= 70) return "6-7";
    if (percentage >= 55) return "4-5";
    if (percentage >= 35) return "2-3";
    return "1";
  }

  function finishExam() {
    if (examSubmitted) return;
    examSubmitted = true;
    if (examTimer) clearInterval(examTimer);
    examTimer = null;
    byId("qb-submit-exam").disabled = true;
    const topicLoss = {};
    const incorrect = [];
    let earnedTotal = 0;
    const possibleTotal = examQueue.reduce((sum, question) => sum + question.marks, 0);
    examQueue.forEach((question, index) => {
      const input = document.querySelector(`[data-exam-mark="${index}"]`);
      const earned = Math.max(0, Math.min(question.marks, Number(input.value) || 0));
      earnedTotal += earned;
      saveQuestionResult(question, earned);
      if (earned < question.marks) {
        topicLoss[question.topicTitle] = (topicLoss[question.topicTitle] || 0) + question.marks - earned;
        incorrect.push({ question, earned });
      }
    });
    const percentage = possibleTotal ? Math.round(100 * earnedTotal / possibleTotal) : 0;
    const lossRows = Object.entries(topicLoss).sort((a, b) => b[1] - a[1]);
    const wrongMarkup = incorrect.length ? incorrect.map(({ question, earned }) =>
      `<article class="qb-question qb-wrong"><h3>${escapeHtml(question.topicTitle)} · ${earned}/${question.marks} marks</h3><p>${escapeHtml(question.q)}</p><p><b>Answer:</b> ${escapeHtml(question.a)}</p>${listMarkup(question.explain || [])}</article>`
    ).join("") : "<p>Every answer earned full marks. Well done.</p>";
    byId("qb-exam-results").innerHTML = `<section class="qb-panel"><h2>Exam result: ${earnedTotal} / ${possibleTotal}</h2><p>${percentage}%</p><p>Rough grade estimate (a guess, not a real grade): ${roughGrade(percentage)}</p><h3>Marks lost by topic</h3>${lossRows.length ? `<table class="qb-result-table"><tbody>${lossRows.map(([title, lost]) => `<tr><th>${escapeHtml(title)}</th><td>${lost}</td></tr>`).join("")}</tbody></table>` : "<p>No marks lost.</p>"}<h3>Questions to review</h3>${wrongMarkup}</section>`;
    updateStreak();
    save();
    renderDashboard();
    renderMistakes();
    setStatus(`Exam finished: ${earnedTotal} of ${possibleTotal} marks.`);
  }

  function getWeakTopics() {
    return Object.entries(state.topicStats)
      .filter(([, stats]) => stats.done > 0)
      .sort((a, b) => {
        const accuracyA = a[1].possible ? a[1].earned / a[1].possible : 0;
        const accuracyB = b[1].possible ? b[1].earned / b[1].possible : 0;
        return accuracyA - accuracyB || b[1].wrong - a[1].wrong;
      }).slice(0, 5);
  }

  function renderWeakTopics() {
    const weak = getWeakTopics();
    byId("qb-weak-list").innerHTML = weak.length ? `<ol>${weak.map(([id, stats]) =>
      `<li>${escapeHtml(stats.title)} (${Math.round(100 * stats.earned / stats.possible)}% across ${stats.done} questions)</li>`
    ).join("")}</ol>` : "<p class=\"qb-empty\">Answer some questions to find your weakest topics.</p>";
  }

  function renderMistakes() {
    const todayDate = localDateString(new Date());
    const due = state.mistakes.filter(item => item.due <= todayDate).length;
    byId("qb-mistakes").innerHTML = state.mistakes.length ?
      `<p>${state.mistakes.length} saved. ${due} ready to practise now.</p><ul>${state.mistakes.slice(0, 20).map(item =>
        `<li>${escapeHtml(item.topicTitle)} · due ${escapeHtml(item.due)} · ${item.wrongCount} miss${item.wrongCount === 1 ? "" : "es"}</li>`
      ).join("")}</ul>` :
      "<p class=\"qb-empty\">No saved mistakes yet. Questions you miss will appear here.</p>";
  }

  function renderChart() {
    const stats = AREAS.map(area => ({ area, ...(state.areaStats[area] || { earned: 0, possible: 0 }) }));
    const width = 760;
    const height = 220;
    const left = 45;
    const chartWidth = 690;
    const barWidth = 62;
    const gap = 40;
    const bars = stats.map((item, index) => {
      const accuracy = item.possible ? item.earned / item.possible : 0;
      const barHeight = Math.round(140 * accuracy);
      const x = left + index * (barWidth + gap);
      const y = 170 - barHeight;
      return `<g><title>${escapeHtml(item.area)}: ${Math.round(accuracy * 100)}% accuracy</title><rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="currentColor" opacity=".8"></rect><text x="${x + barWidth / 2}" y="193" text-anchor="middle">${escapeHtml(item.area)}</text><text x="${x + barWidth / 2}" y="${Math.max(20, y - 7)}" text-anchor="middle">${Math.round(accuracy * 100)}%</text></g>`;
    }).join("");
    byId("qb-chart").innerHTML = `<svg class="qb-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Accuracy by GCSE maths area"><line x1="${left}" y1="170" x2="${left + chartWidth}" y2="170" stroke="currentColor" opacity=".45"></line>${bars}</svg>`;
  }

  function renderDashboard() {
    byId("qb-streak").textContent = `${state.streak} day${state.streak === 1 ? "" : "s"}`;
    byId("qb-done").textContent = String(state.questionsDone);
    byId("qb-marks").textContent = String(state.marksEarned);
    renderChart();
    renderWeakTopics();
    renderMistakes();
  }

  function startFromFilters() {
    const count = Number(byId("qb-count").value) || 10;
    const filters = currentFilters();
    const queue = pickQuestions(filters, count, `practice-${Date.now()}`);
    startPractice(queue, "Practice");
  }

  function startDaily() {
    const date = localDateString(new Date());
    const queue = pickQuestions(currentFilters({
      area: "All", topic: "All", tier: "All", level: "All", calc: "All",
      minMarks: 1, maxMarks: 6, source: "both", topicSet: null
    }), 10, `daily-${date}`);
    startPractice(queue, `Daily challenge · ${date}`);
  }

  function startFixMistakes() {
    const date = localDateString(new Date());
    const due = state.mistakes.filter(item => item.due <= date).map(item => item.question);
    if (!due.length) {
      const next = state.mistakes.map(item => item.due).sort()[0];
      setStatus(next ? `No mistakes are due today. Next review: ${next}.` : "Your mistake book is empty.");
      return;
    }
    startPractice(due, "Fix my mistakes");
  }

  function startWeakPractice() {
    const weak = getWeakTopics();
    if (!weak.length) {
      setStatus("Answer some questions first. Then the weak-topic finder can help.");
      return;
    }
    const topicSet = new Set(weak.map(([id]) => id));
    const queue = pickQuestions(currentFilters({ area: "All", topic: "All", topicSet }), Number(byId("qb-count").value) || 10, `weak-${Date.now()}`);
    startPractice(queue, "Practise my weak topics");
  }

  function exportProgress() {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "mathmaster-gcse-bank-progress.json";
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function onPracticeClick(event) {
    const reveal = event.target.closest("[data-reveal]");
    if (reveal) {
      const panel = event.target.closest(".qb-question").querySelector(`[data-panel="${reveal.dataset.reveal}"]`);
      panel.hidden = !panel.hidden;
      return;
    }
    const earn = event.target.closest("[data-earn]");
    if (earn && !earn.disabled) {
      earn.setAttribute("aria-pressed", earn.getAttribute("aria-pressed") !== "true");
      const card = earn.closest(".qb-question");
      const score = card.querySelectorAll("[data-earn][aria-pressed='true']").length;
      card.querySelector("[data-earned-count]").textContent = `${score} / ${activeQueue[activeIndex].marks} marks`;
      return;
    }
    if (event.target.closest("[data-save-mark]")) {
      const card = event.target.closest(".qb-question");
      finishPracticeQuestion(card);
    }
  }

  function nextPractice() {
    if (activeIndex + 1 >= activeQueue.length) {
      byId("qb-practice-panel").hidden = true;
      setStatus(`${sessionName} complete. Your progress is saved.`);
      return;
    }
    activeIndex += 1;
    renderPractice();
  }

  function setupEvents() {
    byId("qb-start").addEventListener("click", startFromFilters);
    byId("qb-exam-start").addEventListener("click", startExam);
    byId("qb-daily").addEventListener("click", startDaily);
    byId("qb-fix").addEventListener("click", startFixMistakes);
    byId("qb-weak-practise").addEventListener("click", startWeakPractice);
    byId("qb-next").addEventListener("click", nextPractice);
    byId("qb-end-practice").addEventListener("click", () => {
      byId("qb-practice-panel").hidden = true;
      setStatus("Practice ended. Answers you marked are saved.");
    });
    byId("qb-practice-question").addEventListener("click", onPracticeClick);
    byId("qb-submit-exam").addEventListener("click", finishExam);
    byId("qb-export").addEventListener("click", exportProgress);
    byId("qb-reset").addEventListener("click", () => {
      if (!confirm("Reset all Question Bank progress, mistakes, streaks and results?")) return;
      localStorage.removeItem(STORAGE_KEY);
      state = EMPTY_STATE();
      save();
      renderDashboard();
      setStatus("Question Bank progress has been reset.");
    });
    byId("qb-area").addEventListener("change", () => {
      const selected = byId("qb-topic").selectedOptions[0];
      if (selected && selected.value !== "All" && selected.dataset.area !== byId("qb-area").value && byId("qb-area").value !== "All") {
        byId("qb-topic").value = "All";
      }
    });
  }

  setupEvents();
  renderDashboard();
  loadData().catch(error => {
    console.error(error);
    setStatus(error.message, true);
  });
})();
