import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { auth } from '../firebase.js';
import { getInstitution, getMyClasses } from '../lib/api.js';
import { Skeleton } from '../components/Skeleton.jsx';

const NOTIFY_KEY = 'easylex_notify_inactive';

export default function Profile() {
  const { user, profile } = useAuth();
  const [institution, setInstitution] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifyInactive, setNotifyInactive] = useState(
    () => localStorage.getItem(NOTIFY_KEY) === 'true',
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const [inst, classes] = await Promise.all([
        getInstitution(profile.institutionId),
        getMyClasses(profile.institutionId, user.uid),
      ]);
      if (cancelled) return;
      setInstitution(inst);
      setStats({
        classCount: classes.length,
        studentCount: classes.reduce((sum, c) => sum + (c.studentCount || 0), 0),
      });
    }
    if (profile?.institutionId && user) load();
    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  function toggleNotify() {
    const next = !notifyInactive;
    setNotifyInactive(next);
    localStorage.setItem(NOTIFY_KEY, String(next));
  }

  return (
    <div className="px-4 pt-6 space-y-5">
      <h1 className="text-2xl font-bold text-brand-text">פרופיל</h1>

      <div className="rounded-2xl bg-white shadow-md p-5 text-center">
        <span className="h-16 w-16 mx-auto rounded-full bg-brand-turquoise/15 text-brand-turquoise font-bold text-2xl flex items-center justify-center mb-3">
          {(profile.displayName || '?')[0]}
        </span>
        <p className="font-bold text-brand-text text-lg">{profile.displayName}</p>
        <p className="text-sm text-brand-grey-text">{institution ? institution.name : '...'}</p>
      </div>

      {!stats ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-grey-light px-4 py-3 text-center">
            <p className="text-xl font-bold text-brand-text">{stats.classCount}</p>
            <p className="text-xs text-brand-grey-text mt-0.5">כיתות</p>
          </div>
          <div className="rounded-xl bg-brand-grey-light px-4 py-3 text-center">
            <p className="text-xl font-bold text-brand-text">{stats.studentCount}</p>
            <p className="text-xs text-brand-grey-text mt-0.5">תלמידים</p>
          </div>
        </div>
      )}

      <div className="rounded-2xl bg-white shadow-md p-5 flex items-center justify-between">
        <span className="text-sm font-medium text-brand-text">התראות על תלמידים לא פעילים</span>
        <button
          onClick={toggleNotify}
          className={`w-12 h-7 rounded-full transition relative ${
            notifyInactive ? 'bg-brand-green' : 'bg-black/10'
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              notifyInactive ? 'right-1' : 'right-6'
            }`}
          />
        </button>
      </div>

      <a
        href="https://theeasywayapp.co.il/teacher"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-turquoise/10 text-brand-turquoise font-semibold"
      >
        <ExternalLink size={17} />
        פתח ממשק מלא באתר
      </a>

      <button
        onClick={() => signOut(auth)}
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-white shadow-sm text-brand-text font-semibold"
      >
        <LogOut size={17} />
        התנתק
      </button>
    </div>
  );
}
