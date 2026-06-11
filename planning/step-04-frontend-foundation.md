# Step 04 — Frontend Foundation

## Goal
Define TypeScript types that mirror the backend Pydantic models, create a typed Axios client, and build the App-level layout shell that the components will slot into.

## Interview Talking Points
- Defining types first creates a contract — if the backend shape changes, TypeScript will surface the mismatch at compile time rather than at runtime
- The Axios instance is the single place to add auth headers, base URL, or error interceptors later — components never touch `fetch()` directly
- The layout is CSS Grid — one explicit column for charts, one for the alerts panel — matching the mockup exactly

---

## Files to Create

### `frontend/src/types/index.ts`
```ts
export interface MetricItem {
  value: string;
  change_pct: number;
}

export interface MetricsResponse {
  funds_monitored: MetricItem;
  total_aum: MetricItem;
  avg_ytd_return: MetricItem;
  active_alerts: MetricItem;
}

export interface PerformancePoint {
  date: string;
  portfolio: number;
  benchmark: number;
}

export interface AllocationItem {
  name: string;
  value: number;
  color: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'positive' | 'warning' | 'neutral' | 'negative';
  read: boolean;
}
```

---

### `frontend/src/api/client.ts`
```ts
import axios from 'axios';
import type { MetricsResponse, PerformancePoint, AllocationItem, Alert } from '../types';

const api = axios.create({ baseURL: '/api' });

export const fetchMetrics = () =>
  api.get<MetricsResponse>('/metrics').then((r) => r.data);

export const fetchPortfolioPerformance = () =>
  api.get<PerformancePoint[]>('/portfolio-performance').then((r) => r.data);

export const fetchStrategyAllocation = () =>
  api.get<AllocationItem[]>('/strategy-allocation').then((r) => r.data);

export const fetchAlerts = () =>
  api.get<Alert[]>('/alerts').then((r) => r.data);
```

---

### `frontend/src/App.tsx`
```tsx
import { useEffect, useState } from 'react';
import { fetchMetrics, fetchPortfolioPerformance, fetchStrategyAllocation, fetchAlerts } from './api/client';
import type { MetricsResponse, PerformancePoint, AllocationItem, Alert } from './types';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PortfolioChart from './components/PortfolioChart';
import StrategyAllocation from './components/StrategyAllocation';
import AlertsPanel from './components/AlertsPanel';

export default function App() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    fetchMetrics().then(setMetrics);
    fetchPortfolioPerformance().then(setPerformance);
    fetchStrategyAllocation().then(setAllocation);
    fetchAlerts().then(setAlerts);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />
      <main className="p-6">
        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard label="Funds Monitored"  {...metrics.funds_monitored}  icon="chart" />
            <MetricCard label="Total AUM Tracked" {...metrics.total_aum}        icon="dollar" />
            <MetricCard label="Avg. YTD Return"  {...metrics.avg_ytd_return}   icon="trend" />
            <MetricCard label="Active Alerts"    {...metrics.active_alerts}    icon="bell" />
          </div>
        )}

        {/* Charts + Alerts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 grid grid-rows-1 gap-4">
            <PortfolioChart data={performance} />
            <StrategyAllocation data={allocation} />
          </div>
          <AlertsPanel alerts={alerts} onMarkAllRead={() => setAlerts(a => a.map(x => ({ ...x, read: true })))} />
        </div>
      </main>
    </div>
  );
}
```

## Verification
- `npm run dev` compiles without TypeScript errors
- App renders (components will be stubs at this point — add `export default function X() { return <div /> }` placeholders)
- Network tab shows 4 API calls going to `/api/*`
