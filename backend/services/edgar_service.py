"""
Pull live SEC EDGAR filings for each portfolio fund manager.
Sources:
  - 13F-HR quarterly holdings for institutional managers
  - 8-K material-event filings for our public-company proxies (BX, KKR, COIN)
"""

import httpx
import re
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from models import Alert

EDGAR_SEARCH = "https://efts.sec.gov/LATEST/search-index"
HEADERS = {"User-Agent": "OWL Fund Intelligence harrhh0@gmail.com"}

# One year look-back so we always capture the most recent quarterly 13F
_LOOKBACK_DAYS = 365
_START_DATE = (datetime.now() - timedelta(days=_LOOKBACK_DAYS)).strftime("%Y-%m-%d")
_END_DATE = datetime.now().strftime("%Y-%m-%d")

# Map each portfolio fund to its EDGAR filing identity and the form types worth watching
EDGAR_MANAGERS = [
    {
        "fund_id": "millennium",
        "fund_name": "Millennium Management",
        "search": "Millennium Management",
        "forms": "13F-HR",
        "match_substr": "millennium",
    },
    {
        "fund_id": "citadel",
        "fund_name": "Citadel Wellington",
        "search": "Citadel Advisors",
        "forms": "13F-HR",
        "match_substr": "citadel",
    },
    {
        "fund_id": "bridgewater",
        "fund_name": "Bridgewater All Weather",
        "search": "Bridgewater Associates",
        "forms": "13F-HR",
        "match_substr": "bridgewater",
    },
    {
        "fund_id": "blackstone",
        "fund_name": "Blackstone Capital Partners",
        "search": "Blackstone",
        "forms": "13F-HR,8-K",
        "match_substr": "blackstone",
    },
    {
        "fund_id": "kkr",
        "fund_name": "KKR Americas Fund",
        "search": "KKR & CO",
        "forms": "13F-HR,8-K",
        "match_substr": "kkr",
    },
    {
        "fund_id": "brookfield",
        "fund_name": "Brookfield Real Assets",
        "search": "Brookfield Asset Management",
        "forms": "13F-HR,8-K",
        "match_substr": "brookfield",
    },
    {
        "fund_id": "pimco",
        "fund_name": "PIMCO Dynamic Bond",
        "search": "Pacific Investment Management",
        "forms": "13F-HR",
        "match_substr": "pacific investment management",
    },
    {
        "fund_id": "vanguard",
        "fund_name": "Vanguard Institutional",
        "search": "Vanguard Group",
        "forms": "13F-HR",
        "match_substr": "vanguard",
    },
    {
        "fund_id": "a16z",
        "fund_name": "a16z Crypto & Web3 Fund IV",
        "search": "Coinbase Global",
        "forms": "8-K",
        "match_substr": "coinbase",
    },
]

_FORM_LABELS: Dict[str, str] = {
    "13F-HR": "13F Holdings Report",
    "8-K":    "Material Event (8-K)",
    "13G":    "Ownership Disclosure (13G)",
    "13D":    "Activist Stake (13D)",
}

_FORM_TYPES: Dict[str, str] = {
    "13F-HR": "neutral",
    "8-K":    "warning",
    "13G":    "neutral",
    "13D":    "warning",
}

_cache: Dict[str, Any] = {}
CACHE_TTL = 3600  # 1 hour — EDGAR filings don't change frequently


def _is_fresh(key: str) -> bool:
    entry = _cache.get(key)
    return entry is not None and time.time() - entry["ts"] < CACHE_TTL


def _set_cached(key: str, data: Any) -> None:
    _cache[key] = {"data": data, "ts": time.time()}


def _clean_name(display_names: List[str]) -> str:
    if not display_names:
        return "Unknown"
    return re.sub(r"\s*\(CIK \d+\)\s*$", "", display_names[0]).strip().title()


def _relative_time(date_str: str) -> str:
    try:
        filed = datetime.strptime(date_str, "%Y-%m-%d")
        delta = datetime.now() - filed
        d = delta.days
        if d == 0:
            return "Today"
        if d == 1:
            return "Yesterday"
        if d < 7:
            return f"{d} days ago"
        if d < 30:
            return f"{d // 7}w ago"
        return f"{d // 30}mo ago"
    except Exception:
        return "Recently"


def _quarter_label(period: str) -> str:
    """Turn '2026-03-31' into 'Q1 2026'."""
    try:
        dt = datetime.strptime(period, "%Y-%m-%d")
        q = (dt.month - 1) // 3 + 1
        return f"Q{q} {dt.year}"
    except Exception:
        return period


def _fetch_manager_filings(manager: Dict[str, Any], client: httpx.Client) -> Optional[Alert]:
    """Fetch the most recent filing for one portfolio manager from EDGAR EFTS."""
    try:
        params = {
            "q": f'"{manager["search"]}"',
            "forms": manager["forms"],
            "dateRange": "custom",
            "startdt": _START_DATE,
            "enddt": _END_DATE,
        }
        resp = client.get(EDGAR_SEARCH, params=params, headers=HEADERS, timeout=6.0)
        if resp.status_code != 200:
            return None

        hits = resp.json().get("hits", {}).get("hits", [])
        if not hits:
            return None

        # Filter to hits actually filed by this manager (not just mentioning them)
        match_lower = manager["match_substr"].lower()
        matched_hit = None
        for hit in hits:
            src = hit.get("_source", {})
            names = src.get("display_names", [])
            entity = src.get("entity_name", "")
            combined = " ".join(names + [entity]).lower()
            if match_lower in combined:
                matched_hit = src
                break

        if not matched_hit:
            # Fall back to the first hit if no exact match — still relevant
            matched_hit = hits[0].get("_source", {})

        file_date = matched_hit.get("file_date", "")
        period = matched_hit.get("period_ending", "")
        form_type = matched_hit.get("form_type", matched_hit.get("forms", "Filing"))
        filer_name = _clean_name(matched_hit.get("display_names", [manager["fund_name"]]))
        rel_time = _relative_time(file_date) if file_date else "Recently"
        form_label = _FORM_LABELS.get(form_type, form_type)
        alert_type = _FORM_TYPES.get(form_type, "neutral")

        if form_type == "13F-HR" and period:
            quarter = _quarter_label(period)
            title = f"{manager['fund_name']} — {quarter} Holdings Filed"
            description = (
                f"{filer_name} submitted their {quarter} 13F holdings report on {file_date}. "
                f"Discloses all US equity positions ≥ $100M as of {period}."
            )
        elif form_type == "8-K":
            title = f"{manager['fund_name']} — Material Event Disclosed"
            description = (
                f"{filer_name} filed an 8-K on {file_date} reporting a material business event. "
                f"Review SEC filing for details on operational changes, deals, or exec updates."
            )
        else:
            title = f"{manager['fund_name']} — {form_label} Filed"
            description = f"{filer_name} filed a {form_label} on {file_date}."

        return Alert(
            id=f"edgar-{manager['fund_id']}",
            title=title,
            description=description,
            time=rel_time,
            type=alert_type,
            read=False,
        )
    except Exception:
        return None


def get_edgar_alerts() -> List[Alert]:
    if _is_fresh("edgar_alerts"):
        return _cache["edgar_alerts"]["data"]

    alerts: List[Alert] = []
    with httpx.Client() as client:
        for manager in EDGAR_MANAGERS:
            alert = _fetch_manager_filings(manager, client)
            if alert:
                alerts.append(alert)

    _set_cached("edgar_alerts", alerts)
    return alerts
