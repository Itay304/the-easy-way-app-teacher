import { useEffect, useState } from 'react';
import { useParams, useOutletContext, Link } from 'react-router-dom';
import { getClassById, callGetClassProgress } from '../lib/api.js';
import LoadingSpinner from '../components/LoadingSpinner.jsx';
import ErrorBanner from '../components/ErrorBanner.jsx';
import StudentTable from '../components/classes/StudentTable.jsx';
import StudentDetailDrawer from '../components/classes/StudentDetailDrawer.jsx';
import SendAnnouncementModal from '../components/classes/SendAnnouncementModal.jsx';

async function shareJoinCode(className, joinCode) {
  const text = `הצטרפו לכיתה "${className}" באפליקציית EasyLex עם הקוד: ${joinCode}`;
  if (navigator.share) {
    try {
      await navigator.share({ text });
      return 'shared';
    } catch {
      return null;
    }
  }
  try {
    await navigator.clipboard.writeText(text);
    return 'copied';
  } catch {
    return null;
  }
}

export default function ClassDetail() {
  const { classId } = useParams();
  const { profile } = useOutletContext();
  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState(null);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('xp');
  const [onlyInactive, setOnlyInactive] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [showAnnouncement, setShowAnnouncement] = useState(false);
  const [shareStatus, setShareStatus] = useState('');
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setError('');
      try {
        const [cls, progress] = await Promise.all([
          getClassById(profile.institutionId, classId),
          callGetClassProgress({ classId, institutionId: profile.institutionId }),
        ]);
        if (!cancelled) {
          setClassInfo(cls);
          setStudents(progress.data.students);
        }
      } catch {
        if (!cancelled) setError('שגיאה בטעינת נתוני הכיתה.');
      }
    }

    if (profile?.institutionId) load();

    return () => {
      cancelled = true;
    };
  }, [classId, profile, reloadKey]);

  async function handleShare() {
    if (!classInfo) return;
    const result = await shareJoinCode(classInfo.name, classInfo.joinCode);
    if (result === 'copied') {
      setShareStatus('הקוד הועתק!');
      setTimeout(() => setShareStatus(''), 2000);
    }
  }

  return (
    <div className="px-4 pt-6 space-y-4">
      <Link to="/classes" className="text-sm text-brand-grey-text hover:text-brand-text">
        ← חזרה לכיתות
      </Link>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {classInfo && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-brand-text">{classInfo.name}</h1>
            {classInfo.grade && <p className="text-brand-grey-text">שכבה {classInfo.grade}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAnnouncement(true)}
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-brand-green text-white font-semibold text-sm"
            >
              📣 שלח הודעה לכיתה
            </button>
            <button
              onClick={handleShare}
              className="flex-1 min-w-[140px] px-4 py-3 rounded-xl bg-brand-turquoise/10 text-brand-turquoise font-semibold text-sm"
            >
              {shareStatus || `🔗 שתף קוד (${classInfo.joinCode})`}
            </button>
          </div>
        </>
      )}

      {!students && !error && <LoadingSpinner label="טוען תלמידים..." />}

      {students && (
        <StudentTable
          students={students}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onlyInactive={onlyInactive}
          onToggleOnlyInactive={() => setOnlyInactive((v) => !v)}
          onSelectStudent={setSelectedStudent}
        />
      )}

      {selectedStudent && (
        <StudentDetailDrawer student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}

      {showAnnouncement && (
        <SendAnnouncementModal
          classId={classId}
          onClose={() => setShowAnnouncement(false)}
          onSent={() => setShowAnnouncement(false)}
        />
      )}
    </div>
  );
}
