import { useEffect, useState } from 'react';
import { signOut } from 'firebase/auth';
import { ExternalLink, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase.js';
import { marketingFields } from '../lib/consent.js';
import {
  getInstitution,
  getMyClasses,
  callGetClassStudentCounts,
  callSetInstitutionContentSettings,
  resetContentPolicy,
} from '../lib/api.js';
import { hidesSensitive } from '../lib/contentFilter.js';
import { Skeleton } from '../components/Skeleton.jsx';
import Card from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';

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
      const [inst, classes, countsRes] = await Promise.all([
        getInstitution(profile.institutionId),
        getMyClasses(profile.institutionId, user.uid),
        callGetClassStudentCounts({ institutionId: profile.institutionId }).catch(() => ({ data: { counts: {} } })),
      ]);
      if (cancelled) return;
      const counts = countsRes.data.counts || {};
      setInstitution(inst);
      setStats({
        classCount: classes.length,
        studentCount: classes.reduce((sum, c) => sum + (counts[c.id] ?? 0), 0),
      });
    }
    if (profile?.institutionId && user) load();
    return () => {
      cancelled = true;
    };
  }, [profile, user]);

  // "קבלת עדכונים במייל" — הסכמה לדיוור, אפשר לשנות בכל זמן (נשמר עם זמן שרת וגרסת הנוסח).
  // הערך המוצג מגיע מה-snapshot של מסמך המשתמש (useAuthRole), כך שהוא מתעדכן אחרי השמירה.
  const [savingMarketing, setSavingMarketing] = useState(false);
  const [marketingError, setMarketingError] = useState('');
  async function toggleMarketing() {
    setSavingMarketing(true);
    setMarketingError('');
    try {
      await updateDoc(doc(db, 'users', user.uid), marketingFields(!profile.marketingConsent));
    } catch (err) {
      console.error('[Profile] marketing consent save failed:', err);
      setMarketingError('השמירה נכשלה. נסו שוב.');
    } finally {
      setSavingMarketing(false);
    }
  }

  function toggleNotify() {
    const next = !notifyInactive;
    setNotifyInactive(next);
    localStorage.setItem(NOTIFY_KEY, String(next));
  }

  // הגדרת מוסד (מנהל בלבד): "תוכן מותאם לבתי ספר דתיים" — מסתיר מילים מתויגות sensitive מכל המוסד
  const isPrincipal = profile.role === 'principal';
  const hideSensitive = hidesSensitive(institution);
  const [savingContent, setSavingContent] = useState(false);
  const [contentError, setContentError] = useState('');

  async function toggleHideSensitive() {
    const next = !hideSensitive;
    setSavingContent(true);
    setContentError('');
    try {
      await callSetInstitutionContentSettings({ hideSensitiveWords: next });
      setInstitution((prev) => ({ ...prev, hideSensitiveWords: next }));
      resetContentPolicy();
    } catch {
      setContentError('לא הצלחנו לשמור את ההגדרה. נסו שוב.');
    } finally {
      setSavingContent(false);
    }
  }

  return (
    <div className="px-4 pt-6 space-y-5">
      <h1 className="text-h1 font-bold text-brand-text">פרופיל</h1>

      <Card padding="p-5" className="text-center">
        <span className="h-16 w-16 mx-auto rounded-full bg-brand-turquoise/15 text-brand-turquoise font-bold text-h1 flex items-center justify-center mb-3">
          {(profile.displayName || '?')[0]}
        </span>
        <p className="font-bold text-brand-text text-body-lg">{profile.displayName}</p>
        <p className="text-body-sm text-brand-grey-text">{institution ? institution.name : '...'}</p>
      </Card>

      {!stats ? (
        <div className="grid grid-cols-2 gap-3">
          <Skeleton className="h-16 rounded-xl" />
          <Skeleton className="h-16 rounded-xl" />
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-brand-grey-light px-4 py-3 text-center">
            <p className="text-h2 font-bold text-brand-text">{stats.classCount}</p>
            <p className="text-caption text-brand-grey-text mt-0.5">כיתות</p>
          </div>
          <div className="rounded-xl bg-brand-grey-light px-4 py-3 text-center">
            <p className="text-h2 font-bold text-brand-text">{stats.studentCount}</p>
            <p className="text-caption text-brand-grey-text mt-0.5">תלמידים</p>
          </div>
        </div>
      )}

      <Card padding="p-5" className="flex items-center justify-between">
        <span className="text-body-sm font-medium text-brand-text">התראות על תלמידים לא פעילים</span>
        <button
          onClick={toggleNotify}
          className={`w-12 h-7 rounded-full transition relative ${
            notifyInactive ? 'bg-brand-turquoise' : 'bg-black/10'
          }`}
        >
          <span
            className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
              notifyInactive ? 'right-1' : 'right-6'
            }`}
          />
        </button>
      </Card>

      <Card padding="p-5" className="space-y-2">
        <div className="flex items-center justify-between gap-4">
          <span id="marketing-consent-label" className="text-body-sm font-medium text-brand-text">
            קבלת עדכונים במייל
          </span>
          <button
            role="switch"
            aria-checked={profile.marketingConsent}
            aria-labelledby="marketing-consent-label"
            aria-describedby="marketing-consent-hint"
            disabled={savingMarketing}
            onClick={toggleMarketing}
            className={`w-12 h-7 shrink-0 rounded-full transition relative disabled:opacity-50 ${
              profile.marketingConsent ? 'bg-brand-turquoise' : 'bg-black/10'
            }`}
          >
            <span
              className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                profile.marketingConsent ? 'right-1' : 'right-6'
              }`}
            />
          </button>
        </div>
        <p id="marketing-consent-hint" className="text-caption text-brand-grey-text">
          עדכונים ומידע על מוצרים חדשים של Easylex. מיילי שירות (כמו איפוס סיסמה) נשלחים בכל מקרה.
        </p>
        {marketingError && <p className="text-caption text-brand-error">{marketingError}</p>}
      </Card>

      {isPrincipal && institution && (
        <Card padding="p-5" className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <span id="hide-sensitive-label" className="text-body-sm font-medium text-brand-text">
              תוכן מותאם לבתי ספר דתיים
            </span>
            <button
              role="switch"
              aria-checked={hideSensitive}
              aria-labelledby="hide-sensitive-label"
              disabled={savingContent}
              onClick={toggleHideSensitive}
              className={`w-12 h-7 shrink-0 rounded-full transition relative disabled:opacity-50 ${
                hideSensitive ? 'bg-brand-turquoise' : 'bg-black/10'
              }`}
            >
              <span
                className={`absolute top-1 h-5 w-5 rounded-full bg-white transition ${
                  hideSensitive ? 'right-1' : 'right-6'
                }`}
              />
            </button>
          </div>
          <p className="text-caption text-brand-grey-text">
            מילים שסומנו כרגישות לא יוצגו לתלמידי המוסד ולא יהיו זמינות ביצירת משימות. במשימות קיימות הן ידולגו.
          </p>
          {contentError && <p className="text-caption text-brand-error">{contentError}</p>}
        </Card>
      )}

      <a
        href="https://theeasywayapp.co.il/teacher"
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-brand-turquoise/10 text-brand-turquoise font-semibold"
      >
        <ExternalLink size={16} />
        פתח ממשק מלא באתר
      </a>

      <Button variant="danger-subtle" size="lg" onClick={() => signOut(auth)}>
        <LogOut size={16} />
        התנתק
      </Button>
    </div>
  );
}
