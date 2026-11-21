import { serverTimestamp } from 'firebase/firestore';

// הסכמה לתקנון ולמדיניות הפרטיות + הסכמה (אופציונלית) לדיוור — נשמרות על מסמך המשתמש (users/{uid}).
// מורים ומנהלים בלבד רואים את תיבת הדיוור; ברירת המחדל: לא מסומנת. אין כאן שליחת מיילים — רק שמירה.
export const TERMS_VERSION = '2026-10-21';
export const MARKETING_CONSENT_VERSION = '2026-10-21';
export const TERMS_URL = 'https://theeasywayapp.co.il/terms';
export const PRIVACY_URL = 'https://theeasywayapp.co.il/privacy';
export const TERMS_REQUIRED_ERROR = 'כדי להמשיך יש לסמן שקראת ואת/ה מסכים/ה לתקנון ולמדיניות הפרטיות.';
export const MARKETING_LABEL = 'אני רוצה לקבל במייל עדכונים ומידע על מוצרים חדשים של Easylex';

// שדות הדיוור — גם בביטול: זמן ההחלטה וגרסת הנוסח נשמרים תמיד (זמן שרת)
export function marketingFields(consent) {
  return {
    marketingConsent: Boolean(consent),
    marketingConsentAt: serverTimestamp(),
    marketingConsentVersion: MARKETING_CONSENT_VERSION,
  };
}

// אישור התקנון (בהרשמה או במסך ההסכמה החד-פעמי) יחד עם בחירת הדיוור
export function teacherConsentFields(marketingConsent) {
  return { termsAcceptedAt: serverTimestamp(), termsVersion: TERMS_VERSION, ...marketingFields(marketingConsent) };
}

// מסמך קיים בלי termsAcceptedAt → מסך הסכמה חד-פעמי. מסמך שעוד לא נוצר (באמצע הרשמה) — לא.
export function needsConsent(exists, data) {
  return Boolean(exists) && !data?.termsAcceptedAt;
}
