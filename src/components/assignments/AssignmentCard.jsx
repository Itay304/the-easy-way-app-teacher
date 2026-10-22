import { useEffect, useState } from 'react';
import { CalendarClock, ChevronDown } from 'lucide-react';
import { callGetAssignmentSummary } from '../../lib/api.js';
import { daysAgo } from '../../lib/dateUtils.js';
import Card from '../ui/Card.jsx';

// כרטיס משימה למורה — קודם הסיכום (בקצב / מאחור / לא התחילו), ומתחת, בלחיצה על "פרטים",
// 10 המילים הקשות של המשימה ורשימת התלמידים. נתונים: getAssignmentSummary (functions/index.js) —
// מסמך אחד לכל תלמיד במשימה.
const STATUS = {
  'on-pace': { label: 'בקצב', className: 'bg-brand-green/10 text-brand-green' },
  behind: { label: 'מאחור', className: 'bg-amber-50 text-amber-700' },
  'not-started': { label: 'לא התחילו', className: 'bg-brand-grey-light text-brand-grey-text' },
};

function lastSeenLabel(dayKey) {
  if (!dayKey) return 'עוד לא תרגל';
  const d = daysAgo(Date.parse(`${dayKey}T12:00:00`));
  if (d <= 0) return 'היום';
  if (d === 1) return 'אתמול';
  return `לפני ${d} ימים`;
}

export default function AssignmentCard({ assignment, className }) {
  const [summary, setSummary] = useState(null);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    callGetAssignmentSummary({ assignmentId: assignment.id, institutionId: assignment.institutionId })
      .then((res) => !cancelled && setSummary(res.data))
      .catch(() => !cancelled && setFailed(true));
    return () => {
      cancelled = true;
    };
  }, [assignment.id, assignment.institutionId]);

  return (
    <Card className="space-y-3">
      <div className="min-w-0">
        <p className="font-semibold text-brand-text truncate">{assignment.title}</p>
        <p className="text-body-sm text-brand-grey-text truncate">
          {className}
          {summary ? ` · ${summary.totalWords} מילים · ${summary.stageCount} שלבים` : ''}
        </p>
        {assignment.dueDateMs && (
          <p className="flex items-center gap-1 text-caption text-brand-grey-text mt-0.5">
            <CalendarClock size={16} />
            עד {new Date(assignment.dueDateMs).toLocaleDateString('he-IL')}
          </p>
        )}
      </div>

      {!summary && !failed && <p className="text-caption text-brand-grey-text">טוען…</p>}
      {failed && <p className="text-caption text-brand-error">לא הצלחנו לטעון את מצב המשימה.</p>}

      {summary && (
        <>
          {/* הסיכום קודם */}
          <div className="flex flex-wrap gap-2">
            <span className={`rounded-full px-3 py-1 text-body-sm font-semibold ${STATUS['on-pace'].className}`}>
              בקצב: {summary.counts.onPace}
            </span>
            <span className={`rounded-full px-3 py-1 text-body-sm font-semibold ${STATUS.behind.className}`}>
              מאחור: {summary.counts.behind}
            </span>
            <span className={`rounded-full px-3 py-1 text-body-sm font-semibold ${STATUS['not-started'].className}`}>
              לא התחילו: {summary.counts.notStarted}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            className="flex items-center gap-1 text-body-sm font-semibold text-brand-turquoise-dark"
          >
            פרטים
            <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
          </button>

          {open && (
            <div className="space-y-4 border-t border-black/5 pt-3">
              <div>
                <p className="mb-2 text-body-sm font-bold text-brand-text">10 המילים הקשות במשימה</p>
                {summary.hardWords.length === 0 ? (
                  <p className="text-caption text-brand-grey-text">עוד אין מספיק תרגול כדי לזהות מילים קשות.</p>
                ) : (
                  <ul className="flex flex-wrap gap-2">
                    {summary.hardWords.map((w) => (
                      <li key={w.englishWord} className="rounded-lg bg-brand-error-light px-2.5 py-1 text-body-sm">
                        <span dir="ltr" className="font-semibold text-brand-text">
                          {w.englishWord}
                        </span>
                        <span className="text-brand-grey-text"> · {w.studentsNotKnown} עוד לא יודעים</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>

              <div>
                <p className="mb-2 text-body-sm font-bold text-brand-text">תלמידים</p>
                <ul className="divide-y divide-black/5">
                  {summary.students.map((s) => (
                    <li key={s.uid} className="flex items-center justify-between gap-3 py-2 text-body-sm">
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-brand-text">{s.displayName || 'תלמיד/ה'}</p>
                        <p className="text-caption text-brand-grey-text">
                          ידועות {s.known}/{summary.totalWords} · נראו {s.seen} · {lastSeenLabel(s.lastDay)}
                        </p>
                      </div>
                      <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-caption font-semibold ${STATUS[s.status].className}`}>
                        {STATUS[s.status].label}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </>
      )}
    </Card>
  );
}
