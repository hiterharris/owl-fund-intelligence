import type { FundDetail } from '../types';

interface Props {
  funds: FundDetail[];
  weightedYTD: number;
  onClose: () => void;
}

const strategyColors: Record<string, string> = {
  'Hedge Funds':     'bg-blue-100 text-blue-700',
  'Private Equity':  'bg-emerald-100 text-emerald-700',
  'Venture Capital': 'bg-amber-100 text-amber-700',
  'Real Assets':     'bg-red-100 text-red-700',
  'Fixed Income':    'bg-purple-100 text-purple-700',
  'Public Equity':   'bg-pink-100 text-pink-700',
};

export default function YTDReturnModal({ funds, weightedYTD, onClose }: Props) {
  const totalAUM = funds.reduce((s, f) => s + f.aum_billions, 0);
  const sorted = [...funds].sort((a, b) => b.ytd_return - a.ytd_return);
  const maxAbs = Math.max(...sorted.map((f) => Math.abs(f.ytd_return)), 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Avg. YTD Return Breakdown</h2>
            <p className="text-xs text-gray-400 mt-0.5">AUM-weighted returns by fund · year-to-date</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl font-light leading-none"
          >
            ✕
          </button>
        </div>

        {/* Summary strip */}
        <div className="px-4 sm:px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap items-center gap-4 sm:gap-6">
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Weighted Avg. YTD</div>
            <div className={`text-xl sm:text-2xl font-bold ${weightedYTD >= 0 ? 'text-green-600' : 'text-red-500'}`}>
              {weightedYTD >= 0 ? '+' : ''}{weightedYTD.toFixed(2)}%
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200" />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Funds</div>
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{funds.length}</div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200" />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Positive</div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">
              {funds.filter((f) => f.ytd_return >= 0).length}
            </div>
          </div>
          <div className="hidden sm:block h-10 w-px bg-gray-200" />
          <div>
            <div className="text-xs text-gray-400 uppercase tracking-wide">Negative</div>
            <div className="text-xl sm:text-2xl font-bold text-red-500">
              {funds.filter((f) => f.ytd_return < 0).length}
            </div>
          </div>
        </div>

        {/* Fund rows */}
        <div className="overflow-auto flex-1 px-6 py-4 flex flex-col gap-3">
          {sorted.map((fund) => {
            const weight = fund.aum_billions / totalAUM;
            const contribution = fund.ytd_return * weight;
            const barWidth = (Math.abs(fund.ytd_return) / maxAbs) * 100;
            const pos = fund.ytd_return >= 0;

            return (
              <div key={fund.id} className="flex items-center gap-3">
                {/* Fund info */}
                <div className="w-32 sm:w-48 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-8 rounded-full flex-shrink-0" style={{ backgroundColor: fund.color }} />
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-medium text-gray-900 leading-tight truncate">{fund.name}</div>
                      <span className={`inline-block px-1.5 py-0.5 rounded-full text-[10px] font-medium mt-0.5 ${strategyColors[fund.strategy] ?? 'bg-gray-100 text-gray-700'}`}>
                        {fund.strategy}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bar */}
                <div className="flex-1 flex items-center gap-2 min-w-0">
                  <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${pos ? 'bg-green-400' : 'bg-red-400'}`}
                      style={{ width: `${barWidth}%` }}
                    />
                  </div>
                  <span className={`text-xs sm:text-sm font-semibold w-14 sm:w-16 text-right flex-shrink-0 ${pos ? 'text-green-600' : 'text-red-500'}`}>
                    {pos ? '+' : ''}{fund.ytd_return.toFixed(2)}%
                  </span>
                </div>

                {/* Contribution — hidden on small screens */}
                <div className="hidden sm:block w-28 flex-shrink-0 text-right">
                  <div className="text-xs text-gray-400">{(weight * 100).toFixed(1)}% weight</div>
                  <div className={`text-xs font-medium ${contribution >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {contribution >= 0 ? '+' : ''}{contribution.toFixed(2)}% contrib.
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Returns via yfinance proxy tickers · Weighted by AUM allocation
        </div>
      </div>
    </div>
  );
}
