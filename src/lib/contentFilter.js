// "תוכן מותאם לבתי ספר דתיים" — מקום הסינון היחיד באפליקציית המורה. מוסד עם hideSensitiveWords=true:
// מילים מתויגות "sensitive" לא מוצגות באשף המשימות (ולכן אי אפשר לבחור אותן) ובתצוגה המקדימה.
// api.js מפעיל את הפונקציות האלה — לא לסנן במקום אחר. השרת (createAssignment) דוחה מילים כאלה גם אם
// לקוח שונה ישלח אותן; אותם כללים כמו functions/contentFilter.js.

export const SENSITIVE_TAG = 'sensitive';
export const INSTITUTION_FIELD = 'hideSensitiveWords';

/** מילה מתויגת "sensitive"? tags היא מחרוזת ("General, sensitive") — ותומכים גם במערך. */
export function isSensitive(word) {
  const tags = word?.tags;
  const list = Array.isArray(tags) ? tags : typeof tags === 'string' ? tags.split(',') : [];
  return list.some((t) => String(t).trim().toLowerCase() === SENSITIVE_TAG);
}

/** ההגדרה במסמך המוסד (ברירת מחדל: כבוי). */
export function hidesSensitive(institution) {
  return institution?.[INSTITUTION_FIELD] === true;
}

/** רשימת מילים כפי שהמורה רואה אותה באשף. */
export function visibleWords(words, hide) {
  return hide ? words.filter((w) => !isSensitive(w)) : words;
}
