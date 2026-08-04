import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { TAB_PATHS } from '../lib/tabs.js';
import Home from '../pages/Home.jsx';
import Classes from '../pages/Classes.jsx';
import Assignments from '../pages/Assignments.jsx';
import Profile from '../pages/Profile.jsx';

const TAB_PAGES = [Home, Classes, Assignments, Profile];

// עגלת טאבים מוחלקת (כמו ViewPager) — כל 4 העמודים מותקנים תמיד,
// ומחליקים אופקית לפי אינדקס הטאב הפעיל. עוטפים ב-dir="ltr" כדי
// שהחישוב הפיזי של translateX לא יתהפך בגלל ה-RTL של הדף (flex-direction
// כן מתהפך תחת RTL, transform לא — צריך לבודד אחד מהשני), ואז מחזירים
// dir="rtl" בתוך כל עמוד בנפרד כדי שהתוכן עצמו יישאר RTL כרגיל.
export default function TabsCarousel() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeIndex = Math.max(0, TAB_PATHS.indexOf(location.pathname));

  // TODO זמני — נוחש כיוון פעמיים ברצף וטעה בשתיים. במקום לנחש שוב,
  // בונים גרסת דיבוג: swipe רק מדפיס ל-console, לא מנווט בפועל. בדוק
  // במכשיר אמיתי מה מודפס כשמחליקים ימינה/שמאלה, ואז נחזיר את הניווט
  // עם המיפוי הנכון וימחק את ה-console.log.
  const handlers = useSwipeable({
    onSwipedLeft: () => console.log('LEFT', activeIndex),
    onSwipedRight: () => console.log('RIGHT', activeIndex),
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  return (
    <div {...handlers} dir="ltr" className="overflow-hidden">
      <div
        className="flex transition-transform duration-300 ease-out"
        style={{
          // אחוזי transform מחושבים יחסית לרוחב האלמנט עצמו (ה-track,
          // שהוא TAB_PAGES.length*100% מרוחב ההורה) — לא יחסית להורה.
          // צעד של 100/length אחוזים מתוך הרוחב העצמי שווה בדיוק לרוחב
          // הורה אחד, בלי קשר לכמות הטאבים.
          transform: `translateX(-${activeIndex * (100 / TAB_PAGES.length)}%)`,
          width: `${TAB_PAGES.length * 100}%`,
        }}
      >
        {TAB_PAGES.map((Page, i) => (
          <div key={TAB_PATHS[i]} dir="rtl" className="shrink-0" style={{ width: `${100 / TAB_PAGES.length}%` }}>
            <Page />
          </div>
        ))}
      </div>
    </div>
  );
}
