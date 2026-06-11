from fastapi import APIRouter, HTTPException
from typing import List
from models import FundDetail
from services.fund_service import fetch_all_funds_data, PORTFOLIO_FUNDS

router = APIRouter()


@router.get("/funds", response_model=List[FundDetail])
def get_funds():
    return fetch_all_funds_data()


@router.get("/funds/{fund_id}", response_model=FundDetail)
def get_fund(fund_id: str):
    funds = fetch_all_funds_data()
    for f in funds:
        if f["id"] == fund_id:
            return f
    raise HTTPException(status_code=404, detail="Fund not found")
