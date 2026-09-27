import { useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import { doc, setDoc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { auth, db, functions } from '../firebase.js';

const PENDING_INSTITUTION_KEY = 'pending_institution_code';

export default function Login() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // מורה שמגיע מקישור הזמנה של מנהל מוסד (?institutionCode=, נלכד
  // ב-main.jsx) — עובר ישר למצב הרשמה, בלי שיצטרך למצוא את הכפתור בעצמו.
  useEffect(() => {
    if (localStorage.getItem(PENDING_INSTITUTION_KEY)) {
      setMode('signup');
    }
  }, []);

  function switchMode() {
    setMode((m) => (m === 'login' ? 'signup' : 'login'));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        const pendingInstitutionCode = localStorage.getItem(PENDING_INSTITUTION_KEY);
        const { user } = await createUserWithEmailAndPassword(auth, email, password);
        try {
          await setDoc(doc(db, 'users', user.uid), {
            displayName: fullName,
            email,
            role: 'teacher',
            createdAt: serverTimestamp(),
          });
          // בדיקת קיום המוסד לא אפשרית ישירות מהלקוח — firestore.rules על
          // institutions/{instId} דורשות belongsToInstitution(instId),
          // ומורה חדש עדיין לא שייך לאף מוסד. הפונקציה רצה עם הרשאות
          // Admin SDK ובודקת בפועל (ר' functions/index.js).
          if (pendingInstitutionCode) {
            const joinInstitution = httpsCallable(functions, 'joinInstitutionAsTeacher');
            await joinInstitution({ institutionId: pendingInstitutionCode });
            localStorage.removeItem(PENDING_INSTITUTION_KEY);
          }
        } catch (joinErr) {
          // אותו עיקרון all-or-nothing כמו בהרשמת תלמיד (the-easy-way-app-student):
          // קוד מוסד לא תקין לא אמור להשאיר מורה "יתום" — מחובר אבל בלי
          // מוסד, ובלי אפשרות לנסות שוב עם אותו אימייל. מוחקים גם את
          // מסמך Firestore שכבר נכתב (setDoc הצליח לפני שה-join נכשל),
          // לא רק את חשבון ה-Auth — אחרת נשאר מסמך יתום בלי חשבון תואם.
          await deleteDoc(doc(db, 'users', user.uid)).catch(() => {});
          await deleteUser(user).catch(() => {});
          throw joinErr;
        }
      }
    } catch (err) {
      if (mode === 'login') {
        setError('אימייל או סיסמה שגויים.');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('כתובת האימייל כבר רשומה. התחבר במקום זאת.');
      } else if (err.code === 'auth/weak-password') {
        setError('הסיסמה חייבת להכיל לפחות 6 תווים.');
      } else if (err.code && err.code.startsWith('functions/')) {
        setError(err.message || 'קוד המוסד אינו תקין. בקש קישור חדש מהמנהל.');
      } else {
        setError('שגיאה בהרשמה. נסו שוב.');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12">
      <img src="/icons/icon-192.png" alt="EasyLex" className="h-20 w-20 rounded-2xl shadow-md mb-6" />
      <h1 className="text-2xl font-bold text-brand-text mb-8">EasyLex — מורה</h1>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        {mode === 'signup' && (
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="שם מלא"
            className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
          />
        )}
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="אימייל"
          className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
        />
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="סיסמה"
          className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
        />
        {error && <p className="text-red-600 text-sm text-center">{error}</p>}
        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 rounded-xl bg-brand-turquoise text-white font-bold text-lg hover:bg-brand-turquoise-dark transition disabled:opacity-60"
        >
          {submitting ? '...' : mode === 'login' ? 'כניסה' : 'הרשמה'}
        </button>
        <button
          type="button"
          onClick={switchMode}
          className="w-full text-sm text-brand-grey-text hover:text-brand-text underline"
        >
          {mode === 'login' ? 'אין לך חשבון? הירשם' : 'כבר יש לך חשבון? התחבר'}
        </button>
      </form>
    </div>
  );
}
