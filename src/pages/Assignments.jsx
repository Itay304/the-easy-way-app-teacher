import { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { getMyClasses, getAssignmentsForClasses } from '../lib/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import AssignmentCard from '../components/assignments/AssignmentCard.jsx';
import AssignmentWizard from '../components/assignments/AssignmentWizard.jsx';

export default function Assignments() {
  const { user, profile } = useOutletContext();
  const [classes, setClasses] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [error, setError] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError('');
      try {
        const myClasses = await getMyClasses(profile.institutionId, user.uid);
        const list = await getAssignmentsForClasses(
          profile.institutionId,
          myClasses.map((c) => c.id),
        );
        if (!cancelled) {
          setClasses(myClasses);
          setAssignments(list.map((a) => ({ ...a, institutionId: profile.institutionId })));
        }
      } catch {
        if (!cancelled) setError('שגיאה בטעינת המשימות.');
      }
    }

    if (profile?.institutionId && user) load();

    return () => {
      cancelled = true;
    };
  }, [profile, user, reloadKey]);

  const classNameOf = (classId) => classes?.find((c) => c.id === classId)?.name || '';

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-text">משימות</h1>
        <button
          onClick={() => setShowWizard(true)}
          disabled={!classes || classes.length === 0}
          className="px-4 py-2 rounded-xl bg-brand-green text-white font-semibold text-sm disabled:opacity-40"
        >
          + משימה חדשה
        </button>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!assignments && !error && <LoadingSpinner />}

      {classes && classes.length === 0 && (
        <p className="text-brand-grey-text text-center py-12">צור כיתה קודם כדי להוסיף משימות.</p>
      )}

      {assignments && assignments.length === 0 && classes?.length > 0 && (
        <p className="text-brand-grey-text text-center py-12">אין משימות פעילות כרגע.</p>
      )}

      {assignments && assignments.length > 0 && (
        <ul className="space-y-3">
          {assignments.map((a) => (
            <li key={a.id}>
              <AssignmentCard assignment={a} className={classNameOf(a.classId)} />
            </li>
          ))}
        </ul>
      )}

      {showWizard && classes && (
        <AssignmentWizard
          institutionId={profile.institutionId}
          classes={classes}
          onClose={() => setShowWizard(false)}
          onCreated={() => {
            setShowWizard(false);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
