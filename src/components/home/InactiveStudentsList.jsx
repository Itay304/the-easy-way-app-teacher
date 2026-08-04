import { AlertTriangle, PartyPopper } from 'lucide-react';
import { daysAgo } from '../../lib/dateUtils.js';

export default function InactiveStudentsList({ students }) {
  return (
    <section className="rounded-2xl bg-white shadow-md p-5">
      <div className="flex items-center gap-2 mb-1">
        <AlertTriangle size={18} className="text-red-500" />
        <h2 className="text-lg font-bold text-brand-text">תלמידים לא פעילים</h2>
      </div>
      <p className="text-sm text-brand-grey-text mb-4">3+ ימים ללא תרגול</p>

      {students.length === 0 ? (
        <p className="text-sm text-brand-grey-text flex items-center gap-2">
          <PartyPopper size={16} className="text-brand-green" />
          כל התלמידים פעילים — כל הכבוד!
        </p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => {
            const days = daysAgo(s.lastActiveDate);
            return (
              <li
                key={s.uid}
                className="flex items-center justify-between bg-red-50 rounded-xl px-4 py-3"
              >
                <span className="font-medium text-brand-text">{s.displayName || 'תלמיד'}</span>
                <span className="text-sm text-red-600 font-semibold">
                  {Number.isFinite(days) ? `${days} ימים` : 'מעולם לא תרגל'}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
