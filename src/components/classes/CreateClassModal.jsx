import { useState } from 'react';
import { callCreateClass } from '../../lib/api.js';
import Modal from '../ui/Modal.jsx';
import Input from '../ui/Input.jsx';
import Button from '../ui/Button.jsx';

export default function CreateClassModal({ onClose, onCreated }) {
  const [name, setName] = useState('');
  const [grade, setGrade] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await callCreateClass({ className: name.trim(), grade: grade.trim() });
      onCreated();
    } catch {
      setError('שגיאה ביצירת הכיתה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="sm">
      <h2 className="text-body-lg font-bold text-brand-text mb-4">צור כיתה חדשה</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input required value={name} onChange={(e) => setName(e.target.value)} placeholder="שם הכיתה" />
        <Input value={grade} onChange={(e) => setGrade(e.target.value)} placeholder="שכבה (אופציונלי)" />
        {error && <p className="text-brand-error text-body-sm text-center">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="ghost" onClick={onClose} className="flex-1">
            ביטול
          </Button>
          <Button type="submit" loading={submitting} disabled={!name.trim()} className="flex-1">
            צור
          </Button>
        </div>
      </form>
    </Modal>
  );
}
