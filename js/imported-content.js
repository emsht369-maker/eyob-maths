(function () {
  "use strict";

  const topicSlug = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "");
  const guidedPdfTopic = ["linear-algebra", "calculus"].includes(topicSlug);
  const topicQuestions = (window.IMPORTED_QUESTIONS || []).filter(item => item.topic === topicSlug && item.confidence === "high" && item.verified === true && item.answerSourceFile && item.answerSourcePage);
  const topicLearn = (window.IMPORTED_LEARN || []).filter(item => item.topic === topicSlug);
  if (!topicQuestions.length && !topicLearn.length) return;
  const answerStoreKey = `mathMasterImportedAnswers:${topicSlug}:v1`;
  const guidedProgressKey = `mathMasterGuidedProgress:${topicSlug}:v1`;
  let answerStore = {};
  let guidedProgress = { currentIndex: 0, completedIds: [] };
  let guidedFeedbackMessage = "";
  const linearAlgebraTopicGroups = [
    { title: "Solving systems and elimination", pattern: /system|elimination|gauss|solvab|pivot/i },
    { title: "Vector spaces, subspaces and basis", pattern: /vector space|basis|dimension|subspace|span|column space|nullspace|row space|hyperplane|matrix space|four fundamental/i },
    { title: "Linear transformations and matrices", pattern: /transformation|matrix class|matrix group|permutation|incidence|graph laplacian|markov matrix/i },
    { title: "Determinants, inverses and factorizations", pattern: /determinant|inverse|factorization|factorisation|cayley|rank factor/i },
    { title: "Eigenvalues and matrix structure", pattern: /eigen|similarity|jordan|matrix exponential|qr iteration|hermitian/i },
    { title: "Orthogonality, projections and least squares", pattern: /orthog|projection|least squares|gram.schmidt/i },
    { title: "Applications and further topics", pattern: /difference equation|differential equation|fourier|fredholm|numerical|hilbert|markov process/i }
  ];
  const linearAlgebraTopic = item => {
    const subtopic = item.subtopic || "";
    return linearAlgebraTopicGroups.find(group => group.pattern.test(subtopic))?.title || "Other linear algebra topics";
  };
  try {
    const saved = JSON.parse(localStorage.getItem(answerStoreKey) || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) answerStore = saved;
  } catch (_) {}
  try {
    const saved = JSON.parse(localStorage.getItem(guidedProgressKey) || "{}");
    if (saved && typeof saved === "object" && !Array.isArray(saved)) {
      guidedProgress = {
        currentIndex: Number.isInteger(saved.currentIndex) ? Math.max(0, saved.currentIndex) : 0,
        completedIds: Array.isArray(saved.completedIds)
          ? saved.completedIds.filter(id => topicQuestions.some(item => item.id === id))
          : []
      };
    }
  } catch (error) {
    console.warn(`Could not read saved guided progress for ${topicSlug}.`, error);
  }

  const escapeHTML = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const normalizeAnswer = text => String(text || "").toLocaleLowerCase()
    .replace(/\\(?:left|right)\b/g, "")
    .replace(/\\pi\b|π/g, "pi")
    .replace(/\\(?:cdot|times)\b|×/g, "*")
    .replace(/−/g, "-")
    .replace(/²/g, "^2").replace(/³/g, "^3").replace(/⁴/g, "^4").replace(/⁵/g, "^5")
    .replace(/\s+/g, "").replace(/[^\p{L}\p{N}*^.+\-/]+/gu, "");
  const isCorrectAnswer = (item, response) => {
    const normalized = normalizeAnswer(response);
    const expected = [item.finalAnswer || item.answerText, ...(item.acceptedAnswers || [])].map(normalizeAnswer);
    return Boolean(normalized && expected.includes(normalized));
  };

  function saveGuidedProgress() {
    try {
      localStorage.setItem(guidedProgressKey, JSON.stringify(guidedProgress));
      return true;
    } catch (error) {
      console.error(`Could not save guided progress for ${topicSlug}.`, error);
      return false;
    }
  }

  function renderGuidedPath(path) {
    if (!path || !topicQuestions.length) return;
    const total = topicQuestions.length;
    const index = Math.min(guidedProgress.currentIndex, total);
    const completed = new Set(guidedProgress.completedIds);
    const item = topicQuestions[index];
    const completedCount = completed.size;
    const progressPercent = Math.round(completedCount / total * 100);
    const progress = `<div class="guided-path-progress" role="progressbar" aria-label="Guided questions complete" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${completedCount}"><span style="width:${progressPercent}%"></span></div>
      <p class="guided-path-count">${completedCount} of ${total} questions completed · ${progressPercent}%</p>`;
    if (!item) {
      path.innerHTML = `<div class="guided-path-heading"><span class="guided-path-kicker">Learning path complete</span><h3>Excellent work — you finished every question</h3></div>${progress}<p class="guided-path-feedback is-correct" role="status">🏆 All ${total} reviewed questions completed. Your progress is saved on this device.</p>`;
      return;
    }
    const solved = completed.has(item.id);
    const saved = answerStore[item.id] || {};
    const topicTitle = topicSlug === "linear-algebra" ? linearAlgebraTopic(item) : (item.subtopic || "Mathematics");
    const topicItems = topicQuestions.filter(question =>
      (topicSlug === "linear-algebra" ? linearAlgebraTopic(question) : question.subtopic || "Mathematics") === topicTitle
    );
    const topicCompleted = topicItems.filter(question => completed.has(question.id)).length;
    const questionImage = item.questionImage
      ? `<figure class="imported-source-image"><img src="/${escapeHTML(item.questionImage)}" alt="${escapeHTML(`Question ${item.number} from ${item.sourceTitle || "the source paper"}`)}" loading="lazy"></figure>`
      : "";
    const solution = (item.solutionSteps || []).map(step => `<li>${escapeHTML(step)}</li>`).join("");
    const feedbackClass = solved ? "is-correct" : guidedFeedbackMessage ? "is-wrong" : "";
    const feedbackText = solved
      ? `✅ Correct — question ${index + 1} is complete. You earned a step.`
      : guidedFeedbackMessage;
    path.innerHTML = `<div class="guided-path-heading"><span class="guided-path-kicker">Guided question ${index + 1} of ${total}</span><h3>Try it, check it, unlock the next step</h3></div>
      ${progress}
      <p class="guided-topic-label">Topic: <strong>${escapeHTML(topicTitle)}</strong>${item.subtopic&&item.subtopic!==topicTitle?` · Subtopic: ${escapeHTML(item.subtopic)}`:""} · ${topicCompleted} of ${topicItems.length} in this topic complete</p>
      <article class="guided-question-card mm-question${solved ? " is-complete" : ""}" data-guided-id="${escapeHTML(item.id)}">
        <p class="guided-question-source">${escapeHTML(item.sourceTitle || item.sourceFile)} · question ${escapeHTML(item.number)} · page ${escapeHTML(item.sourcePage)}</p>
        <header class="mm-question-header"><b class="mm-question-number">Q${escapeHTML(item.number)}</b><p class="guided-question-text mm-question-prompt">${escapeHTML(item.questionText)}</p></header>
        ${questionImage}
        <label class="imported-answer-entry guided-answer-entry"><span>Your answer</span><textarea rows="3" autocomplete="off" spellcheck="false" data-guided-answer="${escapeHTML(item.id)}"${solved ? " readonly" : ""} placeholder="Type your answer here">${escapeHTML(saved.answer || "")}</textarea></label>
        <div class="guided-path-actions mm-question-actions">
          ${solved ? "" : '<button type="button" class="guided-check-button mm-button mm-button-primary" data-guided-check>Submit</button>'}
          <button type="button" class="mm-button mm-button-secondary" data-guided-hint>Hint</button>
          <button type="button" class="mm-button mm-button-ghost" data-guided-reveal>Show answer</button>
          ${solved ? '<button type="button" class="guided-next-button" data-guided-next>Continue to the next question →</button>' : ""}
        </div>
        <p class="guided-hint" hidden>${escapeHTML(item.hint || "Try writing down the key formula or idea first.")}</p>
        <section class="mm-question-final"${solved ? "" : " hidden"}><strong>Final answer:</strong> ${escapeHTML(item.finalAnswer || item.answerText)}<p class="mm-revealed-note"${solved ? " hidden" : ""}>No points for a revealed answer.</p></section>
        <div class="mm-question-steps"${solved ? "" : " hidden"}><strong>Worked steps</strong>${solution ? `<ol>${solution}</ol>` : ""}</div>
        ${feedbackText ? `<p class="guided-path-feedback ${feedbackClass}" role="status" aria-live="polite">${escapeHTML(feedbackText)}</p>` : ""}
      </article>`;
  }

  function mountGuidedPath() {
    if (!topicQuestions.length || !["linear-algebra", "calculus"].includes(topicSlug)) return;
    const learnPanel = document.querySelector("#room-tab-learn");
    const practicePanel = document.querySelector("#room-tab-practice");
    if (!learnPanel || !practicePanel) return;
    learnPanel.querySelectorAll('a[href$="#practice"]').forEach(link => {
      if (link.getAttribute("href") !== "#practice" || link.textContent !== "Continue to a guided question") {
        link.href = "#practice";
        link.textContent = "Continue to a guided question";
      }
    });
    let path = practicePanel.querySelector("[data-guided-path]");
    if (path) return;
    path = document.createElement("section");
    path.id = "guided-learning";
    path.className = "guided-path";
    path.dataset.guidedPath = "";
    path.setAttribute("aria-label", "Guided learning questions");
    const insertBefore = practicePanel.querySelector(".practice-set-heading");
    if (insertBefore) insertBefore.before(path);
    else practicePanel.prepend(path);
    renderGuidedPath(path);
  }

  const sources = new Map();
  function recordSource(file, title, item) {
    if (!file || sources.has(file)) return;
    sources.set(file, { title: title || file, author: item.author || "Gilbert Strang", licence: item.licence || "CC BY-NC-SA 4.0, MIT OpenCourseWare" });
  }
  topicQuestions.forEach(item => {
    recordSource(item.sourceFile, item.sourceTitle, item);
    recordSource(item.answerSourceFile, item.answerSourceTitle, item);
  });
  topicLearn.forEach(item => recordSource(item.sourceFile, item.sourceTitle, item));
  const attribution = document.getElementById("imported-source-attribution");
  if (attribution) attribution.innerHTML = `<details><summary>Source files used</summary><ul>${[...sources.entries()].map(([file, source]) => `<li><code>${escapeHTML(file)}</code> — ${escapeHTML(source.title)}; ${escapeHTML(source.author)}; ${escapeHTML(source.licence)}.</li>`).join("")}</ul></details>`;

  function renderItem(item) {
    const saved = answerStore[item.id] || {};
    const hint = item.hint ? `<p class="imported-hint" hidden>${escapeHTML(item.hint)}</p>` : "";
    const questionImage = item.questionImage
      ? `<details class="imported-source-page"><summary>View original question page</summary><figure class="imported-source-image"><img src="/${escapeHTML(item.questionImage)}" alt="${escapeHTML(`Question ${item.number}, source page ${item.sourcePage} of ${item.sourceTitle || "the source PDF"}`)}"><figcaption>Question image · source page ${item.sourcePage}</figcaption></figure></details>`
      : "";
    const answerImage = item.answerImage
      ? `<details class="imported-source-page"><summary>View original solution page</summary><figure class="imported-source-image"><img src="/${escapeHTML(item.answerImage)}" alt="${escapeHTML(`Worked answer for ${item.number}, source page ${item.answerSourcePage}`)}"><figcaption>Worked answer image · solution page ${item.answerSourcePage}</figcaption></figure></details>`
      : "";
    const solution = (item.solutionSteps || []).map(step => `<li>${escapeHTML(step)}</li>`).join("");
    const originalTag = `Original ${item.number} · question p. ${item.sourcePage}`;
    const sourcePath = item.topic === "calculus"
      ? `/assets/mit-calculus/${item.sourceFile}`
      : `/assets/mit-linear-algebra/${item.sourceFile}`;
    const answerPath = item.topic === "calculus"
      ? `/assets/mit-calculus/${item.answerSourceFile}`
      : `/assets/mit-linear-algebra/${item.answerSourceFile}`;
    const feedback = saved.feedback || "";
    const questionPage = item.questionImage || guidedPdfTopic ? "" : `<p class="imported-source-page"><a href="${sourcePath}#page=${encodeURIComponent(item.sourcePage)}">Read original question · page ${escapeHTML(item.sourcePage)}</a></p>`;
    const answerPage = item.answerImage || guidedPdfTopic ? "" : `<p class="imported-source-page"><a href="${answerPath}#page=${encodeURIComponent(item.answerSourcePage)}">Read original solution · page ${escapeHTML(item.answerSourcePage)}</a></p>`;
    return `<article class="imported-question mm-question" data-imported-id="${escapeHTML(item.id)}">
      <header class="mm-question-header"><b class="mm-question-number">Q${escapeHTML(item.number)}</b><p class="imported-question-text">${escapeHTML(item.questionText)}</p></header>
      ${questionImage}
      <p class="imported-source-tag">From ${escapeHTML(item.sourceTitle || item.sourceFile)} · ${escapeHTML(originalTag)}</p>
      ${questionPage}
      <label class="imported-answer-entry"><span>Your answer</span><textarea rows="3" autocomplete="off" spellcheck="false" data-imported-answer="${escapeHTML(item.id)}" aria-label="Your answer to question ${escapeHTML(item.number)}" placeholder="Type your answer or key working here">${escapeHTML(saved.answer || "")}</textarea><small>Work it out first. Use Hint if you need a nudge.</small></label>
      <div class="imported-controls mm-question-actions">
        <button type="button" class="mm-button mm-button-secondary" data-import-action="hint">Hint</button>
        <button type="button" class="mm-button mm-button-primary" data-import-action="check">Submit</button>
        <button type="button" class="mm-button mm-button-ghost" data-import-action="answer">Show answer</button>
      </div>
      ${hint}
      <p class="imported-feedback${saved.correct ? " is-correct" : saved.correct === false && feedback ? " is-wrong" : ""}" role="status" aria-live="polite"${feedback ? "" : " hidden"}>${escapeHTML(feedback)}</p>
      <div class="imported-answer mm-question-final" hidden><strong>Final answer:</strong> ${escapeHTML(item.finalAnswer || item.answerText)}<p class="mm-revealed-note">No points for a revealed answer.</p></div>
      <details class="imported-solution mm-question-steps"${saved.correct ? " open" : ""}><summary>Worked steps</summary>
        ${answerImage}${answerPage}<ol>${solution}</ol>
        <p><strong>Final answer:</strong> ${escapeHTML(item.finalAnswer || item.answerText)}</p>
        <p class="imported-answer-source">Answer from ${escapeHTML(item.answerSourceTitle || item.answerSourceFile)}, page ${escapeHTML(item.answerSourcePage)} · David Jerison et al. · CC BY-NC-SA 4.0, MIT OpenCourseWare</p>
      </details>
    </article>`;
  }

  const questionsBySource = new Map();
  function renderQuestionOptions(items) {
    return items.map(item => `<option value="${escapeHTML(item.id)}">${escapeHTML(item.number)} · ${escapeHTML(item.subtopic || "Question")}</option>`).join("");
  }

  function renderStation(groups) {
    const [firstTitle, firstItems] = groups[0];
    return `<section class="imported-question-group imported-question-station" data-imported-station data-current-index="0" data-current-source="${escapeHTML(firstTitle)}">
      <div class="imported-station-heading"><div><span class="imported-station-kicker">Source question room</span><h3>One question at a time</h3></div><span class="imported-station-count">${topicQuestions.length} reviewed questions</span></div>
      <p class="imported-group-intro">Practice one question at a time. Enter your answer, check it, then open the worked steps. Original question and answer pages are available inside each question, so you can study without leaving this page.</p>
      <div class="imported-station-selectors">
        <label>Source paper<select data-imported-source aria-label="Choose a source paper">${groups.map(([title]) => `<option value="${escapeHTML(title)}">${escapeHTML(title)}</option>`).join("")}</select></label>
        <label>Question<select data-imported-select aria-label="Choose a question">${renderQuestionOptions(firstItems)}</select></label>
      </div>
      <div class="imported-question-navigator" aria-label="Question navigation">
        <button type="button" data-import-nav="-1" disabled>Previous</button>
        <span data-import-counter aria-live="polite">Question 1 of ${firstItems.length}</span>
        <button type="button" data-import-nav="1"${firstItems.length < 2 ? " disabled" : ""}>Next question</button>
      </div>
      <div class="imported-question-host" aria-live="polite">${renderItem(firstItems[0])}</div>
    </section>`;
  }

  function showStationQuestion(station, index) {
    const title = station.querySelector("[data-imported-source]").value;
    const items = questionsBySource.get(title) || [];
    if (!items.length) return;
    const safeIndex = Math.max(0, Math.min(items.length - 1, index));
    const item = items[safeIndex];
    station.dataset.currentIndex = String(safeIndex);
    station.dataset.currentSource = title;
    station.querySelector("[data-imported-select]").value = item.id;
    station.querySelector("[data-import-counter]").textContent = `Question ${safeIndex + 1} of ${items.length}`;
    station.querySelector('[data-import-nav="-1"]').disabled = safeIndex === 0;
    station.querySelector('[data-import-nav="1"]').disabled = safeIndex === items.length - 1;
    station.querySelector(".imported-question-host").innerHTML = renderItem(item);
    attachVisibleImportedTutors(station);
  }

  function attachImportedTutor(card, item) {
    if (!window.AITutor || !card || card.dataset.aiAttached === "true") return;
    window.AITutor.attach(card, {
      question: item.questionText,
      topic: item.subtopic || "Linear Algebra",
      level: item.difficulty === "hard" ? "advanced" : "intermediate",
      practiceQuestion: true,
      responseElement: card.querySelector("[data-imported-answer]"),
      isBlocked: () => Boolean(document.querySelector("#room-tab-exam:not([hidden]) [data-topic-exam] .submit-exam"))
    });
  }

  function attachVisibleImportedTutors(root) {
    root.querySelectorAll(".imported-question").forEach(card => {
      const item = topicQuestions.find(question => question.id === card.dataset.importedId);
      if (item) attachImportedTutor(card, item);
    });
  }

  function addImportedGroups() {
    mountGuidedPath();
    const learnPanel = document.querySelector("#room-tab-learn");
    if (learnPanel && topicLearn.length && !learnPanel.querySelector("[data-imported-learn]")) {
      const learnHtml = `<details class="topic-flow-extra imported-learn-group" data-imported-learn><summary>Extra course notes · MIT OpenCourseWare 18.06</summary>${topicLearn.map(item => `<details class="imported-learn-item"><summary>${escapeHTML(item.title)}</summary><p>${escapeHTML(item.text)}</p>${item.image?`<figure class="imported-source-image"><img src="/${escapeHTML(item.image)}" alt="${escapeHTML(`${item.title}, source page ${item.page}`)}"><figcaption>Source image · page ${item.page}</figcaption></figure>`:""}<p class="imported-source-tag">From: ${escapeHTML(item.sourceTitle)}, page ${item.page} · ${escapeHTML(item.author)} · ${escapeHTML(item.licence)}</p></details>`).join("")}</details>`;
      learnPanel.insertAdjacentHTML("beforeend", learnHtml);
    }
    if (!topicQuestions.length) return;
    const practice = document.querySelector("#room-tab-practice");
    const exam = document.querySelector("#room-tab-exam");
    const grouped = new Map();
    topicQuestions.forEach(item => {
      const title = item.sourceTitle || item.sourceFile;
      if (!grouped.has(title)) grouped.set(title, []);
      grouped.get(title).push(item);
    });
    questionsBySource.clear();
    for (const [title, items] of grouped) questionsBySource.set(title, items);
    if (guidedPdfTopic) return;
    const importedIntro = topicSlug === "linear-algebra"
      ? `<p class="imported-group-intro">Plus ${topicQuestions.length} more questions from MIT 18.06 below.</p>`
      : "";
    const html = importedIntro + renderStation([...grouped.entries()]);
    const targetPanels = topicSlug === "calculus" ? [practice] : [practice, exam];
    targetPanels.forEach(panel => {
      if (panel && !panel.querySelector("[data-imported-station]")) {
        panel.insertAdjacentHTML("afterbegin", html);
        attachVisibleImportedTutors(panel);
      }
    });
  }

  const observer = new MutationObserver(addImportedGroups);
  observer.observe(document.getElementById("topic-mount") || document.body, { childList: true, subtree: true });
  addImportedGroups();

  document.addEventListener("click", event => {
    const guidedHint=event.target.closest("[data-guided-hint]");
    if(guidedHint){const hint=guidedHint.closest(".mm-question")?.querySelector(".guided-hint");if(hint){hint.hidden=!hint.hidden;guidedHint.textContent=hint.hidden?"Hint":"Hide hint";}return;}
    const guidedReveal=event.target.closest("[data-guided-reveal]");
    if(guidedReveal){const card=guidedReveal.closest(".mm-question");const answer=card?.querySelector(".mm-question-final");const steps=card?.querySelector(".mm-question-steps");if(answer&&steps){answer.hidden=!answer.hidden;steps.hidden=!steps.hidden;guidedReveal.textContent=answer.hidden?"Show answer":"Hide answer";}return;}
    const guidedCheck = event.target.closest("[data-guided-check]");
    if (guidedCheck) {
      const path = guidedCheck.closest("[data-guided-path]");
      const card = guidedCheck.closest("[data-guided-id]");
      const item = topicQuestions.find(question => question.id === card?.dataset.guidedId);
      const input = card?.querySelector("[data-guided-answer]");
      if (!path || !item || !input) return;
      const correct = isCorrectAnswer(item, input.value);
      answerStore[item.id] = {
        ...(answerStore[item.id] || {}),
        answer: input.value,
        correct,
        feedback: correct ? "Correct — the next question is unlocked." : "Not quite. Check your work or use the hint, then try again."
      };
      try { localStorage.setItem(answerStoreKey, JSON.stringify(answerStore)); } catch (_) {}
      if (!correct) {
        guidedFeedbackMessage = input.value.trim()
          ? "Not quite yet. Use the hint if you need one, then try again."
          : "Enter an answer before checking it.";
        renderGuidedPath(path);
        path.querySelector("[data-guided-answer]")?.focus();
        return;
      }
      if (!guidedProgress.completedIds.includes(item.id)) guidedProgress.completedIds.push(item.id);
      if (!saveGuidedProgress()) {
        guidedProgress.completedIds = guidedProgress.completedIds.filter(id => id !== item.id);
        guidedFeedbackMessage = "Your answer is correct, but progress could not be saved. Check your browser storage settings and try again.";
        renderGuidedPath(path);
        return;
      }
      guidedFeedbackMessage = "";
      renderGuidedPath(path);
      path.querySelector("[data-guided-next]")?.focus();
      return;
    }
    const guidedNext = event.target.closest("[data-guided-next]");
    if (guidedNext) {
      const path = guidedNext.closest("[data-guided-path]");
      const item = topicQuestions[guidedProgress.currentIndex];
      if (!path || !item || !guidedProgress.completedIds.includes(item.id)) return;
      guidedProgress.currentIndex += 1;
      if (!saveGuidedProgress()) {
        guidedProgress.currentIndex -= 1;
        guidedFeedbackMessage = "Progress could not be saved. Check your browser storage settings and try again.";
        renderGuidedPath(path);
        return;
      }
      guidedFeedbackMessage = "";
      renderGuidedPath(path);
      path.querySelector("[data-guided-answer]")?.focus();
      return;
    }
    const navButton = event.target.closest("[data-import-nav]");
    if (navButton) {
      const station = navButton.closest("[data-imported-station]");
      if (!station) return;
      showStationQuestion(station, Number(station.dataset.currentIndex || 0) + Number(navButton.dataset.importNav));
      return;
    }
    const button = event.target.closest("[data-import-action]");
    if (!button) return;
    const card = button.closest(".imported-question");
    const item = topicQuestions.find(question => question.id === card?.dataset.importedId);
    if (!item || !card) return;
    const action = button.dataset.importAction;
    if (action === "hint") {
      const hint = card.querySelector(".imported-hint");
      if (hint) { hint.hidden = !hint.hidden; button.textContent = hint.hidden ? "Hint" : "Hide hint"; }
    } else if (action === "answer") {
      const answer = card.querySelector(".imported-answer");
      answer.hidden = !answer.hidden;
      const solution = card.querySelector(".imported-solution");
      if (solution) solution.open = !answer.hidden;
      button.textContent = answer.hidden ? "Show answer" : "Hide answer";
    } else if (action === "explain") {
      const explanation = card.querySelector(".imported-explanation");
      explanation.hidden = !explanation.hidden;
      button.textContent = explanation.hidden ? "Explain first step" : "Hide explanation";
    } else if (action === "check") {
      const input = card.querySelector("[data-imported-answer]");
      const feedback = card.querySelector(".imported-feedback");
      const response = normalizeAnswer(input.value);
      const correct = isCorrectAnswer(item, input.value);
      feedback.hidden = false;
      feedback.classList.toggle("is-correct", correct);
      feedback.classList.toggle("is-wrong", !correct);
      feedback.textContent = !response
        ? "Enter an answer before checking it. You can use a fraction, decimal, or equivalent expression."
        : correct
          ? "✓ Correct answer. The worked steps are open below."
          : "Not quite yet. Check your steps, try again, or open the answer and worked solution.";
      if (correct) card.querySelector(".imported-solution").open = true;
      answerStore[item.id] = { answer: input.value, feedback: feedback.textContent, correct };
      try { localStorage.setItem(answerStoreKey, JSON.stringify(answerStore)); } catch (_) {}
    }
  });

  document.addEventListener("input", event => {
    const input = event.target.closest("[data-imported-answer], [data-guided-answer]");
    if (!input) return;
    const id = input.dataset.importedAnswer || input.dataset.guidedAnswer;
    answerStore[id] = { ...(answerStore[id] || {}), answer: input.value };
    try { localStorage.setItem(answerStoreKey, JSON.stringify(answerStore)); } catch (_) {}
  });

  document.addEventListener("change", event => {
    const station = event.target.closest("[data-imported-station]");
    if (!station) return;
    if (event.target.matches("[data-imported-source]")) {
      const items = questionsBySource.get(event.target.value) || [];
      const questionSelect = station.querySelector("[data-imported-select]");
      questionSelect.innerHTML = renderQuestionOptions(items);
      showStationQuestion(station, 0);
    } else if (event.target.matches("[data-imported-select]")) {
      const items = questionsBySource.get(station.querySelector("[data-imported-source]").value) || [];
      const index = items.findIndex(item => item.id === event.target.value);
      if (index >= 0) showStationQuestion(station, index);
    }
  });
})();
