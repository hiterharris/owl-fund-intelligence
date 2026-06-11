import yfinance as yf
from datetime import datetime, timedelta
from typing import List
from models import PerformancePoint


def get_portfolio_performance() -> List[PerformancePoint]:
    end = datetime.today()
    start = end - timedelta(days=365)

    portfolio_hist = yf.Ticker("QQQ").history(start=start, end=end, interval="1mo")
    benchmark_hist = yf.Ticker("SPY").history(start=start, end=end, interval="1mo")

    # Index by "YYYY-MM" string to avoid timezone alignment issues
    p_by_month = {d.strftime("%Y-%m"): row["Close"] for d, row in portfolio_hist.iterrows()}
    b_by_month = {d.strftime("%Y-%m"): row["Close"] for d, row in benchmark_hist.iterrows()}

    common_months = sorted(set(p_by_month) & set(b_by_month))
    if not common_months:
        return []

    p_base = p_by_month[common_months[0]]
    b_base = b_by_month[common_months[0]]

    result = []
    for month in common_months:
        p_return = round((p_by_month[month] - p_base) / p_base, 4)
        b_return = round((b_by_month[month] - b_base) / b_base, 4)
        result.append(PerformancePoint(date=month, portfolio=p_return, benchmark=b_return))

    return result
