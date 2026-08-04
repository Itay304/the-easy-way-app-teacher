import { useEffect, useState } from 'react';
import { getWordLists, getCustomLists } from '../../../lib/api.js';
import LoadingSpinner from '../../LoadingSpinner.jsx';

export default function StepSource({ institutionId, source, onChange, onNext }) {
  const [wordLists, setWordLists] = useState(null);
  const [customLists, setCustomLists] = useState(null);
  const [tab, setTab] = useState(source.sourceType);

  useEffect(() => {
    getWordLists().then(setWordLists);
    getCustomLists(institutionId).then(setCustomLists);
  }, [institutionId]);

  function selectList(sourceType, listId) {
    onChange({ sourceType, listId });
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-bold text-brand-text">שלב 1: מקור מילים</h2>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('wordList')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${
            tab === 'wordList' ? 'bg-brand-green text-white' : 'bg-brand-grey-light text-brand-text'
          }`}
        >
          באנדים
        </button>
        <button
          onClick={() => setTab('customList')}
          className={`flex-1 py-2.5 rounded-xl text-sm font-semibold ${
            tab === 'customList' ? 'bg-brand-green text-white' : 'bg-brand-grey-light text-brand-text'
          }`}
        >
          רשימות מוסדיות
        </button>
      </div>

      {tab === 'wordList' && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {wordLists === null ? (
            <LoadingSpinner />
          ) : wordLists.length === 0 ? (
            <p className="text-brand-grey-text text-sm text-center py-4">לא נמצאו רשימות מילים.</p>
          ) : (
            wordLists.map((list) => (
              <button
                key={list.id}
                onClick={() => selectList('wordList', list.id)}
                className={`w-full text-right px-4 py-3 rounded-xl border transition ${
                  source.sourceType === 'wordList' && source.listId === list.id
                    ? 'border-brand-green bg-brand-green/5'
                    : 'border-black/10 bg-white'
                }`}
              >
                <span className="font-semibold text-brand-text">{list.name || list.id}</span>
                {typeof list.wordCount === 'number' && (
                  <span className="text-sm text-brand-grey-text mr-2">({list.wordCount} מילים)</span>
                )}
              </button>
            ))
          )}
        </div>
      )}

      {tab === 'customList' && (
        <div className="space-y-2 max-h-72 overflow-y-auto">
          {customLists === null ? (
            <LoadingSpinner />
          ) : customLists.length === 0 ? (
            <p className="text-brand-grey-text text-sm text-center py-4">אין עדיין רשימות מוסדיות.</p>
          ) : (
            customLists.map((list) => (
              <button
                key={list.id}
                onClick={() => selectList('customList', list.id)}
                className={`w-full text-right px-4 py-3 rounded-xl border transition ${
                  source.sourceType === 'customList' && source.listId === list.id
                    ? 'border-brand-green bg-brand-green/5'
                    : 'border-black/10 bg-white'
                }`}
              >
                <span className="font-semibold text-brand-text">{list.name || list.id}</span>
              </button>
            ))
          )}
        </div>
      )}

      <button
        onClick={onNext}
        disabled={!source.listId}
        className="w-full py-3 rounded-xl bg-brand-green text-white font-bold disabled:opacity-40"
      >
        המשך
      </button>
    </div>
  );
}
