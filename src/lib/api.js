import {
  collection,
  query,
  where,
  getDocs,
  doc,
  getDoc,
} from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase.js';

// ── כיתות ────────────────────────────────────────────────────────────────

export async function getMyClasses(institutionId, teacherUid) {
  const q = query(
    collection(db, 'institutions', institutionId, 'classes'),
    where('teacherId', '==', teacherUid),
    where('archived', '==', false),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getClassById(institutionId, classId) {
  const snap = await getDoc(doc(db, 'institutions', institutionId, 'classes', classId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export const callCreateClass = httpsCallable(functions, 'createClass');

// ── משימות ───────────────────────────────────────────────────────────────

export async function getAssignmentsForClasses(institutionId, classIds) {
  if (classIds.length === 0) return [];
  // Firestore 'in' מוגבל ל-30 ערכים — מספיק לכיתות של מורה יחיד.
  const q = query(
    collection(db, 'institutions', institutionId, 'assignments'),
    where('classId', 'in', classIds.slice(0, 30)),
    where('status', '==', 'active'),
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export const callCreateAssignment = httpsCallable(functions, 'createAssignment');

// ── מילים ────────────────────────────────────────────────────────────────

export async function getWordLists() {
  const snap = await getDocs(collection(db, 'word_lists'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getWordsForList(listId) {
  const snap = await getDocs(collection(db, 'word_lists', listId, 'words'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCustomLists(institutionId) {
  const snap = await getDocs(collection(db, 'institutions', institutionId, 'customLists'));
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getCustomListWords(institutionId, listId) {
  const snap = await getDocs(
    collection(db, 'institutions', institutionId, 'customLists', listId, 'words'),
  );
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// ── התקדמות תלמידים / הודעות (Cloud Functions קיימות בלבד) ─────────────────

export const callGetClassProgress = httpsCallable(functions, 'getClassProgress');
export const callGetClassHardWords = httpsCallable(functions, 'getClassHardWords');
export const callGetAssignmentProgress = httpsCallable(functions, 'getAssignmentProgress');
export const callSendAnnouncement = httpsCallable(functions, 'sendAnnouncement');
export const callGetPrincipalStats = httpsCallable(functions, 'getPrincipalStats');

// ── מוסד ─────────────────────────────────────────────────────────────────

export async function getInstitution(institutionId) {
  const snap = await getDoc(doc(db, 'institutions', institutionId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

// ── משתמשים (מותר לקרוא עמיתי-מוסד ישירות, ר' firestore.rules) ────────────

export async function getUserDoc(uid) {
  const snap = await getDoc(doc(db, 'users', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
