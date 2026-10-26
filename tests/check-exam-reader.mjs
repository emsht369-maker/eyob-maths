import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const marking = require('../js/exam/marking.js');
const progress = require('../js/exam/reader-progress.js');

const valid = { score: 4, max: 5, verdict: 'partial', feedback: 'Good setup.\nCheck the sign.', first_mistake: '', next_step: 'Recheck the final line.' };
assert.equal(marking.parseMarking(JSON.stringify(valid)).ok, true, 'clean JSON parses');
assert.equal(marking.parseMarking(`\`\`\`json\n${JSON.stringify(valid)}\n\`\`\``).ok, true, 'JSON code fence parses');
assert.equal(marking.parseMarking(`Result follows:\n${JSON.stringify(valid)}\nDone.`).ok, true, 'JSON with extra text parses');
const invalid = marking.parseMarking('The answer is probably right.');
assert.equal(invalid.ok, false, 'invalid text requests retry');
assert.equal(invalid.raw, 'The answer is probably right.');

const state = { awarded: {} };
assert.equal(progress.hasRealAnswer('1234567890', 0), true);
assert.equal(progress.hasRealAnswer('short', 1), true);
assert.equal(progress.awardOnce(state, 'file-a:q1:answer'), true, 'first award is granted');
assert.equal(progress.awardOnce(state, 'file-a:q1:answer'), false, 'repeat award is rejected');
assert.equal(progress.awardOnce(state, 'file-b:q1:answer'), true, 'another file has an independent award');
console.log('Exam reader marking and points checks passed.');
