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
  aum_billions?: number;
  fund_count?: number;
}

export interface FundDetail {
  id: string;
  name: string;
  ticker: string;
  strategy: string;
  aum_billions: number;
  color: string;
  description: string;
  manager: string;
  current_price: number;
  daily_change: number;
  ytd_return: number;
  monthly_return: number;
  week52_high: number;
  week52_low: number;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  time: string;
  type: 'positive' | 'warning' | 'neutral' | 'negative';
  read: boolean;
}
