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

  const formatted = data.map((d) => ({
    ...d,
    label: new Date(d.date + '-01').toLocaleString('default', { month: 'short' }),
  }));

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Portfolio Performance</h2>
        <p className="text-xs text-gray-400">Cumulative returns vs. blended benchmark (ACWI/AGG/GLD/HYG/VNQ)</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={formatted} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" />
          <XAxis dataKey="label" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
          <YAxis tickFormatter={formatPct} tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} width={48} />
          <Tooltip formatter={(v) => formatPct(Number(v))} />
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
            name="Blended Benchmark"
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
