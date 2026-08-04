import { useState } from 'react';
import { X } from 'lucide-react';
import StepSource from './steps/StepSource.jsx';
import StepFilter from './steps/StepFilter.jsx';
import StepFinalize from './steps/StepFinalize.jsx';

const EMPTY_FILTERS = { letters: [], pos: [], difficulty: [], search: '', hardWordsForClass: false };

export default function AssignmentWizard({ institutionId, classes, onClose, onCreated }) {
  const [step, setStep] = useState(1);
  const [source, setSource] = useState({ sourceType: 'wordList', listId: null });
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [matchedWords, setMatchedWords] = useState([]);

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1.5">
            {[1, 2, 3].map((n) => (
              <span
                key={n}
                className={`h-1.5 w-8 rounded-full ${n <= step ? 'bg-brand-green' : 'bg-brand-grey-light'}`}
              />
            ))}
          </div>
          <button onClick={onClose} className="text-brand-grey-text hover:text-brand-text">
            <X size={20} />
          </button>
        </div>

        {step === 1 && (
          <StepSource
            institutionId={institutionId}
            source={source}
            onChange={setSource}
            onNext={() => setStep(2)}
          />
        )}

        {step === 2 && (
          <StepFilter
            institutionId={institutionId}
            classes={classes}
            source={source}
            filters={filters}
            onFiltersChange={setFilters}
            onMatchedWordsChange={setMatchedWords}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepFinalize
            matchedWords={matchedWords}
            listId={source.listId}
            classes={classes}
            onBack={() => setStep(2)}
            onCreated={onCreated}
          />
        )}
      </div>
    </div>
  );
}
