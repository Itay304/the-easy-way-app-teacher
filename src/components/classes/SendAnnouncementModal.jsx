import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { callSendAnnouncement } from '../../lib/api.js';
import Modal from '../ui/Modal.jsx';
import Button from '../ui/Button.jsx';

const MAX_LEN = 200;

export default function SendAnnouncementModal({ classId, onClose, onSent }) {
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await callSendAnnouncement({ classId, message: message.trim() });
      onSent();
    } catch {
      setError('שגיאה בשליחת ההודעה. נסה שוב.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal onClose={onClose} maxWidth="sm">
      <div className="flex items-center gap-2 mb-4">
        <Megaphone size={20} className="text-brand-turquoise" />
        <h2 className="text-lg font-bold text-brand-text">שלח הודעה לכיתה</h2>
      </div>
      <form onSubmit={handleSubmit} className="space-y-3">
        <textarea
          required
          maxLength={MAX_LEN}
          rows={4}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="הודעה לתלמידי הכיתה..."
          className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-turquoise resize-none"
        />
        <p className="text-xs text-brand-grey-text text-left">
          {message.length}/{MAX_LEN}
        </p>
        {error && <p className="text-brand-error text-sm text-center">{error}</p>}
        <div className="flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            ביטול
          </Button>
          <Button type="submit" loading={submitting} disabled={!message.trim()} className="flex-1">
            שלח
          </Button>
        </div>
      </form>
    </Modal>
  );
}
