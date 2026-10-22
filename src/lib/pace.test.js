// מריצים: npm test (node --test)
import test from 'node:test';
import assert from 'node:assert/strict';
import { creationPace, stageCount } from './pace.js';

const now = Date.parse('2026-10-22T09:00:00Z');

test('stage count matches the server split (10–15 words per stage)', () => {
  assert.equal(stageCount(150), 10);
  assert.equal(stageCount(17), 1);
  assert.equal(stageCount(31), 3);
  assert.equal(stageCount(300), 20);
});

test('pace: words per day until the due date, warning above 20', () => {
  assert.equal(creationPace(150, null, now), null);
  assert.deepEqual(creationPace(150, Date.parse('2026-10-31T09:00:00Z'), now), { days: 10, wordsPerDay: 15, tooFast: false, pastDue: false });
  assert.deepEqual(creationPace(100, Date.parse('2026-10-26T09:00:00Z'), now), { days: 5, wordsPerDay: 20, tooFast: false, pastDue: false });
  assert.equal(creationPace(101, Date.parse('2026-10-26T09:00:00Z'), now).tooFast, true);
  assert.equal(creationPace(150, Date.parse('2026-10-20T09:00:00Z'), now).pastDue, true);
});
