import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowRight, Megaphone, Share2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { getClassById, callGetClassProgress } from '../lib/api.js';
import { ListSkeleton } from '../components/Skeleton.jsx';
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
  const navigate = useNavigate();
  const { profile } = useAuth();
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

  function goBack() {
    // navigate(-1) קופץ אחורה בהיסטוריה האמיתית (עדיף על push חדש ל-/classes,
    // שהיה יוצר entry כפול). אם הגיעו לכאן ישירות (deep link, אין state
    // קודם) — נופלים ל-/classes בלי ליצור עוד skip-back מוזר.
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/classes', { replace: true });
    }
  }

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
      <button
        onClick={goBack}
        className="inline-flex items-center gap-1 text-sm text-brand-grey-text hover:text-brand-text"
      >
        <ArrowRight size={16} />
        חזרה לכיתות
      </button>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {classInfo && (
        <>
          <div>
            <h1 className="text-2xl font-bold text-brand-green-dark">{classInfo.name}</h1>
            {classInfo.grade && <p className="text-brand-grey-text">שכבה {classInfo.grade}</p>}
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setShowAnnouncement(true)}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-green text-white font-semibold text-sm shadow-sm"
            >
              <Megaphone size={17} />
              שלח הודעה לכיתה
            </button>
            <button
              onClick={handleShare}
              className="flex-1 min-w-[140px] flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-brand-turquoise/10 text-brand-turquoise font-semibold text-sm"
            >
              <Share2 size={17} />
              {shareStatus || `שתף קוד (${classInfo.joinCode})`}
            </button>
          </div>
        </>
      )}

      {!students && !error && <ListSkeleton rows={5} />}

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
