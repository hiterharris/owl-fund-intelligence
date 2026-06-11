interface Props {
  label: string;
  value: string;
  change_pct: number;
  icon: 'chart' | 'dollar' | 'trend' | 'bell';
  onClick?: () => void;
}

const icons: Record<Props['icon'], string> = {
  chart:  '📊',
  dollar: '$',
  trend:  '↗',
  bell:   '🔔',
};

export default function MetricCard({ label, value, change_pct, icon, onClick }: Props) {
  const isPositive = change_pct >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-500';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <div
      className={`bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2 ${onClick ? 'cursor-pointer hover:border-blue-300 hover:shadow-md transition-all' : ''}`}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{icons[icon]}</span>
        <div className="flex items-center gap-1.5">
          {onClick && (
            <span className="text-xs text-blue-400 font-medium">View details →</span>
          )}
          <span className={`text-xs font-medium ${changeColor}`}>
            {arrow} {Math.abs(change_pct)}%
          </span>
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
