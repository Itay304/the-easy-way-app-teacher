import { useEffect, useState } from 'react';
import { getWordsForList, getCustomListWords, callGetClassHardWords } from '../../../lib/api.js';
import { filterWords, POS_OPTIONS, LETTER_OPTIONS, DIFFICULTY_OPTIONS } from '../../../lib/wordFilters.js';
import LoadingSpinner from '../../LoadingSpinner.jsx';

function toggle(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function StepFilter({
  institutionId,
  classes,
  source,
  filters,
  onFiltersChange,
  onMatchedWordsChange,
  onBack,
  onNext,
}) {
  const [allWords, setAllWords] = useState(null);
  const [hardWordClassId, setHardWordClassId] = useState('');
  const [hardWords, setHardWords] = useState([]);

  useEffect(() => {
    const loader =
      source.sourceType === 'wordList'
        ? getWordsForList(source.listId)
        : getCustomListWords(institutionId, source.listId);
    loader.then(setAllWords);
  }, [institutionId, source]);

  useEffect(() => {
    if (!filters.hardWordsForClass || !hardWordClassId) {
      setHardWords([]);
      return;
    }
    callGetClassHardWords({ classId: hardWordClassId, institutionId }).then((res) =>
      setHardWords(res.data.words.map((w) => w.englishWord)),
    );
  }, [filters.hardWordsForClass, hardWordClassId, institutionId]);

  const filtered = allWords ? filterWords(allWords, filters) : [];
  const hardWordDocs = allWords ? allWords.filter((w) => hardWords.includes(w.englishWord)) : [];
  const matched = Array.from(new Map([...filtered, ...hardWordDocs].map((w) => [w.id, w])).values());

  useEffect(() => {
    onMatchedWordsChange(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, filters, hardWords]);

  if (allWords === null) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-bold text-brand-text">שלב 2: סינון (אופציונלי)</h2>

      <div>
        <p className="text-sm font-semibold text-brand-text mb-2">אות התחלה</p>
        <div className="flex flex-wrap gap-1.5">
          {LETTER_OPTIONS.map((letter) => (
            <button
              key={letter}
              onClick={() => onFiltersChange({ ...filters, letters: toggle(filters.letters, letter) })}
              className={`h-8 w-8 rounded-lg text-sm font-semibold ${
                filters.letters.includes(letter)
                  ? 'bg-brand-green text-white'
                  : 'bg-brand-grey-light text-brand-text'
              }`}
            >
              {letter}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-brand-text mb-2">חלק דיבר</p>
        <div className="flex flex-wrap gap-2">
          {POS_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              onClick={() => onFiltersChange({ ...filters, pos: toggle(filters.pos, opt.key) })}
              className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                filters.pos.includes(opt.key)
                  ? 'bg-brand-green text-white'
                  : 'bg-brand-grey-light text-brand-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-brand-text mb-2">קושי</p>
        <div className="flex gap-2">
          {DIFFICULTY_OPTIONS.map((d) => (
            <button
              key={d}
              onClick={() => onFiltersChange({ ...filters, difficulty: toggle(filters.difficulty, d) })}
              className={`px-4 py-1.5 rounded-full text-sm font-medium ${
                filters.difficulty.includes(d)
                  ? 'bg-brand-green text-white'
                  : 'bg-brand-grey-light text-brand-text'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div>
        <input
          value={filters.search}
          onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
          placeholder="חיפוש חופשי (אנגלית/עברית)"
          className="w-full rounded-xl border border-black/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div className="rounded-xl bg-brand-grey-light p-3 space-y-2">
        <label className="flex items-center gap-2 text-sm font-semibold text-brand-text">
          <input
            type="checkbox"
            checked={filters.hardWordsForClass}
            onChange={(e) => onFiltersChange({ ...filters, hardWordsForClass: e.target.checked })}
          />
          הוסף מילים קשות לכיתה זו
        </label>
        {filters.hardWordsForClass && (
          <select
            value={hardWordClassId}
            onChange={(e) => setHardWordClassId(e.target.value)}
            className="w-full rounded-lg border border-black/10 px-3 py-2 text-sm"
          >
            <option value="">בחר כיתה...</option>
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <p className="text-center text-sm font-semibold text-brand-turquoise">נמצאו {matched.length} מילים</p>

      <div className="flex gap-3">
        <button onClick={onBack} className="flex-1 py-3 rounded-xl border border-black/10 text-brand-text font-semibold">
          חזרה
        </button>
        <button
          onClick={onNext}
          disabled={matched.length === 0}
          className="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold disabled:opacity-40"
        >
          המשך
        </button>
      </div>
    </div>
  );
}
