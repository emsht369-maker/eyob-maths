(function() {
  "use strict";

  const UNIT_RE = /(cm|mm|km|m|kg|g|lb|lbs|%|£|€|\$|degrees?|deg|°)$/i;
  function unitOf(value) {
    const raw = String(value == null ? "" : value).trim().toLowerCase().replace(/\s+/g, "");
    const prefix = raw.match(/^[£€$]/);
    const suffix = raw.match(/(lbs?|kg|cm|mm|km|m|g|%|degrees?|deg|°)$/);
    if (prefix) return prefix[0];
    if (!suffix) return "";
    return suffix[1] === "°" ? "deg" : suffix[1];
  }

  function normalize(value) {
    return String(value == null ? "" : value).trim().toLowerCase()
      .replace(/[−﹣－‐‑‒–—]/g, "-")
      .replace(/[×·]/g, "*").replace(/÷/g, "/")
      .replace(/,/g, "").replace(/\s+/g, "")
      .replace(/°/g, "deg")
      .replace(/^[£€$]/, "")
      .replace(UNIT_RE, "");
  }

  function comparable(value) {
    let text = normalize(value);
    if (!text) return null;
    const equal = text.match(/^(?:[a-z]\w*=)(.+)$/);
    if (equal) text = equal[1];
    if (/^[-+]?\d*\.?\d+\/[-+]?\d*\.?\d+$/.test(text)) {
      const [a, b] = text.split("/").map(Number);
      return b === 0 ? null : a / b;
    }
    const sqrt = text.match(/^sqrt\(([-+]?\d*\.?\d+)\)$/);
    if (sqrt) return Math.sqrt(Number(sqrt[1]));
    if (/^[-+]?\d*\.?\d+(?:e[-+]?\d+)?$/.test(text)) return Number(text);
    return null;
  }

  function canonicalExpression(value) {
    return normalize(value)
      .replace(/(^|[^a-z])(-?\d+(?:\.\d+)?)\/(-?\d+(?:\.\d+)?)(?=$|[a-z+\-])/g, (match, prefix, top, bottom) => {
        const denominator = Number(bottom);
        return denominator === 0 ? match : prefix + String(Number(top) / denominator);
      })
      .replace(/-?\d+\.\d+/g, number => String(Number(number)));
  }

  function correct(expected, submitted, options) {
    if (submitted == null || String(submitted).trim() === "") return false;
    const settings = options || {};
    const candidates = [expected].concat(settings.accept || []);
    const actual = normalize(submitted);
    for (const candidate of candidates) {
      const expectedUnit = unitOf(candidate), submittedUnit = unitOf(submitted);
      if (expectedUnit && submittedUnit && expectedUnit !== submittedUnit) continue;
      const wanted = normalize(candidate);
      if (wanted === actual) return true;
      if (canonicalExpression(candidate) === canonicalExpression(submitted)) return true;
      const a = comparable(candidate), b = comparable(submitted);
      if (a !== null && b !== null && Math.abs(a - b) <= (Number(settings.tolerance) || 1e-8)) return true;
    }
    return false;
  }

  window.VisualChecker = { normalize, comparable, canonicalExpression, correct };
}());
