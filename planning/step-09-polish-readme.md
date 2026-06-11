# Step 09 — Polish, README, and GitHub Push

## Goal
Add loading states, wire up the layout so charts and alerts panel are vertically aligned properly, write the README, and push to GitHub.

## Interview Talking Points
- The README is read by interviewers before the session — "What I'd do next" shows architectural thinking beyond the 2-hour window
- Loading states matter: without them, the page flashes empty on every refresh, which looks unfinished
- The layout refinement (ensuring the alerts panel is the same height as the two charts stacked) is the kind of polish that signals attention to the design reference

---

## Layout Refinement in `App.tsx`

The charts panel should stack Portfolio Performance on top of Strategy Allocation. Update the grid structure:

```tsx
<div className="grid grid-cols-3 gap-4">
  {/* Left: charts stacked */}
  <div className="col-span-2 flex flex-col gap-4">
    <PortfolioChart data={performance} />
    <StrategyAllocation data={allocation} />
  </div>
  {/* Right: alerts fills full height */}
  <div className="flex flex-col">
    <AlertsPanel
      alerts={alerts}
      onMarkAllRead={() => setAlerts(a => a.map(x => ({ ...x, read: true })))}
    />
  </div>
</div>
```

---

## Loading State Pattern

Add a `loading` state in `App.tsx`:

```tsx
const [loading, setLoading] = useState(true);

useEffect(() => {
  Promise.all([
    fetchMetrics().then(setMetrics),
    fetchPortfolioPerformance().then(setPerformance),
    fetchStrategyAllocation().then(setAllocation),
    fetchAlerts().then(setAlerts),
  ]).finally(() => setLoading(false));
}, []);
```

Add a top-level loading indicator:
```tsx
{loading && (
  <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
    <div className="text-blue-500 text-sm font-medium animate-pulse">Loading dashboard...</div>
  </div>
)}
```

---

## README.md (root level)

```markdown
# OWL Fund Intelligence Dashboard

A fund intelligence dashboard built with React + TypeScript (frontend) and Python FastAPI (backend).

## Stack

- **Frontend**: Vite, React, TypeScript, Recharts, Tailwind CSS, Axios
- **Backend**: Python, FastAPI, Uvicorn, Pydantic
- **Data**: yfinance (portfolio performance), SEC EDGAR API (regulatory alerts), mock data (KPIs, allocation)

## Running Locally

### Backend
\`\`\`bash
cd backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload
\`\`\`
API runs at http://localhost:8000. Visit /docs for the interactive API explorer.

### Frontend
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
App runs at http://localhost:5173.

## API Endpoints

| Endpoint | Source | Description |
|---|---|---|
| `GET /api/metrics` | Mock | KPI card values |
| `GET /api/portfolio-performance` | yfinance (QQQ vs SPY) | 12-month cumulative returns |
| `GET /api/strategy-allocation` | Mock | Portfolio breakdown by strategy |
| `GET /api/alerts` | SEC EDGAR + Mock | Recent fund events and filings |

## What I'd Do Next

- **Real-time updates**: WebSocket connection for live alert streaming
- **Date range selector**: Let users zoom the portfolio chart to 1M / 3M / 1Y / All
- **Fund search**: Search bar to filter alerts by fund name
- **Persistence**: PostgreSQL to store alerts with read/unread state per user
- **Authentication**: JWT-based auth so each user sees their own alert feed
- **More data sources**: 13F filings to show fund position changes, not just ADV amendments
```

---

## GitHub Push

```bash
cd /Users/hiterharrisiv/Desktop/owl-fund-intelligence
git add .
git commit -m "feat: complete OWL Fund Intelligence dashboard"
git remote add origin https://github.com/<your-username>/owl-fund-intelligence.git
git branch -M main
git push -u origin main
```

## Final Verification Checklist
- [ ] `uvicorn main:app --reload` starts with no errors
- [ ] `npm run dev` starts with no TypeScript errors
- [ ] All 4 API endpoints return data at `http://localhost:8000/docs`
- [ ] Dashboard renders all 5 sections: header, 4 KPI cards, portfolio chart, allocation donut, alerts panel
- [ ] "Mark all read" button works
- [ ] Loading overlay appears briefly then disappears
- [ ] README is accurate and complete
- [ ] All files committed and pushed to GitHub
