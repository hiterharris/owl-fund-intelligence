from fastapi import APIRouter
from typing import List
from models import Alert
from services.price_alert_service import get_price_alerts
from services.edgar_service import get_edgar_alerts

router = APIRouter()

# Alert type priority for sorting (lower = higher priority)
_TYPE_ORDER = {"negative": 0, "warning": 1, "positive": 2, "neutral": 3}


@router.get("/alerts", response_model=List[Alert])
def alerts():
    price = get_price_alerts()
    edgar = get_edgar_alerts()

    combined = price + edgar
    combined.sort(key=lambda a: _TYPE_ORDER.get(a.type, 99))
    return combined
