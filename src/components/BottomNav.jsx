import { NavLink } from 'react-router-dom';

const TABS = [
  { to: '/', icon: '🏠', label: 'בית', end: true },
  { to: '/classes', icon: '👥', label: 'כיתות' },
  { to: '/assignments', icon: '📋', label: 'משימות' },
  { to: '/profile', icon: '👤', label: 'פרופיל' },
];

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 bg-white border-t border-black/5 grid grid-cols-4">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center gap-1 py-2.5 text-xs font-medium transition ${
              isActive ? 'text-brand-green' : 'text-brand-grey-text'
            }`
          }
        >
          <span className="text-xl">{tab.icon}</span>
          {tab.label}
        </NavLink>
      ))}
    </nav>
  );
}
