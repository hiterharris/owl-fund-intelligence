import httpx
from models import Alert
from typing import List
import re

EDGAR_URL = "https://efts.sec.gov/LATEST/search-index"

# SEC requires a descriptive User-Agent for all API requests
HEADERS = {"User-Agent": "OWL Fund Intelligence harrhh0@gmail.com"}

MOCK_ALERTS: List[Alert] = [
    Alert(id="m1", title="Tiger Global +25% YTD", description="Outperforming benchmark for 17 days", time="1h ago", type="positive", read=False),
    Alert(id="m2", title="Bridgewater drawdown alert", description="Fund Alpha fund down 3.1% YTD", time="3h ago", type="warning", read=False),
    Alert(id="m3", title="PM departure at Citadel", description="Senior PM Rob Kim departing", time="5h ago", type="negative", read=False),
]


def _parse_fund_name(display_names: list) -> str:
    if not display_names:
        return "Unknown Fund"
    # Strip the "(CIK XXXXXXXXXX)" suffix
    raw = display_names[0]
    return re.sub(r"\s*\(CIK \d+\)\s*$", "", raw).strip()


def get_alerts() -> List[Alert]:
    alerts = list(MOCK_ALERTS)
    try:
        params = {
            "forms": "13F-HR",
            "dateRange": "custom",
            "startdt": "2026-01-01",
            "enddt": "2026-06-11",
        }
        resp = httpx.get(EDGAR_URL, params=params, headers=HEADERS, timeout=5.0)
        if resp.status_code == 200:
            hits = resp.json().get("hits", {}).get("hits", [])[:2]
            for i, hit in enumerate(hits):
                src = hit.get("_source", {})
                name = _parse_fund_name(src.get("display_names", []))
                filed = src.get("file_date", "recently")
                period = src.get("period_ending", "")
                desc = f"13F holdings report filed {filed}" + (f" (period ending {period})" if period else "")
                alerts.append(Alert(
                    id=f"edgar-{i}",
                    title=f"{name} 13F filing",
                    description=desc,
                    time="12h ago",
                    type="neutral",
                    read=False,
                ))
    except Exception:
        pass  # Fall back to mock-only alerts if EDGAR is unreachable
    return alerts
