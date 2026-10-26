import { MARKING_SYSTEM_PROMPT, PDF_SYSTEM_PROMPT, SYSTEM_PROMPT } from "./prompt.js";

// Check provider documentation for current free model names.
const MODELS = Object.freeze({
  gemini: "gemini-3.5-flash-lite",
  groq: "openai/gpt-oss-120b"
});
const MAX_BODY_BYTES = 1_400_000;
const MAX_IMAGE_CHARS = 1_300_000;
const FIELD_LIMITS = Object.freeze({
  question: 18000,
  officialSolution: 12000,
  studentQuestion: 1000,
  studentAnswer: 8000,
  studentWorking: 1800,
  resourceTitle: 180,
  topic: 160,
  level: 40
});
const MODES = new Set(["hint", "explain", "check", "similar", "ask", "mark"]);

function allowedOrigin(origin, env) {
  const configuredOrigins = String(env.ALLOWED_ORIGIN || "")
    .split(",")
    .map(value => value.trim())
    .filter(Boolean);
  return Boolean(origin && configuredOrigins.includes(origin));
}

function corsHeaders(origin, env) {
  const headers = { "Content-Type": "application/json; charset=utf-8", "Vary": "Origin" };
  if (allowedOrigin(origin, env)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Methods"] = "POST, OPTIONS";
    headers["Access-Control-Allow-Headers"] = "Content-Type";
    headers["Access-Control-Max-Age"] = "86400";
  }
  return headers;
}

function jsonResponse(data, status, origin, env) {
  return new Response(JSON.stringify(data), { status, headers: corsHeaders(origin, env) });
}

async function readLimitedBody(request) {
  if (Number(request.headers.get("Content-Length")) > MAX_BODY_BYTES) throw new Error("body-too-large");
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) {
      await reader.cancel();
      throw new Error("body-too-large");
    }
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  chunks.forEach(chunk => { bytes.set(chunk, offset); offset += chunk.byteLength; });
  return new TextDecoder().decode(bytes);
}

function validatePayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload) || !MODES.has(payload.mode)) return null;
  if (payload.pdfStudy != null && typeof payload.pdfStudy !== "boolean") return null;
  const clean = { mode: payload.mode, history: [], image: null, pdfStudy: payload.pdfStudy === true };
  for (const [field, limit] of Object.entries(FIELD_LIMITS)) {
    const value = payload[field] == null ? "" : payload[field];
    if (typeof value !== "string" || value.length > limit) return null;
    clean[field] = value;
  }
  if (payload.maxMarks != null && (!Number.isFinite(Number(payload.maxMarks)) || Number(payload.maxMarks) < 1 || Number(payload.maxMarks) > 1000)) return null;
  clean.maxMarks = Math.max(1, Math.min(1000, Number(payload.maxMarks) || 10));
  if (payload.image != null) {
    if (!payload.image || typeof payload.image !== "object" || Array.isArray(payload.image) ||
        payload.image.mimeType !== "image/jpeg" || typeof payload.image.data !== "string" ||
        !payload.image.data.length ||
        payload.image.data.length > MAX_IMAGE_CHARS ||
        !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(payload.image.data)) return null;
    clean.image = { mimeType: "image/jpeg", data: payload.image.data };
  }
  if (clean.mode === "ask" && !clean.studentQuestion.trim()) return null;
  if (clean.mode === "mark" && !clean.officialSolution.trim()) return null;
  if (clean.mode !== "ask" && !clean.question.trim()) return null;
  if (Array.isArray(payload.history)) {
    clean.history = payload.history.slice(-4).filter(entry =>
      entry && ["user", "assistant"].includes(entry.role) && typeof entry.content === "string"
    ).map(entry => ({ role: entry.role, content: entry.content.slice(0, 400) }));
  }
  return clean;
}

function tutorMessage(payload) {
  const modeInstructions = {
    explain: "Explain the page's concept in 4-6 short lines and include one tiny example.",
    hint: "Give exactly ONE hint. Never provide the final answer.",
    check: "Check the learner's working line by line.",
    similar: "Write a new question based on the page using different numbers. Then write the exact delimiter ===TUTOR-ANSWER=== on its own line, followed by the new question's answer. Keep the answer brief.",
    ask: "Answer the learner's specific question using only the supplied page.",
    mark: "Return the required marking JSON only. Mark only against the supplied official solution."
  };
  return [
    `Mode: ${payload.mode}`,
    ...(payload.pdfStudy ? [`Task instructions: ${modeInstructions[payload.mode]}`] : []),
    `Topic: ${payload.topic || "Maths"}`,
    `Resource title: ${payload.resourceTitle || "not supplied"}`,
    `Level: ${payload.level || "not given"}`,
    `Exercise context (untrusted): ${JSON.stringify(payload.question || "not supplied")}`,
    ...(payload.mode === "mark" ? [`Official solution (untrusted): ${JSON.stringify(payload.officialSolution || "not supplied")}`, `Maximum marks: ${payload.maxMarks}`] : []),
    `Learner question (untrusted): ${JSON.stringify(payload.studentQuestion || "not supplied")}`,
    `Learner answer (untrusted): ${JSON.stringify(payload.studentAnswer || "not supplied")}`,
    `Learner working (untrusted): ${JSON.stringify(payload.studentWorking || "not supplied")}`,
    `Conversation excerpt (untrusted): ${JSON.stringify(payload.history || [])}`
  ].join("\n");
}

