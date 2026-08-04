import { daysAgo } from '../../lib/dateUtils.js';

export default function InactiveStudentsList({ students }) {
  return (
    <section className="rounded-2xl border border-red-100 bg-red-50/50 shadow-sm p-5">
      <h2 className="text-lg font-bold text-brand-text mb-1">תלמידים לא פעילים</h2>
      <p className="text-sm text-brand-grey-text mb-4">3+ ימים ללא תרגול</p>

      {students.length === 0 ? (
        <p className="text-sm text-brand-grey-text">כל התלמידים פעילים — כל הכבוד! 🎉</p>
      ) : (
        <ul className="space-y-2">
          {students.map((s) => {
            const days = daysAgo(s.lastActiveDate);
            return (
              <li
                key={s.uid}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-3 border border-red-100"
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
