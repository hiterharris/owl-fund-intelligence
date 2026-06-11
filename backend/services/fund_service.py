import time
import yfinance as yf
import pandas as pd
from datetime import datetime
from typing import List, Dict, Any, Optional
from models import PerformancePoint

# 10 curated portfolio funds — sector ETFs used as proxies that match each fund's actual strategy
PORTFOLIO_FUNDS: List[Dict[str, Any]] = [
    {
        "id": "millennium",
        "name": "Millennium Management",
        "ticker": "QAI",   # IQ Hedge Multi-Strategy Tracker ETF
        "strategy": "Hedge Funds",
        "aum_billions": 4.2,
        "color": "#3B82F6",
        "description": "Multi-strategy quantitative hedge fund",
        "manager": "Israel Englander",
    },
    {
        "id": "citadel",
        "name": "Citadel Wellington",
        "ticker": "HDG",   # ProShares Hedge Replication ETF
        "strategy": "Hedge Funds",
        "aum_billions": 3.8,
        "color": "#3B82F6",
        "description": "Quantitative equity strategies fund",
        "manager": "Ken Griffin",
    },
    {
        "id": "bridgewater",
        "name": "Bridgewater All Weather",
        "ticker": "RPAR",  # Risk Parity ETF — mirrors All Weather's risk-parity construction
        "strategy": "Hedge Funds",
        "aum_billions": 3.2,
        "color": "#3B82F6",
        "description": "Global macro all-weather risk parity",
        "manager": "Greg Jensen",
    },
    {
        "id": "blackstone",
        "name": "Blackstone Capital Partners X",
        "ticker": "PSP",   # Invesco Global Listed Private Equity ETF
        "strategy": "Private Equity",
        "aum_billions": 5.1,
        "color": "#10B981",
        "description": "Large-cap private equity buyouts",
        "manager": "Jon Gray",
    },
    {
        "id": "kkr",
        "name": "KKR Americas Fund XII",
        "ticker": "KKR",   # KKR & Co. stock — direct PE firm proxy
        "strategy": "Private Equity",
        "aum_billions": 3.6,
        "color": "#10B981",
        "description": "North American leveraged buyouts",
        "manager": "Joe Bae",
    },
    {
        "id": "sequoia",
        "name": "Sequoia Capital Growth Fund",
        "ticker": "VGT",   # Vanguard IT ETF — late-stage growth/tech VC proxy
        "strategy": "Venture Capital",
        "aum_billions": 2.9,
        "color": "#F59E0B",
        "description": "Late-stage venture and growth equity",
        "manager": "Roelof Botha",
    },
    {
        "id": "a16z",
        "name": "a16z Crypto & Web3 Fund IV",
        "ticker": "GBTC",  # Grayscale Bitcoin Trust — crypto/Web3 proxy
        "strategy": "Venture Capital",
        "aum_billions": 2.1,
        "color": "#F59E0B",
        "description": "Crypto, blockchain and Web3 ventures",
        "manager": "Marc Andreessen",
    },
    {
        "id": "brookfield",
        "name": "Brookfield Real Assets Income",
        "ticker": "REET",  # iShares Global REIT ETF — global real estate proxy
        "strategy": "Real Assets",
        "aum_billions": 3.3,
        "color": "#EF4444",
        "description": "Global real estate and infrastructure",
        "manager": "Bruce Flatt",
    },
    {
        "id": "pimco",
        "name": "PIMCO Dynamic Bond Strategy",
        "ticker": "BOND",  # PIMCO Active Bond ETF — actual PIMCO active fixed income product
        "strategy": "Fixed Income",
        "aum_billions": 2.4,
        "color": "#8B5CF6",
        "description": "Active fixed income and credit management",
        "manager": "Dan Ivascyn",
    },
    {
        "id": "vanguard",
        "name": "Vanguard Institutional 500 Index",
        "ticker": "VOO",   # Vanguard S&P 500 ETF — Vanguard's own flagship product
        "strategy": "Public Equity",
        "aum_billions": 1.8,
        "color": "#EC4899",
        "description": "Passive S&P 500 index tracking fund",
        "manager": "Vanguard Group",
    },
]

# Blended endowment-style benchmark weights (mirrors a large institutional fund's policy portfolio)
BENCHMARK_WEIGHTS: Dict[str, float] = {
    "ACWI": 0.35,  # iShares MSCI ACWI — global equity
    "AGG":  0.20,  # iShares Core US Aggregate Bond — investment-grade fixed income
    "GLD":  0.15,  # SPDR Gold Shares — real assets / inflation hedge
    "HYG":  0.15,  # iShares iBoxx High Yield Corporate Bond — credit / alternatives proxy
    "VNQ":  0.15,  # Vanguard Real Estate ETF — real assets
}

