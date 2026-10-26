(function (root, factory) {
  const api = factory();
  if (typeof module !== "undefined" && module.exports) module.exports = api;
  root.MathMasterQuestionParser = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function number(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function linesFromItems(items) {
    const rows = [];
    (items || []).forEach(item => {
      const str = String(item?.str || "").trim();
      if (!str) return;
      const y = number(item.y ?? item.transform?.[5]);
      const x = number(item.x ?? item.transform?.[4]);
      let row = rows.find(candidate => Math.abs(candidate.y - y) <= 2);
      if (!row) {
        row = { y, items: [] };
        rows.push(row);
      }
      row.items.push({ x, str });
    });
    return rows.sort((a, b) => b.y - a.y).map(row => row.items
      .sort((a, b) => a.x - b.x)
      .map(item => item.str)
      .join(" ")
      .replace(/\s+/g, " ")
      .trim()
    ).filter(Boolean);
  }

  function partsFromText(text) {
    const seen = new Set();
    const parts = [];
    for (const match of String(text).matchAll(/\(([a-z])\)/gi)) {
      const part = match[1].toLowerCase();
      if (!seen.has(part)) {
        seen.add(part);
        parts.push(part);
      }
    }
    return parts;
  }

  function marksFromText(text) {
    const matches = String(text).match(/\((\d+)\s*points?\)/gi) || [];
    const total = matches.reduce((sum, match) => sum + Number(match.match(/\d+/)?.[0] || 0), 0);
    return total || null;
  }

  function parseQuestions(pages) {
    const questions = [];
    let expected = 1;
    let active = null;
    (pages || []).forEach((pageItems, pageIndex) => {
      const page = pageIndex + 1;
      linesFromItems(pageItems).forEach(line => {
        const match = line.match(/^\s*(?:Problem|Question|Q)?\s*(\d{1,2})\s*[.):]\s+\S/i);
        if (match && Number(match[1]) === expected) {
          if (active) questions.push(active);
          active = { id: String(expected), number: expected, page, text: line, maxMarks: null, parts: [] };
          expected += 1;
        } else if (active) {
          active.text += `\n${line}`;
        }
      });
    });
    if (active) questions.push(active);
    questions.forEach(question => {
      question.maxMarks = marksFromText(question.text);
      question.parts = partsFromText(question.text);
    });
    return questions;
  }

  return Object.freeze({ linesFromItems, parseQuestions, partsFromText, marksFromText });
});
