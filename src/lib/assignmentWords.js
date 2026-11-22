// מילים של משימה בצד המורה (assignments-v2) — אותם כללים בדיוק כמו functions/assignmentWords.js:
// כמה מקורות, אותה מילה באנגלית פעם אחת (המופע הראשון), מעל 300 — באישור, עד 1,000, כמה רשימות — באישור.
export const LARGE_ASSIGNMENT_WORDS = 300;
export const MAX_ASSIGNMENT_WORDS = 1000;
export const LARGE_ACK_LABEL = 'אני מודע/ת שזו משימה גדולה מאוד, ושהתלמידים יצטרכו זמן רב להשלים אותה';
export const MIXED_ACK_LABEL = 'אני מודע/ת שהמשימה משלבת מילים מכמה רשימות ברמות שונות';

const normEnglish = (w) =>
  String(w || '')
    .trim()
    .toLowerCase();
export const wordKey = (w) => `${w.listId}/${w.id}`;

// [{ listId, listSource: 'global'|'custom', name, words }] → כל המילים, כל אחת עם המקור שלה, לפי סדר המקורות
export function mergeSources(lists) {
  return lists.flatMap((l) =>
    l.words.map((w) => ({ ...w, listId: l.listId, listSource: l.listSource, sourceName: l.name || l.listId })),
  );
}

// אותה מילה באנגלית (בלי רישיות/רווחים) — פעם אחת, המופע הראשון; גם אותה מילה מאותה רשימה פעמיים
export function dedupeByEnglish(words) {
  const seenEn = new Set();
  const seenKey = new Set();
  const kept = [];
  for (const w of words) {
    const en = normEnglish(w.englishWord);
    if (seenKey.has(wordKey(w)) || (en && seenEn.has(en))) continue;
    seenKey.add(wordKey(w));
    if (en) seenEn.add(en);
    kept.push(w);
  }
  return { kept, duplicates: words.length - kept.length };
}

export function sourceCount(words) {
  return new Set(words.map((w) => `${w.listSource}:${w.listId}`)).size;
}

// מה צריך לפני יצירה: { large, mixed, tooMany, error } — error בעברית, או null אם אפשר לשלוח
export function checkSelection({ count, sources, ackLarge, ackMixed }) {
  const large = count > LARGE_ASSIGNMENT_WORDS;
  const mixed = sources > 1;
  const tooMany = count > MAX_ASSIGNMENT_WORDS;
  let error = null;
  if (count === 0) error = 'יש לבחור לפחות מילה אחת.';
  else if (tooMany)
    error = `משימה יכולה לכלול עד ${MAX_ASSIGNMENT_WORDS.toLocaleString('en-US')} מילים (נבחרו ${count.toLocaleString('en-US')}). צמצמו בסינון או חלקו לכמה משימות.`;
  else if (large && !ackLarge) error = 'משימה של יותר מ-300 מילים: יש לסמן את תיבת האישור.';
  else if (mixed && !ackMixed) error = 'משימה שמשלבת כמה רשימות: יש לסמן את תיבת האישור.';
  return { large, mixed, tooMany, error };
}

// בקשת יצירת משימה. words — הפורמט החדש (assignments-v2: לכל מילה המקור שלה). כשכל המילים ממקור אחד,
// נשלחים גם השדות הישנים (listId, listSource, wordIds) — כך היצירה עובדת גם מול גרסת השרת הקודמת
// (שדורשת listId), למשל באפליקציה חדשה מול פונקציות שעוד לא עודכנו. משימה משולבת — רק בפורמט החדש.
export function buildCreatePayload({
  classId,
  title,
  selectedWords,
  ackLarge = false,
  ackMixed = false,
  dueDateMs = null,
}) {
  const check = checkSelection({
    count: selectedWords.length,
    sources: sourceCount(selectedWords),
    ackLarge,
    ackMixed,
  });
  const payload = {
    classId,
    title: String(title || '').trim(),
    words: selectedWords.map((w) => ({ id: w.id, listId: w.listId, listSource: w.listSource })),
    acknowledgedLarge: check.large && ackLarge,
    acknowledgedMixed: check.mixed && ackMixed,
  };
  if (!check.mixed && selectedWords.length > 0) {
    payload.listId = selectedWords[0].listId;
    payload.listSource = selectedWords[0].listSource;
    payload.wordIds = selectedWords.map((w) => w.id);
  }
  if (dueDateMs) payload.dueDateMs = dueDateMs;
  return payload;
}
