const fs = require("node:fs");
const path = require("node:path");

const questionsPath = path.resolve(__dirname, "..", "audit", "questions.json");
const questions = JSON.parse(fs.readFileSync(questionsPath, "utf8"));
const seen = new Map();
const failures = [];

function plainText(value) {
  return value
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<\/?[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function compact(value) {
  return plainText(value)
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, digit => String("⁰¹²³⁴⁵⁶⁷⁸⁹".indexOf(digit)))
    .replace(/[^a-z0-9]/g, "");
}

for (const question of questions) {
  const explanation = question.explanation || "";
  const normalizedExplanation = plainText(explanation);
  const normalizedKey = compact(explanation);

  if (normalizedExplanation.length < 40) {
    failures.push(`${question.id}: explanation is shorter than 40 characters.`);
  }

  if (seen.has(normalizedKey)) {
    failures.push(`${question.id}: explanation duplicates ${seen.get(normalizedKey)}.`);
  } else {
    seen.set(normalizedKey, question.id);
  }

  const sourceTerms = `${question.question} ${question.storedAnswer}`;
  const candidates = sourceTerms.match(/\d+(?:\.\d+)?|[\p{L}]{3,}|[A-Za-z][⁰¹²³⁴⁵⁶⁷⁸⁹]+|\b[a-z]\b/giu) || [];
  const normalizedCandidates = candidates.map(compact).filter(term => /^\d/.test(term) || /\d/.test(term) || term.length >= 3 || /^[a-z]$/.test(term));
  if (!normalizedCandidates.some(term => normalizedKey.includes(term))) {
    failures.push(`${question.id}: explanation has no number or meaningful term from its question or answer.`);
  }
}

if (failures.length) {
  console.error(failures.join("\n"));
  process.exitCode = 1;
} else {
  console.log(`Checked ${questions.length} explanations: all are long enough, unique, and question-specific.`);
}
