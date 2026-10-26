const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const auditDirectory = path.join(root, "audit");
fs.mkdirSync(auditDirectory, { recursive: true });

const window = { L: [] };
const context = { window, L: window.L };
vm.createContext(context);

for (const file of ["js/data.js", "js/more-questions.js"]) {
  vm.runInContext(fs.readFileSync(path.join(root, file), "utf8"), context, {
    filename: file
  });
}

for (let index = 0; index < 25; index += 1) {
  const file = path.join(root, "js", "lessons", `${String(index + 1).padStart(2, "0")}.js`);
  if (!fs.existsSync(file)) {
    throw new Error(`Missing lesson file: ${path.relative(root, file)}`);
  }
  vm.runInContext(fs.readFileSync(file, "utf8"), context, {
    filename: path.relative(root, file)
  });
}

const topics = vm.runInContext("TOPICS", context);
const extraQuestions = window.MORE_QUESTIONS;
const questionRecords = [];

for (let topicIndex = 0; topicIndex < topics.length; topicIndex += 1) {
  const lesson = window.L[topicIndex] || {};
  const sourceQuestions = lesson.q || topics[topicIndex][5] || [];
  const questions = sourceQuestions.concat(extraQuestions[topicIndex] || []);

  questions.forEach((question, questionIndex) => {
    const hint = question[2] || "Use the topic rule to work one step at a time.";
    const explanation = question[3] || [
      "<p>1. Identify the operation or relationship the question asks about.",
      `<br>2. Use this rule: ${hint} This rule fits because it matches that operation.`,
      "<br>3. Apply the rule to the values in the question and simplify.",
      `<br>4. Check the result against the question.<br><b>Answer: ${question[1]}</b></p>`
    ].join("");

    questionRecords.push({
      id: `T${String(topicIndex + 1).padStart(2, "0")}-Q${String(questionIndex + 1).padStart(3, "0")}`,
      topic: topics[topicIndex][1],
      level: question[4] || (questionIndex < 10 ? "E" : questionIndex < 25 ? "M" : "H"),
      question: question[0],
      storedAnswer: question[1],
      hint,
      explanation
    });
  });
}

const outputPath = path.join(auditDirectory, "questions.json");
fs.writeFileSync(outputPath, `${JSON.stringify(questionRecords, null, 2)}\n`);
console.log(`Exported ${questionRecords.length} practice questions from ${topics.length} topics to ${path.relative(root, outputPath)}.`);
