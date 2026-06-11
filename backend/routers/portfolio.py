from fastapi import APIRouter
from typing import List
from models import PerformancePoint
from services.yfinance_service import get_portfolio_performance

router = APIRouter()


@router.get("/portfolio-performance", response_model=List[PerformancePoint])
def portfolio_performance():
    return get_portfolio_performance()
