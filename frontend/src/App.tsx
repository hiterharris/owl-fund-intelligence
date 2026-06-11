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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetchMetrics().then(setMetrics),
      fetchPortfolioPerformance().then(setPerformance),
      fetchStrategyAllocation().then(setAllocation),
      fetchAlerts().then(setAlerts),
    ]).finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      {loading && (
        <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
          <div className="text-blue-500 text-sm font-medium animate-pulse">Loading dashboard...</div>
        </div>
      )}

      <main className="p-6">
        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-4 gap-4 mb-6">
            <MetricCard label="Funds Monitored"   {...metrics.funds_monitored}  icon="chart" />
            <MetricCard label="Total AUM Tracked" {...metrics.total_aum}        icon="dollar" />
            <MetricCard label="Avg. YTD Return"   {...metrics.avg_ytd_return}   icon="trend" />
            <MetricCard label="Active Alerts"     {...metrics.active_alerts}    icon="bell" />
          </div>
        )}

        {/* Charts + Alerts */}
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 flex flex-col gap-4">
            <PortfolioChart data={performance} />
            <StrategyAllocation data={allocation} />
          </div>
          <div className="flex flex-col">
            <AlertsPanel
              alerts={alerts}
              onMarkAllRead={() => setAlerts((a) => a.map((x) => ({ ...x, read: true })))}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
