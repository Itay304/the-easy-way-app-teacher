import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell } from 'recharts';
import { CalendarClock } from 'lucide-react';
import { callGetAssignmentProgress } from '../../lib/api.js';

export default function AssignmentCard({ assignment, className }) {
  const [pct, setPct] = useState(null);

  useEffect(() => {
    let cancelled = false;
    callGetAssignmentProgress({ assignmentId: assignment.id, institutionId: assignment.institutionId })
      .then((res) => !cancelled && setPct(res.data.completionPct))
      .catch(() => !cancelled && setPct(0));
    return () => {
      cancelled = true;
    };
  }, [assignment.id, assignment.institutionId]);

  const data = [
    { name: 'הושלם', value: pct ?? 0 },
    { name: 'נותר', value: 100 - (pct ?? 0) },
  ];

  return (
    <div className="rounded-2xl bg-white shadow-md p-4 flex items-center gap-4">
      <div className="h-16 w-16 shrink-0 relative">
        <PieChart width={64} height={64}>
          <Pie
            data={data}
            dataKey="value"
            innerRadius={20}
            outerRadius={30}
            startAngle={90}
            endAngle={-270}
            stroke="none"
          >
            <Cell fill="#2e7d32" />
            <Cell fill="#f5f5f5" />
          </Pie>
        </PieChart>
        <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-brand-text">
          {pct === null ? '…' : `${pct}%`}
        </span>
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-brand-text truncate">{assignment.title}</p>
        <p className="text-sm text-brand-grey-text truncate">{className}</p>
        {assignment.dueDateMs && (
          <p className="flex items-center gap-1 text-xs text-brand-grey-text mt-0.5">
            <CalendarClock size={13} />
            עד {new Date(assignment.dueDateMs).toLocaleDateString('he-IL')}
          </p>
        )}
      </div>
    </div>
  );
}
