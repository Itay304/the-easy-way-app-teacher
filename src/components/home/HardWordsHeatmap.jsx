import { useState } from 'react';
import { Flame } from 'lucide-react';

function heatColor(errorRate) {
  if (errorRate >= 0.8) return 'bg-red-700 text-white';
  if (errorRate >= 0.5) return 'bg-orange-400 text-white';
  if (errorRate >= 0.3) return 'bg-yellow-300 text-yellow-900';
  return 'bg-brand-green/15 text-brand-green';
}

const LEGEND = [
  { label: '80%+', className: 'bg-red-700' },
  { label: '50-80%', className: 'bg-orange-400' },
  { label: '30-50%', className: 'bg-yellow-300' },
  { label: 'מתחת ל-30%', className: 'bg-brand-green/60' },
];

export default function HardWordsHeatmap({ words }) {
  const [selected, setSelected] = useState(null);

  function toggle(word) {
    setSelected((s) => (s?.englishWord === word.englishWord ? null : word));
  }

  return (
    <section className="rounded-2xl bg-white shadow-md p-5">
      <div className="flex items-center gap-2 mb-1">
        <Flame size={18} className="text-amber-500" />
        <h2 className="text-lg font-bold text-brand-text">מפת חום — מילים קשות בכיתה</h2>
      </div>
      <p className="text-sm text-brand-grey-text mb-4">
        לפי אחוז שגיאות על פני כל הכיתות שלך. הקש/י על מילה לפרטים.
      </p>

      {words.length === 0 ? (
        <p className="text-sm text-brand-grey-text">אין עדיין מספיק נתוני תרגול.</p>
      ) : (
        <>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-96 overflow-y-auto pr-1">
            {words.map((w) => {
              const isSelected = selected?.englishWord === w.englishWord;
              return (
                <button
                  key={w.englishWord}
                  onClick={() => toggle(w)}
                  title={`${w.studentsFailed}/${w.studentsAttempted} תלמידים נכשלו`}
                  className={`rounded-xl px-2 py-3 text-center transition hover:scale-105 hover:shadow-md ${heatColor(
                    w.errorRate,
                  )} ${isSelected ? 'ring-2 ring-offset-1 ring-brand-turquoise' : ''}`}
                >
                  <p className="font-bold text-sm truncate" dir="ltr">
                    {w.englishWord}
                  </p>
                  <p className="text-xs font-semibold mt-1">{Math.round(w.errorRate * 100)}% שגיאה</p>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="mt-4 rounded-xl bg-brand-grey-light p-4 space-y-1">
              <p className="font-bold text-brand-text" dir="ltr">
                {selected.englishWord}
              </p>
              <p className="text-sm text-brand-grey-text">
                {selected.studentsFailed} מתוך {selected.studentsAttempted} תלמידים שניסו את המילה עדיין לא כבשו אותה
              </p>
              <p className="text-sm text-brand-grey-text">
                {selected.totalAttempts} ניסיונות סה"כ · {Math.round(selected.errorRate * 100)}% שגיאה
              </p>
            </div>
          )}

          <div className="flex items-center justify-center gap-3 mt-4 text-xs text-brand-grey-text flex-wrap">
            {LEGEND.map((item) => (
              <span key={item.label} className="flex items-center gap-1">
                <span className={`h-3 w-3 rounded-full inline-block ${item.className}`} />
                {item.label}
              </span>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
