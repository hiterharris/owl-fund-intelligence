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
