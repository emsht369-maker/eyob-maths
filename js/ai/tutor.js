"use strict";

(function () {
  const config = window.AI_CONFIG;
  const states = new WeakMap();
  const DEFAULT_ERROR = "AI is busy. Try again in a minute.";
  const PRIVACY_NOTE = "Do not enter personal details. The tutor may be wrong and helps you reason without giving exercise answers.";

  function settings() {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem(config.STORAGE_KEY) || "{}");
    } catch (error) {
      console.error("AI Tutor settings are not valid JSON.", error);
    }
    if (saved && typeof saved === "object") delete saved.usage;
    return { workerUrl: String(config.WORKER_URL || "").trim(), saved };
  }

  async function requestTutor(payload) {
    const current = settings();
    if (!current.workerUrl) throw new Error("The AI Tutor is not connected on this browser yet.");
    const url = new URL(current.workerUrl);
    if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      throw new Error("The Worker URL must use HTTPS.");
    }
    const response = await fetch(`${url.origin}${url.pathname.replace(/\/+$/, "")}/api/tutor`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    let result = {};
    try { result = await response.json(); } catch (_) { result = { text: "" }; }
    return { status: response.status, result };
  }

  function blocked(context) {
    if (!config.AI_ENABLED || typeof context.isBlocked === "function" && context.isBlocked()) return true;
    if (context.pdfStudy === true) return false;
    const practiceQuestion = context.practiceQuestion === true;
    if (document.body.dataset.paperActive === "true") return true;
    if (document.querySelector("#qb-exam-panel:not([hidden]) #qb-submit-exam:not(:disabled)")) return true;
    if (document.body.dataset.page === "mock" && document.querySelector("#mock-submit:not(:disabled)")) return true;
    if (!practiceQuestion && document.querySelector("#room-tab-practice:not([hidden]) #room-tab-quiz [data-topic-quiz-submit]")) return true;
    if (document.querySelector("#room-tab-exam:not([hidden]) [data-topic-exam] .submit-exam")) return true;
    if (document.querySelector("#room-view:not([hidden]) .room-exam [data-timer]")) return true;
    if (document.querySelector("#visual-exam-panel:not([hidden])") &&
        !document.querySelector("#visual-exam-review:not([hidden])")) return true;
    return false;
  }

  function createButton(label, action, className) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = className || "ai-tutor-action";
    button.textContent = label;
    button.addEventListener("click", event => {
      event.preventDefault();
      action(event);
    });
    return button;
  }

  function formatMathText(value) {
    return String(value || "")
      .replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g, (_, display, inline, dollars) =>
        String(display || inline || dollars).replace(/\s-\s/g, " − "))
      .replace(/\\(?:dfrac|tfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, numerator, denominator) =>
        numerator === "1" && denominator === "2" ? "½" : `(${numerator})⁄(${denominator})`)
      .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)")
      .replace(/\\(?:times|cdot|div|pm|leq?|geq?|neq|approx|infty|pi|theta|alpha|beta)\b/g, token => ({
        "\\times": "×", "\\cdot": "·", "\\div": "÷", "\\pm": "±", "\\le": "≤", "\\leq": "≤",
        "\\ge": "≥", "\\geq": "≥", "\\neq": "≠", "\\approx": "≈", "\\infty": "∞",
        "\\pi": "π", "\\theta": "θ", "\\alpha": "α", "\\beta": "β"
      })[token] || token)
      .replace(/\\(?:text|mathrm|mathbf)\s*\{([^{}]*)\}/g, "$1")
      .replace(/\\(?:left|right)\b/g, "")
      .replace(/\\[()[\]]/g, "")
      .replace(/\\[a-zA-Z]+/g, "")
      .replace(/([A-Za-z0-9)])\^\{?([+-]?\d+)\}?/g, (_, base, power) => base + [...power].map(char => ({
        "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "+": "⁺"
      })[char] || char).join(""))
      .replace(/[{}]/g, "")
      .replace(/\$/g, "")
      .replace(/[ \t]+([,.;!?])/g, "$1");
  }

  const CHAT_KEY = "math-master-ai-chat";
  function readChat() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(CHAT_KEY) || "{}");
      const messages = Array.isArray(saved.messages) ? saved.messages : [];
      return {
        messages: messages.filter(message => message && ["user", "assistant"].includes(message.role) && typeof message.text === "string")
          .slice(-60).map(message => ({ role: message.role, text: message.role === "assistant" ? formatMathText(message.text) : message.text.slice(0, 1000) })),
        scrollTop: Number(saved.scrollTop) || 0,
        atBottom: saved.atBottom !== false,
        isOpen: saved.isOpen === true
      };
    } catch (_) {
      return { messages: [], scrollTop: 0, atBottom: true, isOpen: false };
    }
  }

  function cleanGeneratedQuestion(text) {
    const raw = String(text || "").replace(/\r/g, "").trim();
    const answerMarker = /(?:^|\n)\s*(?:(?:final|worked)\s+)?(?:answer|solution|steps|working|result)\s*[:=\-]/i;
    const inlineMarker = /\s+(?:(?:final|worked)\s+)?(?:answer|solution|steps|working|result)\s*[:=\-].*$/i;
    const beforeMarker = raw.split(answerMarker, 1)[0].replace(inlineMarker, "").trim();
    return beforeMarker.replace(/^question\s*:\s*/i, "").slice(0, 1400);
  }

  function attach(element, context) {
    if (!config || !element || !context || blocked(context) || element.dataset.aiAttached === "true") return null;
    if (context.roomLocked) return null;

    const panel = document.createElement("section");
    panel.className = "ai-tutor";
    panel.setAttribute("aria-label", "AI Tutor");
    panel.dataset.aiTutor = "";
    const heading = document.createElement("h4");
    heading.textContent = context.general ? "Ask the maths tutor" : "AI Tutor · guided help";
    heading.hidden = context.pdfStudy === true;
    const controls = document.createElement("div");
    controls.className = "ai-tutor-buttons";
    const workingLabel = document.createElement("label");
    workingLabel.className = "ai-tutor-input-label";
    const working = document.createElement("textarea");
    working.rows = 3;
    working.maxLength = 1800;
    working.placeholder = "Write the steps you tried. You can include a rough attempt.";
    working.setAttribute("aria-label", "Your working or attempt");
    const workingPrivacy=document.createElement("small");
    workingPrivacy.className="ai-tutor-privacy";
    workingPrivacy.textContent=PRIVACY_NOTE;
    workingLabel.append(working,workingPrivacy);
    workingLabel.hidden = true;

    const askLabel = document.createElement("label");
    askLabel.className = "ai-tutor-input-label";
    const askPrompt = document.createElement("span");
    askPrompt.textContent = "What would you like help understanding?";
    const ask = document.createElement("textarea");
    ask.rows = 2;
    ask.maxLength = 1000;
    ask.placeholder = "For example: Why do we find a common denominator?";
    ask.setAttribute("aria-label", "Ask the AI Tutor a maths question");
    const replaceAsk = createButton("Ask another question", () => {
      ask.focus({ preventScroll: true });
      ask.select();
      status.textContent = "Your question is selected. Type to replace it, or edit any part of it.";
      ask.scrollIntoView({ behavior: "smooth", block: "center" });
    }, "ai-tutor-action ai-tutor-replace-question");
    replaceAsk.hidden = true;
    ask.addEventListener("input", () => {
      replaceAsk.hidden = askLabel.hidden || !ask.value.trim();
    });
    const askPrivacy=document.createElement("small");
    askPrivacy.className="ai-tutor-privacy";
    askPrivacy.textContent=PRIVACY_NOTE;
    askLabel.append(askPrompt, ask, askPrivacy);
    // The global tutor is ready to use as soon as it opens. Contextual tutors
    // still ask the learner to choose a help mode first.
    askLabel.hidden = !context.general;
    ask.addEventListener("keydown", event => {
      if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
        event.preventDefault();
        if (!submitAsk.disabled) submitAsk.click();
      }
    });

    const answer = document.createElement("div");
    answer.className = "ai-tutor-answer";
    answer.setAttribute("aria-live", "polite");
    answer.setAttribute("aria-atomic", "true");
    answer.hidden = true;
    const similarAnswer = document.createElement("details");
    similarAnswer.className = "ai-tutor-similar-answer";
    const similarAnswerSummary = document.createElement("summary");
    similarAnswerSummary.textContent = "Show answer";
    const similarAnswerText = document.createElement("p");
    similarAnswer.append(similarAnswerSummary, similarAnswerText);
    similarAnswer.hidden = true;
    const status = document.createElement("p");
    status.className = "ai-tutor-status";
    status.setAttribute("role", "status");
    const copy = createButton("Copy", async () => {
      const state = states.get(panel);
      if (!state || !state.text) return;
      try {
        await navigator.clipboard.writeText(state.text);
        status.textContent = "Copied.";
      } catch (error) {
        console.error("Could not copy the AI Tutor response.", error);
        status.textContent = "Could not copy. Select the response text to copy it.";
      }
    }, "ai-tutor-copy");
    copy.hidden = true;
    const submitWorking = createButton("Check my working", () => request("check"));
    submitWorking.dataset.aiCheckSubmit = "";
    submitWorking.hidden = true;
    const submitAsk = createButton("Ask tutor", () => request(states.get(panel)?.requestMode || "ask"));
    submitAsk.dataset.aiAskSubmit = "";
    submitAsk.hidden = !context.general;
    const localSimilar = context.makeSimilar
      ? createButton("New checked question of the same type", () => {
        if (blocked(context)) {
          status.textContent = "AI and practice help are off during a test.";
          return;
        }
        const similar = context.makeSimilar();
        if (!similar || similar.replacedQuestion || !similar.question) return;
        const state = states.get(panel);
        state.practiceQuestion = String(similar.question).slice(0, 1400);
        working.value = "";
        workingLabel.hidden = false;
        submitWorking.hidden = false;
        answer.textContent = "Checked practice question\n" + state.practiceQuestion +
          "\n\nTry it first. Then write your method below and ask me to check your reasoning.";
        answer.hidden = false;
        copy.hidden = true;
        status.textContent = "This question was generated and checked by Math Master. The tutor will guide your method without showing the result.";
      })
      : null;

    const modes = context.general
      ? [["Ask a question", "ask"], ["Create practice question", "similar"]]
      : [["Teach me the idea", "explain"], ["Give me a hint", "hint"], ["Check my working", "check"], ["Similar question", "similar"], ["Ask a question", "ask"]];
    modes.forEach(([label, mode]) => controls.appendChild(createButton(label, () => {
      const state = states.get(panel);
      if (mode !== "check") state.practiceQuestion = "";
      state.requestMode = mode;
      working.value = "";
      const needsQuestionInput = mode === "ask" || context.general && mode === "similar";
      askPrompt.textContent = context.general && mode === "similar"
        ? "Topic or skill for your practice question"
        : "What would you like help understanding?";
      ask.placeholder = context.general && mode === "similar"
        ? "For example: fractions, algebra or derivatives"
        : "For example: Why do we find a common denominator?";
      askLabel.hidden = !needsQuestionInput;
      replaceAsk.hidden = !needsQuestionInput || !ask.value.trim();
      submitAsk.hidden = !needsQuestionInput;
      submitAsk.textContent = context.general && mode === "similar" ? "Generate question" : "Ask tutor";
      workingLabel.hidden = mode !== "check";
      submitWorking.hidden = mode !== "check";
      if (localSimilar) localSimilar.hidden = mode !== "similar";
      answer.hidden = true;
      similarAnswer.hidden = true;
      copy.hidden = true;
      status.textContent = "";
      if (needsQuestionInput) ask.focus({ preventScroll: true });
      else if (mode === "check") working.focus({ preventScroll: true });
      else request(mode);
    })));

    panel.append(heading, controls);
    if (localSimilar) panel.append(localSimilar);
    panel.append(workingLabel, submitWorking, askLabel, submitAsk, answer, similarAnswer, copy, replaceAsk, status);
    element.append(panel);
    element.dataset.aiAttached = "true";
    states.set(panel, { history: [], text: "", practiceQuestion: "" });

    async function request(mode) {
      if (blocked(context)) {
        status.textContent = "AI help is off during a test. Try this question after the test.";
        return;
      }
      const current = settings();
      if (!current.workerUrl) {
        status.textContent = "The AI Tutor is not connected on this browser yet.";
        return;
      }
      if ((mode === "ask" || context.general && mode === "similar") && !ask.value.trim()) {
        status.textContent = mode === "similar" ? "Choose a maths topic or skill first." : "Type your maths question first.";
        ask.focus({ preventScroll: true });
        return;
      }
      const responseInput = context.responseElement
        ? context.responseElement.value || context.responseElement.textContent || ""
        : "";
      const questionText = String(context.question || "").slice(0, 1800);
      const liveStudentAnswer = typeof context.getStudentAnswer === "function" ? context.getStudentAnswer() : context.studentAnswer;
      const studentAnswer = String(liveStudentAnswer || responseInput).slice(0, 1800);
      const studentWorking = String(working.value || context.studentWorking || studentAnswer).slice(0, 1800);
      if (mode === "check" && !studentWorking.trim()) {
        status.textContent = context.pdfStudy === true ? "Write your answer first." : "Write a step or an attempt first. It is fine if you are unsure.";
        working.focus({ preventScroll: true });
        return;
      }
      const state = states.get(panel);
      let pageContext = null;
      if (context.pdfStudy === true) {
        try {
          if (!questionText || /[\uFFFD_]{2,}|\b_x\s*0\b/i.test(questionText)) pageContext = await context.getPageContext();
        } catch (error) {
          console.error("Could not read the current PDF page for the AI Tutor.", error);
          status.textContent = "The current PDF page could not be read. Try again when it has finished loading.";
          return;
        }
        if (pageContext && pageContext.text.length < 40 && !pageContext.image) {
          status.textContent = "I can't read this page's text; ask me a specific question.";
          return;
        }
      }
      const tutoringQuestion = mode === "check" && state.practiceQuestion
        ? state.practiceQuestion
        : context.general && mode === "similar"
          ? `Maths topic or skill: ${ask.value.trim()}`
          : questionText;
      const pdfQuestionText = context.pdfStudy === true ? String(questionText || "").trim() : "";
      const pdfPageText = context.pdfStudy === true && pageContext?.text ? String(pageContext.text).trim() : "";
      const pdfStudyQuestion = context.pdfStudy === true ? pdfQuestionText || pdfPageText : tutoringQuestion;
      const payload = {
        mode,
        question: pdfStudyQuestion,
        studentQuestion: mode === "ask" || context.general && mode === "similar" ? ask.value.trim() : "",
        studentAnswer: context.pdfStudy === true ? studentAnswer : mode === "check" ? studentAnswer : "",
        studentWorking: mode === "check" ? studentWorking : "",
        topic: String(context.topic || "Maths").slice(0, 160),
        resourceTitle: String(context.resourceTitle || "").slice(0, 180),
        pdfStudy: context.pdfStudy === true,
        level: String(context.level || "").slice(0, 40),
        ...(pageContext?.image ? { image: pageContext.image } : {}),
        history: context.pdfStudy === true ? [] : state.history.slice(-4)
      };
      if (new URLSearchParams(location.search).get("debug") === "1") {
        console.log("AI tutor payload", payload);
      }
      status.textContent = "Thinking…";
      answer.hidden = true;
      copy.hidden = true;
      panel.querySelectorAll(".ai-tutor-action").forEach(button => { button.disabled = true; });
      try {
        const responseData = await requestTutor(payload);
        const response = { status: responseData.status, ok: responseData.status >= 200 && responseData.status < 300 };
        const result = responseData.result;
        if (response.status === 422 && result.error === "vision-unavailable") {
          status.textContent = "I can't read this page's text; ask me a specific question.";
          return;
        }
        if (response.status === 429) {
          status.textContent = "The AI Tutor is busy right now. Please try again shortly.";
          return;
        }
        if (!response.ok || !result.ok || typeof result.text !== "string") throw new Error(DEFAULT_ERROR);
        const renderedText = formatMathText(mode === "similar" ? cleanGeneratedQuestion(result.text) : result.text.trim());
        if (!renderedText) throw new Error(DEFAULT_ERROR);
        state.text = renderedText;
        const requestHistory = mode === "ask" || context.general && mode === "similar"
          ? `Learner question: ${payload.studentQuestion}`
          : `Tutor mode: ${mode}. Exercise: ${payload.question}. Learner working: ${payload.studentWorking || "not supplied"}`;
        state.history.push({ role: "user", content: requestHistory.slice(0, 600) });
        state.history.push({ role: "assistant", content: renderedText.slice(0, 600) });
        state.history = state.history.slice(-4);
        answer.textContent = renderedText;
        answer.hidden = false;
        controls.classList.add("has-answer");
        copy.hidden = false;
        status.textContent = "";
        if (mode === "similar") {
          if (context.pdfStudy === true) {
            similarAnswerText.textContent = formatMathText(result.answer || "");
            similarAnswer.hidden = !similarAnswerText.textContent;
            state.practiceQuestion = "";
          } else {
            answer.textContent = `AI practice question (not verified)\n${renderedText}\n\nTry it first. Write your method below, then ask me to check your reasoning.`;
            state.practiceQuestion = renderedText;
            working.value = "";
            workingLabel.hidden = false;
            submitWorking.hidden = false;
            working.focus({ preventScroll: true });
          }
        }
        const scrollContainer = panel.closest(".mm-pdf-ai-content");
        if (scrollContainer) {
          const overflow = answer.getBoundingClientRect().bottom - scrollContainer.getBoundingClientRect().bottom;
          if (overflow > 0) scrollContainer.scrollBy({ top: overflow + 16, behavior: "smooth" });
        } else {
          answer.scrollIntoView({ behavior: "smooth", block: "nearest" });
        }
        localStorage.setItem(config.STORAGE_KEY, JSON.stringify({
          ...current.saved,
          workerUrl: current.workerUrl
        }));
      } catch (error) {
        if (error.message !== DEFAULT_ERROR && error.message !== "The Worker URL must use HTTPS.") {
          console.error("AI Tutor request failed.", error);
        }
        status.textContent = error.message === "The Worker URL must use HTTPS."
          ? error.message
          : DEFAULT_ERROR;
      } finally {
        panel.querySelectorAll(".ai-tutor-action").forEach(button => { button.disabled = false; });
      }
    }
    return panel;
  }

  function setupGlobalTutor() {
    if (!config.AI_ENABLED || document.querySelector("[data-ai-global]")) return;
    const dock = document.createElement("aside");
    dock.className = "ai-tutor-dock";
    dock.dataset.aiGlobal = "";
    dock.setAttribute("aria-label", "Maths Tutor");
    const toggle = createButton("Ask maths tutor", () => {
      const studyScroll = { left: window.scrollX, top: window.scrollY };
      if (toggle.matches(":popover-open")) toggle.hidePopover();
      content.hidden = false;
      if (!content.matches(":popover-open")) content.showPopover();
      dock.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      chat.isOpen = true;
      saveChat();
      input.focus({ preventScroll: true });
      if (chat.atBottom) scrollToBottom();
      else messages.scrollTop = chat.scrollTop;
      const restoreStudyScroll = () => window.scrollTo({ ...studyScroll, behavior: "instant" });
      restoreStudyScroll();
      requestAnimationFrame(restoreStudyScroll);
    }, "ai-tutor-launcher");
    toggle.setAttribute("aria-label", "Ask maths tutor");
    toggle.title = "Ask maths tutor";
    toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path d="M5 18.5 3.8 21l4-.9a9 9 0 1 0-2.8-1.6Z"></path><path d="M12 7.5v5M9.5 10h5"></path></svg><span>Ask maths tutor</span>';
    toggle.setAttribute("popover", "manual");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-controls", "ai-tutor-global-panel");
    const content = document.createElement("section");
    content.className = "ai-tutor-dock-panel";
    content.id = "ai-tutor-global-panel";
    content.setAttribute("popover", "manual");
    content.setAttribute("role", "dialog");
    content.setAttribute("aria-label", "Ask the maths tutor");
    content.setAttribute("aria-modal", "false");
    content.hidden = true;

    const chat = readChat();
    const header = document.createElement("header");
    header.className = "ai-tutor-chat-header";
    const title = document.createElement("h2");
    title.id = "ai-tutor-chat-title";
    title.textContent = "Ask the maths tutor";
    content.setAttribute("aria-labelledby", title.id);
    const headerActions = document.createElement("div");
    headerActions.className = "ai-tutor-chat-header-actions";
    const newChat = createButton("New chat", () => {
      chat.messages = [];
      chat.scrollTop = 0;
      chat.atBottom = true;
      messages.replaceChildren();
      input.value = "";
      sendStatus.textContent = "";
      updateCounter();
      saveChat();
      input.focus({ preventScroll: true });
    }, "ai-tutor-new-chat");
    const close = createButton("×", () => closePanel(), "ai-tutor-close");
    close.setAttribute("aria-label", "Close maths tutor");
    headerActions.append(newChat, close);
    header.append(title, headerActions);

    const messages = document.createElement("div");
    messages.className = "ai-tutor-chat-messages";
    messages.setAttribute("role", "log");
    messages.setAttribute("aria-live", "polite");
    messages.setAttribute("aria-relevant", "additions text");
    messages.setAttribute("aria-label", "Tutor conversation");

    const composer = document.createElement("div");
    composer.className = "ai-tutor-chat-composer";
    const input = document.createElement("textarea");
    input.rows = 2;
    input.maxLength = 1000;
    input.placeholder = "Ask any maths question…";
    input.setAttribute("aria-label", "Ask the AI Tutor a maths question");
    const composerTools = document.createElement("div");
    composerTools.className = "ai-tutor-chat-tools";
    const counter = document.createElement("span");
    counter.className = "ai-tutor-char-count";
    counter.setAttribute("aria-live", "off");
    const send = createButton("Send", () => submitMessage(), "ai-tutor-send");
    const privacy = document.createElement("small");
    privacy.className = "ai-tutor-privacy";
    privacy.textContent = "Do not enter personal details. The tutor may be wrong.";
    const sendStatus = document.createElement("p");
    sendStatus.className = "ai-tutor-chat-status";
    sendStatus.setAttribute("role", "status");
    composerTools.append(counter, send);
    composer.append(input, privacy, composerTools, sendStatus);
    content.append(header, messages, composer);

    function saveChat() {
      try {
        sessionStorage.setItem(CHAT_KEY, JSON.stringify({ messages: chat.messages, scrollTop: chat.scrollTop, atBottom: chat.atBottom, isOpen: chat.isOpen }));
      } catch (_) { /* Chat remains usable when session storage is unavailable. */ }
    }
    function scrollToBottom() {
      messages.scrollTop = messages.scrollHeight;
      chat.scrollTop = messages.scrollTop;
      chat.atBottom = true;
      saveChat();
    }
    function updateCounter() {
      counter.textContent = `${input.value.length}/1000`;
    }
    function closePanel() {
      const studyScroll = { left: window.scrollX, top: window.scrollY };
      if (content.matches(":popover-open")) content.hidePopover();
      content.hidden = true;
      dock.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
      chat.isOpen = false;
      saveChat();
      if (!toggle.matches(":popover-open")) toggle.showPopover();
      toggle.focus({ preventScroll: true });
      window.scrollTo({ ...studyScroll, behavior: "instant" });
    }
    function addMessage(role, text, persist = true) {
      const shouldStick = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 48;
      const item = document.createElement("article");
      item.className = `ai-tutor-chat-message is-${role}`;
      item.dataset.role = role;
      const speaker = document.createElement("span");
      speaker.className = "ai-tutor-chat-speaker";
      speaker.textContent = role === "user" ? "You" : "Tutor";
      const body = document.createElement("p");
      body.textContent = role === "assistant" ? formatMathText(text) : text;
      item.append(speaker, body);
      messages.append(item);
      if (persist) {
        chat.messages.push({ role, text: body.textContent });
        chat.messages = chat.messages.slice(-60);
        saveChat();
      }
      if (shouldStick && persist) requestAnimationFrame(scrollToBottom);
      return item;
    }
    chat.messages.forEach(message => addMessage(message.role, message.text, false));
    messages.addEventListener("scroll", () => {
      chat.atBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 48;
      chat.scrollTop = messages.scrollTop;
      saveChat();
    }, { passive: true });
    if (chat.atBottom) requestAnimationFrame(scrollToBottom);
    else messages.scrollTop = chat.scrollTop;

    async function submitMessage() {
      if (send.disabled) return;
      const studyScroll = { left: window.scrollX, top: window.scrollY };
      const question = input.value.trim();
      if (!question) {
        sendStatus.textContent = "Type a maths question first.";
        input.focus({ preventScroll: true });
        return;
      }
      const current = settings();
      let url;
      try { url = new URL(current.workerUrl); }
      catch (_) {
        sendStatus.textContent = "The tutor is not connected right now. Continue studying and try again later.";
        return;
      }
      if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
        sendStatus.textContent = "The tutor is not connected securely right now. Continue studying and try again later.";
        return;
      }
      const history = chat.messages.slice(-4).map(message => ({ role: message.role, content: message.text.slice(0, 400) }));
      const stickToBottom = messages.scrollHeight - messages.scrollTop - messages.clientHeight < 48;
      input.value = "";
      updateCounter();
      sendStatus.textContent = "";
      addMessage("user", question);
      const thinking = document.createElement("article");
      thinking.className = "ai-tutor-chat-message is-assistant ai-tutor-thinking";
      thinking.setAttribute("role", "status");
      thinking.textContent = "Thinking…";
      messages.append(thinking);
      if (stickToBottom) requestAnimationFrame(scrollToBottom);
      send.disabled = true;
      send.textContent = "Sending…";
      try {
        const response = await fetch(`${url.origin}${url.pathname.replace(/\/+$/, "")}/api/tutor`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "ask", studentQuestion: question, topic: "Maths", history })
        });
        const result = await response.json();
        thinking.remove();
        if (!response.ok || !result.ok || typeof result.text !== "string") {
          addMessage("assistant", "The tutor could not reply just now. Your question is still here; please try again in a moment.");
          return;
        }
        const reply = formatMathText(result.text.trim());
        if (!reply) {
          addMessage("assistant", "The tutor could not format that reply. Please try your question again.");
          return;
        }
        addMessage("assistant", reply);
        localStorage.setItem(config.STORAGE_KEY, JSON.stringify({
          ...current.saved,
          workerUrl: current.workerUrl
        }));
      } catch (_) {
        thinking.remove();
        addMessage("assistant", "The tutor could not reply just now. Check your connection and try again.");
      } finally {
        send.disabled = false;
        send.textContent = "Send";
        window.scrollTo({ ...studyScroll, behavior: "instant" });
        requestAnimationFrame(() => window.scrollTo({ ...studyScroll, behavior: "instant" }));
      }
    }
    input.addEventListener("input", updateCounter);
    input.addEventListener("keydown", event => {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitMessage();
      }
    });
    document.addEventListener("keydown", event => {
      if (event.key === "Escape" && !content.hidden) {
        event.preventDefault();
        event.stopPropagation();
        closePanel();
      }
    }, true);
    updateCounter();

    dock.append(toggle, content);
    let topDialog = document.querySelector("dialog[open]");
    if (topDialog) topDialog.append(dock);
    else document.body.append(dock);
    toggle.showPopover();
    const promoteAboveDialog = () => {
      const current = document.querySelector("dialog[open]");
      if (current === topDialog) return;
      topDialog = current;
      if (current) current.append(dock);
      else document.body.append(dock);
      const floating = chat.isOpen ? content : toggle;
      if (floating.matches(":popover-open")) {
        floating.hidePopover();
        floating.showPopover();
      }
    };
    new MutationObserver(promoteAboveDialog).observe(document.documentElement, {
      subtree: true, childList: true, attributes: true, attributeFilter: ["open"]
    });
    if (chat.isOpen) {
      toggle.hidePopover();
      content.hidden = false;
      content.showPopover();
      dock.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      input.focus({ preventScroll: true });
      if (chat.atBottom) requestAnimationFrame(scrollToBottom);
      else requestAnimationFrame(() => { messages.scrollTop = chat.scrollTop; });
    }
  }

  window.AITutor = Object.freeze({ attach, settings, request: requestTutor, cleanGeneratedQuestion, formatMathText });
  const initialize = () => {
    setupGlobalTutor();
  };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
