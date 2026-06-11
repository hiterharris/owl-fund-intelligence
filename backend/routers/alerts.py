from fastapi import APIRouter
from typing import List
from models import Alert
from services.edgar_service import get_alerts

router = APIRouter()


@router.get("/alerts", response_model=List[Alert])
def alerts():
    return get_alerts()
