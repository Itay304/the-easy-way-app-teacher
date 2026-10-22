// קצב משימה בזמן היצירה — אותן הגדרות כמו functions/stages.js ו-the-easy-way-app-student/src/lib/stages.js
// (שלבים של 10–15 מילים, ימים לפי שעון ישראל, עד 300 מילים, אזהרה מעל 20 מילים חדשות ביום).
export const MAX_ASSIGNMENT_WORDS = 300;
export const HIGH_PACE_WORDS_PER_DAY = 20;
const STAGE_MIN = 10;
const STAGE_MAX = 15;

const dayKey = (ms) => new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Jerusalem' }).format(new Date(ms));
const dayDiff = (a, b) => Math.round((Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86400000);

export function stageCount(wordCount) {
  if (wordCount <= 0) return 0;
  return Math.max(1, Math.min(Math.ceil(wordCount / STAGE_MAX), Math.floor(wordCount / STAGE_MIN)));
}

// מילים חדשות ליום עד תאריך היעד (כולל היום). null בלי תאריך יעד.
export function creationPace(wordCount, dueDateMs, now = Date.now()) {
  if (!dueDateMs || wordCount <= 0) return null;
  const days = dayDiff(dayKey(now), dayKey(dueDateMs)) + 1;
  if (days <= 0) return { days: 0, wordsPerDay: wordCount, tooFast: true, pastDue: true };
  const wordsPerDay = Math.ceil(wordCount / days);
  return { days, wordsPerDay, tooFast: wordsPerDay > HIGH_PACE_WORDS_PER_DAY, pastDue: false };
}
