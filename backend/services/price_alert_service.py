"""
Generate live price-based alerts for every fund in the portfolio.
Reuses the cached fund data from fund_service to avoid redundant yfinance calls.
"""

import time
from typing import List, Dict, Any
from models import Alert
from services.fund_service import fetch_all_funds_data, PORTFOLIO_FUNDS

_cache: Dict[str, Any] = {}
CACHE_TTL = 300  # 5 minutes


def _is_fresh(key: str) -> bool:
    entry = _cache.get(key)
    return entry is not None and time.time() - entry["ts"] < CACHE_TTL


def _set_cached(key: str, data: Any) -> None:
    _cache[key] = {"data": data, "ts": time.time()}


def get_price_alerts() -> List[Alert]:
    if _is_fresh("price_alerts"):
        return _cache["price_alerts"]["data"]

    funds = fetch_all_funds_data()
    alerts: List[Alert] = []

    for fund in funds:
        fid = fund["id"]
        name = fund["name"]
        ticker = fund["ticker"]
        current = fund.get("current_price", 0.0)
        daily = fund.get("daily_change", 0.0)
        ytd = fund.get("ytd_return", 0.0)
        monthly = fund.get("monthly_return", 0.0)
        high52 = fund.get("week52_high", 0.0)
        low52 = fund.get("week52_low", 0.0)

        # ── Significant single-day moves (threshold: ±3%) ──────────────────
        if daily >= 3.0:
            alerts.append(Alert(
                id=f"price-day-up-{fid}",
                title=f"{name} surged {daily:+.2f}% today",
                description=(
                    f"{ticker} proxy gained {daily:.2f}% in the latest session "
                    f"(current ${current:.2f}). Strong buying pressure noted."
                ),
                time="Today",
                type="positive",
                read=False,
            ))
        elif daily <= -3.0:
            alerts.append(Alert(
                id=f"price-day-dn-{fid}",
                title=f"{name} dropped {daily:.2f}% today",
                description=(
                    f"{ticker} proxy fell {abs(daily):.2f}% in the latest session "
                    f"(current ${current:.2f}). Review position sizing."
                ),
                time="Today",
                type="negative",
                read=False,
            ))
        elif abs(daily) >= 1.5:
            sign = "+" if daily > 0 else ""
            alerts.append(Alert(
                id=f"price-day-mv-{fid}",
                title=f"{name} {sign}{daily:.2f}% — notable session move",
                description=(
                    f"{ticker} moved {sign}{daily:.2f}% today. "
                    f"Current price ${current:.2f}."
                ),
                time="Today",
                type="warning" if daily < 0 else "neutral",
                read=False,
            ))

        # ── 52-week high / low proximity (within 1%) ──────────────────────
        if high52 > 0 and current >= high52 * 0.99:
            alerts.append(Alert(
                id=f"price-52h-{fid}",
                title=f"{name} at 52-week high",
                description=(
                    f"{ticker} trading at ${current:.2f}, at or near its "
                    f"52-week high of ${high52:.2f}. Momentum signal for {name}."
                ),
                time="Today",
                type="positive",
                read=False,
            ))
        elif low52 > 0 and current <= low52 * 1.01:
            alerts.append(Alert(
                id=f"price-52l-{fid}",
                title=f"{name} at 52-week low",
                description=(
                    f"{ticker} trading at ${current:.2f}, near its "
                    f"52-week low of ${low52:.2f}. Flag for review."
                ),
                time="Today",
                type="negative",
                read=False,
            ))

        # ── Strong YTD outperformance (>20%) ──────────────────────────────
        if ytd >= 20.0:
            alerts.append(Alert(
                id=f"price-ytd-bull-{fid}",
                title=f"{name} up {ytd:+.1f}% YTD",
                description=(
                    f"{ticker} is outperforming year-to-date with {ytd:.1f}% returns "
                    f"since Jan 1. Driving positive alpha in {fund['strategy']} allocation."
                ),
                time="YTD",
                type="positive",
                read=False,
            ))
        # ── YTD underperformance (< -10%) ────────────────────────────────
        elif ytd <= -10.0:
            alerts.append(Alert(
                id=f"price-ytd-bear-{fid}",
                title=f"{name} down {ytd:.1f}% YTD",
                description=(
                    f"{ticker} is underperforming year-to-date at {ytd:.1f}%. "
                    f"Drag on {fund['strategy']} allocation. Consider rebalancing."
                ),
                time="YTD",
                type="warning",
                read=False,
            ))

        # ── Significant monthly drawdown (< -5%) ─────────────────────────
        if monthly <= -5.0:
            alerts.append(Alert(
                id=f"price-mo-dn-{fid}",
                title=f"{name} down {monthly:.1f}% this month",
                description=(
                    f"{ticker} has declined {abs(monthly):.1f}% over the past month. "
                    f"Current price ${current:.2f}. Monitor for further weakness."
                ),
                time="1 month",
                type="warning",
                read=False,
            ))

    # Deduplicate: keep at most 2 alerts per fund, prioritising daily moves first
    seen: Dict[str, int] = {}
    prioritized: List[Alert] = []
    for alert in sorted(alerts, key=lambda a: (
        0 if "day" in a.id else 1 if "52" in a.id else 2
    )):
        fund_id = "-".join(alert.id.split("-")[-1:])
        seen[fund_id] = seen.get(fund_id, 0) + 1
        if seen[fund_id] <= 2:
            prioritized.append(alert)

    _set_cached("price_alerts", prioritized)
    return prioritized
