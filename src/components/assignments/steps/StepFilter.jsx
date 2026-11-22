import { useEffect, useState } from 'react';
import { getWordsForList, getCustomListWords, callGetClassHardWords } from '../../../lib/api.js';
import { filterWords, POS_OPTIONS, LETTER_OPTIONS, DIFFICULTY_OPTIONS } from '../../../lib/wordFilters.js';
import { mergeSources, dedupeByEnglish, wordKey } from '../../../lib/assignmentWords.js';
import LoadingSpinner from '../../LoadingSpinner.jsx';
import Button from '../../ui/Button.jsx';

// כמה מילים להציג ברשימה שליד המסננים (במחשב) — רשימה של 1,900 שורות מאטה את המודאל
const WORD_PREVIEW_LIMIT = 300;

function toggle(arr, value) {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function StepFilter({
  institutionId,
  classes,
  sources,
  filters,
  onFiltersChange,
  onMatchedWordsChange,
  onBack,
  onNext,
}) {
  const [allWords, setAllWords] = useState(null);
  const [hardWordClassId, setHardWordClassId] = useState('');
  const [hardWords, setHardWords] = useState([]);

  // כל הרשימות שנבחרו (assignments-v2): כל מילה נושאת listId/listSource ושם המקור
  useEffect(() => {
    let cancelled = false;
    Promise.all(
      sources.map(async (s) => ({
        listId: s.listId,
        listSource: s.sourceType === 'customList' ? 'custom' : 'global',
        name: s.name,
        words:
          s.sourceType === 'wordList'
            ? await getWordsForList(s.listId)
            : await getCustomListWords(institutionId, s.listId),
      })),
    ).then((lists) => !cancelled && setAllWords(mergeSources(lists)));
    return () => {
      cancelled = true;
    };
  }, [institutionId, sources]);

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
  // אותה מילה באנגלית מכמה רשימות — פעם אחת (המופע הראשון, לפי סדר הרשימות)
  const { kept: matched, duplicates } = dedupeByEnglish(
    Array.from(new Map([...filtered, ...hardWordDocs].map((w) => [wordKey(w), w])).values()),
  );
  const multiSource = sources.length > 1;

  useEffect(() => {
    onMatchedWordsChange(matched);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allWords, filters, hardWords]);

  if (allWords === null) return <LoadingSpinner />;

  return (
    <div className="space-y-5">
      <h2 className="text-body-lg font-bold text-brand-text">שלב 2: סינון (אופציונלי)</h2>

      {/* מחשב: המסננים מימין ורשימת המילים שנמצאו משמאל. טלפון/טאבלט: המסננים בלבד, כמו קודם */}
      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="space-y-5">
          <div>
            <p className="text-body-sm font-semibold text-brand-text mb-2">אות התחלה</p>
            <div className="flex flex-wrap gap-1.5">
              {LETTER_OPTIONS.map((letter) => (
                <button
                  key={letter}
                  onClick={() => onFiltersChange({ ...filters, letters: toggle(filters.letters, letter) })}
                  className={`h-8 w-8 rounded-lg text-body-sm font-semibold ${
                    filters.letters.includes(letter)
                      ? 'bg-brand-turquoise text-white'
                      : 'bg-brand-grey-light text-brand-text'
                  }`}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-body-sm font-semibold text-brand-text mb-2">חלק דיבר</p>
            <div className="flex flex-wrap gap-2">
              {POS_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => onFiltersChange({ ...filters, pos: toggle(filters.pos, opt.key) })}
                  className={`px-3 py-1.5 rounded-full text-body-sm font-medium ${
                    filters.pos.includes(opt.key)
                      ? 'bg-brand-turquoise text-white'
                      : 'bg-brand-grey-light text-brand-text'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-body-sm font-semibold text-brand-text mb-2">קושי</p>
            <div className="flex gap-2">
              {DIFFICULTY_OPTIONS.map((d) => (
                <button
                  key={d}
                  onClick={() => onFiltersChange({ ...filters, difficulty: toggle(filters.difficulty, d) })}
                  className={`px-4 py-1.5 rounded-full text-body-sm font-medium ${
                    filters.difficulty.includes(d)
                      ? 'bg-brand-turquoise text-white'
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
              className="w-full rounded-xl border border-black/10 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
            />
          </div>

          <div className="rounded-xl bg-brand-grey-light p-3 space-y-2">
            <label className="flex items-center gap-2 text-body-sm font-semibold text-brand-text">
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
                className="w-full rounded-lg border border-black/10 px-3 py-2 text-body-sm"
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
        </div>

        <section aria-label="המילים שנמצאו" className="hidden lg:block rounded-xl border border-black/10">
          <p className="px-4 py-2.5 border-b border-black/10 text-body-sm font-semibold text-brand-text">
            המילים שנמצאו ({matched.length})
          </p>
          <ul
            tabIndex={0}
            className="max-h-[52vh] overflow-y-auto divide-y divide-black/5 outline-none focus-visible:ring-2 focus-visible:ring-brand-turquoise"
          >
            {matched.slice(0, WORD_PREVIEW_LIMIT).map((w) => (
              <li key={wordKey(w)} className="flex items-center justify-between gap-3 px-4 py-2 text-body-sm">
                <span className="text-brand-grey-text truncate">
                  {w.hebrewTranslation}
                  {multiSource && <span className="text-caption"> · {w.sourceName}</span>}
                </span>
                <span dir="ltr" className="font-medium text-brand-text shrink-0">
                  {w.englishWord}
                </span>
              </li>
            ))}
          </ul>
          {matched.length > WORD_PREVIEW_LIMIT && (
            <p className="px-4 py-2 border-t border-black/10 text-caption text-brand-grey-text">
              ועוד {matched.length - WORD_PREVIEW_LIMIT} מילים — צמצמו בעזרת המסננים
            </p>
          )}
        </section>
      </div>

      <p className="text-center text-body-sm font-semibold text-brand-turquoise" aria-live="polite">
        נמצאו {matched.length} מילים
        {duplicates > 0 && (
          <span className="font-normal text-brand-grey-text">
            {' '}
            ({duplicates} {duplicates === 1 ? 'מילה כפולה הוסרה' : 'מילים כפולות הוסרו'})
          </span>
        )}
      </p>

      <div className="flex gap-3">
        <Button variant="ghost" onClick={onBack} className="flex-1">
          חזרה
        </Button>
        <Button onClick={onNext} disabled={matched.length === 0} className="flex-1">
          המשך
        </Button>
      </div>
    </div>
  );
}