function withholdMarkedAnswers(text) {
  const lines = String(text || "").replace(/\r/g, "").split("\n");
  const marker = /^\s*(?:[-*#>]\s*)?(?:(?:final|correct|worked)\s+)?(?:answer|solution|steps|working|result)\s*[:=\-]/i;
  const markerIndex = lines.findIndex(line => marker.test(line));
  const safeLines = markerIndex < 0 ? lines : lines.slice(0, markerIndex);
  return safeLines.join("\n").replace(/\s+(?:(?:final|correct|worked)\s+)?(?:answer|solution|steps|working|result)\s*[:=\-][\s\S]*$/i, "").trim();
}

function plainMathText(text) {
  return String(text || "")
    .replace(/\\\[([\s\S]*?)\\\]|\\\(([\s\S]*?)\\\)|\$([^$\n]+)\$/g, (_, display, inline, dollars) =>
      String(display || inline || dollars).replace(/\s-\s/g, " − "))
    .replace(/\\(?:dfrac|tfrac|frac)\s*\{([^{}]*)\}\s*\{([^{}]*)\}/g, (_, numerator, denominator) =>
      numerator === "1" && denominator === "2" ? "½" : `(${numerator})⁄(${denominator})`)
    .replace(/\\sqrt\s*\{([^{}]*)\}/g, "√($1)")
    .replace(/\\times\b/g, "×").replace(/\\cdot\b/g, "·").replace(/\\div\b/g, "÷")
    .replace(/\\leq?\b/g, "≤").replace(/\\geq?\b/g, "≥").replace(/\\neq\b/g, "≠").replace(/\\approx\b/g, "≈")
    .replace(/\\(?:left|right)\b/g, "").replace(/\\[()[\]]/g, "").replace(/\\[a-zA-Z]+/g, "")
    .replace(/([A-Za-z0-9)])\^\{?([+-]?\d+)\}?/g, (_, base, power) => base + [...power].map(char => ({
      "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹", "-": "⁻", "+": "⁺"
    })[char] || char).join(""))
    .replace(/[{}]/g, "").replace(/\$/g, "");
}

function cleanTutorReply(text) {
  let clean = plainMathText(withholdMarkedAnswers(text)).trim();
  while (/\?\s*$/.test(clean)) {
    const end = clean.lastIndexOf("?");
    const start = Math.max(clean.lastIndexOf(".", end - 1), clean.lastIndexOf("!", end - 1), clean.lastIndexOf("?", end - 1), clean.lastIndexOf("\n", end - 1)) + 1;
    clean = clean.slice(0, start).trim();
  }
  const offer = /(?:would you like|do you want|want to|try this and tell|tell me|let me know|feel free|shall we|if you want)[^.!?]*(?:[.!…]+)?$/i;
  if (offer.test(clean)) {
    const index = clean.search(offer);
    clean = clean.slice(0, index).trim();
  }
  clean = clean.replace(/\s+/g, " ").trim();
  return clean || "Use the same method with a small example using different numbers.";
}

async function callGemini(payload, env, fetcher) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODELS.gemini}:generateContent?key=${encodeURIComponent(env.GEMINI_API_KEY)}`;
  const response = await fetcher(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: payload.mode === "mark" ? MARKING_SYSTEM_PROMPT : payload.pdfStudy ? PDF_SYSTEM_PROMPT : SYSTEM_PROMPT }] },
      contents: [{ role: "user", parts: [
        { text: tutorMessage(payload) },
        ...(payload.image ? [{ inlineData: { mimeType: payload.image.mimeType, data: payload.image.data } }] : [])
      ] }],
      generationConfig: { maxOutputTokens: 360, temperature: 0.25 }
    })
  });
  if (!response.ok) throw new Error("provider-failed");
  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.map(part => part.text || "").join("").trim();
  if (!text) throw new Error("provider-failed");
  return formatProviderReply(text, payload.mode, payload.pdfStudy);
}

async function callGroq(payload, env, fetcher) {
  const response = await fetcher("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${env.GROQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: MODELS.groq,
      messages: [
        { role: "system", content: payload.mode === "mark" ? MARKING_SYSTEM_PROMPT : payload.pdfStudy ? PDF_SYSTEM_PROMPT : SYSTEM_PROMPT },
        { role: "user", content: tutorMessage(payload) }
      ],
      max_completion_tokens: 360,
      temperature: 0.25
    })
  });
  if (!response.ok) throw new Error("provider-failed");
  const data = await response.json();
  const text = data.choices?.[0]?.message?.content?.trim();
  if (!text) throw new Error("provider-failed");
  return formatProviderReply(text, payload.mode, payload.pdfStudy);
}

function formatProviderReply(text, mode, pdfStudy = false) {
  if (mode === "mark") return { text: String(text || "").trim().slice(0, 6000) };
  if (mode === "similar" && pdfStudy) {
    const [questionText, answerText] = String(text || "").split("===TUTOR-ANSWER===");
    const question = String(questionText || "").replace(/^question\s*:\s*/i, "").trim();
    const answer = plainMathText(String(answerText || "").replace(/^\s*(?:answer\s*:\s*)?/i, "").trim());
    if (!question || !answer) throw new Error("provider-failed");
    return { text: question.slice(0, 1400), answer: answer.slice(0, 800) };
  }
  const safeText = cleanTutorReply(text);
  if (!safeText) throw new Error("provider-failed");
  return { text: safeText };
}

function limitWords(text) {
  const words = text.trim().split(/\s+/);
  const limited = words.length > 150 ? `${words.slice(0, 150).join(" ")}…` : text.trim();
  return limited;
}

async function handleRequest(request, env) {
  const origin = request.headers.get("Origin") || "";
  if (request.method === "OPTIONS") {
    return allowedOrigin(origin, env)
      ? new Response(null, { status: 204, headers: corsHeaders(origin, env) })
      : jsonResponse({ ok: false, error: "This site is not allowed to use the tutor." }, 403, origin, env);
  }
  if (!allowedOrigin(origin, env)) return jsonResponse({ ok: false, error: "This site is not allowed to use the tutor." }, 403, origin, env);
  if (request.method !== "POST" || new URL(request.url).pathname !== "/api/tutor") {
    return jsonResponse({ ok: false, error: "Use POST /api/tutor." }, 404, origin, env);
  }
  let payload;
  try {
    const body = await readLimitedBody(request);
    payload = validatePayload(JSON.parse(body));
  } catch (error) {
    if (error.message === "body-too-large") return jsonResponse({ ok: false, error: "This request is too long." }, 413, origin, env);
    return jsonResponse({ ok: false, error: "Please send a valid tutor request." }, 400, origin, env);
  }
  if (!payload) return jsonResponse({ ok: false, error: "Please check the tutor request and try again." }, 400, origin, env);
  const fetcher = env.FETCH || fetch;
  let geminiError = false;
  if (payload.image && !env.GEMINI_API_KEY) {
    return jsonResponse({ ok: false, error: "vision-unavailable" }, 422, origin, env);
  }
  if (env.GEMINI_API_KEY) {
    try {
      const reply = await callGemini(payload, env, fetcher);
      return jsonResponse({
        ok: true,
        text: payload.mode === "mark" ? reply.text : limitWords(reply.text),
        ...(reply.answer ? { answer: limitWords(reply.answer) } : {}),
        provider: "Gemini"
      }, 200, origin, env);
    } catch (_) {
      geminiError = true;
    }
  }
  if (env.GROQ_API_KEY && !payload.image) {
    try {
      const reply = await callGroq(payload, env, fetcher);
      return jsonResponse({
        ok: true,
        text: payload.mode === "mark" ? reply.text : limitWords(reply.text),
        ...(reply.answer ? { answer: limitWords(reply.answer) } : {}),
        provider: "Groq"
      }, 200, origin, env);
    } catch (_) {
      return jsonResponse({ ok: false, error: "AI is busy. Try again in a minute." }, 503, origin, env);
    }
  }
  return jsonResponse({
    ok: false,
    error: geminiError ? "AI is busy. Try again in a minute." : "The tutor is not connected yet."
  }, 503, origin, env);
}

const _testing = { MODELS, validatePayload, withholdMarkedAnswers, cleanTutorReply, plainMathText, tutorMessage, formatProviderReply, MAX_BODY_BYTES, MAX_IMAGE_CHARS };

export { handleRequest as fetch, _testing };
export default { fetch: handleRequest };
