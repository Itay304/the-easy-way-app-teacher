import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const ALLOWED_ROLES = ['teacher', 'principal'];

// syncUserClaims (functions/index.js, onDocumentWritten על users/{uid}) מסנכרן
// role/institutionId ל-Custom Claims א-סינכרונית, אחרי הכתיבה שקבעה אותם —
// לא בו-זמנית איתה, ולפעמים עם עיכוב ניכר (cold start של ה-Cloud Function).
// אותו תיקון בדיוק כמו the-easy-way-app-student/src/hooks/useAuthRole.js:
// בודקים תחילה את הטוקן הקיים (זול, בלי רשת — המקרה הנפוץ: משתמש חוזר
// שה-claims שלו כבר מסונכרנים מפעם קודמת), ורק אם יש אי-התאמה מנסים שוב
// עם רענון כפוי ופער זמן גדל, עד שה-claim בפועל תואם את המסמך. בלי זה,
// מורה שנרשם דרך קישור הזמנה (?institutionCode=) רואה שגיאת הרשאות מיד
// אחרי ההרשמה — ה-Firestore doc כבר נכון, אבל ה-token עדיין לא מעודכן.
const CLAIM_RETRY_DELAYS_MS = [300, 800, 1500];

async function ensureInstitutionClaimMatches(user, institutionId) {
  let result = await user.getIdTokenResult();
  if (result.claims.institutionId === institutionId) return;

  for (const delayMs of CLAIM_RETRY_DELAYS_MS) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    result = await user.getIdTokenResult(true);
    if (result.claims.institutionId === institutionId) return;
  }
}

// status: 'loading' | 'signed-out' | 'unauthorized' | 'ready'
export default function useAuthRole() {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { role, institutionId, displayName, classIds }

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        setProfile(null);
        setStatus('signed-out');
        return;
      }
      firebaseUser.getIdToken(true).finally(() => setUser(firebaseUser));
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    setStatus('loading');
    let cancelled = false;

    const unsubDoc = onSnapshot(
      doc(db, 'users', user.uid),
      async (snap) => {
        const data = snap.data() || {};
        const role = data.role || 'student';
        const institutionId = data.institutionId || null;

        if (institutionId) {
          await ensureInstitutionClaimMatches(user, institutionId);
          if (cancelled) return;
        }

        setProfile({
          role,
          institutionId,
          displayName: data.displayName || user.email,
          classIds: Array.isArray(data.classIds) ? data.classIds : [],
        });
        setStatus(ALLOWED_ROLES.includes(role) ? 'ready' : 'unauthorized');
      },
      () => setStatus('unauthorized'),
    );
    return () => {
      cancelled = true;
      unsubDoc();
    };
  }, [user]);

  return { status, user, profile };
}
