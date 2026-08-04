export default function SummaryCard({ icon, label, value, accent = 'brand-green' }) {
  return (
    <div className="rounded-2xl border border-black/5 bg-white shadow-sm p-5 flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
          accent === 'brand-turquoise' ? 'bg-brand-turquoise/10' : 'bg-brand-green/10'
        }`}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-2xl font-bold text-brand-text leading-none">{value}</p>
        <p className="text-sm text-brand-grey-text mt-1">{label}</p>
      </div>
    </div>
  );
}
