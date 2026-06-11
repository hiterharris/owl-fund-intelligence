# Step 07 — Strategy Allocation Chart

## Goal
Build the donut chart showing the 6-category portfolio breakdown. Uses Recharts `PieChart` with an inner radius to create the donut shape, plus a custom legend matching the mockup.

## Interview Talking Points
- Donut (vs full pie) is the standard for allocation charts in financial dashboards — the center void can display a total or key metric in a future iteration
- Using `cx="50%"` and `cy="50%"` keeps it centered regardless of container size
- The legend is rendered as a custom component (not Recharts' built-in) for full control over layout — matching the side-by-side name + percentage format in the mockup
- Colors come from the backend so swapping strategy colors requires no frontend change

---

## File to Create

### `frontend/src/components/StrategyAllocation.tsx`
```tsx
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
```

## Verification
- Donut chart renders with 6 colored segments
- Legend shows all 6 categories with correct percentages
- Hovering a segment shows tooltip with percentage
- Total of all percentages adds to 100% (32+25+18+12+8+5 = 100)
