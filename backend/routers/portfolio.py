from fastapi import APIRouter
from typing import List
from models import PerformancePoint
from services.fund_service import fetch_portfolio_performance

router = APIRouter()


@router.get("/portfolio-performance", response_model=List[PerformancePoint])
def portfolio_performance():
    return fetch_portfolio_performance()
