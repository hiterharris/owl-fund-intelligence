# Step 05 — KPI Cards Component

## Goal
Build the `Header` component and the `MetricCard` component. The four cards appear at the top of the dashboard and display the key stats with color-coded percentage change badges.

## Interview Talking Points
- The `changePct` sign drives the color — positive = green, negative = red — so the same component handles all 4 cards without conditional rendering per card
- The icon is a simple character/SVG — kept lightweight since the mockup uses simple line icons
- `Header` is intentionally thin: just branding + avatar. Could hold nav links or user dropdown in a future iteration.

---

## Files to Create

### `frontend/src/components/Header.tsx`
```tsx
export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <span className="font-bold text-blue-600 text-lg">OWL</span>
        <span className="text-gray-500 text-sm">Fund Intelligence</span>
      </div>
      <div className="flex items-center gap-3">
        <button className="text-gray-400 hover:text-gray-600">
          <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-semibold">
          JB
        </div>
      </div>
    </header>
  );
}
```

---

### `frontend/src/components/MetricCard.tsx`
```tsx
interface Props {
  label: string;
  value: string;
  change_pct: number;
  icon: 'chart' | 'dollar' | 'trend' | 'bell';
}

const icons: Record<Props['icon'], string> = {
  chart:  '📊',
  dollar: '$',
  trend:  '↗',
  bell:   '🔔',
};

export default function MetricCard({ label, value, change_pct, icon }: Props) {
  const isPositive = change_pct >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-500';
  const arrow = isPositive ? '▲' : '▼';

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-gray-400 text-sm">{icons[icon]}</span>
        <span className={`text-xs font-medium ${changeColor}`}>
          {arrow} {Math.abs(change_pct)}%
        </span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{value}</div>
      <div className="text-xs text-gray-500">{label}</div>
    </div>
  );
}
```

## Verification
- All 4 cards render with correct values from `/api/metrics`
- "Active Alerts" shows red badge (negative change), others show green
- Cards are evenly spaced in a 4-column grid
