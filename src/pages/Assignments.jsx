import { useEffect, useState } from 'react';
import { Plus, ClipboardList } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyClasses, getAssignmentsForClasses } from '../lib/api.js';
import { ListSkeleton } from '../components/Skeleton.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AssignmentCard from '../components/assignments/AssignmentCard.jsx';
import AssignmentWizard from '../components/assignments/AssignmentWizard.jsx';
import Button from '../components/ui/Button.jsx';

export default function Assignments() {
  const { user, profile } = useAuth();
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
        <Button
          size="sm"
          onClick={() => setShowWizard(true)}
          disabled={!classes || classes.length === 0}
          className="shadow-sm"
        >
          <Plus size={16} strokeWidth={2} />
          משימה חדשה
        </Button>
      </div>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!assignments && !error && <ListSkeleton rows={3} />}

      {classes && classes.length === 0 && (
        <EmptyState icon={ClipboardList} title="צור כיתה קודם" subtitle="כדי להוסיף משימות צריך קודם כיתה" />
      )}

      {assignments && assignments.length === 0 && classes?.length > 0 && (
        <EmptyState icon={ClipboardList} title="אין משימות פעילות כרגע" />
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
