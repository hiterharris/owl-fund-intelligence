from fastapi import APIRouter, HTTPException
from typing import List
from models import AllocationItem, FundDetail
from services.fund_service import compute_strategy_allocation, fetch_all_funds_data

router = APIRouter()


@router.get("/strategy-allocation", response_model=List[AllocationItem])
def strategy_allocation():
    return [AllocationItem(**item) for item in compute_strategy_allocation()]


@router.get("/strategy-allocation/{strategy}/funds", response_model=List[FundDetail])
def funds_by_strategy(strategy: str):
    all_funds = fetch_all_funds_data()
    matched = [f for f in all_funds if f["strategy"].lower() == strategy.lower()]
    if not matched:
        raise HTTPException(status_code=404, detail="Strategy not found")
    return matched
