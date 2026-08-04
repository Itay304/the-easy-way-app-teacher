export default function SummaryCard({ icon: Icon, label, value, accent = 'green' }) {
  const bg = accent === 'turquoise' ? 'bg-brand-turquoise/10 text-brand-turquoise' : 'bg-brand-green/10 text-brand-green';

  return (
    <div className="rounded-2xl bg-white shadow-md p-4 flex items-center gap-4">
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center shrink-0 ${bg}`}>
        <Icon size={24} strokeWidth={2.25} />
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-brand-text leading-none">{value}</p>
        <p className="text-xs text-brand-grey-text mt-1.5">{label}</p>
      </div>
    </div>
  );
}
