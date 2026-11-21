import { MARKETING_LABEL } from '../../lib/consent.js';

// תיבת הסכמה אופציונלית לדיוור (מורים ומנהלים בלבד) — לא מסומנת מראש, לא חוסמת הרשמה.
export default function MarketingCheckbox({ checked, onChange }) {
  return (
    <label className="flex items-start gap-2.5 text-body-sm text-brand-text text-right cursor-pointer">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-0.5 h-5 w-5 shrink-0 accent-brand-turquoise"
      />
      <span>
        {MARKETING_LABEL} <span className="text-brand-grey-text">(לא חובה)</span>
      </span>
    </label>
  );
}
