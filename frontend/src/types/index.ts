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
