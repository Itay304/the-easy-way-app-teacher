import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  getMyClasses,
  getAssignmentsForClasses,
  callGetClassProgress,
  callGetClassHardWords,
} from '../lib/api.js';
import { toDateKey, daysAgo, lastSevenDays } from '../lib/dateUtils.js';
import { GraduationCap, ClipboardList, TrendingUp } from 'lucide-react';
import ErrorBanner from '../components/ErrorBanner.jsx';
import SummaryCard from '../components/SummaryCard.jsx';
import { SummaryCardsSkeleton, Skeleton } from '../components/Skeleton.jsx';
import WeeklyActivityChart from '../components/home/WeeklyActivityChart.jsx';
import InactiveStudentsList from '../components/home/InactiveStudentsList.jsx';
import HardWordsHeatmap from '../components/home/HardWordsHeatmap.jsx';

export default function Home() {
  const { user, profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [data, setData] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError('');
      try {
        const classes = await getMyClasses(profile.institutionId, user.uid);
        const classIds = classes.map((c) => c.id);

        const [progressResults, hardWordsResults, activeAssignments] = await Promise.all([
          Promise.all(
            classes.map((c) =>
              callGetClassProgress({ classId: c.id, institutionId: profile.institutionId }).then(
                (res) => res.data.students,
              ),
            ),
          ),
          Promise.all(
            classes.map((c) =>
              callGetClassHardWords({ classId: c.id, institutionId: profile.institutionId }).then(
                (res) => res.data.words,
              ),
            ),
          ),
          getAssignmentsForClasses(profile.institutionId, classIds),
        ]);

        const allStudents = progressResults.flat();
        const todayKey = toDateKey(Date.now());

        const activeToday = allStudents.filter(
          (s) => s.lastActiveDate !== null && toDateKey(s.lastActiveDate) === todayKey,
        ).length;

        const avgMastered =
          allStudents.length === 0
            ? 0
            : allStudents.reduce((sum, s) => sum + s.masteredWords, 0) / allStudents.length;

        const inactiveStudents = allStudents
          .filter((s) => daysAgo(s.lastActiveDate) >= 3)
          .sort((a, b) => daysAgo(b.lastActiveDate) - daysAgo(a.lastActiveDate));

        const weeklyChart = lastSevenDays().map(({ key, label }) => ({
          label,
          count: allStudents.filter((s) => s.lastActiveDate !== null && toDateKey(s.lastActiveDate) === key)
            .length,
        }));

        // איחוד מילים קשות מכל הכיתות (סכימת attempts/errors/תלמידים מחדש
        // לפני מיון סופי) — מפת חום מציגה את כל המילים, לא רק top 5.
        const wordMap = new Map();
        hardWordsResults.flat().forEach((w) => {
          const errors = Math.round(w.errorRate * w.totalAttempts);
          const entry = wordMap.get(w.englishWord) ||
            { attempts: 0, errors: 0, studentsAttempted: 0, studentsFailed: 0 };
          entry.attempts += w.totalAttempts;
          entry.errors += errors;
          entry.studentsAttempted += w.studentsAttempted || 0;
          entry.studentsFailed += w.studentsFailed || 0;
          wordMap.set(w.englishWord, entry);
        });
        const hardWords = Array.from(wordMap.entries())
          .map(([englishWord, { attempts, errors, studentsAttempted, studentsFailed }]) => ({
            englishWord,
            totalAttempts: attempts,
            errorRate: attempts > 0 ? errors / attempts : 0,
            studentsAttempted,
            studentsFailed,
          }))
          .sort((a, b) => b.errorRate - a.errorRate);

        if (!cancelled) {
          setData({
            totalStudents: allStudents.length,
            activeToday,
            activeAssignments: activeAssignments.length,
            avgMastered,
            weeklyChart,
            inactiveStudents,
            hardWords,
          });
        }
      } catch {
        if (!cancelled) setError('שגיאה בטעינת הדשבורד.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    if (profile?.institutionId && user) load();
    else {
      setLoading(false);
      setError('לא משויך למוסד — לא ניתן לטעון נתוני דשבורד.');
    }

    return () => {
      cancelled = true;
    };
  }, [profile, user, reloadKey]);

  return (
    <div className="px-4 pt-6 space-y-6">
      <h1 className="text-2xl font-bold text-brand-text">בית</h1>

      {error && <ErrorBanner message={error} onRetry={() => setReloadKey((k) => k + 1)} />}

      {loading && (
        <div className="space-y-6">
          <SummaryCardsSkeleton />
          <Skeleton className="h-56 rounded-2xl" />
          <Skeleton className="h-32 rounded-2xl" />
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <SummaryCard icon={GraduationCap} label="תלמידים פעילים היום" value={data.activeToday} />
            <SummaryCard
              icon={ClipboardList}
              label="משימות פעילות"
              value={data.activeAssignments}
              accent="turquoise"
            />
            <SummaryCard icon={TrendingUp} label="ממוצע מילים נכבשות" value={data.avgMastered.toFixed(1)} />
          </div>

          <WeeklyActivityChart data={data.weeklyChart} />
          <InactiveStudentsList students={data.inactiveStudents} />
          <HardWordsHeatmap words={data.hardWords} />
        </>
      )}
    </div>
  );
}
