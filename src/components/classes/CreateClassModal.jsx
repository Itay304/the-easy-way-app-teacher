import { useState } from 'react';
import { callCreateClass } from '../../lib/api.js';

export default function CreateClassModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await callCreateClass({ className: name.trim(), grade: grade.trim() });
      onCreated();
    } catch {
      setError('שגיאה ביצירת הכיתה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm p-6">
        <h2 className="text-lg font-bold text-brand-text mb-4">צור כיתה חדשה</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="שם הכיתה"
            className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
          <input
            value={grade}
            onChange={(e) => setGrade(e.target.value)}
            placeholder="שכבה (אופציונלי)"
            className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green"
          />
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-black/10 text-brand-text font-semibold"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold disabled:opacity-60"
            >
              {submitting ? '...' : 'צור'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
