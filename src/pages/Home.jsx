import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyClasses, getAssignmentsForClasses, callGetClassProgress, callGetClassHardWords } from '../lib/api.js';
import { toDateKey, daysAgo, lastSevenDays } from '../lib/dateUtils.js';
import { GraduationCap, ClipboardList, TrendingUp } from 'lucide-react';
import ErrorBanner from '../components/ErrorBanner.jsx';
import SummaryCard from '../components/ui/StatCard.jsx';
import { SummaryCardsSkeleton, Skeleton } from '../components/Skeleton.jsx';
import WeeklyActivityChart from '../components/home/WeeklyActivityChart.jsx';
import InactiveStudentsList from '../components/home/InactiveStudentsList.jsx';
import HardWordsHeatmap from '../components/home/HardWordsHeatmap.jsx';
import AssignmentCard from '../components/assignments/AssignmentCard.jsx';
import useMediaQuery from '../hooks/useMediaQuery.js';

// getClassProgress/getClassHardWords קוראות את כל ה-progress של כל תלמיד בכיתה — יקר. לכן:
// טוענים רק את הכיתה שנבחרה (לא את כל הכיתות בכל כניסה לבית), ושומרים בזיכרון ל-5 דקות,
// כך שחזרה לעמוד הבית בתוך האפליקציה לא קוראת שוב. "רענון" (נסה שוב) עוקף את המטמון.
const CLASS_CACHE_MS = 5 * 60 * 1000;
const classCache = new Map(); // classId -> { at, students, words }

async function loadClassData(classId, institutionId, force) {
  const hit = classCache.get(classId);
  if (!force && hit && Date.now() - hit.at < CLASS_CACHE_MS) return hit;
  const [progress, hard] = await Promise.all([
    callGetClassProgress({ classId, institutionId }),
    callGetClassHardWords({ classId, institutionId }),
  ]);
  const entry = { at: Date.now(), students: progress.data.students, words: hard.data.words };
  classCache.set(classId, entry);
  return entry;
}

function summarize(students, words) {
  const todayKey = toDateKey(Date.now());
  return {
    totalStudents: students.length,
    activeToday: students.filter((s) => s.lastActiveDate !== null && toDateKey(s.lastActiveDate) === todayKey).length,
    avgMastered: students.length === 0 ? 0 : students.reduce((sum, s) => sum + s.masteredWords, 0) / students.length,
    weeklyChart: lastSevenDays().map(({ key, label }) => ({
      label,
      count: students.filter((s) => s.lastActiveDate !== null && toDateKey(s.lastActiveDate) === key).length,
    })),
    inactiveStudents: students
      .filter((s) => daysAgo(s.lastActiveDate) >= 3)
      .sort((a, b) => daysAgo(b.lastActiveDate) - daysAgo(a.lastActiveDate)),
    // מפת חום של הכיתה — כל המילים, הקשות קודם (getClassHardWords כבר ממיינת)
    hardWords: words,
  };
}

export default function Home() {
  const { user, profile } = useAuth();
  const [classes, setClasses] = useState(null);
  const [activeAssignments, setActiveAssignments] = useState(0);
  const [assignmentList, setAssignmentList] = useState([]);
  // במחשב בלבד: המשימות של הכיתה עם הסיכום (בקצב / מאחור / לא התחילו) — עמודה ראשית בבית.
  // בטלפון לא מוצגות ולא נטענים סיכומים (AssignmentCard טוען סיכום רק כשהוא מוצג).
  const desktop = useMediaQuery('(min-width: 1024px)');
  const [classId, setClassId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // 1. הכיתות והמשימות (שאילתות Firestore רגילות — זולות)
  useEffect(() => {
    let cancelled = false;
    if (!profile?.institutionId || !user) {
      setLoading(false);
      setError('לא משויך למוסד — לא ניתן לטעון נתוני דשבורד.');
      return undefined;
    }
    (async () => {
      try {
        const myClasses = await getMyClasses(profile.institutionId, user.uid);
        const assignments = await getAssignmentsForClasses(
          profile.institutionId,
          myClasses.map((c) => c.id),
        );
        if (cancelled) return;
        setClasses(myClasses);
        setActiveAssignments(assignments.length);
        setAssignmentList(assignments.map((a) => ({ ...a, institutionId: profile.institutionId })));
        setClassId((current) => current || myClasses[0]?.id || null);
        if (myClasses.length === 0) setLoading(false);
      } catch {
        if (!cancelled) {
          setError('שגיאה בטעינת הדשבורד.');
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  // 2. נתוני הכיתה שנבחרה בלבד (עם מטמון)
  useEffect(() => {
    if (!classId || !profile?.institutionId) return undefined;
    let cancelled = false;
    setLoading(true);
    setError('');
    loadClassData(classId, profile.institutionId, reloadKey > 0)
      .then(({ students, words }) => !cancelled && setData(summarize(students, words)))
      .catch(() => !cancelled && setError('שגיאה בטעינת הדשבורד.'))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [classId, profile?.institutionId, reloadKey]);

  return (
    <div className="px-4 pt-6 space-y-6">
      <h1 className="text-h1 font-bold text-brand-text">בית</h1>

      {classes && classes.length > 1 && (
        <label className="flex items-center gap-2 text-body-sm font-semibold text-brand-text">
          כיתה:
          <select
            value={classId || ''}
            onChange={(e) => setClassId(e.target.value)}
            className="rounded-xl border border-black/10 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
      )}

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {loading && (
        <div className="space-y-6">
          <SummaryCardsSkeleton />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      )}

      {data && !loading && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard icon={GraduationCap} label="תלמידים פעילים היום" value={data.activeToday} />
            <SummaryCard icon={ClipboardList} label="משימות פעילות" value={activeAssignments} />
            <SummaryCard icon={TrendingUp} label="ממוצע מילים נכבשות" value={data.avgMastered.toFixed(1)} />
          </div>

          {/* טאבלט (md): שני הפאנלים התחתונים זה לצד זה. מחשב (lg): עמודה ראשית (2/3) — המשימות של
          הכיתה וגרף הפעילות; עמודת צד (1/3) — תלמידים לא פעילים ומפת החום. בטלפון — כמו קודם. */}
          <div className="space-y-6 lg:grid lg:grid-cols-3 lg:items-start lg:gap-6 lg:space-y-0">
            <div className="space-y-6 lg:col-span-2">
              {desktop && (
                <section aria-labelledby="home-assignments-title" className="space-y-3">
                  <h2 id="home-assignments-title" className="text-h2 font-bold text-brand-text">
                    משימות הכיתה
                  </h2>
                  {assignmentList.filter((a) => a.classId === classId).length === 0 ? (
                    <p className="text-body-sm text-brand-grey-text">אין משימות פעילות בכיתה הזו.</p>
                  ) : (
                    <ul className="space-y-3">
                      {assignmentList
                        .filter((a) => a.classId === classId)
                        .map((a) => (
                          <li key={a.id}>
                            <AssignmentCard
                              assignment={a}
                              className={classes?.find((c) => c.id === a.classId)?.name || ''}
                            />
                          </li>
                        ))}
                    </ul>
                  )}
                </section>
              )}
              <WeeklyActivityChart data={data.weeklyChart} />
            </div>
            <div className="md:grid md:grid-cols-2 md:gap-4 space-y-6 md:space-y-0 lg:block lg:space-y-6">
              <InactiveStudentsList students={data.inactiveStudents} />
              <HardWordsHeatmap words={data.hardWords} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
