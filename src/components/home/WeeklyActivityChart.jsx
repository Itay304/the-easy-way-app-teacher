import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeeklyActivityChart({ data }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white shadow-sm p-5">
      <h2 className="text-lg font-bold text-brand-text mb-4">פעילות שבועית</h2>
      <div className="h-56" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="label" tick={{ fontSize: 13 }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 13 }} />
            <Tooltip
              contentStyle={{ direction: 'rtl', fontFamily: 'Assistant, sans-serif' }}
              formatter={(value) => [value, 'תלמידים פעילים']}
            />
            <Line type="monotone" dataKey="count" stroke="#2e7d32" strokeWidth={2.5} dot={{ r: 4 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
