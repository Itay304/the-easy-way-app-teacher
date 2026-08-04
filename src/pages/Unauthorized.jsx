import { signOut } from 'firebase/auth';
import { auth } from '../firebase.js';

export default function Unauthorized() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="text-5xl mb-4">🚫</div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">אין הרשאה</h1>
      <p className="text-brand-grey-text mb-10 max-w-sm">
        החשבון הזה אינו מוגדר כמורה או כמנהל מוסד. אם זו טעות, פנה למנהל המערכת שלך.
      </p>
      <button
        onClick={() => signOut(auth)}
        className="text-sm text-brand-grey-text hover:text-brand-text underline"
      >
        התנתק ונסה עם חשבון אחר
      </button>
    </div>
  );
}
