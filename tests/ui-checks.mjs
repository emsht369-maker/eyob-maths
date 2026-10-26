import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { readFile, readdir, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const { chromium } = require('./node_modules/playwright-core');
const serve = require('./serve-pages-preview');
const parser = require('../js/exam/question-parser.js');
const exam1 = '/assets/mit-calculus/MIT18_01SCF10_exam1.pdf';
const exam1Solutions = '/assets/mit-calculus/MIT18_01SCF10_exam1sol.pdf';
const exam4 = '/assets/mit-calculus/MIT18_01SCF10_exam4.pdf';
const exam4Solutions = '/assets/mit-calculus/MIT18_01SCF10_exam4sol.pdf';
const redirectFile = path.join(root, '_redirects');
const originalRedirects = existsSync(redirectFile) ? await readFile(redirectFile, 'utf8') : null;
const outcomes = [];
let server, browser;

async function check(name, action) {
  try {
    await action();
    outcomes.push(true);
    console.log(`PASS ${name}`);
  } catch (error) {
    outcomes.push(false);
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

async function walkHtml(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => {
    if (entry.isDirectory() && (entry.name === '.git' || entry.name === 'node_modules' || entry.name === 'vendor' || entry.name === 'tests' || entry.name === 'worker' || entry.name.startsWith('backup-'))) return [];
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? walkHtml(filename) : entry.name.endsWith('.html') ? [filename] : [];
  }));
  return nested.flat();
}

async function openReader(page, url, solutionUrl, title, kind = 'questions') {
  await page.evaluate(({ url, solutionUrl, title, kind }) => window.openReader(url, 1, {
    files: [{ url, questionUrl: url, solutionUrl, title, solutionTitle: title.replace(/Questions/i, 'Solutions'), kind }],
    index: 0
  }), { url, solutionUrl, title, kind });
  await page.locator('#mm-pdf-reader[open]').waitFor();
  await page.locator('#mm-pdf-reader canvas').first().waitFor();
}

async function readQuestions(pdfPath) {
  let pdfjs;
  try { pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs'); }
  catch { pdfjs = await import(pathToFileURL(path.join(root, 'worker/node_modules/pdfjs-dist/legacy/build/pdf.mjs')).href); }
  const task = pdfjs.getDocument({ data: new Uint8Array(await readFile(path.join(root, pdfPath.slice(1)))), verbosity: pdfjs.VerbosityLevel.ERRORS });
  try {
    const document = await task.promise, pages = [];
    for (let number = 1; number <= document.numPages; number += 1) {
      const content = await (await document.getPage(number)).getTextContent();
      pages.push(content.items.map(item => ({ str: item.str, x: item.transform?.[4], y: item.transform?.[5] })));
    }
    return parser.parseQuestions(pages);
  } finally { await task.destroy(); }
}

try {
  const routes = originalRedirects || '';
  if (!routes.includes('/topic/*')) await writeFile(redirectFile, `${routes}${routes && !routes.endsWith('\n') ? '\n' : ''}/topic/* /topic/:splat/index.html 200\n`);
  server = await serve(root);
  browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const pageErrors = [];
  page.on('pageerror', error => pageErrors.push(error.message));
  const origin = `http://127.0.0.1:${server.address().port}`;

  await check('shared header identical on every site HTML page', async () => {
    const pages = (await walkHtml(root)).sort();
    const signatures = [];
    for (const filename of pages) {
      const route = `/${path.relative(root, filename).split(path.sep).join('/')}`;
      await page.goto(`${origin}${route}`, { waitUntil: 'domcontentloaded' });
      await page.locator('.site-menu .mm-brand-name').waitFor({ timeout: 12000 });
      signatures.push(await page.locator('.site-menu').evaluate(menu => ({ text: menu.innerText.replace(/\s+/g, ' ').trim(), chips: menu.querySelectorAll(':scope > .nav-points,:scope > .nav-streak').length })));
    }
    assert.ok(pages.length >= 35, `found ${pages.length} site pages`);
    for (const signature of signatures) assert.deepEqual(signature, signatures[0]);
    assert.equal(signatures[0].chips, 2);
    assert.match(signatures[0].text, /Math Master.*Learning rooms.*Courses.*GCSE.*Question Bank.*More/);
  });

  await check('phone header keeps both chips and drawer visible', async () => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.goto(`${origin}/index.html`);
    await page.locator('.site-menu .mm-brand-name').waitFor();
    const header = await page.evaluate(() => ({
      mark: getComputedStyle(document.querySelector('.mm-brand-mark')).display,
      brandName: getComputedStyle(document.querySelector('.mm-brand-name')).display,
      points: getComputedStyle(document.querySelector('.site-menu > .nav-points')).display,
      streak: getComputedStyle(document.querySelector('.site-menu > .nav-streak')).display,
      drawer: getComputedStyle(document.querySelector('.site-menu-drawer > summary')).display,
      overflow: document.documentElement.scrollWidth - innerWidth
    }));
    assert.notEqual(header.mark, 'none');
    assert.equal(header.brandName, 'none');
    assert.notEqual(header.points, 'none');
    assert.notEqual(header.streak, 'none');
    assert.notEqual(header.drawer, 'none');
    assert.equal(header.overflow, 0);
  });

  await check('solutions reader has Tutor-only tools and five modes', async () => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${origin}/index.html`);
    await openReader(page, exam1Solutions, '', 'Exam 1 · Solutions', 'solutions');
    await page.locator('.ai-tutor-buttons button').first().waitFor();
    const controls = await page.evaluate(() => {
      const reader = document.querySelector('#mm-pdf-reader');
      return { kind: reader.dataset.readerKind, answers: reader.querySelector('[data-reader-tab="answers"]').hidden, solutions: reader.querySelector('[data-reader-tab="solutions"]').hidden, submit: [...reader.querySelectorAll('[data-reader-submit]')].some(button => button.getClientRects().length), timer: reader.querySelector('.mm-exam-timer-label').hidden, chips: reader.querySelectorAll('[data-reader-question]').length, tutorModes: reader.querySelectorAll('.ai-tutor-buttons button').length, context: reader.querySelector('.mm-reader-context')?.textContent };
    });
    assert.deepEqual(controls, { kind: 'solutions', answers: true, solutions: true, submit: false, timer: true, chips: 0, tutorModes: 5, context: 'Using page 1 of 6' });
    await page.locator('.mm-pdf-close').click();
  });

  await check('exam cards contain no embedded tutor boxes', async () => {
    await page.goto(`${origin}/topic/calculus/index.html`);
    await page.waitForFunction(() => document.querySelector('.topic-exam-papers'));
    const counts = await page.evaluate(() => ({ cards: document.querySelectorAll('.topic-exam-paper').length, boxes: document.querySelectorAll('.resource-exam-row [data-resource-exam-ai],.resource-exam-row .ai-tutor').length }));
    assert.ok(counts.cards >= 4, `expected exam cards, found ${counts.cards}`);
    assert.equal(counts.boxes, 0);
  });

  await check('Exam 4 list opens fixed reader and restores scroll', async () => {
    await page.evaluate(() => {
      document.querySelectorAll('.topic-flow-panel').forEach(panel => { panel.hidden = true; });
      const exam = document.querySelector('#room-tab-exam');
      if (exam) exam.hidden = false;
    });
    const examLink = page.locator('.topic-exam-paper a[href*="exam4.pdf"]').first();
    await examLink.scrollIntoViewIfNeeded();
    const before = await page.evaluate(() => window.scrollY);
    await examLink.click();
    await page.locator('#mm-pdf-reader[open]').waitFor();
    const rootStyle = await page.locator('#mm-pdf-reader').evaluate(element => ({ position: getComputedStyle(element).position, top: element.getBoundingClientRect().top, backdrop: getComputedStyle(element, '::backdrop').backgroundColor }));
    assert.deepEqual(rootStyle, { position: 'fixed', top: 0, backdrop: 'rgba(2, 5, 9, 0.84)' });
    assert.equal(await page.locator('#mm-pdf-title').textContent(), 'Exam 4 · Questions');
    await page.locator('.mm-pdf-close').click();
    await page.waitForFunction(() => !document.querySelector('#mm-pdf-reader')?.open);
    assert.equal(await page.evaluate(() => window.scrollY), before);
  });

  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 412, height: 915 }, { width: 360, height: 640 }]) {
    await check(`responsive reader ${viewport.width}x${viewport.height}`, async () => {
      await page.setViewportSize(viewport);
      await page.goto(`${origin}/index.html`);
      await openReader(page, exam1, exam1Solutions, 'Exam 1 · Questions');
      assert.equal(await page.locator('#mm-pdf-reader').evaluate(element => getComputedStyle(element).position), 'fixed');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true);
      const fitButtons = page.locator('.mm-pdf-toolbar button:nth-last-child(-n+3)');
      assert.equal(await fitButtons.count(), 3);
      if (viewport.width < 900) assert.equal(await fitButtons.evaluateAll(buttons => buttons.every(button => getComputedStyle(button).display !== 'none' && parseFloat(getComputedStyle(button).width) >= 44)), true);
      await page.locator('.mm-pdf-close').click();
    });
  }

  await check('phone sheet has one chip row and one vertical scroller', async () => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto(`${origin}/index.html`);
    await openReader(page, exam1, exam1Solutions, 'Exam 1 · Questions');
    await page.locator('[data-reader-question="5"]:visible').first().click();
    const answer = page.locator('#mm-pdf-reader textarea[data-answer-id]').first();
    await answer.focus();
    const state = await page.evaluate(() => {
      const reader = document.querySelector('#mm-pdf-reader'), panel = reader.querySelector('[data-exam-panel]');
      const chipRows = [...reader.querySelectorAll('.mm-exam-chips,.mm-exam-mobile-chips,.mm-reader-tutor-chips')].filter(row => row.getClientRects().length && row.querySelectorAll('[data-reader-question]').length);
      const scrollers = [...panel.querySelectorAll('*')].filter(element => ['auto','scroll'].includes(getComputedStyle(element).overflowY) && element.scrollHeight > element.clientHeight + 2);
      return { dock: reader.querySelector('.mm-exam-dock .is-active')?.dataset.readerDock, chipRows: chipRows.length, count: chipRows[0]?.querySelectorAll('[data-reader-question]').length, allChips: reader.querySelectorAll('[data-reader-mobile-chips] [data-reader-question]').length, scrollers: scrollers.map(element => element.className), minHeight: parseFloat(getComputedStyle(reader.querySelector('textarea[data-answer-id]')).minHeight) };
    });
    assert.equal(state.dock, 'answers');
    assert.equal(state.chipRows, 1);
    assert.equal(state.count, state.allChips);
    assert.equal(state.scrollers.length, 1);
    assert.ok(state.minHeight >= 96);
    await page.locator('[data-reader-dock="tutor"]').click();
    await page.locator('.ai-tutor-buttons button').first().waitFor();
    assert.equal(await page.locator('.mm-reader-context').textContent(), 'Using Question 5');
    assert.equal(await page.locator('#mm-pdf-reader .mm-reader-tutor-chips').count(), 0);
    assert.equal(await page.locator('.mm-exam-dock .is-active').getAttribute('data-reader-dock'), 'tutor');
    await page.locator('[data-reader-dock="question"]').click();
    assert.equal(await page.locator('.mm-exam-dock .is-active').getAttribute('data-reader-dock'), 'question');
    await page.locator('[data-reader-dock="answers"]').click();
    assert.equal(await page.locator('.mm-exam-dock .is-active').getAttribute('data-reader-dock'), 'answers');
    await page.locator('.mm-pdf-close').click();
  });

  await check('Exam 4 Fit text is at least 1.3 times wider', async () => {
    await page.setViewportSize({ width: 412, height: 915 });
    await page.goto(`${origin}/index.html`);
    await openReader(page, exam4, exam4Solutions, 'Exam 4 · Questions');
    const pageOne = page.locator('.mm-pdf-page[data-pdf-page-container="1"]');
    const fitText = await pageOne.evaluate(element => ({ mode: element.dataset.fitMode, width: Number(element.dataset.renderedTextWidth) }));
    assert.equal(fitText.mode, 'text');
    await page.locator('[data-pdf-fit]').click();
    await page.waitForFunction(previous => { const element = document.querySelector('.mm-pdf-page[data-pdf-page-container="1"]'); return element?.dataset.fitMode === 'width' && Number(element.dataset.renderedTextWidth) < previous * .95; }, fitText.width);
    const fitWidth = await pageOne.evaluate(element => Number(element.dataset.renderedTextWidth));
    assert.ok(fitText.width / fitWidth >= 1.3, `ratio ${(fitText.width / fitWidth).toFixed(2)}`);
    await page.locator('.mm-pdf-close').click();
  });

  await check('unanswered submitted questions have no mark controls', async () => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${origin}/index.html`);
    await page.evaluate(() => { localStorage.clear(); window.confirm = () => true; });
    await openReader(page, exam1, exam1Solutions, 'Exam 1 · Questions');
    await page.locator('[data-reader-submit]:visible').first().click();
    await page.locator('.mm-reader-results').waitFor();
    assert.equal(await page.locator('.mm-reader-results h3').textContent(), 'Not marked yet');
    assert.equal(await page.locator('.mm-reader-result-card').count(), 6);
    assert.equal(await page.locator('.mm-reader-result-card .mm-reader-self-mark').count(), 0);
    assert.equal(await page.locator('.mm-reader-result-card').filter({ hasText: 'No answer' }).count(), 6);
    assert.equal(await page.locator('[data-mark-ai]').count(), 0);
    await page.locator('.mm-pdf-close').click();
  });

  await check('Tutor Q5 request contains only Question 5 text', async () => {
    const questions = await readQuestions(exam1);
    const questionFive = questions.find(question => question.number === 5);
    let payload = null;
    await page.route('**/api/tutor', async route => {
      payload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true, text: 'Use the definition of differentiability at the joining points.' }) });
    });
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto(`${origin}/index.html`);
    await openReader(page, exam1, exam1Solutions, 'Exam 1 · Questions');
    await page.locator('[data-reader-question="5"]:visible').first().click();
    await page.locator('[data-reader-tab="tutor"]').click();
    await page.locator('.ai-tutor-buttons button').filter({ hasText: 'Teach me the idea' }).click();
    await page.waitForFunction(() => document.querySelector('.ai-tutor-answer:not([hidden])'));
    assert.ok(payload, 'tutor request reached the intercepted route');
    assert.ok(payload.question.startsWith('5.'));
    assert.match(payload.question.toLowerCase(), /differentiable/);
    assert.equal(payload.question, questionFive.text);
    await page.unroute('**/api/tutor');
    await page.locator('.mm-pdf-close').click();
  });

  await check('browser has no uncaught page errors', async () => assert.deepEqual(pageErrors, []));
} finally {
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
  if (originalRedirects === null) await unlink(redirectFile).catch(() => {});
  else await writeFile(redirectFile, originalRedirects);
}

if (outcomes.some(ok => !ok)) process.exitCode = 1;
