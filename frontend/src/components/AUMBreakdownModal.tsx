import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { AllocationItem, FundDetail } from '../types';

interface Props {
  allocation: AllocationItem[];
  funds: FundDetail[];
  totalAUM: number;
  onClose: () => void;
}

export default function AUMBreakdownModal({ allocation, funds, totalAUM, onClose }: Props) {
  const chartData = allocation.map((a) => ({
    name: a.name,
    aum: a.aum_billions ?? 0,
    color: a.color,
    pct: a.value,
    fund_count: a.fund_count ?? 0,
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">AUM Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              Total tracked: <span className="font-semibold text-gray-700">${totalAUM.toFixed(1)}B</span> across {funds.length} funds
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
        </div>

        <div className="overflow-auto flex-1 p-6 flex flex-col gap-6">
          {/* Bar chart */}
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 16, right: 24, top: 4, bottom: 4 }}>
                <XAxis
                  type="number"
                  tickFormatter={(v) => `$${v}B`}
                  tick={{ fontSize: 11, fill: '#9CA3AF' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  width={120}
                  tick={{ fontSize: 12, fill: '#374151' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  formatter={(v) => [`$${Number(v).toFixed(1)}B`, 'AUM']}
                  contentStyle={{ borderRadius: 8, border: '1px solid #E5E7EB', fontSize: 12 }}
                />
                <Bar dataKey="aum" radius={[0, 4, 4, 0]}>
                  {chartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Strategy</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">AUM</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">% of Portfolio</th>
                <th className="text-right py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Funds</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {chartData.map((row) => (
                <tr key={row.name} className="hover:bg-gray-50">
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: row.color }} />
                      <span className="text-gray-800 font-medium">{row.name}</span>
                    </div>
                  </td>
                  <td className="py-3 text-right font-semibold text-gray-900">${row.aum.toFixed(1)}B</td>
                  <td className="py-3 text-right text-gray-600">{row.pct.toFixed(1)}%</td>
                  <td className="py-3 text-right text-gray-600">{row.fund_count}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-gray-200">
                <td className="py-3 font-semibold text-gray-900">Total</td>
                <td className="py-3 text-right font-bold text-gray-900">${totalAUM.toFixed(1)}B</td>
                <td className="py-3 text-right font-semibold text-gray-700">100%</td>
                <td className="py-3 text-right font-semibold text-gray-700">{funds.length}</td>
              </tr>
            </tbody>
          </table>

          {/* Per-fund AUM */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Individual Fund AUM</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {funds.map((f) => (
                <div key={f.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: f.color }} />
                    <span className="text-xs text-gray-700 truncate">{f.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900 ml-2 flex-shrink-0">${f.aum_billions.toFixed(1)}B</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
