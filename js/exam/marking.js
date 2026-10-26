(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MathMasterExamMarking = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function stripCodeFence(value) {
    return String(value || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "").trim();
  }

  function parseMarking(value, fallbackMax = 10) {
    const text = stripCodeFence(value);
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) return { ok: false, raw: text };
    try {
      const data = JSON.parse(match[0]);
      const score = Number(data.score);
      const max = Number(data.max || fallbackMax);
      if (!Number.isFinite(score) || !Number.isFinite(max) || !["correct", "partial", "incorrect", "unreadable"].includes(data.verdict)) {
        return { ok: false, raw: text };
      }
      return {
        ok: true,
        value: {
          score: Math.max(0, Math.min(score, max)),
          max: Math.max(1, max),
          verdict: data.verdict,
          feedback: String(data.feedback || "").split(/\n+/).filter(Boolean).slice(0, 3).join("\n"),
          first_mistake: String(data.first_mistake || "").slice(0, 500),
          next_step: String(data.next_step || "").slice(0, 500)
        }
      };
    } catch (_) {
      return { ok: false, raw: text };
    }
  }

  return Object.freeze({ stripCodeFence, parseMarking });
});
