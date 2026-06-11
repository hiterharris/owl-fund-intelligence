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
