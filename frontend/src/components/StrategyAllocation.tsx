import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { AllocationItem, FundDetail } from '../types';
import { fetchFundsByStrategy } from '../api/client';

interface Props {
  data: AllocationItem[];
}

function ReturnBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={`text-xs font-medium ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

export default function StrategyAllocation({ data }: Props) {
  const [selectedStrategy, setSelectedStrategy] = useState<string | null>(null);
  const [drillFunds, setDrillFunds] = useState<FundDetail[]>([]);
  const [loadingDrill, setLoadingDrill] = useState(false);

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5 h-64 flex items-center justify-center text-gray-400 text-sm">
        Loading allocation data...
      </div>
    );
  }

  const handleStrategyClick = async (name: string) => {
    if (selectedStrategy === name) {
      setSelectedStrategy(null);
      setDrillFunds([]);
      return;
    }
    setSelectedStrategy(name);
    setLoadingDrill(true);
    try {
      const funds = await fetchFundsByStrategy(name);
      setDrillFunds(funds);
    } catch {
      setDrillFunds([]);
    } finally {
      setLoadingDrill(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="mb-4">
        <h2 className="font-semibold text-gray-900">Strategy Allocation</h2>
        <p className="text-xs text-gray-400">Click a strategy to see fund breakdown</p>
      </div>

      <div className="flex items-center gap-6">
        {/* Donut chart */}
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
                onClick={(entry) => entry.name && handleStrategyClick(entry.name as string)}
                style={{ cursor: 'pointer' }}
              >
                {data.map((entry) => (
                  <Cell
                    key={entry.name}
                    fill={entry.color}
                    opacity={selectedStrategy && selectedStrategy !== entry.name ? 0.35 : 1}
                    stroke={selectedStrategy === entry.name ? '#1E40AF' : 'none'}
                    strokeWidth={selectedStrategy === entry.name ? 2 : 0}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v, _name, props) => {
                  const payload = props?.payload as { name?: string; aum_billions?: number } | undefined;
                  const aum = payload?.aum_billions;
                  return [
                    `${Number(v).toFixed(1)}%${aum != null ? ` · $${aum.toFixed(1)}B` : ''}`,
                    payload?.name ?? '',
                  ];
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <ul className="flex flex-col gap-2 flex-1">
          {data.map((item) => (
            <li
              key={item.name}
              className={`flex items-center justify-between text-sm rounded-lg px-2 py-1 cursor-pointer transition-colors ${selectedStrategy === item.name ? 'bg-blue-50' : 'hover:bg-gray-50'}`}
              onClick={() => handleStrategyClick(item.name)}
            >
              <span className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-gray-700">{item.name}</span>
                {item.fund_count != null && (
                  <span className="text-xs text-gray-400">({item.fund_count})</span>
                )}
              </span>
              <div className="flex items-center gap-3">
                {item.aum_billions != null && (
                  <span className="text-xs text-gray-400">${item.aum_billions.toFixed(1)}B</span>
                )}
                <span className="font-medium text-gray-900">{item.value.toFixed(1)}%</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Drill-down panel */}
      {selectedStrategy && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-800">{selectedStrategy} — Fund Detail</h3>
            <button
              onClick={() => { setSelectedStrategy(null); setDrillFunds([]); }}
              className="text-xs text-gray-400 hover:text-gray-600"
            >
              Close ✕
            </button>
          </div>

          {loadingDrill ? (
            <div className="text-xs text-gray-400 animate-pulse py-4 text-center">Loading funds...</div>
          ) : (
            <div className="grid gap-2">
              {drillFunds.map((fund) => (
                <div key={fund.id} className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">{fund.name}</div>
                      <div className="text-xs text-gray-400">{fund.ticker} · {fund.manager}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0 ml-4">
                    <div className="text-right">
                      <div className="text-xs text-gray-400">AUM</div>
                      <div className="text-sm font-semibold text-gray-900">${fund.aum_billions.toFixed(1)}B</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">YTD</div>
                      <ReturnBadge value={fund.ytd_return} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">1-Mo</div>
                      <ReturnBadge value={fund.monthly_return} />
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-gray-400">Price</div>
                      <div className="text-sm font-medium text-gray-700">${fund.current_price.toFixed(2)}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
