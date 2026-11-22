import { useEffect, useState } from 'react';
import { Check } from 'lucide-react';
import { getWordLists, getCustomLists } from '../../../lib/api.js';
import LoadingSpinner from '../../LoadingSpinner.jsx';
import Button from '../../ui/Button.jsx';

// שלב 1: מקור המילים. אפשר לבחור כמה רשימות (assignments-v2) — כמה Bands, או Band + רשימה מוסדית.
// sources: [{ sourceType: 'wordList'|'customList', listId, name }]. בחירה ביותר מרשימה אחת תדרוש אישור בשלב 3.
export default function StepSource({ institutionId, sources, onChange, onNext }) {
  const [wordLists, setWordLists] = useState(null);
  const [customLists, setCustomLists] = useState(null);
  const [tab, setTab] = useState('wordList');

  useEffect(() => {
    getWordLists().then(setWordLists);
    getCustomLists(institutionId).then(setCustomLists);
  }, [institutionId]);

  const isSelected = (sourceType, listId) => sources.some((s) => s.sourceType === sourceType && s.listId === listId);

  function toggle(sourceType, list) {
    if (isSelected(sourceType, list.id)) {
      onChange(sources.filter((s) => !(s.sourceType === sourceType && s.listId === list.id)));
    } else {
      onChange([...sources, { sourceType, listId: list.id, name: list.name || list.id }]);
    }
  }

  function renderList(lists, sourceType, emptyText) {
    if (lists === null) return <LoadingSpinner />;
    if (lists.length === 0) return <p className="text-brand-grey-text text-body-sm text-center py-4">{emptyText}</p>;
    return lists.map((list) => {
      const selected = isSelected(sourceType, list.id);
      return (
        <button
          key={list.id}
          type="button"
          aria-pressed={selected}
          onClick={() => toggle(sourceType, list)}
          className={`w-full flex items-center gap-3 text-right px-4 py-3 rounded-xl border transition ${
            selected ? 'border-brand-turquoise bg-brand-turquoise/5' : 'border-black/10 bg-white'
          }`}
        >
          <span
            aria-hidden="true"
            className={`h-5 w-5 shrink-0 rounded-md border-2 flex items-center justify-center ${
              selected ? 'bg-brand-turquoise border-brand-turquoise text-white' : 'border-brand-grey-text'
            }`}
          >
            {selected && <Check size={14} strokeWidth={3} />}
          </span>
          <span className="font-semibold text-brand-text">{list.name || list.id}</span>
          {typeof list.wordCount === 'number' && (
            <span className="text-body-sm text-brand-grey-text">({list.wordCount} מילים)</span>
          )}
        </button>
      );
    });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-body-lg font-bold text-brand-text">שלב 1: מקור מילים</h2>
      <p className="text-body-sm text-brand-grey-text">אפשר לבחור רשימה אחת או כמה רשימות.</p>

      <div className="flex gap-2">
        {[
          ['wordList', 'באנדים'],
          ['customList', 'רשימות מוסדיות'],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`flex-1 py-2.5 rounded-xl text-body-sm font-semibold ${
              tab === key ? 'bg-brand-turquoise text-white' : 'bg-brand-grey-light text-brand-text'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {tab === 'wordList'
          ? renderList(wordLists, 'wordList', 'לא נמצאו רשימות מילים.')
          : renderList(customLists, 'customList', 'אין עדיין רשימות מוסדיות.')}
      </div>

      {sources.length > 0 && (
        <p className="text-body-sm text-brand-text" aria-live="polite">
          נבחרו: {sources.map((s) => s.name).join(', ')}
        </p>
      )}

      <Button onClick={onNext} disabled={sources.length === 0} className="w-full">
        המשך
      </Button>
    </div>
  );
}
