import type { FundDetail } from '../types';

interface Props {
  funds: FundDetail[];
  onClose: () => void;
}

function ReturnBadge({ value }: { value: number }) {
  const pos = value >= 0;
  return (
    <span className={`font-medium ${pos ? 'text-green-600' : 'text-red-500'}`}>
      {pos ? '+' : ''}{value.toFixed(2)}%
    </span>
  );
}

function RangeBar({ low, high, current }: { low: number; high: number; current: number }) {
  const pct = high > low ? ((current - low) / (high - low)) * 100 : 50;
  return (
    <div className="flex items-center gap-2 text-xs text-gray-400 min-w-[120px]">
      <span>${low.toFixed(0)}</span>
      <div className="relative flex-1 h-1.5 bg-gray-200 rounded-full">
        <div
          className="absolute top-0 left-0 h-1.5 bg-blue-400 rounded-full"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <span>${high.toFixed(0)}</span>
    </div>
  );
}

const strategyColors: Record<string, string> = {
  'Hedge Funds':     'bg-blue-100 text-blue-700',
  'Private Equity':  'bg-emerald-100 text-emerald-700',
  'Venture Capital': 'bg-amber-100 text-amber-700',
  'Real Assets':     'bg-red-100 text-red-700',
  'Fixed Income':    'bg-purple-100 text-purple-700',
  'Public Equity':   'bg-pink-100 text-pink-700',
};

export default function FundsModal({ funds, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Portfolio Funds</h2>
            <p className="text-xs text-gray-400 mt-0.5">{funds.length} active positions · live market data</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none"
          >
            ✕
          </button>
        </div>

        {/* Table */}
        <div className="overflow-auto flex-1">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Fund</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Strategy</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Manager</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">AUM</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Today</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">YTD</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">1-Mo</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">52W Range</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-gray-500 uppercase tracking-wide">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {funds.map((fund) => (
                <tr key={fund.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-8 rounded-full flex-shrink-0"
                        style={{ backgroundColor: fund.color }}
                      />
                      <div>
                        <div className="font-medium text-gray-900">{fund.name}</div>
                        <div className="text-xs text-gray-400">{fund.ticker} · {fund.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${strategyColors[fund.strategy] ?? 'bg-gray-100 text-gray-700'}`}>
                      {fund.strategy}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-600">{fund.manager}</td>
                  <td className="px-4 py-4 text-right font-medium text-gray-900">
                    ${fund.aum_billions.toFixed(1)}B
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ReturnBadge value={fund.daily_change} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ReturnBadge value={fund.ytd_return} />
                  </td>
                  <td className="px-4 py-4 text-right">
                    <ReturnBadge value={fund.monthly_return} />
                  </td>
                  <td className="px-4 py-4">
                    <RangeBar low={fund.week52_low} high={fund.week52_high} current={fund.current_price} />
                  </td>
                  <td className="px-4 py-4 text-right text-gray-700 font-medium">
                    ${fund.current_price.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Prices via yfinance · Proxy tickers used for fund performance tracking
        </div>
      </div>
    </div>
  );
}
