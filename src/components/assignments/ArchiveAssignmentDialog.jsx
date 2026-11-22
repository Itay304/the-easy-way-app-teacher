import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { callArchiveAssignment } from '../../lib/api.js';
import Modal from '../ui/Modal.jsx';
import { friendlyError } from '../../lib/errors.js';
import Button from '../ui/Button.jsx';

// אישור "מחיקה" של משימה — בפועל העברה לארכיון (assignments-v2): המשימה נעלמת מהתלמידים ומהרשימה
// הפעילה, ההתקדמות נשמרת, ואפשר לשחזר מ"משימות בארכיון".
export default function ArchiveAssignmentDialog({ assignment, onClose, onArchived }) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function confirm() {
    setSaving(true);
    setError('');
    try {
      await callArchiveAssignment({ assignmentId: assignment.id });
      onArchived(assignment);
    } catch (err) {
      setError(friendlyError(err, { context: 'archiveAssignment' }));
      setSaving(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="sm">
      <div role="alertdialog" aria-labelledby="archive-title" aria-describedby="archive-desc" className="space-y-4">
        <div className="flex items-center gap-2">
          <Trash2 size={20} className="text-brand-error" aria-hidden="true" />
          <h2 id="archive-title" className="text-h2 font-bold text-brand-text">
            למחוק את המשימה?
          </h2>
        </div>
        <p className="font-semibold text-brand-text">{assignment.title}</p>
        <p id="archive-desc" className="text-body-sm text-brand-text">
          המשימה תוסר מהתלמידים. ההתקדמות שלהם נשמרת.
        </p>
        <p className="text-caption text-brand-grey-text">אפשר לשחזר אותה בכל זמן מ"משימות בארכיון".</p>
        {error && (
          <p role="alert" className="text-body-sm text-brand-error">
            {error}
          </p>
        )}
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            ביטול
          </Button>
          <Button type="button" variant="danger" onClick={confirm} loading={saving} className="flex-1">
            מחיקה
          </Button>
        </div>
      </div>
    </Modal>
  );
}
