import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const require = createRequire(import.meta.url);
const { chromium } = require('./node_modules/playwright-core');
const serve = require('./serve-pages-preview');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
await writeFile(path.join(root, '_redirects'), '/topic/* /topic/:splat/index.html 200\n');
const server = await serve(root);
const browser = await chromium.launch({ headless: true, executablePath: '/usr/bin/google-chrome', args: ['--no-sandbox'] });
const questionUrl = '/assets/mit-calculus/MIT18_01SCF10_exam1.pdf';
const solutionUrl = '/assets/mit-calculus/MIT18_01SCF10_exam1sol.pdf';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jXioAAAAASUVORK5CYII=', 'base64');
try {
  const page = await browser.newPage();
  page.on('pageerror', error => { throw error; });
  await page.goto(`http://127.0.0.1:${server.address().port}/index.html`);
  for (const viewport of [{ width: 1920, height: 1080 }, { width: 1280, height: 720 }, { width: 412, height: 915 }, { width: 360, height: 640 }]) {
    await page.setViewportSize(viewport);
    await page.evaluate(() => localStorage.clear());
    await page.evaluate(() => window.scrollTo(0, Math.min(500, document.documentElement.scrollHeight - innerHeight)));
    const scrollBeforeOpen = await page.evaluate(() => window.scrollY);
    await page.evaluate(({ questionUrl, solutionUrl }) => window.openReader(questionUrl, 1, { files: [{ url: questionUrl, questionUrl, solutionUrl, title: 'Exam 1 · Questions', solutionTitle: 'Exam 1 · Solutions' }], index: 0 }), { questionUrl, solutionUrl });
    await page.locator('#mm-pdf-reader[open]').waitFor();
    const overlay = await page.locator('#mm-pdf-reader').evaluate(element => ({ position: getComputedStyle(element).position, top: element.getBoundingClientRect().top, backdrop: getComputedStyle(element, '::backdrop').backgroundColor }));
    assert.equal(overlay.position, 'fixed', `reader root is fixed at ${viewport.width}`);
    assert.equal(overlay.top, 0, `reader fills from top at ${viewport.width}`);
    assert.notEqual(overlay.backdrop, 'rgba(0, 0, 0, 0)', `reader backdrop is visible at ${viewport.width}`);
    await page.locator('[data-reader-question="5"]:visible').first().waitFor();
    await page.locator('[data-reader-question="5"]:visible').first().click();
    const answer = page.locator('#mm-pdf-reader textarea[data-answer-id]').first();
    await answer.waitFor();
    await page.waitForFunction(() => document.querySelector('#mm-pdf-reader [data-pdf-page]').value === '5' && document.activeElement?.matches('textarea[data-answer-id]'));
    await answer.fill('1234567890 working answer');
    await answer.evaluate(el => el.blur());
    await page.locator('[data-reader-photo]').setInputFiles({ name: 'working.png', mimeType: 'image/png', buffer: png });
    await page.waitForTimeout(1000);
    const photoStatus = await page.locator('[data-photo-status]').textContent();
    const photoDebug = await page.evaluate(() => ({ inputCount: document.querySelectorAll('[data-reader-photo]').length, fileCount: document.querySelector('[data-reader-photo]')?.files?.length, cardQuestion: document.querySelector('.mm-reader-answer-card strong')?.textContent, statusCount: document.querySelectorAll('[data-photo-status]').length, active: document.activeElement?.outerHTML?.slice(0, 160) }));
    assert.equal(photoStatus, 'Photo saved', `photo upload failed at ${viewport.width}: ${JSON.stringify({ photoStatus, photoDebug })}`);
    await page.evaluate(() => { window.confirm = () => true; });
    await page.locator('#mm-pdf-reader [data-reader-submit]:visible').first().click();
    await page.locator('.mm-reader-results').waitFor();
    await page.locator('[data-question-id="1"][data-self-mark="correct"]').click();
    assert.equal(await page.locator('.mm-reader-result-card.is-correct').count(), 1, `results mark persists at ${viewport.width}`);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), true, `no horizontal overflow at ${viewport.width}`);
    if (viewport.width < 900) {
      await page.locator('[data-reader-dock="answers"]').click();
      await page.locator('#mm-pdf-reader textarea[data-answer-id]').first().focus();
    }
    await page.reload();
    await page.evaluate(({ questionUrl, solutionUrl }) => window.openReader(questionUrl, 1, { files: [{ url: questionUrl, questionUrl, solutionUrl, title: 'Exam 1 · Questions', solutionTitle: 'Exam 1 · Solutions' }], index: 0 }), { questionUrl, solutionUrl });
    await page.locator('#mm-pdf-reader[open]').waitFor();
    await page.locator('[data-reader-question="5"]:visible').first().waitFor();
    await page.locator('[data-reader-question="5"]:visible').first().click();
    assert.match(await page.locator('#mm-pdf-reader textarea[data-answer-id]').first().inputValue(), /1234567890/, `answer persists at ${viewport.width}`);
    await page.locator('.mm-reader-photos img').first().waitFor();
    if (viewport.width < 900) {
      await page.locator('[data-reader-dock="answers"]').click();
      await page.locator('#mm-pdf-reader textarea[data-answer-id]').first().focus();
      const visible = await page.locator('#mm-pdf-reader textarea[data-answer-id]').first().evaluate(el => { const r = el.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight; });
      assert.equal(visible, true, `focused answer remains visible at phone size ${viewport.width}`);
    }
    console.log(`PASS ${viewport.width}x${viewport.height}`);
    await page.locator('.mm-pdf-close').click();
    await page.waitForFunction(() => !document.querySelector('#mm-pdf-reader')?.open);
    assert.equal(await page.evaluate(() => window.scrollY), scrollBeforeOpen, `scroll position restores at ${viewport.width}`);
  }
  await page.setViewportSize({ width: 412, height: 450 });
  await page.evaluate(({ questionUrl, solutionUrl }) => window.openReader(questionUrl, 1, { files: [{ url: questionUrl, questionUrl, solutionUrl, title: 'Exam 1 · Questions', solutionTitle: 'Exam 1 · Solutions' }], index: 0 }), { questionUrl, solutionUrl });
  await page.locator('#mm-pdf-reader[open]').waitFor();
  await page.locator('[data-reader-dock="answers"]').click();
  const field = page.locator('#mm-pdf-reader textarea[data-answer-id]').first();
  await field.focus();
  assert.equal(await field.evaluate(el => { const r = el.getBoundingClientRect(); return r.bottom >= 0 && r.top <= innerHeight; }), true, 'answer box stays visible at 450px viewport height');
  console.log('PASS 412x450 keyboard focus');
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
  await unlink(path.join(root, '_redirects')).catch(() => {});
}
