import { useEffect, useState } from 'react';
import { Plus, ClipboardList, Archive, RotateCcw } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getMyClasses,
  getAssignmentsForClasses,
  getArchivedAssignmentsForClasses,
  callRestoreAssignment,
} from '../lib/api.js';
import { ListSkeleton } from '../components/Skeleton.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import EmptyState from '../components/EmptyState.jsx';
import AssignmentCard from '../components/assignments/AssignmentCard.jsx';
import AssignmentWizard from '../components/assignments/AssignmentWizard.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

// משימות: "פעילות" (עם סיכום ו"מחיקה") ו"משימות בארכיון" (assignments-v2) — משימה שנמחקה עוברת לארכיון:
// מוסתרת מהתלמידים, ההתקדמות שלהם נשמרת, ואפשר לשחזר אותה. שחזור — רק המורה שיצר או מנהל המוסד.
export default function Assignments() {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState(null);
  const [assignments, setAssignments] = useState(null);
  const [archived, setArchived] = useState(null);
  const [view, setView] = useState('active'); // 'active' | 'archived'
  const [error, setError] = useState('');
  const [showWizard, setShowWizard] = useState(false);
  const [reloadKey, setReloadKey] = useState(0);
  const [restoringId, setRestoringId] = useState(null);
  const [restoreError, setRestoreError] = useState('');

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError('');
      try {
        const myClasses = await getMyClasses(profile.institutionId, user.uid);
        const ids = myClasses.map((c) => c.id);
        const [list, archivedList] = await Promise.all([
          getAssignmentsForClasses(profile.institutionId, ids),
          getArchivedAssignmentsForClasses(profile.institutionId, ids),
        ]);
        if (!cancelled) {
          setClasses(myClasses);
          setAssignments(list.map((a) => ({ ...a, institutionId: profile.institutionId })));
          setArchived(
            archivedList
              .map((a) => ({ ...a, institutionId: profile.institutionId }))
              .sort((a, b) => (b.archivedAt?.toMillis?.() || 0) - (a.archivedAt?.toMillis?.() || 0)),
          );
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
  const canManage = (a) => profile?.role === 'principal' || a.createdBy === user?.uid;

  async function restore(a) {
    setRestoringId(a.id);
    setRestoreError('');
    try {
      await callRestoreAssignment({ assignmentId: a.id });
      setReloadKey((k) => k + 1);
    } catch (err) {
      setRestoreError(err?.code?.startsWith('functions/') && err.message ? err.message : 'השחזור נכשל. נסו שוב.');
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-h1 font-bold text-brand-text">משימות</h1>
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

      <div role="tablist" aria-label="סוג משימות" className="flex gap-2">
        {[
          ['active', 'פעילות', assignments?.length],
          ['archived', 'משימות בארכיון', archived?.length],
        ].map(([key, label, count]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={view === key}
            onClick={() => setView(key)}
            className={`rounded-full px-4 py-2 text-body-sm font-semibold transition ${
              view === key ? 'bg-brand-turquoise text-white' : 'bg-brand-grey-light text-brand-text'
            }`}
          >
            {label}
            {typeof count === 'number' ? ` (${count})` : ''}
          </button>
        ))}
      </div>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {!assignments && !error && <ListSkeleton rows={3} />}

      {view === 'active' && (
        <>
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
                  <AssignmentCard
                    assignment={a}
                    className={classNameOf(a.classId)}
                    onArchived={() => setReloadKey((k) => k + 1)}
                  />
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {view === 'archived' && archived && (
        <>
          <p className="text-body-sm text-brand-grey-text">
            משימות בארכיון לא מוצגות לתלמידים. ההתקדמות שלהם נשמרת, ואפשר לשחזר משימה בכל זמן.
          </p>
          {restoreError && (
            <p role="alert" className="text-body-sm text-brand-error">
              {restoreError}
            </p>
          )}
          {archived.length === 0 ? (
            <EmptyState icon={Archive} title="אין משימות בארכיון" />
          ) : (
            <ul className="space-y-3">
              {archived.map((a) => (
                <li key={a.id}>
                  <Card className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-brand-text truncate">{a.title}</p>
                      <p className="text-body-sm text-brand-grey-text truncate">
                        {classNameOf(a.classId)}
                        {Array.isArray(a.wordIds) ? ` · ${a.wordIds.length} מילים` : ''}
                        {a.archivedAt?.toDate ? ` · נמחקה ${a.archivedAt.toDate().toLocaleDateString('he-IL')}` : ''}
                      </p>
                    </div>
                    {canManage(a) && (
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => restore(a)}
                        loading={restoringId === a.id}
                        className="shrink-0"
                      >
                        <RotateCcw size={16} aria-hidden="true" />
                        שחזור
                      </Button>
                    )}
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </>
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
