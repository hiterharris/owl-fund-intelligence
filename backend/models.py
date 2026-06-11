from pydantic import BaseModel
from typing import Optional


class MetricItem(BaseModel):
    value: str
    change_pct: float  # positive = up, negative = down


class MetricsResponse(BaseModel):
    funds_monitored: MetricItem
    total_aum: MetricItem
    avg_ytd_return: MetricItem
    active_alerts: MetricItem


class PerformancePoint(BaseModel):
    date: str         # "YYYY-MM"
    portfolio: float  # cumulative return as decimal, e.g. 0.125 = 12.5%
    benchmark: float


class AllocationItem(BaseModel):
    name: str
    value: float          # percentage, e.g. 34.6
    color: str            # hex color
    aum_billions: Optional[float] = None
    fund_count: Optional[int] = None


class FundDetail(BaseModel):
    id: str
    name: str
    ticker: str
    strategy: str
    aum_billions: float
    color: str
    description: str
    manager: str
    current_price: float
    daily_change: float
    ytd_return: float
    monthly_return: float
    week52_high: float
    week52_low: float


class Alert(BaseModel):
    id: str
    title: str
    description: str
    time: str    # relative string, e.g. "2h ago"
    type: str    # "positive" | "warning" | "neutral" | "negative"
    read: bool
