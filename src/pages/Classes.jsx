import { useEffect, useState } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import { Plus, Users } from 'lucide-react';
import { getMyClasses, callGetClassProgress } from '../lib/api.js';
import { ListSkeleton } from '../components/Skeleton.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
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
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-green text-white font-semibold text-sm shadow-sm"
        >
          <Plus size={16} strokeWidth={2.5} />
          כיתה חדשה
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!classes && !error && <ListSkeleton rows={3} />}

      {classes && classes.length === 0 && (
        <EmptyState icon={Users} title="אין לך עדיין כיתות" subtitle="צור את הכיתה הראשונה שלך למעלה" />
      )}

      {classes && classes.length > 0 && (
        <ul className="space-y-3">
          {classes.map((c) => (
            <li key={c.id}>
              <Link
                to={`/classes/${c.id}`}
                className="block rounded-2xl bg-white shadow-md p-4 active:shadow-sm transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-brand-green-dark text-lg">{c.name}</p>
                    {c.grade && <p className="text-sm text-brand-grey-text mt-0.5">שכבה {c.grade}</p>}
                  </div>
                  <div className="text-left">
                    <p className="text-xl font-bold text-brand-turquoise">{c.studentCount || 0}</p>
                    <p className="text-xs text-brand-grey-text">תלמידים</p>
                  </div>
                </div>
                {c.activePct !== null && (
                  <p className="text-sm font-semibold text-brand-green mt-3">{c.activePct}% פעילים השבוע</p>
                )}
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
