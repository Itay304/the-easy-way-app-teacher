import Card from './Card.jsx';

const ACCENT_CLASSES = {
  primary: 'bg-brand-turquoise/10 text-brand-turquoise',
  success: 'bg-brand-green/10 text-brand-green',
};

// iconClassName is an escape hatch for states that don't fit primary/success,
// without forcing an unrequested third accent value.
export default function StatCard({ icon: Icon, value, label, accent = 'primary', iconClassName, className = '' }) {
  return (
    <Card className={`flex items-center gap-4 ${className}`}>
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${iconClassName || ACCENT_CLASSES[accent]}`}>
        <Icon size={24} strokeWidth={2} />
      </div>
      <div className="min-w-0">
        <p className="text-h1 font-bold text-brand-text leading-none">{value}</p>
        <p className="text-caption text-brand-grey-text mt-1.5">{label}</p>
      </div>
    </Card>
  );
}
