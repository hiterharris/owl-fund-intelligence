import { useEffect, useState } from 'react';
import {
  fetchMetrics,
  fetchPortfolioPerformance,
  fetchStrategyAllocation,
  fetchAlerts,
  fetchFunds,
} from './api/client';
import type { MetricsResponse, PerformancePoint, AllocationItem, Alert, FundDetail } from './types';
import Header from './components/Header';
import MetricCard from './components/MetricCard';
import PortfolioChart from './components/PortfolioChart';
import StrategyAllocation from './components/StrategyAllocation';
import AlertsPanel from './components/AlertsPanel';
import FundsModal from './components/FundsModal';
import AUMBreakdownModal from './components/AUMBreakdownModal';
import AlertsModal from './components/AlertsModal';
import YTDReturnModal from './components/YTDReturnModal';

type Modal = 'funds' | 'aum' | 'alerts' | 'ytd' | null;

export default function App() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [performance, setPerformance] = useState<PerformancePoint[]>([]);
  const [allocation, setAllocation] = useState<AllocationItem[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [funds, setFunds] = useState<FundDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<Modal>(null);

  useEffect(() => {
    Promise.all([
      fetchMetrics().then(setMetrics),
      fetchPortfolioPerformance().then(setPerformance),
      fetchStrategyAllocation().then(setAllocation),
      fetchAlerts().then(setAlerts),
      fetchFunds().then(setFunds),
    ]).finally(() => setLoading(false));
  }, []);

  const totalAUM = funds.reduce((sum, f) => sum + f.aum_billions, 0);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Header />

      {loading && (
        <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
          <div className="text-blue-500 text-sm font-medium animate-pulse">Loading live data...</div>
        </div>
      )}

      {activeModal === 'funds' && funds.length > 0 && (
        <FundsModal funds={funds} onClose={() => setActiveModal(null)} />
      )}

      {activeModal === 'aum' && allocation.length > 0 && (
        <AUMBreakdownModal
          allocation={allocation}
          funds={funds}
          totalAUM={totalAUM}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'ytd' && funds.length > 0 && metrics && (
        <YTDReturnModal
          funds={funds}
          weightedYTD={parseFloat(metrics.avg_ytd_return.value)}
          onClose={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'alerts' && (
        <AlertsModal
          alerts={alerts}
          onMarkAllRead={() => setAlerts((a) => a.map((x) => ({ ...x, read: true })))}
          onClose={() => setActiveModal(null)}
        />
      )}

      <main className="p-3 sm:p-6">
        {/* KPI Cards */}
        {metrics && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
            <MetricCard
              label="Funds Monitored"
              {...metrics.funds_monitored}
              icon="chart"
              onClick={() => setActiveModal('funds')}
            />
            <MetricCard
              label="Total AUM Tracked"
              {...metrics.total_aum}
              icon="dollar"
              onClick={() => setActiveModal('aum')}
            />
            <MetricCard label="Avg. YTD Return" {...metrics.avg_ytd_return} icon="trend" onClick={() => setActiveModal('ytd')} />
            <MetricCard label="Active Alerts" {...metrics.active_alerts} icon="bell" onClick={() => setActiveModal('alerts')} />
          </div>
        )}

        {/* Charts + Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 flex flex-col gap-4">
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
