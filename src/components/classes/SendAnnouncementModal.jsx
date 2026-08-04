import { useState } from 'react';
import { Megaphone } from 'lucide-react';
import { callSendAnnouncement } from '../../lib/api.js';

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
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <Megaphone size={20} className="text-brand-green" />
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
            className="w-full rounded-xl border border-black/10 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-green resize-none"
          />
          <p className="text-xs text-brand-grey-text text-left">
            {message.length}/{MAX_LEN}
          </p>
          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-black/10 text-brand-text font-semibold"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={submitting || !message.trim()}
              className="flex-1 py-3 rounded-xl bg-brand-green text-white font-bold disabled:opacity-60"
            >
              {submitting ? '...' : 'שלח'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
