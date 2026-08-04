const POS_ALIASES = {
  n: ['n', 'noun'],
  v: ['v', 'verb'],
  adj: ['adj', 'adjective'],
  adv: ['adv', 'adverb'],
  phrase: ['phrase'],
};

export function normalizedPos(word) {
  const raw = (word.partOfSpeech || '').toLowerCase().trim();
  for (const [short, variants] of Object.entries(POS_ALIASES)) {
    if (variants.includes(raw)) return short;
  }
  return raw;
}

export function firstLetter(word) {
  const w = (word.englishWord || '').trim();
  return w ? w[0].toUpperCase() : '';
}

export function filterWords(words, filters) {
  const { letters, pos, difficulty, search } = filters;
  const searchLower = search.trim().toLowerCase();

  return words.filter((w) => {
    if (letters.length > 0 && !letters.includes(firstLetter(w))) return false;
    if (pos.length > 0 && !pos.includes(normalizedPos(w))) return false;
    if (difficulty.length > 0 && !difficulty.includes(w.difficulty || 1)) return false;
    if (searchLower) {
      const inEnglish = (w.englishWord || '').toLowerCase().includes(searchLower);
      const inHebrew = (w.hebrewTranslation || '').includes(search.trim());
      if (!inEnglish && !inHebrew) return false;
    }
    return true;
  });
}

export const POS_OPTIONS = [
  { key: 'n', label: 'שם עצם' },
  { key: 'v', label: 'פועל' },
  { key: 'adj', label: 'שם תואר' },
  { key: 'adv', label: 'תואר פועל' },
  { key: 'phrase', label: 'ביטוי' },
];

export const LETTER_OPTIONS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
export const DIFFICULTY_OPTIONS = [1, 2, 3];
