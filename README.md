# OWL Fund Intelligence Dashboard

A real-time institutional fund monitoring dashboard. Tracks 10 curated portfolio funds across hedge funds, private equity, venture capital, real assets, and fixed income — with live market data, interactive drill-down modals, and a blended benchmark comparison.

## Live

| | URL |
|---|---|
| **Frontend** | https://owl-fund-intelligence-4m7v.onrender.com |
| **Backend API** | https://owl-fund-intelligence.onrender.com/docs |

## Stack

- **Frontend**: Vite, React 19, TypeScript, Recharts, Tailwind CSS, Axios
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Data**: yfinance (live prices via proxy ETF tickers), SEC EDGAR API (regulatory filing alerts), price alert service

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
| `GET /api/metrics` | Live (yfinance) | KPI card values — fund count, AUM, weighted YTD return, alert count |
| `GET /api/portfolio-performance` | yfinance | 12-month cumulative returns for portfolio vs. blended benchmark |
| `GET /api/strategy-allocation` | Derived from fund data | AUM % split across 6 strategy types |
| `GET /api/funds` | yfinance | Full fund detail list — price, daily/YTD/monthly returns, 52-week range |
| `GET /api/alerts` | SEC EDGAR + price alerts | Regulatory filings and price-based fund alerts |

All endpoints cache responses for **5 minutes** to reduce yfinance API calls.

## Portfolio Funds

10 institutional funds tracked via strategy-matched proxy ETFs:

| Fund | Strategy | Proxy Ticker | Rationale |
|---|---|---|---|
| Millennium Management | Hedge Funds | `QAI` | IQ Hedge Multi-Strategy Tracker ETF |
| Citadel Wellington | Hedge Funds | `HDG` | ProShares Hedge Replication ETF |
| Bridgewater All Weather | Hedge Funds | `RPAR` | Risk Parity ETF — mirrors All Weather's construction |
| Blackstone Capital Partners X | Private Equity | `PSP` | Invesco Global Listed Private Equity ETF |
| KKR Americas Fund XII | Private Equity | `KKR` | KKR & Co. stock — direct PE firm proxy |
| Sequoia Capital Growth Fund | Venture Capital | `VGT` | Vanguard IT ETF — late-stage tech VC proxy |
| a16z Crypto & Web3 Fund IV | Venture Capital | `GBTC` | Grayscale Bitcoin Trust — crypto/Web3 basket |
| Brookfield Real Assets Income | Real Assets | `REET` | iShares Global REIT ETF |
| PIMCO Dynamic Bond Strategy | Fixed Income | `BOND` | PIMCO Active Bond ETF — actual PIMCO product |
| Vanguard Institutional 500 Index | Public Equity | `VOO` | Vanguard's own flagship S&P 500 ETF |

**Total tracked AUM: $32.4B**

## Benchmark

The portfolio performance chart compares against a **blended endowment-style benchmark** that reflects the multi-asset nature of the portfolio, rather than a single equity index:

| ETF | Weight | Represents |
|---|---|---|
| `ACWI` | 35% | Global equity (iShares MSCI ACWI) |
| `AGG` | 20% | Investment-grade bonds (iShares Core US Aggregate) |
| `GLD` | 15% | Real assets / inflation hedge (SPDR Gold Shares) |
| `HYG` | 15% | Credit / alternatives proxy (iShares High Yield Corporate Bond) |
| `VNQ` | 15% | Real estate (Vanguard Real Estate ETF) |

## Dashboard Features

### KPI Cards
Four metric cards at the top — each clickable and opens a detail modal:

| Card | Modal |
|---|---|
| Funds Monitored | Full fund table with live prices, returns, and 52-week range |
| Total AUM Tracked | AUM breakdown by strategy with a donut chart |
| Avg. YTD Return | Per-fund YTD return bars with AUM weight and weighted contribution |
| Active Alerts | Alert history with mark-all-read |

### Portfolio Performance Chart
Line chart of 12-month cumulative returns — AUM-weighted portfolio vs. blended benchmark, resampled to monthly data points.

### Strategy Allocation
Donut chart and breakdown table showing AUM split across: Hedge Funds, Private Equity, Venture Capital, Real Assets, Fixed Income, Public Equity.

### Alerts Panel
Sidebar feed combining price-based alerts (from `price_alert_service`) and SEC EDGAR 13F filing alerts (from `edgar_service`).

## Architecture

```
backend/
├── main.py                      # FastAPI app + CORS middleware
├── models.py                    # Pydantic response models
├── routers/
│   ├── portfolio.py             # GET /api/portfolio-performance
│   ├── metrics.py               # GET /api/metrics
│   ├── allocation.py            # GET /api/strategy-allocation
│   ├── funds.py                 # GET /api/funds
│   └── alerts.py                # GET /api/alerts
└── services/
    ├── fund_service.py          # Portfolio funds, performance calc, benchmark
    ├── price_alert_service.py   # Price-based alert generation
    └── edgar_service.py         # SEC EDGAR 13F filing alerts

frontend/src/
├── App.tsx                      # Root — data fetching, modal state
├── api/client.ts                # Axios API client
├── types/index.ts               # Shared TypeScript interfaces
└── components/
    ├── Header.tsx
    ├── MetricCard.tsx           # Clickable KPI cards
    ├── PortfolioChart.tsx       # Cumulative return line chart
    ├── StrategyAllocation.tsx   # Donut + breakdown table
    ├── AlertsPanel.tsx          # Sidebar alert feed
    ├── FundsModal.tsx           # Full fund table (10 positions)
    ├── AUMBreakdownModal.tsx    # AUM by strategy + fund list
    ├── AlertsModal.tsx          # Alert history with mark-all-read
    └── YTDReturnModal.tsx       # Per-fund YTD return breakdown
```

## Data Notes

- Prices are fetched via `yfinance` using publicly traded ETF/stock proxies — actual fund NAVs are not publicly available in real time.
- YTD and 1-month returns reflect each proxy ticker's performance, weighted by AUM allocation.
- The blended benchmark and portfolio returns are both normalized to 1.0 at the start of the 1-year window and expressed as cumulative percentage returns.

## What I'd Do Next

- **Real-time updates**: WebSocket connection for live alert streaming instead of a one-time fetch on load
- **Date range selector**: Let users zoom the portfolio chart to 1M / 3M / 1Y / All time
- **Fund search**: Search and filter the fund table and alerts by name or strategy
- **Persistence**: PostgreSQL to store per-user read/unread alert state
- **Authentication**: JWT-based auth so each user sees a personalized alert feed
- **More data sources**: Pull 13F position-level data to surface fund holdings changes, not just filing events
