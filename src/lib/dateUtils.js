const HEBREW_DAY_LABELS = ["א'", "ב'", "ג'", "ד'", "ה'", "ו'", 'ש\''];

export function toDateKey(msOrDate) {
  const d = msOrDate instanceof Date ? msOrDate : new Date(msOrDate);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function isSameDay(msA, msB) {
  return toDateKey(msA) === toDateKey(msB);
}

export function daysAgo(ms) {
  if (ms === null || ms === undefined) return Infinity;
  return Math.floor((Date.now() - ms) / (24 * 60 * 60 * 1000));
}

/** מחזיר 7 הימים האחרונים (כולל היום), מהישן לחדש: [{ key: 'yyyy-MM-dd', label: 'א\'' }, ...] */
export function lastSevenDays() {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({ key: toDateKey(d), label: HEBREW_DAY_LABELS[d.getDay()] });
  }
  return days;
}
