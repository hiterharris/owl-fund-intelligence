import type { Alert } from '../types';

interface Props {
  alerts: Alert[];
  onMarkAllRead: () => void;
  onClose: () => void;
}

const typeStyles: Record<Alert['type'], { border: string; dot: string; badge: string }> = {
  positive: { border: 'border-l-green-400',  dot: 'bg-green-400',  badge: 'bg-green-100 text-green-700' },
  warning:  { border: 'border-l-yellow-400', dot: 'bg-yellow-400', badge: 'bg-yellow-100 text-yellow-700' },
  negative: { border: 'border-l-red-400',    dot: 'bg-red-400',    badge: 'bg-red-100 text-red-700' },
  neutral:  { border: 'border-l-gray-300',   dot: 'bg-gray-400',   badge: 'bg-gray-100 text-gray-600' },
};

const typeLabel: Record<Alert['type'], string> = {
  positive: 'Positive',
  warning:  'Warning',
  negative: 'Alert',
  neutral:  'Info',
};

export default function AlertsModal({ alerts, onMarkAllRead, onClose }: Props) {
  const unread = alerts.filter((a) => !a.read).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Active Alerts</h2>
            <p className="text-xs text-gray-400 mt-0.5">
              {alerts.length} total · {unread} unread · live price &amp; SEC filing signals
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={onMarkAllRead}
              className="text-xs text-blue-500 hover:text-blue-700 font-medium"
            >
              Mark all read
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl font-light">✕</button>
          </div>
        </div>

        {/* Alert list */}
        <ul className="overflow-y-auto flex-1 divide-y divide-gray-50 px-6 py-2">
          {alerts.length === 0 && (
            <li className="text-sm text-gray-400 text-center py-12">No active alerts</li>
          )}
          {alerts.map((alert) => {
            const s = typeStyles[alert.type];
            return (
              <li
                key={alert.id}
                className={`py-4 border-l-2 pl-4 ${s.border} ${alert.read ? 'opacity-50' : ''}`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${s.dot}`} />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">{alert.title}</p>
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">{alert.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${s.badge}`}>
                      {typeLabel[alert.type]}
                    </span>
                    <span className="text-xs text-gray-400">{alert.time}</span>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>

        <div className="px-6 py-3 border-t border-gray-100 text-xs text-gray-400">
          Price signals via yfinance · Regulatory filings via SEC EDGAR
        </div>
      </div>
    </div>
  );
}
