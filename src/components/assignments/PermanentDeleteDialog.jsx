import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { callDeleteAssignmentPermanently } from '../../lib/api.js';
import { friendlyError } from '../../lib/errors.js';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

// "מחיקה לצמיתות" של משימה מהארכיון — אישור חזק: הכפתור פעיל רק אחרי סימון "אני מבין/ה".
// השרת (deleteAssignmentPermanently) בודק שוב: רק משימה בארכיון, רק המורה שיצר או מנהל המוסד, ורושם לפני המחיקה.
export default function PermanentDeleteDialog({ assignment, onClose, onDeleted }) {
  const [understood, setUnderstood] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setSaving(true);
    setError('');
    try {
      await callDeleteAssignmentPermanently({ assignmentId: assignment.id });
      onDeleted(assignment);
    } catch (err) {
      setError(friendlyError(err, { context: 'deleteAssignmentPermanently' }));
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="sm">
      <div
        role="alertdialog"
        aria-labelledby="perm-delete-title"
        aria-describedby="perm-delete-desc"
        className="space-y-4"
      >
        <div className="flex items-center gap-2">
          <AlertTriangle size={20} className="text-brand-error" aria-hidden="true" />
          <h2 id="perm-delete-title" className="text-h2 font-bold text-brand-text">
            מחיקה לצמיתות
          </h2>
        </div>
        <p className="font-semibold text-brand-text">{assignment.title}</p>
        <p
          id="perm-delete-desc"
          className="rounded-xl bg-brand-error-light p-3 text-body-sm font-semibold text-brand-error"
        >
          המשימה וכל ההתקדמות של התלמידים בה יימחקו לצמיתות. אי אפשר לבטל את הפעולה.
        </p>
        <label className="flex items-start gap-2.5 text-body-sm text-brand-text cursor-pointer">
          <input
            type="checkbox"
            checked={understood}
            onChange={(e) => setUnderstood(e.target.checked)}
            className="mt-0.5 h-5 w-5 shrink-0 accent-brand-turquoise"
          />
          <span>אני מבין/ה שאי אפשר לשחזר את המשימה אחרי המחיקה</span>
        </label>
        {error && (
          <p role="alert" className="text-body-sm text-brand-error">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            ביטול
          </Button>
          <Button
            type="button"
            variant="danger"
            onClick={confirm}
            loading={saving}
            disabled={!understood}
            className="flex-1"
          >
            מחיקה לצמיתות
          </Button>
        </div>
      </div>
    </Modal>
  );
}
