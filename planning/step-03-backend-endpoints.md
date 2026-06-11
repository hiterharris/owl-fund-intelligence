# Step 03 — FastAPI Routes

## Goal
Create the 4 API routers and register them in `main.py`. After this step, all endpoints are testable via the FastAPI `/docs` UI.

## Interview Talking Points
- Router-per-resource keeps each file focused — easy to hand off individual routes to teammates
- Pydantic `response_model` on each endpoint gives automatic serialization + OpenAPI schema generation
- The `/docs` page is a free demo tool during the interview — no need to open Postman

---

## Files to Create

### `backend/routers/metrics.py`
```python
from fastapi import APIRouter
from models import MetricsResponse, MetricItem

router = APIRouter()

@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    return MetricsResponse(
        funds_monitored=MetricItem(value="142", change_pct=8.2),
        total_aum=MetricItem(value="$15.0B", change_pct=12.5),
        avg_ytd_return=MetricItem(value="+12.5%", change_pct=0.1),
        active_alerts=MetricItem(value="24", change_pct=-10.0),
    )
```

---

### `backend/routers/portfolio.py`
```python
from fastapi import APIRouter
from typing import List
from models import PerformancePoint
from services.yfinance_service import get_portfolio_performance

router = APIRouter()

@router.get("/portfolio-performance", response_model=List[PerformancePoint])
def portfolio_performance():
    return get_portfolio_performance()
```

---

### `backend/routers/allocation.py`
```python
from fastapi import APIRouter
from typing import List
from models import AllocationItem

router = APIRouter()

ALLOCATION_DATA = [
    AllocationItem(name="Hedge Funds",     value=32, color="#3B82F6"),
    AllocationItem(name="Private Equity",  value=25, color="#10B981"),
    AllocationItem(name="Venture Capital", value=18, color="#F59E0B"),
    AllocationItem(name="Real Assets",     value=12, color="#EF4444"),
    AllocationItem(name="Fixed Income",    value=8,  color="#8B5CF6"),
    AllocationItem(name="Public Equity",   value=5,  color="#EC4899"),
]

@router.get("/strategy-allocation", response_model=List[AllocationItem])
def strategy_allocation():
    return ALLOCATION_DATA
```

---

### `backend/routers/alerts.py`
```python
from fastapi import APIRouter
from typing import List
from models import Alert
from services.edgar_service import get_alerts

router = APIRouter()

@router.get("/alerts", response_model=List[Alert])
def alerts():
    return get_alerts()
```

---

### Update `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import metrics, portfolio, allocation, alerts

app = FastAPI(title="OWL Fund Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metrics.router,    prefix="/api")
app.include_router(portfolio.router,  prefix="/api")
app.include_router(allocation.router, prefix="/api")
app.include_router(alerts.router,     prefix="/api")

@app.get("/health")
def health():
    return {"status": "ok"}
```

## Verification
```bash
cd backend && source venv/bin/activate
uvicorn main:app --reload
```
Then visit `http://localhost:8000/docs` and test:
- `GET /api/metrics` → 4 metric objects
- `GET /api/portfolio-performance` → array of 12 monthly points
- `GET /api/strategy-allocation` → 6 allocation items
- `GET /api/alerts` → 3+ alert objects
