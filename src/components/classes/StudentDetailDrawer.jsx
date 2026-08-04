import { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { getUserDoc } from '../../lib/api.js';
import { daysAgo } from '../../lib/dateUtils.js';
import LoadingSpinner from '../LoadingSpinner.jsx';

export default function StudentDetailDrawer({ student, onClose }) {
  const [extra, setExtra] = useState(undefined); // undefined = loading

  useEffect(() => {
    let cancelled = false;
    getUserDoc(student.uid)
      .then((doc) => !cancelled && setExtra(doc))
      .catch(() => !cancelled && setExtra(null));
    return () => {
      cancelled = true;
    };
  }, [student.uid]);

  const days = daysAgo(student.lastActiveDate);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-brand-text">התקדמות אישית</h2>
          <button onClick={onClose} className="text-brand-grey-text hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <span className="h-14 w-14 rounded-full bg-brand-turquoise/15 text-brand-turquoise font-bold text-xl flex items-center justify-center shrink-0">
            {(student.displayName || '?')[0]}
          </span>
          <div>
            <p className="font-bold text-brand-text text-lg">{student.displayName || 'תלמיד'}</p>
            <p className="text-sm text-brand-grey-text">
              {Number.isFinite(days) ? `פעיל לאחרונה לפני ${days} ימים` : 'מעולם לא תרגל'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Stat label="XP" value={student.totalXp} />
          <Stat label="מילים נכבשות" value={student.masteredWords} />
          {extra === undefined ? null : (
            <>
              <Stat label="רמה" value={extra?.level ?? '—'} />
              <Stat label="רצף ימים" value={extra?.streak ?? '—'} />
            </>
          )}
        </div>

        {extra === undefined && <LoadingSpinner label="טוען פרטים נוספים..." />}

        <div
          className={`rounded-xl px-4 py-3 text-sm font-semibold text-center ${
            student.weeklyActivity ? 'bg-brand-green/10 text-brand-green' : 'bg-red-50 text-red-600'
          }`}
        >
          {student.weeklyActivity ? 'פעיל השבוע' : 'לא פעיל השבוע'}
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-xl bg-brand-grey-light px-4 py-3 text-center">
      <p className="text-xl font-bold text-brand-text">{value}</p>
      <p className="text-xs text-brand-grey-text mt-0.5">{label}</p>
    </div>
  );
}