TOTAL_AUM: float = sum(f["aum_billions"] for f in PORTFOLIO_FUNDS)

_cache: Dict[str, Any] = {}
CACHE_TTL = 300  # 5 minutes


def _is_fresh(key: str) -> bool:
    entry = _cache.get(key)
    return entry is not None and time.time() - entry["ts"] < CACHE_TTL


def _get_cached(key: str) -> Any:
    return _cache[key]["data"]


def _set_cached(key: str, data: Any) -> None:
    _cache[key] = {"data": data, "ts": time.time()}


def _extract_close(df: pd.DataFrame, ticker: str) -> Optional[pd.Series]:
    """Extract Close price series from single or multi-ticker yf.download result."""
    if df.empty:
        return None
    if isinstance(df.columns, pd.MultiIndex):
        lvl0 = df.columns.get_level_values(0)
        lvl1 = df.columns.get_level_values(1)
        if "Close" in lvl0 and ticker in lvl1:
            return df["Close"][ticker].dropna()
    else:
        if "Close" in df.columns:
            return df["Close"].dropna()
    return None


def _extract_ohlc(df: pd.DataFrame, ticker: str, col: str) -> Optional[pd.Series]:
    if df.empty:
        return None
    if isinstance(df.columns, pd.MultiIndex):
        lvl0 = df.columns.get_level_values(0)
        lvl1 = df.columns.get_level_values(1)
        if col in lvl0 and ticker in lvl1:
            return df[col][ticker].dropna()
    else:
        if col in df.columns:
            return df[col].dropna()
    return None


def fetch_all_funds_data() -> List[Dict[str, Any]]:
    if _is_fresh("funds_data"):
        return _get_cached("funds_data")

    tickers = [f["ticker"] for f in PORTFOLIO_FUNDS]
    ytd_start = f"{datetime.now().year}-01-01"

    try:
        raw_1y = yf.download(tickers, period="1y", auto_adjust=True, progress=False)
        raw_ytd = yf.download(tickers, start=ytd_start, auto_adjust=True, progress=False)
    except Exception:
        raw_1y = pd.DataFrame()
        raw_ytd = pd.DataFrame()

    results: List[Dict[str, Any]] = []
    for fund in PORTFOLIO_FUNDS:
        t = fund["ticker"]
        try:
            close_1y = _extract_close(raw_1y, t)
            close_ytd = _extract_close(raw_ytd, t)
            high_1y = _extract_ohlc(raw_1y, t, "High")
            low_1y = _extract_ohlc(raw_1y, t, "Low")

            if close_1y is None or close_ytd is None or len(close_1y) < 2 or len(close_ytd) < 2:
                raise ValueError("insufficient data")

            current_price = float(close_1y.iloc[-1])
            prev_close = float(close_1y.iloc[-2])
            daily_change = round((current_price / prev_close - 1) * 100, 2)
            ytd_return = round((float(close_ytd.iloc[-1]) / float(close_ytd.iloc[0]) - 1) * 100, 2)
            # ~22 trading days = 1 month
            lookback = max(0, len(close_1y) - 22)
            monthly_return = round((float(close_1y.iloc[-1]) / float(close_1y.iloc[lookback]) - 1) * 100, 2)
            week52_high = round(float(high_1y.max()), 2) if high_1y is not None else 0.0
            week52_low = round(float(low_1y.min()), 2) if low_1y is not None else 0.0

            results.append({
                **fund,
                "current_price": round(current_price, 2),
                "daily_change": daily_change,
                "ytd_return": ytd_return,
                "monthly_return": monthly_return,
                "week52_high": week52_high,
                "week52_low": week52_low,
            })
        except Exception:
            results.append({
                **fund,
                "current_price": 0.0,
                "daily_change": 0.0,
                "ytd_return": 0.0,
                "monthly_return": 0.0,
                "week52_high": 0.0,
                "week52_low": 0.0,
            })

    _set_cached("funds_data", results)
    return results


