import { useState } from 'react';
import { AlertTriangle, Gauge, Layers } from 'lucide-react';
import { callCreateAssignment } from '../../../lib/api.js';
import { creationPace, MAX_ASSIGNMENT_WORDS, stageCount } from '../../../lib/pace.js';
import Input from '../../ui/Input.jsx';
import Button from '../../ui/Button.jsx';

export default function StepFinalize({ matchedWords, listId, listSource, classes, onBack, onCreated }) {
  // בחירת מילים בלבד — התרגול עצמו תמיד מגוון (המורה כבר לא בוחר מצב תרגול)
  const [selectionMode, setSelectionMode] = useState('all'); // 'all' | 'random' | 'manual'
  const [randomCount, setRandomCount] = useState(Math.min(10, matchedWords.length, MAX_ASSIGNMENT_WORDS));
  const [manualIds, setManualIds] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [classId, setClassId] = useState(classes[0]?.id || '');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  function toggleManual(id) {
    setManualIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function resolveWordIds() {
    if (selectionMode === 'all') return matchedWords.map((w) => w.id);
    if (selectionMode === 'random') {
      const shuffled = [...matchedWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, randomCount).map((w) => w.id);
    }
    return manualIds;
  }

  const selectedCount =
    selectionMode === 'all' ? matchedWords.length : selectionMode === 'random' ? randomCount : manualIds.length;
  const tooMany = selectedCount > MAX_ASSIGNMENT_WORDS;
  const pace = creationPace(selectedCount, dueDate ? new Date(dueDate).getTime() : null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const wordIds = resolveWordIds();
    if (wordIds.length === 0) {
      setError('יש לבחור לפחות מילה אחת.');
      return;
    }
    if (wordIds.length > MAX_ASSIGNMENT_WORDS) {
      setError(`משימה יכולה לכלול עד ${MAX_ASSIGNMENT_WORDS} מילים (נבחרו ${wordIds.length}). צמצמו בסינון או חלקו לכמה משימות.`);
      return;
    }
    if (!classId) {
      setError('יש לבחור כיתה.');
      return;
    }

    setSubmitting(true);
    try {
      // listSource: רשימה גלובלית (Band) או מוסדית — התלמיד והפונקציות טוענים את המילים מהמקום הנכון
      const payload = { classId, listId, listSource, title: title.trim(), wordIds };
      if (dueDate) payload.dueDateMs = new Date(dueDate).getTime();
      await callCreateAssignment(payload);
      onCreated();
    } catch {
      setError('שגיאה ביצירת המשימה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <h2 className="text-body-lg font-bold text-brand-text">שלב 3: כמות והגדרות</h2>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'all', label: `כל ${matchedWords.length} המילים` },
            { key: 'random', label: 'אקראי' },
            { key: 'manual', label: 'בחירה ידנית' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectionMode(opt.key)}
              className={`py-2 rounded-xl text-body-sm font-semibold ${
                selectionMode === opt.key ? 'bg-brand-turquoise text-white' : 'bg-brand-grey-light text-brand-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectionMode === 'random' && (
          <div className="px-1">
            <input
              type="range"
              min={1}
              max={Math.min(matchedWords.length, MAX_ASSIGNMENT_WORDS)}
              value={randomCount}
              onChange={(e) => setRandomCount(Number(e.target.value))}
              className="w-full accent-brand-turquoise"
            />
            <p className="text-center text-body-sm text-brand-grey-text">{randomCount} מילים אקראיות</p>
          </div>
        )}

        {selectionMode === 'manual' && (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-black/10 divide-y divide-black/5">
            {matchedWords.map((w) => (
              <label key={w.id} className="flex items-center gap-3 px-4 py-2 text-body-sm">
                <input type="checkbox" checked={manualIds.includes(w.id)} onChange={() => toggleManual(w.id)} />
                <span dir="ltr" className="font-medium text-brand-text">
                  {w.englishWord}
                </span>
                <span className="text-brand-grey-text">{w.hebrewTranslation}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="שם המשימה" />

      <Input
        type="date"
        label="דד-ליין (אופציונלי)"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
      />

      {/* כמה שלבים, קצב מילים ליום עד תאריך היעד, ואזהרות (יותר מדי מילים / קצב גבוה) */}
      <div className="space-y-2 rounded-xl bg-brand-grey-light p-3 text-body-sm">
        {selectedCount > 0 && !tooMany && (
          <p className="flex items-center gap-2 text-brand-text">
            <Layers size={16} className="shrink-0 text-brand-turquoise" />
            {selectedCount} מילים · {stageCount(selectedCount)} שלבים של 10–15 מילים
          </p>
        )}
        {tooMany && (
          <p className="flex items-start gap-2 font-semibold text-brand-error">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            משימה יכולה לכלול עד {MAX_ASSIGNMENT_WORDS} מילים (נבחרו {selectedCount}). צמצמו בסינון או חלקו לכמה משימות.
          </p>
        )}
        {pace && !tooMany && !pace.pastDue && (
          <p className="flex items-center gap-2 text-brand-text">
            <Gauge size={16} className="shrink-0 text-brand-turquoise" />
            קצב: כ-{pace.wordsPerDay} מילים חדשות ליום ({pace.days} ימים)
          </p>
        )}
        {pace && !tooMany && pace.pastDue && (
          <p className="flex items-start gap-2 font-semibold text-brand-error">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            תאריך היעד כבר עבר.
          </p>
        )}
        {pace && !tooMany && pace.tooFast && !pace.pastDue && (
          <p className="flex items-start gap-2 font-semibold text-amber-700">
            <AlertTriangle size={16} className="mt-0.5 shrink-0" />
            קצב גבוה: יותר מ-20 מילים חדשות ביום. כדאי להאריך את תאריך היעד או לצמצם מילים.
          </p>
        )}
        {!pace && selectedCount > 0 && !tooMany && (
          <p className="text-brand-grey-text">בלי תאריך יעד: התלמידים מתקדמים בקצב של סבב ביום.</p>
        )}
      </div>

      <div>
        <label className="block text-body-sm font-semibold text-brand-text mb-1">לאיזו כיתה</label>
        <select
          required
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-brand-error text-body-sm text-center">{error}</p>}

      <div className="flex gap-3">
        <Button type="button" variant="ghost" onClick={onBack} className="flex-1">
          חזרה
        </Button>
        <Button type="submit" loading={submitting} disabled={tooMany} className="flex-1">
          צור משימה
        </Button>
      </div>
    </form>
  );
}
