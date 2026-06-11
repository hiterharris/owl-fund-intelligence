import axios from 'axios';
import type { MetricsResponse, PerformancePoint, AllocationItem, Alert, FundDetail } from '../types';

const api = axios.create({ baseURL: '/api' });

export const fetchMetrics = () =>
  api.get<MetricsResponse>('/metrics').then((r) => r.data);

export const fetchPortfolioPerformance = () =>
  api.get<PerformancePoint[]>('/portfolio-performance').then((r) => r.data);

export const fetchStrategyAllocation = () =>
  api.get<AllocationItem[]>('/strategy-allocation').then((r) => r.data);

export const fetchAlerts = () =>
  api.get<Alert[]>('/alerts').then((r) => r.data);

export const fetchFunds = () =>
  api.get<FundDetail[]>('/funds').then((r) => r.data);

export const fetchFundsByStrategy = (strategy: string) =>
  api.get<FundDetail[]>(`/strategy-allocation/${encodeURIComponent(strategy)}/funds`).then((r) => r.data);
