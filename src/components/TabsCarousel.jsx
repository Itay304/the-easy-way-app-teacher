import { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSwipeable } from 'react-swipeable';
import { TAB_PATHS } from '../lib/tabs.js';
import Home from '../pages/Home.jsx';
import Classes from '../pages/Classes.jsx';
import Assignments from '../pages/Assignments.jsx';
import Profile from '../pages/Profile.jsx';

const TAB_PAGES = [Home, Classes, Assignments, Profile];

// גישה חדשה לגמרי אחרי שגישת ה-track-מוחלק (flex + translateX + dir
// tricks) התבררה כלא אמינה על מכשיר אמיתי חרף כמה תיקונים: רק העמוד
// הפעיל מותקן בכל רגע נתון (לא כל 4 יחד), וכשהאינדקס משתנה הוא נכנס
// עם אנימציית keyframes פיזית (translateX מ-100%/-100% ל-0) — לא תלויה
// בכלל ב-dir/direction, אז אין עוד מקום לבלבול RTL/LTR.
export default function TabsCarousel() {
  const navigate = useNavigate();
  const location = useLocation();
  const activeIndex = Math.max(0, TAB_PATHS.indexOf(location.pathname));

  const prevIndexRef = useRef(activeIndex);
  const [animClass, setAnimClass] = useState('');

  useEffect(() => {
    if (activeIndex > prevIndexRef.current) {
      setAnimClass('animate-slide-in-right'); // הבא — נכנס מימין
    } else if (activeIndex < prevIndexRef.current) {
      setAnimClass('animate-slide-in-left'); // קודם — נכנס משמאל
    }
    prevIndexRef.current = activeIndex;
  }, [activeIndex]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      if (activeIndex > 0) {
        navigate(TAB_PATHS[activeIndex - 1], { replace: true });
      }
    },
    onSwipedRight: () => {
      if (activeIndex < TAB_PATHS.length - 1) {
        navigate(TAB_PATHS[activeIndex + 1], { replace: true });
      }
    },
    trackMouse: false,
    preventScrollOnSwipe: false,
  });

  const ActivePage = TAB_PAGES[activeIndex];

  return (
    <div {...handlers} className="overflow-hidden">
      <div key={activeIndex} className={animClass}>
        <ActivePage />
      </div>
    </div>
  );
}
