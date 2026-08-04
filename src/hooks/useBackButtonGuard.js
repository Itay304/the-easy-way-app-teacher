import { useEffect } from 'react';

// מונע יציאה מוקדמת מדי מה-PWA (מותקן, standalone) כשלוחצים "חזור"
// (מחווה/כפתור פיזי באנדרואיד) מיד עם פתיחת האפליקציה, לפני שנוצרה
// היסטוריית ניווט פנימית משלנו. history.state==null זה הסימן התקני
// לכניסה הראשונה לעמוד (אין entry קודם ב-session). דוחפים "ריפוד" חד-פעמי
// כדי שלחיצת חזור ראשונה תיבלע (תישאר באפליקציה) במקום לצאת ישר —
// בלי זה, "חזור" ראשון על מסך הבית סוגר את כל האפליקציה.
export default function useBackButtonGuard() {
  useEffect(() => {
    if (window.history.state === null) {
      window.history.pushState({ __pad: true }, '', window.location.href);
    }
  }, []);
}
