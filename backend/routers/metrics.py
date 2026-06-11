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
