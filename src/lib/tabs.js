import { Home, Users, ClipboardList, User } from 'lucide-react';

// סדר הטאבים משותף בין BottomNav (לחיצה) ל-TabsCarousel (swipe) —
// אותו מקור אמת כדי שהשניים לא יסטו זה מזה.
export const TABS = [
  { path: '/', icon: Home, label: 'בית' },
  { path: '/classes', icon: Users, label: 'כיתות' },
  { path: '/assignments', icon: ClipboardList, label: 'משימות' },
  { path: '/profile', icon: User, label: 'פרופיל' },
];

export const TAB_PATHS = TABS.map((t) => t.path);
