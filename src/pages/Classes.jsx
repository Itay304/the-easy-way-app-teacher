import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { getMyClasses, callGetClassProgress } from '../lib/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import CreateClassModal from '../components/classes/CreateClassModal.jsx';

export default function Classes() {
  const { user, profile } = useOutletContext();
  const [classes, setClasses] = useState(null);
  const [error, setError] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError('');
      try {
        const list = await getMyClasses(profile.institutionId, user.uid);
        const withActivity = await Promise.all(
          list.map(async (c) => {
            try {
              const res = await callGetClassProgress({ classId: c.id, institutionId: profile.institutionId });
              const students = res.data.students;
              const activePct =
                students.length === 0
                  ? 0
                  : Math.round((students.filter((s) => s.weeklyActivity).length / students.length) * 100);
              return { ...c, activePct };
            } catch {
              return { ...c, activePct: null };
            }
          }),
        );
        if (!cancelled) setClasses(withActivity);
      } catch {
        if (!cancelled) setError('שגיאה בטעינת הכיתות.');
      }
    }

    if (profile?.institutionId && user) load();
    else setError('לא משויך למוסד.');

    return () => {
      cancelled = true;
    };
  }, [profile, user, reloadKey]);

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text">כיתות</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 rounded-xl bg-brand-green text-white font-semibold text-sm"
        >
          + כיתה חדשה
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!classes && !error && <LoadingSpinner />}

      {classes && classes.length === 0 && (
        <p className="text-brand-grey-text text-center py-12">אין לך עדיין כיתות. צור את הראשונה!</p>
      )}

      {classes && classes.length > 0 && (
        <ul className="space-y-3">
          {classes.map((c) => (
            <li key={c.id}>
              <Link
                to={`/classes/${c.id}`}
                className="block rounded-2xl border border-black/5 bg-white shadow-sm p-5 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brand-text text-lg">{c.name}</p>
                    {c.grade && <p className="text-sm text-brand-grey-text">שכבה {c.grade}</p>}
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-brand-grey-text">{c.studentCount || 0} תלמידים</p>
                    {c.activePct !== null && (
                      <p className="text-sm font-semibold text-brand-green">{c.activePct}% פעילים השבוע</p>
                    )}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {showCreate && (
        <CreateClassModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
