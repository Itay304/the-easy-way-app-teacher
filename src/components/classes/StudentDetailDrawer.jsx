import { useEffect, useState } from 'react';
import { X, UserMinus } from 'lucide-react';
import { getUserDoc, callRemoveStudentFromClass } from '../../lib/api.js';
import { daysAgo } from '../../lib/dateUtils.js';
import LoadingSpinner from '../LoadingSpinner.jsx';

export default function StudentDetailDrawer({ student, classId, institutionId, onClose, onRemoved }) {
  const [extra, setExtra] = useState(undefined); // undefined = loading
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const [removeError, setRemoveError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getUserDoc(student.uid)
      .then((doc) => !cancelled && setExtra(doc))
      .catch(() => !cancelled && setExtra(null));
    return () => {
      cancelled = true;
    };
  }, [student.uid]);

  async function handleRemove() {
    setRemoving(true);
    setRemoveError('');
    try {
      await callRemoveStudentFromClass({ studentUid: student.uid, classId, institutionId });
      onRemoved(student.uid);
      onClose();
    } catch (err) {
      setRemoveError(err.message || 'שגיאה בהסרת התלמיד. נסו שוב.');
      setRemoving(false);
    }
  }

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
            {(student.displayName || student.fullName || '?')[0]}
          </span>
          <div>
            <p className="font-bold text-brand-text text-lg">{student.displayName || student.fullName || 'תלמיד'}</p>
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

        {removeError && <p className="text-red-600 text-sm text-center mt-4">{removeError}</p>}

        {confirming ? (
          <div className="mt-4 rounded-xl bg-red-50 p-4 space-y-3">
            <p className="text-sm font-semibold text-red-700 text-center">
              להסיר את {student.displayName || student.fullName || 'התלמיד'} מהכיתה?
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setConfirming(false)}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl bg-white border border-black/10 text-brand-text font-semibold text-sm disabled:opacity-60"
              >
                ביטול
              </button>
              <button
                onClick={handleRemove}
                disabled={removing}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-semibold text-sm disabled:opacity-60"
              >
                {removing ? '...' : 'כן, הסר'}
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="mt-4 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-red-600 hover:bg-red-50 font-semibold text-sm transition"
          >
            <UserMinus size={16} />
            הסר מהכיתה
          </button>
        )}
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
