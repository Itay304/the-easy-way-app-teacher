import { useState } from 'react';
import { callCreateAssignment } from '../../../lib/api.js';

export default function StepFinalize({ matchedWords, listId, classes, onBack, onCreated }) {
  const [selectionMode, setSelectionMode] = useState('all'); // 'all' | 'random' | 'manual' | 'varied'
  const [randomCount, setRandomCount] = useState(Math.min(10, matchedWords.length));
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
    if (selectionMode === 'all' || selectionMode === 'varied') return matchedWords.map((w) => w.id);
    if (selectionMode === 'random') {
      const shuffled = [...matchedWords].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, randomCount).map((w) => w.id);
    }
    return manualIds;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    const wordIds = resolveWordIds();
    if (wordIds.length === 0) {
      setError('יש לבחור לפחות מילה אחת.');
      return;
    }
    if (!classId) {
      setError('יש לבחור כיתה.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = { classId, listId, title: title.trim(), wordIds };
      if (dueDate) payload.dueDateMs = new Date(dueDate).getTime();
      if (selectionMode === 'varied') payload.practiceMode = 'varied';
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
      <h2 className="text-lg font-bold text-brand-text">שלב 3: כמות והגדרות</h2>

      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          {[
            { key: 'all', label: `כל ${matchedWords.length} המילים` },
            { key: 'random', label: 'אקראי' },
            { key: 'manual', label: 'בחירה ידנית' },
            { key: 'varied', label: 'מגוון אוטומטי 🎯' },
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setSelectionMode(opt.key)}
              className={`py-2 rounded-xl text-sm font-semibold ${
                selectionMode === opt.key ? 'bg-brand-green text-white' : 'bg-brand-grey-light text-brand-text'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {selectionMode === 'varied' && (
          <p className="text-sm text-brand-grey-text bg-brand-grey-light rounded-xl p-3">
            כל {matchedWords.length} המילים ייכללו במשימה. אנחנו ממליצים לתלמידים לחלק את התרגול לשלושה שווה
            בשווה — שליש כרטיסיות, שליש מבחן, שליש איות — כדי לגוון את שיטת הלמידה.
          </p>
        )}

        {selectionMode === 'random' && (
          <div className="px-1">
            <input
              type="range"
              min={1}
              max={matchedWords.length}
              value={randomCount}
              onChange={(e) => setRandomCount(Number(e.target.value))}
              className="w-full accent-brand-green"
            />
            <p className="text-center text-sm text-brand-grey-text">{randomCount} מילים אקראיות</p>
          </div>
        )}

        {selectionMode === 'manual' && (
          <div className="max-h-48 overflow-y-auto rounded-xl border border-black/10 divide-y divide-black/5">
            {matchedWords.map((w) => (
              <label key={w.id} className="flex items-center gap-3 px-4 py-2 text-sm">
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

      <input
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="שם המשימה"
        className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
      />

      <div>
        <label className="block text-sm font-semibold text-brand-text mb-1">דד-ליין (אופציונלי)</label>
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
        />
      </div>

      <div>
        <label className="block text-sm font-semibold text-brand-text mb-1">לאיזו כיתה</label>
        <select
          required
          value={classId}
          onChange={(e) => setClassId(e.target.value)}
          className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
        >
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-red-600 text-sm text-center">{error}</p>}

      <div className="flex gap-3">
        <button type="button" onClick={onBack} className="flex-1 py-3 rounded-xl border border-black/10 text-brand-text font-semibold">
          חזרה
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold disabled:opacity-60"
        >
          {submitting ? '...' : 'צור משימה'}
        </button>
      </div>
    </form>
  );
}
