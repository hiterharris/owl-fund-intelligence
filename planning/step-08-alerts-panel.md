# Step 08 — Alerts Panel

## Goal
Build the right-sidebar Alerts panel. It lists recent fund intelligence alerts (from SEC EDGAR + mock data), color-coded by type, with a "Mark all read" button that updates local state.

## Interview Talking Points
- "Mark all read" is handled entirely in frontend state — no backend PATCH call needed for a take-home. In production this would persist to a database.
- Alert `type` drives the icon color: green for positive performance, yellow for warnings, red for departures/negative events, gray for neutral regulatory filings
- The SEC EDGAR alerts give the panel credibility — they're real filings from real hedge funds
- Unread alerts get a subtle left border highlight — common pattern in notification UIs

---

## File to Create

### `frontend/src/components/AlertsPanel.tsx`
```tsx
import type { Alert } from '../types';

interface Props {
  alerts: Alert[];
  onMarkAllRead: () => void;
}

const typeStyles: Record<Alert['type'], { border: string; dot: string }> = {
  positive: { border: 'border-l-green-400',  dot: 'bg-green-400' },
  warning:  { border: 'border-l-yellow-400', dot: 'bg-yellow-400' },
  negative: { border: 'border-l-red-400',    dot: 'bg-red-400' },
  neutral:  { border: 'border-l-gray-300',   dot: 'bg-gray-400' },
};

export default function AlertsPanel({ alerts, onMarkAllRead }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-gray-900">Alerts</h2>
        <button
          onClick={onMarkAllRead}
          className="text-xs text-blue-500 hover:text-blue-700 font-medium"
        >
          Mark all read
        </button>
      </div>

      {/* Alert list */}
      <ul className="flex flex-col gap-3 overflow-y-auto">
        {alerts.length === 0 && (
          <li className="text-sm text-gray-400 text-center py-8">No alerts</li>
        )}
        {alerts.map((alert) => {
          const style = typeStyles[alert.type];
          return (
            <li
              key={alert.id}
              className={`border-l-2 pl-3 py-1 ${style.border} ${alert.read ? 'opacity-50' : ''}`}
            >
              <div className="flex items-start gap-2">
                <span className={`mt-1.5 w-2 h-2 rounded-full flex-shrink-0 ${style.dot}`} />
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{alert.title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{alert.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{alert.time}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
```

## Verification
- Alerts panel renders in the right column alongside the charts
- Each alert shows colored dot, title, description, and time
- Clicking "Mark all read" grays out all alerts (via `opacity-50`)
- SEC EDGAR alerts appear at the bottom with "ADV amendment" titles and real fund names
