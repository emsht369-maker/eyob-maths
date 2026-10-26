(() => {
  "use strict";

  const root = document.querySelector("[data-paper-question-browser]");
  const count = document.getElementById("paper-q-count");
  const questions = (window.IMPORTED_QUESTIONS || []).filter(item =>
    item.confidence === "high" && item.verified === true && item.answerSourceFile &&
    item.answerSourcePage && item.questionImage
  );
  if (!root || !count) return;
  if (!questions.length) {
    count.textContent = "No reviewed questions available";
    root.textContent = "Reviewed source questions could not be loaded.";
    return;
  }

  const escapeHTML = value => String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
  const bySource = new Map();
  questions.forEach(item => {
    const title = item.sourceTitle || item.sourceFile;
    if (!bySource.has(title)) bySource.set(title, []);
    bySource.get(title).push(item);
  });
  const sourceSelect = `<label>Paper<select data-paper-q-source>${[...bySource.keys()].map(title => `<option value="${escapeHTML(title)}">${escapeHTML(title)}</option>`).join("")}</select></label>`;
  root.innerHTML = `<div class="imported-station-selectors">${sourceSelect}<label>Question<select data-paper-q-select></select></label></div>
    <div class="imported-question-navigator"><button type="button" data-paper-q-prev>Previous</button><span data-paper-q-position aria-live="polite"></span><button type="button" data-paper-q-next>Next</button></div>
    <article class="imported-question" data-paper-q-card aria-live="polite"></article>`;
  count.textContent = `${questions.length} reviewed questions · ${bySource.size} papers`;

  const source = root.querySelector("[data-paper-q-source]");
  const selector = root.querySelector("[data-paper-q-select]");
  const position = root.querySelector("[data-paper-q-position]");
  const card = root.querySelector("[data-paper-q-card]");
  const previous = root.querySelector("[data-paper-q-prev]");
  const next = root.querySelector("[data-paper-q-next]");
  let items = bySource.get(source.value) || [];
  let index = 0;

  function renderOptions() {
    selector.innerHTML = items.map((item, i) => `<option value="${i}">Question ${escapeHTML(item.number)}</option>`).join("");
    selector.value = String(index);
  }
  function render() {
    if (!items.length) return;
    index = Math.max(0, Math.min(index, items.length - 1));
    const item = items[index];
    position.textContent = `${index + 1} of ${items.length}`;
    previous.disabled = index === 0;
    next.disabled = index === items.length - 1;
    selector.value = String(index);
    const imageAlt = `Original page ${item.sourcePage} from ${item.sourceTitle || "the source paper"}, question ${item.number}`;
    card.innerHTML = `<p class="imported-source-tag">${escapeHTML(item.sourceTitle || item.sourceFile)} · paper page ${escapeHTML(item.sourcePage)} · ${escapeHTML(item.topic || "")}</p>
      <p class="imported-question-text"><strong>Question ${escapeHTML(item.number)}.</strong> ${escapeHTML(item.questionText)}</p>
      <figure class="imported-source-image"><img src="/${escapeHTML(item.questionImage)}" alt="${escapeHTML(imageAlt)}" loading="lazy"><figcaption>Original paper page ${escapeHTML(item.sourcePage)}</figcaption></figure>
      <details class="imported-solution"><summary>Show answer</summary><p><strong>${escapeHTML(item.answerText || item.finalAnswer || "")}</strong></p>${item.solutionSteps?.length ? `<ol>${item.solutionSteps.map(step => `<li>${escapeHTML(step)}</li>`).join("")}</ol>` : ""}<p class="imported-answer-source">Answer source: ${escapeHTML(item.answerSourceTitle || "Solutions")}, page ${escapeHTML(item.answerSourcePage)}</p></details>`;
  }
  source.addEventListener("change", () => {
    items = bySource.get(source.value) || [];
    index = 0;
    renderOptions();
    render();
  });
  selector.addEventListener("change", () => { index = Number(selector.value) || 0; render(); });
  previous.addEventListener("click", () => { index -= 1; render(); });
  next.addEventListener("click", () => { index += 1; render(); });
  renderOptions();
  render();
})();
