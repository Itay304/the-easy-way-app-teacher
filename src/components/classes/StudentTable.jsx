const SORT_OPTIONS = [
  { key: 'xp', label: 'XP' },
  { key: 'mastered', label: 'מילים' },
  { key: 'activity', label: 'פעילות' },
];

function sortStudents(students, sortBy) {
  const copy = [...students];
  if (sortBy === 'mastered') return copy.sort((a, b) => b.masteredWords - a.masteredWords);
  if (sortBy === 'activity') {
    return copy.sort((a, b) => (b.lastActiveDate || 0) - (a.lastActiveDate || 0));
  }
  return copy.sort((a, b) => b.totalXp - a.totalXp);
}

export default function StudentTable({
  students,
  sortBy,
  onSortChange,
  onlyInactive,
  onToggleOnlyInactive,
  onSelectStudent,
}) {
  const filtered = onlyInactive
    ? students.filter((s) => !s.weeklyActivity)
    : students;
  const sorted = sortStudents(filtered, sortBy);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-sm text-brand-grey-text ml-1">מיון:</span>
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            onClick={() => onSortChange(opt.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition ${
              sortBy === opt.key
                ? 'bg-brand-green text-white'
                : 'bg-brand-grey-light text-brand-text'
            }`}
          >
            {opt.label}
          </button>
        ))}
        <button
          onClick={onToggleOnlyInactive}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition mr-auto ${
            onlyInactive ? 'bg-red-500 text-white' : 'bg-brand-grey-light text-brand-text'
          }`}
        >
          לא פעילים 3+ ימים
        </button>
      </div>

      {sorted.length === 0 ? (
        <p className="text-brand-grey-text text-center py-8">אין תלמידים להצגה.</p>
      ) : (
        <ul className="space-y-2">
          {sorted.map((s) => (
            <li key={s.uid}>
              <button
                onClick={() => onSelectStudent(s)}
                className="w-full flex items-center gap-3 bg-white rounded-xl border border-black/5 px-4 py-3 hover:shadow-md transition text-right"
              >
                <span className="h-10 w-10 rounded-full bg-brand-turquoise/15 text-brand-turquoise font-bold flex items-center justify-center shrink-0">
                  {(s.displayName || '?')[0]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block font-semibold text-brand-text truncate">
                    {s.displayName || 'תלמיד'}
                  </span>
                  <span className="block text-xs text-brand-grey-text">
                    {s.totalXp} XP · {s.masteredWords} מילים נכבשות
                  </span>
                </span>
                <span className={`text-lg shrink-0 ${s.weeklyActivity ? 'text-brand-green' : 'text-red-400'}`}>
                  {s.weeklyActivity ? '✓' : '✗'}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
