import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const parser = require('../js/exam/question-parser.js');
let pdfjs;
try {
  pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
} catch {
  pdfjs = await import(pathToFileURL(path.join(root, 'worker/node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href);
}

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(filename) : [filename];
  }));
  return nested.flat();
}

function isQuestionPaper(filename) {
  const name = path.basename(filename);
  return /(?:exam|quiz|final|problem|pset)/i.test(name) &&
    !/(?:sol|answer)/i.test(name);
}

async function readTextPages(filename) {
  const standardFonts = pathToFileURL(path.join(root, 'worker/node_modules/pdfjs-dist/standard_fonts/')).href;
  const task = pdfjs.getDocument({ data: new Uint8Array(await readFile(filename)), standardFontDataUrl: standardFonts, verbosity: pdfjs.VerbosityLevel.ERRORS });
  try {
    const document = await task.promise;
    const pages = [];
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const content = await (await document.getPage(pageNumber)).getTextContent();
      pages.push(content.items.map(item => ({ str: item.str, x: item.transform?.[4], y: item.transform?.[5] })));
    }
    return { pages, count: document.numPages };
  } finally {
    await task.destroy();
  }
}

const files = (await walk(path.join(root, 'assets'))).filter(filename => filename.toLowerCase().endsWith('.pdf') && isQuestionPaper(filename)).sort();
assert.ok(files.length > 0, 'exam and problem set PDFs are present');
const rows = [];
let examOneQ5 = null;

for (const filename of files) {
  const { pages, count } = await readTextPages(filename);
  const questions = parser.parseQuestions(pages);
  const sequential = questions.length >= 3 && questions.every((question, index) => question.number === index + 1);
  const relative = path.relative(root, filename).replaceAll(path.sep, '/');
  if (relative === 'assets/mit-calculus/MIT18_01SCF10_exam1.pdf') examOneQ5 = questions.find(question => question.number === 5);
  rows.push({ file: relative, found: sequential ? String(questions.length) : 'fallback: pages', pages: sequential ? questions.map(question => question.page).join(', ') : `1–${count}` });
}

assert.ok(examOneQ5, 'Exam 1 Questions includes question 5');
assert.ok(examOneQ5.text.startsWith('5.'), 'Exam 1 question 5 text starts with 5.');
assert.match(examOneQ5.text.toLowerCase(), /differentiable/, 'Exam 1 question 5 contains differentiable');

const widths = [Math.max(...rows.map(row => row.file.length)), 17, 22];
const line = row => `| ${row.file.padEnd(widths[0])} | ${row.found.padEnd(widths[1])} | ${row.pages.padEnd(widths[2])} |`;
console.log(line({ file: 'file', found: 'questions found', pages: 'page of each question' }));
console.log(`|-${'-'.repeat(widths[0])}-|-${'-'.repeat(widths[1])}-|-${'-'.repeat(widths[2])}-|`);
rows.forEach(row => console.log(line(row)));
console.log(`Parsed ${rows.length} question papers; Exam 1 Q5 check passed.`);
