// בדיקות ל"תוכן מותאם לבתי ספר דתיים" באשף המשימות — npm test.
import test from 'node:test';
import assert from 'node:assert/strict';
import { hidesSensitive, isSensitive, visibleWords } from './contentFilter.js';

const words = [
  { id: 'a', englishWord: 'apple', tags: 'Food' },
  { id: 'g', englishWord: 'gun', tags: 'General, sensitive' },
  { id: 'v', englishWord: 'violence', tags: 'School, sensitive' },
];

test('switch OFF (default): the wizard shows every word', () => {
  assert.equal(hidesSensitive({}), false);
  assert.deepEqual(visibleWords(words, hidesSensitive({})).map((w) => w.id), ['a', 'g', 'v']);
});

test('switch ON: the wizard does not show sensitive words, so they cannot be selected', () => {
  const inst = { hideSensitiveWords: true };
  assert.deepEqual(visibleWords(words, hidesSensitive(inst)).map((w) => w.id), ['a']);
  assert.equal(isSensitive(words[1]), true);
});
