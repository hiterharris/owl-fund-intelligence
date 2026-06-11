from pydantic import BaseModel


class MetricItem(BaseModel):
    value: str
    change_pct: float  # positive = up, negative = down


class MetricsResponse(BaseModel):
    funds_monitored: MetricItem
    total_aum: MetricItem
    avg_ytd_return: MetricItem
    active_alerts: MetricItem


class PerformancePoint(BaseModel):
    date: str        # "YYYY-MM"
    portfolio: float  # cumulative return as decimal, e.g. 0.125 = 12.5%
    benchmark: float


class AllocationItem(BaseModel):
    name: str
    value: int   # percentage, e.g. 32
    color: str   # hex color


class Alert(BaseModel):
    id: str
    title: str
    description: str
    time: str    # relative string, e.g. "2h ago"
    type: str    # "positive" | "warning" | "neutral" | "negative"
    read: bool
