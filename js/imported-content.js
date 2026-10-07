(function () {
  "use strict";

  const topicSlug = decodeURIComponent(location.pathname.split("/").filter(Boolean).pop() || "");
  const topicQuestions = (window.IMPORTED_QUESTIONS || []).filter(item => item.topic === topicSlug && item.confidence === "high");
  const topicLearn = (window.IMPORTED_LEARN || []).filter(item => item.topic === topicSlug);
  if (!topicQuestions.length && !topicLearn.length) return;

  const escapeHTML = value => String(value == null ? "" : value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);

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

  function renderItem(item, index) {
    const hint = item.hint ? `<p class="imported-hint" hidden>${escapeHTML(item.hint)}</p>` : "";
    const questionImage = item.questionImage
      ? `<figure class="imported-source-image"><img src="/${escapeHTML(item.questionImage)}" alt="${escapeHTML(`Question ${item.number}, source page ${item.sourcePage} of ${item.sourceTitle || "the source PDF"}`)}"><figcaption>Question image · source page ${item.sourcePage}</figcaption></figure>`
      : "";
    const answerImage = item.answerImage
      ? `<figure class="imported-source-image"><img src="/${escapeHTML(item.answerImage)}" alt="${escapeHTML(`Worked answer for ${item.number}, source page ${item.answerSourcePage}`)}"><figcaption>Worked answer image · solution page ${item.answerSourcePage}</figcaption></figure>`
      : "";
    const solution = (item.solutionSteps || []).map(step => `<li>${escapeHTML(step)}</li>`).join("");
    const originalTag = `Original ${item.number} · question p. ${item.sourcePage}`;
    const sourceTag = `From: ${item.sourceTitle || item.sourceFile}, page ${item.sourcePage}`;
    return `<article class="imported-question" data-imported-id="${escapeHTML(item.id)}">
      <p class="imported-question-text"><strong>Q${index + 1}.</strong> ${escapeHTML(item.questionText)}</p>
      ${questionImage}
      <p class="imported-source-tag">${escapeHTML(sourceTag)} · ${escapeHTML(originalTag)}</p>
      <label class="imported-answer-entry">Your answer<input type="text" autocomplete="off" data-imported-answer="${escapeHTML(item.id)}"></label>
      <div class="imported-controls">
        <button type="button" data-import-action="hint">Hint</button>
        <button type="button" data-import-action="check">Check answer</button>
        <button type="button" data-import-action="explain">Explain</button>
        <button type="button" data-import-action="answer">Show answer</button>
      </div>
      ${hint}
      <p class="imported-feedback" role="status" aria-live="polite" hidden></p>
      <div class="imported-answer" hidden><strong>Answer:</strong> ${escapeHTML(item.answerText)}</div>
      <p class="imported-explanation" hidden>${escapeHTML((item.solutionSteps || [])[0] || "")}</p>
      <details class="imported-solution"><summary>Show solution</summary>
        ${answerImage}<ol>${solution}</ol>
        <p><strong>Final answer:</strong> ${escapeHTML(item.finalAnswer || item.answerText)}</p>
        <p class="imported-answer-source">Answer source: ${escapeHTML(item.answerSourceTitle || item.answerSourceFile)}, page ${item.answerSourcePage}</p>
      </details>
    </article>`;
  }

  function addImportedGroups() {
    const examplesPanel = document.querySelector("#room-tab-examples");
    if (examplesPanel && topicLearn.length && !examplesPanel.querySelector("[data-imported-learn]")) {
      const learnHtml = `<section class="imported-learn-group" data-imported-learn><h4>Learning notes from MIT OpenCourseWare · 18.06 Linear Algebra</h4>${topicLearn.map(item => `<details class="imported-learn-item"><summary>${escapeHTML(item.title)}</summary><p>${escapeHTML(item.text)}</p>${item.image?`<figure class="imported-source-image"><img src="/${escapeHTML(item.image)}" alt="${escapeHTML(`${item.title}, source page ${item.page}`)}"><figcaption>Source image · page ${item.page}</figcaption></figure>`:""}<p class="imported-source-tag">From: ${escapeHTML(item.sourceTitle)}, page ${item.page} · ${escapeHTML(item.author)} · ${escapeHTML(item.licence)}</p></details>`).join("")}</section>`;
      examplesPanel.insertAdjacentHTML("beforeend", learnHtml);
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
    const html = [...grouped.entries()].map(([title, items]) => `<section class="imported-question-group" data-imported-group>
      <h3>Questions from MIT OpenCourseWare · 18.06 Linear Algebra · ${escapeHTML(title)}</h3>
      <p class="imported-group-intro">These hard questions come from the cited exam. Answers and worked solutions are hidden until you open them.</p>
      ${items.map(renderItem).join("")}
    </section>`).join("");
    [practice, exam].forEach(panel => {
      if (panel && !panel.querySelector("[data-imported-group]")) {
        if (topicSlug === "linear-algebra") panel.insertAdjacentHTML("afterbegin", `<p class="imported-group-intro">Plus ${topicQuestions.length} more questions from MIT 18.06 below.</p>`);
        panel.insertAdjacentHTML("beforeend", html);
      }
    });
  }

  const observer = new MutationObserver(addImportedGroups);
  observer.observe(document.getElementById("topic-mount") || document.body, { childList: true, subtree: true });
  addImportedGroups();

  document.addEventListener("click", event => {
    const button = event.target.closest("[data-import-action]");
    if (!button) return;
    const card = button.closest(".imported-question");
    const item = topicQuestions.find(question => question.id === card?.dataset.importedId);
    if (!item || !card) return;
    const action = button.dataset.importAction;
    if (action === "hint") {
      const hint = card.querySelector(".imported-hint");
      if (hint) hint.hidden = !hint.hidden;
    } else if (action === "answer") {
      const answer = card.querySelector(".imported-answer");
      answer.hidden = !answer.hidden;
      button.textContent = answer.hidden ? "Show answer" : "Hide answer";
    } else if (action === "explain") {
      const explanation = card.querySelector(".imported-explanation");
      explanation.hidden = !explanation.hidden;
    } else if (action === "check") {
      const input = card.querySelector("[data-imported-answer]");
      const feedback = card.querySelector(".imported-feedback");
      const normalize = text => String(text || "").toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, "");
      const response = normalize(input.value);
      const expected = normalize(item.finalAnswer || item.answerText);
      feedback.hidden = false;
      feedback.textContent = response && response === expected
        ? "That matches the recorded answer."
        : "That does not match the recorded answer yet. Try again or open Show answer.";
    }
  });
})();