def fetch_portfolio_performance() -> List[PerformancePoint]:
    if _is_fresh("portfolio_perf"):
        return _get_cached("portfolio_perf")

    tickers = [f["ticker"] for f in PORTFOLIO_FUNDS]

    bench_tickers = list(BENCHMARK_WEIGHTS.keys())
    try:
        raw = yf.download(tickers, period="1y", auto_adjust=True, progress=False)
        bench_raw = yf.download(bench_tickers, period="1y", auto_adjust=True, progress=False)
    except Exception:
        return []

    if raw.empty or bench_raw.empty:
        return []

    # Daily close then resample to month-end
    if isinstance(raw.columns, pd.MultiIndex):
        close_daily = raw["Close"]
    else:
        close_daily = pd.DataFrame(raw["Close"])
        close_daily.columns = [tickers[0]]

    close_monthly = close_daily.resample("ME").last()

    # Build blended benchmark as weighted sum of normalized benchmark ETF returns
    if isinstance(bench_raw.columns, pd.MultiIndex):
        bench_close_daily = bench_raw["Close"]
    else:
        bench_close_daily = pd.DataFrame(bench_raw["Close"])
        bench_close_daily.columns = [bench_tickers[0]]

    bench_close_monthly = bench_close_daily.resample("ME").last()

    bench_values: Optional[pd.Series] = None
    for bticker, bweight in BENCHMARK_WEIGHTS.items():
        if bticker not in bench_close_monthly.columns:
            continue
        col = bench_close_monthly[bticker].dropna()
        if len(col) < 2:
            continue
        normalized = col / col.iloc[0]
        if bench_values is None:
            bench_values = bweight * normalized
        else:
            bench_values = bench_values.add(bweight * normalized, fill_value=0)

    if bench_values is None or len(bench_values) < 2:
        return []

    # Weighted buy-and-hold portfolio (each ticker normalized to 1 at start)
    portfolio_values: Optional[pd.Series] = None
    for fund in PORTFOLIO_FUNDS:
        t = fund["ticker"]
        weight = fund["aum_billions"] / TOTAL_AUM
        if t not in close_monthly.columns:
            continue
        col = close_monthly[t].dropna()
        if len(col) < 2:
            continue
        normalized = col / col.iloc[0]
        if portfolio_values is None:
            portfolio_values = weight * normalized
        else:
            portfolio_values = portfolio_values.add(weight * normalized, fill_value=0)

    if portfolio_values is None or len(portfolio_values) < 2:
        return []

    portfolio_return = portfolio_values / portfolio_values.iloc[0] - 1

    bench_aligned = bench_values.reindex(portfolio_return.index).ffill()
    bench_return = bench_aligned / bench_aligned.iloc[0] - 1

    result: List[PerformancePoint] = []
    for date in portfolio_return.index:
        p = portfolio_return.get(date)
        b = bench_return.get(date)
        if pd.notna(p) and pd.notna(b):
            result.append(PerformancePoint(
                date=date.strftime("%Y-%m"),
                portfolio=round(float(p), 4),
                benchmark=round(float(b), 4),
            ))

    _set_cached("portfolio_perf", result)
    return result


def compute_live_metrics(funds_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """Derive dashboard KPI metrics from live fund data."""
    weighted_ytd = sum(
        f.get("ytd_return", 0.0) * (PORTFOLIO_FUNDS[i]["aum_billions"] / TOTAL_AUM)
        for i, f in enumerate(funds_data)
    )
    weighted_monthly = sum(
        f.get("monthly_return", 0.0) * (PORTFOLIO_FUNDS[i]["aum_billions"] / TOTAL_AUM)
        for i, f in enumerate(funds_data)
    )
    return {
        "fund_count": len(PORTFOLIO_FUNDS),
        "total_aum": TOTAL_AUM,
        "weighted_ytd": round(weighted_ytd, 2),
        "weighted_monthly": round(weighted_monthly, 2),
    }


def compute_strategy_allocation() -> List[Dict[str, Any]]:
    """Real allocation percentages derived from portfolio fund weights."""
    strategy_map: Dict[str, Dict[str, Any]] = {}
    for fund in PORTFOLIO_FUNDS:
        s = fund["strategy"]
        if s not in strategy_map:
            strategy_map[s] = {"name": s, "aum_billions": 0.0, "fund_count": 0, "color": fund["color"]}
        strategy_map[s]["aum_billions"] += fund["aum_billions"]
        strategy_map[s]["fund_count"] += 1

    result = []
    for s_data in strategy_map.values():
        result.append({
            **s_data,
            "value": round(s_data["aum_billions"] / TOTAL_AUM * 100, 1),
            "aum_billions": round(s_data["aum_billions"], 1),
        })

    result.sort(key=lambda x: x["value"], reverse=True)
    return result
