# Step 02 — Backend Data Layer

## Goal
Build the two service modules that fetch real external data, plus define all Pydantic models. The rest of the backend depends on these services.

## Interview Talking Points
- **yfinance**: Zero-config, no API key. We use QQQ as a multi-strategy "portfolio" proxy and SPY as the benchmark — not because they're accurate, but because they produce realistic return curves that make the chart credible.
- **SEC EDGAR**: Official US government open API (no auth). Querying recent ADV amendment filings gives the Alerts panel real fund names and dates — Bridgewater, Tiger Global, etc. actually file these.
- Pydantic models on the backend enforce the contract between backend and frontend types.

---

## Files to Create

### `backend/models.py`
```python
from pydantic import BaseModel
from typing import List

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
    portfolio: float # cumulative return as decimal, e.g. 0.125 = 12.5%
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
```

---

### `backend/services/yfinance_service.py`
```python
import yfinance as yf
from datetime import datetime, timedelta
from typing import List
from models import PerformancePoint

def get_portfolio_performance() -> List[PerformancePoint]:
    end = datetime.today()
    start = end - timedelta(days=365)

    portfolio_ticker = yf.Ticker("QQQ")
    benchmark_ticker = yf.Ticker("SPY")

    portfolio_hist = portfolio_ticker.history(start=start, end=end, interval="1mo")
    benchmark_hist = benchmark_ticker.history(start=start, end=end, interval="1mo")

    # Compute cumulative returns from first price
    p_base = portfolio_hist["Close"].iloc[0]
    b_base = benchmark_hist["Close"].iloc[0]

    result = []
    for date in portfolio_hist.index:
        date_str = date.strftime("%Y-%m")
        if date in benchmark_hist.index:
            p_return = (portfolio_hist.loc[date, "Close"] - p_base) / p_base
            b_return = (benchmark_hist.loc[date, "Close"] - b_base) / b_base
            result.append(PerformancePoint(
                date=date_str,
                portfolio=round(p_return, 4),
                benchmark=round(b_return, 4),
            ))

    return result
```

---

### `backend/services/edgar_service.py`
```python
import httpx
from models import Alert
from typing import List
import uuid

EDGAR_URL = "https://efts.sec.gov/LATEST/search-index"

MOCK_ALERTS: List[Alert] = [
    Alert(id="m1", title="Tiger Global +25% YTD", description="Outperforming benchmark for 17 days", time="1h ago", type="positive", read=False),
    Alert(id="m2", title="Bridgewater drawdown alert", description="Fund Alpha fund down 3.1% YTD", time="3h ago", type="warning", read=False),
    Alert(id="m3", title="PM departure at Citadel", description="Senior PM Rob Kim departing", time="5h ago", type="negative", read=False),
]

def get_alerts() -> List[Alert]:
    alerts = list(MOCK_ALERTS)
    try:
        params = {
            "q": '"ADV amendment"',
            "forms": "ADV",
            "dateRange": "custom",
            "startdt": "2025-06-01",
            "enddt": "2026-06-11",
            "_source": "file_date,entity_name,file_num",
            "hits.hits.total.value": 5,
        }
        resp = httpx.get(EDGAR_URL, params=params, timeout=5.0)
        if resp.status_code == 200:
            hits = resp.json().get("hits", {}).get("hits", [])[:2]
            for i, hit in enumerate(hits):
                src = hit.get("_source", {})
                name = src.get("entity_name", "Unknown Fund")
                filed = src.get("file_date", "recently")
                alerts.append(Alert(
                    id=f"edgar-{i}",
                    title=f"{name} ADV amendment",
                    description=f"Updated Form ADV filed with SEC on {filed}",
                    time="12h ago",
                    type="neutral",
                    read=False,
                ))
    except Exception:
        pass  # Fall back to mock-only if EDGAR is unreachable
    return alerts
```

## Verification
From `backend/` with venv active:
```bash
python3 -c "from services.yfinance_service import get_portfolio_performance; print(get_portfolio_performance()[:2])"
python3 -c "from services.edgar_service import get_alerts; print(get_alerts())"
```
Both should return lists of data without errors.
