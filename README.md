# OWL Fund Intelligence Dashboard

A fund intelligence dashboard built with React + TypeScript (frontend) and Python FastAPI (backend).

## Stack

- **Frontend**: Vite, React, TypeScript, Recharts, Tailwind CSS, Axios
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Data**: yfinance (portfolio performance), SEC EDGAR API (regulatory alerts), mock data (KPIs, allocation)

## Running Locally

### Backend
```bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
```
API runs at http://localhost:8000. Visit `/docs` for the interactive API explorer.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
App runs at http://localhost:5173.

## API Endpoints

| Endpoint | Source | Description |
|---|---|---|
| `GET /api/metrics` | Mock | KPI card values (funds monitored, AUM, YTD return, active alerts) |
| `GET /api/portfolio-performance` | yfinance — QQQ vs SPY | 12-month cumulative returns for portfolio vs benchmark |
| `GET /api/strategy-allocation` | Mock | Portfolio breakdown across 6 strategy types |
| `GET /api/alerts` | SEC EDGAR 13F filings + Mock | Recent fund events and regulatory filings |

## Approach

The backend is split into one router per resource (`routers/`) and one service per data source (`services/`). This keeps each file focused and makes it easy to swap data sources independently — e.g. replacing yfinance with a paid data vendor requires touching only `yfinance_service.py`.

For the portfolio chart, QQQ is used as a proxy for a multi-strategy "portfolio" and SPY as the benchmark. Both are fetched via `yfinance` (no API key required) and converted to cumulative returns so they're comparable regardless of price level.

For the alerts panel, live 13F quarterly holdings filings are pulled from the SEC EDGAR full-text search API (free, no auth — requires a `User-Agent` header per SEC policy). These are merged with hardcoded mock alerts for PM departures and fund drawdowns that don't have a public data source.

## What I'd Do Next

- **Real-time updates**: WebSocket connection for live alert streaming instead of a one-time fetch on load
- **Date range selector**: Let users zoom the portfolio chart to 1M / 3M / 1Y / All time
- **Fund search**: Search and filter alerts by fund name or strategy type
- **Persistence**: PostgreSQL to store per-user read/unread alert state
- **Authentication**: JWT-based auth so each user sees a personalized alert feed
- **Caching**: Cache yfinance responses (Redis or in-memory TTL) to avoid re-fetching on every page load
- **More data sources**: Pull 13F position-level data to surface fund holdings changes, not just filing events
