import { useEffect, useState } from 'react';
import { X, Eye, CalendarClock } from 'lucide-react';
import { getAssignmentsForClasses, getWordsForList, getCustomListWords } from '../../lib/api.js';
import LoadingSpinner from '../LoadingSpinner.jsx';
import Modal from '../ui/Modal.jsx';
import Card from '../ui/Card.jsx';

const SAMPLE_WORD = {
  englishWord: 'achieve',
  hebrewTranslation: 'להשיג',
  exampleSentence: 'She worked hard to achieve her goals.',
};
const SAMPLE_DISTRACTORS = ['לוותר', 'להתחיל', 'לסיים'];
const DEMO_PROGRESS_PCT = 30;

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PreviewModal({ institutionId, classId, onClose }) {
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [word, setWord] = useState(SAMPLE_WORD);
  const [choices, setChoices] = useState(() => shuffle([SAMPLE_WORD.hebrewTranslation, ...SAMPLE_DISTRACTORS]));
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const assignments = await getAssignmentsForClasses(institutionId, [classId]);
        const found = assignments[0] || null;
        if (!found) return;

        // אין שדה שמציין אם listId הוא word_lists גלובלי או customList מוסדי
        // (StepFinalize לא שומר sourceType) — מנסים גלובלי קודם, נופלים
        // למוסדי אם ריק. תצוגה מקדימה בלבד — לא קריטי אם זה ניחוש.
        let words = await getWordsForList(found.listId);
        if (words.length === 0) {
          words = await getCustomListWords(institutionId, found.listId);
        }
        const scoped =
          found.wordIds && found.wordIds.length > 0 ? words.filter((w) => found.wordIds.includes(w.id)) : words;

        if (cancelled) return;
        setAssignment(found);
        if (scoped.length > 0) {
          const first = scoped[0];
          const distractorPool = shuffle(scoped.filter((w) => w.id !== first.id).map((w) => w.hebrewTranslation)).slice(
            0,
            3,
          );
          const distractors = distractorPool.length > 0 ? distractorPool : SAMPLE_DISTRACTORS;
          setWord(first);
          setChoices(shuffle([first.hebrewTranslation, ...distractors]));
        }
      } catch {
        // תצוגה מקדימה בלבד — אם הטעינה נכשלת, פשוט נשארים עם הדוגמה הגנרית
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [institutionId, classId]);

  return (
    <Modal onClose={onClose} maxWidth="md" className="max-h-[90vh] overflow-y-auto space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Eye size={20} className="text-brand-turquoise" />
            <h2 className="text-body-lg font-bold text-brand-text">תצוגה מקדימה</h2>
          </div>
          <button onClick={onClose} className="text-brand-grey-text hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <LoadingSpinner />
        ) : (
          <>
            <div>
              <p className="text-caption font-semibold text-brand-grey-text mb-2">כרטיס משימה</p>
              <Card padding="p-4" className="border border-black/5">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-semibold text-brand-text truncate">
                    {assignment?.title || 'משימת תרגול לדוגמה'}
                  </p>
                  <span className="text-body-sm font-bold text-brand-turquoise shrink-0">{DEMO_PROGRESS_PCT}%</span>
                </div>
                <div className="h-2 rounded-full bg-brand-grey-light overflow-hidden">
                  <div
                    className="h-full bg-brand-turquoise rounded-full"
                    style={{ width: `${DEMO_PROGRESS_PCT}%` }}
                  />
                </div>
                {assignment?.dueDateMs ? (
                  <p className="flex items-center gap-1 text-caption text-brand-grey-text mt-2">
                    <CalendarClock size={16} />
                    עד {new Date(assignment.dueDateMs).toLocaleDateString('he-IL')}
                  </p>
                ) : (
                  <p className="text-caption text-brand-grey-text mt-2">ללא דד-ליין</p>
                )}
              </Card>
            </div>

            <div>
              <p className="text-caption font-semibold text-brand-grey-text mb-2">כרטיסיית תרגול</p>
              <Card
                padding="p-6"
                role="button"
                tabIndex={0}
                onClick={() => setFlipped((f) => !f)}
                onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setFlipped((f) => !f)}
                className="border border-black/5 flex flex-col items-center justify-center text-center cursor-pointer min-h-[110px]"
              >
                {!flipped ? (
                  <p className="text-h1 font-bold text-brand-text" dir="ltr">
                    {word.englishWord}
                  </p>
                ) : (
                  <>
                    <p className="text-h2 font-bold text-brand-turquoise mb-1">{word.hebrewTranslation}</p>
                    {word.exampleSentence && (
                      <p className="text-body-sm text-brand-grey-text" dir="ltr">
                        {word.exampleSentence}
                      </p>
                    )}
                  </>
                )}
              </Card>
              <p className="text-caption text-brand-grey-text text-center mt-1">הקש/י להיפוך</p>
            </div>

            <div>
              <p className="text-caption font-semibold text-brand-grey-text mb-2">שאלת מבחן</p>
              <Card padding="p-5" className="border border-black/5 text-center mb-2">
                <p className="text-h2 font-bold text-brand-text" dir="ltr">
                  {word.englishWord}
                </p>
              </Card>
              <div className="space-y-2">
                {choices.map((c) => (
                  <div key={c} className="w-full rounded-xl border border-black/10 p-3 text-body-sm font-semibold text-brand-text">
                    {c}
                  </div>
                ))}
              </div>
            </div>

            <p className="text-body-sm text-center text-brand-grey-text bg-brand-grey-light rounded-xl p-3">
              👁 כך התלמיד רואה את המשימה שלך
            </p>
          </>
        )}
    </Modal>
  );
}
