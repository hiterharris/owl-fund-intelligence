# Step 06 — Portfolio Performance Chart

## Goal
Build the line chart showing 12-month cumulative returns for the portfolio (QQQ proxy) vs the benchmark (SPY). Uses Recharts.

## Interview Talking Points
- Real data from yfinance makes the chart look credible — the lines actually diverge in realistic ways
- Cumulative return (not raw price) is the right metric for comparing strategies with different price levels
- `ResponsiveContainer` wraps the chart so it fills its parent without hardcoded pixel dimensions — critical for responsive layouts
- The dashed benchmark line is a common financial charting convention — distinguishes it from the portfolio without relying on color alone (accessibility)

---

## File to Create

### `frontend/src/components/PortfolioChart.tsx`
```tsx
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer
} from 'recharts';
import type { PerformancePoint } from '../types';

interface Props {
  data: PerformancePoint[];
}

const formatPct = (v: number) => `${(v * 100).toFixed(1)}%`;

export default function PortfolioChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-64 flex items-center justify-center text-gray-400 text-sm">
        Loading performance data...
      </div>
    );
  }

  // Format date labels to short month name
  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + '-01').toLocaleString('default', { month: 'short' }),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Portfolio Performance</h2>
        <p className="text-xs text-gray-400">Cumulative returns vs. benchmark</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatPct} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={(v: number) => formatPct(v)} />
          <Legend iconType="plainline" wrapperStyle={{ fontSize: 12 }} />
          <Line
            type="monotone"
            dataKey="portfolio"
            name="Portfolio"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="benchmark"
            name="Benchmark"
            stroke="#9CA3AF"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

## Verification
- Chart renders with two lines (blue solid = portfolio, gray dashed = benchmark)
- X-axis shows 12 month labels (Jun → Jun)
- Y-axis shows percentage values (e.g., 0.0%, 5.0%, 10.0%)
- Hovering a data point shows tooltip with both values formatted as percentages
