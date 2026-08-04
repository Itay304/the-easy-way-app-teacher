import { Flame } from 'lucide-react';

function heatColor(errorRate) {
  // ירוק->צהוב->אדום לפי חומרת אחוז השגיאה
  if (errorRate >= 0.66) return 'bg-red-100 text-red-700';
  if (errorRate >= 0.33) return 'bg-amber-100 text-amber-700';
  return 'bg-brand-green/10 text-brand-green';
}

export default function HardWordsHeatmap({ words }) {
  return (
    <section className="rounded-2xl bg-white shadow-md p-5">
      <div className="flex items-center gap-2 mb-1">
        <Flame size={18} className="text-amber-500" />
        <h2 className="text-lg font-bold text-brand-text">5 המילים הקשות ביותר</h2>
      </div>
      <p className="text-sm text-brand-grey-text mb-4">לפי אחוז שגיאות בכל הכיתות שלך</p>

      {words.length === 0 ? (
        <p className="text-sm text-brand-grey-text">אין עדיין מספיק נתוני תרגול.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {words.map((w) => (
            <div
              key={w.englishWord}
              className={`rounded-xl px-3 py-4 text-center ${heatColor(w.errorRate)}`}
            >
              <p className="font-bold text-lg" dir="ltr">
                {w.englishWord}
              </p>
              <p className="text-sm font-semibold mt-1">{Math.round(w.errorRate * 100)}% שגיאה</p>
              <p className="text-xs opacity-70 mt-0.5">{w.totalAttempts} ניסיונות</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
