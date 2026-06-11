from fastapi import APIRouter
from models import MetricsResponse, MetricItem
from services.fund_service import fetch_all_funds_data, compute_live_metrics, TOTAL_AUM
from services.price_alert_service import get_price_alerts
from services.edgar_service import get_edgar_alerts

router = APIRouter()


@router.get("/metrics", response_model=MetricsResponse)
def get_metrics():
    funds_data = fetch_all_funds_data()
    m = compute_live_metrics(funds_data)

    ytd = m["weighted_ytd"]
    ytd_str = f"+{ytd:.1f}%" if ytd >= 0 else f"{ytd:.1f}%"

    alert_count = len(get_price_alerts()) + len(get_edgar_alerts())

    return MetricsResponse(
        funds_monitored=MetricItem(value=str(m["fund_count"]), change_pct=0.0),
        total_aum=MetricItem(value=f"${TOTAL_AUM:.1f}B", change_pct=round(ytd, 1)),
        avg_ytd_return=MetricItem(value=ytd_str, change_pct=round(m["weighted_monthly"], 2)),
        active_alerts=MetricItem(value=str(alert_count), change_pct=0.0),
    )
