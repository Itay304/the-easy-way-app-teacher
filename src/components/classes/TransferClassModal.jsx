import { useEffect, useState } from 'react';
import { ArrowRightLeft } from 'lucide-react';
import { getTeachersForInstitution, callTransferClass } from '../../lib/api.js';
import LoadingSpinner from '../LoadingSpinner.jsx';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

export default function TransferClassModal({ institutionId, classId, currentTeacherId, onClose, onTransferred }) {
  const [teachers, setTeachers] = useState(null);
  const [newTeacherId, setNewTeacherId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getTeachersForInstitution(institutionId)
      .then((list) => {
        if (cancelled) return;
        setTeachers(list);
        const firstOther = list.find((t) => t.uid !== currentTeacherId);
        if (firstOther) setNewTeacherId(firstOther.uid);
      })
      .catch(() => {
        if (!cancelled) setError('שגיאה בטעינת רשימת המורים.');
      });
    return () => {
      cancelled = true;
    };
  }, [institutionId, currentTeacherId]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!newTeacherId) return;
    setSubmitting(true);
    setError('');
    try {
      await callTransferClass({ classId, newTeacherId });
      onTransferred();
    } catch {
      setError('שגיאה בהעברת הכיתה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="sm">
        <div className="flex items-center gap-2 mb-4">
          <ArrowRightLeft size={20} className="text-brand-turquoise" />
          <h2 className="text-lg font-bold text-brand-text">העבר כיתה למורה אחר</h2>
        </div>

        {teachers === null && !error && <LoadingSpinner />}

        {teachers !== null && (
          <form onSubmit={handleSubmit} className="space-y-3">
            <select
              required
              value={newTeacherId}
              onChange={(e) => setNewTeacherId(e.target.value)}
              className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-turquoise"
            >
              {teachers.length === 0 && <option value="">אין מורים נוספים במוסד</option>}
              {teachers.map((t) => (
                <option key={t.uid} value={t.uid} disabled={t.uid === currentTeacherId}>
                  {t.displayName || t.uid}
                  {t.uid === currentTeacherId ? ' (המורה הנוכחי)' : ''}
                </option>
              ))}
            </select>

            {error && <p className="text-brand-error text-sm text-center">{error}</p>}

            <div className="flex gap-3">
              <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
                ביטול
              </Button>
              <Button
                type="submit"
                loading={submitting}
                disabled={!newTeacherId || newTeacherId === currentTeacherId}
                className="flex-1"
              >
                העבר
              </Button>
            </div>
          </form>
        )}
    </Modal>
  );
}
