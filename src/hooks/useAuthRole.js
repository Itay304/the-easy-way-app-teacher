import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebase.js';

const ALLOWED_ROLES = ['teacher', 'principal'];

// status: 'loading' | 'signed-out' | 'unauthorized' | 'ready'
export default function useAuthRole() {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null); // { role, institutionId, displayName, classIds }

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setStatus('signed-out');
      }
    });
    return unsubAuth;
  }, []);

  useEffect(() => {
    if (!user) return undefined;

    setStatus('loading');
    const unsubDoc = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        const data = snap.data() || {};
        const role = data.role || 'student';
        setProfile({
          role,
          institutionId: data.institutionId || null,
          displayName: data.displayName || user.email,
          classIds: Array.isArray(data.classIds) ? data.classIds : [],
        });
        setStatus(ALLOWED_ROLES.includes(role) ? 'ready' : 'unauthorized');
      },
      () => setStatus('unauthorized'),
    );
    return unsubDoc;
  }, [user]);

  return { status, user, profile };
}
