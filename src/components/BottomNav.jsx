import { NavLink } from 'react-router-dom';
import { TABS } from '../lib/tabs.js';

export default function BottomNav() {
  return (
    <nav className="sticky bottom-0 z-40 bg-white shadow-[0_-2px_8px_rgba(0,0,0,0.06)] grid grid-cols-4">
      {TABS.map((tab) => (
        <NavLink
          key={tab.path}
          to={tab.path}
          end
          replace
          aria-label={tab.label}
          className={({ isActive }) =>
            `flex items-center justify-center py-3.5 transition ${
              isActive ? 'text-brand-green' : 'text-brand-grey-text'
            }`
          }
        >
          <tab.icon size={24} strokeWidth={2.25} />
        </NavLink>
      ))}
    </nav>
  );
}
