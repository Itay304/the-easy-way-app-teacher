import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mergeSources, dedupeByEnglish, sourceCount, checkSelection } from './assignmentWords.js';

test('mergeSources + dedupeByEnglish: same English word from two lists goes in once (first list)', () => {
  const merged = mergeSources([
    {
      listId: 'B1',
      listSource: 'global',
      name: 'Band 1',
      words: [
        { id: 'a', englishWord: 'Happy' },
        { id: 'b', englishWord: 'sad' },
      ],
    },
    {
      listId: 'C1',
      listSource: 'custom',
      name: 'שלנו',
      words: [
        { id: 'x', englishWord: 'happy ' },
        { id: 'y', englishWord: 'tall' },
      ],
    },
  ]);
  const { kept, duplicates } = dedupeByEnglish(merged);
  assert.deepEqual(
    kept.map((w) => `${w.listId}/${w.id}`),
    ['B1/a', 'B1/b', 'C1/y'],
  );
  assert.equal(duplicates, 1);
  assert.equal(sourceCount(kept), 2);
  assert.equal(kept[2].sourceName, 'שלנו');
});

test('checkSelection: 300 ok; 301 needs the large checkbox; 1,001 blocked', () => {
  assert.equal(checkSelection({ count: 300, sources: 1 }).error, null);
  const big = checkSelection({ count: 301, sources: 1 });
  assert.equal(big.large, true);
  assert.match(big.error, /300/);
  assert.equal(checkSelection({ count: 301, sources: 1, ackLarge: true }).error, null);
  const over = checkSelection({ count: 1001, sources: 1, ackLarge: true });
  assert.equal(over.tooMany, true);
  assert.match(over.error, /1,000.*1,001/);
});

test('checkSelection: several lists need the mixed checkbox', () => {
  assert.match(checkSelection({ count: 20, sources: 2 }).error, /כמה רשימות/);
  assert.equal(checkSelection({ count: 20, sources: 2, ackMixed: true }).error, null);
});

test('checkSelection: nothing selected', () => {
  assert.match(checkSelection({ count: 0, sources: 0 }).error, /לפחות מילה/);
});
