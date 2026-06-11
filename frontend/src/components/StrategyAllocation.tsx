import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { AllocationItem } from '../types';

interface Props {
  data: AllocationItem[];
}

export default function StrategyAllocation({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-64 flex items-center justify-center text-gray-400 text-sm">
        Loading allocation data...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Strategy Allocation</h2>
        <p className="text-xs text-gray-400">Current portfolio breakdown</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut */}
        <div className="w-48 h-48 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={52}
                outerRadius={80}
                dataKey="value"
                paddingAngle={2}
              >
                {data.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v: number) => `${v}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <ul className="flex flex-col gap-2 flex-1">
          {data.map((item) => (
            <li key={item.name} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-700">{item.name}</span>
              </span>
              <span className="font-medium text-gray-900">{item.value}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
