# Step 01 — Project Scaffolding

## Goal
Initialize the monorepo with a Vite + React + TypeScript frontend and a Python FastAPI backend. Wire them together with a dev proxy so all API calls share the same origin during development.

## Interview Talking Points
- Vite chosen over CRA for near-instant HMR and zero config TypeScript
- Monorepo (single git root, two subfolders) keeps things simple for a take-home — no need for Nx or Turborepo
- Vite's `proxy` in `vite.config.ts` removes CORS friction in development without touching backend CORS config

---

## Commands to Execute

### 1. Create project root and Planning folder
```bash
cd /Users/hiterharrisiv/Desktop/owl-fund-intelligence
mkdir Planning
```

### 2. Scaffold the frontend
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
npm install
npm install axios recharts
npm install -D tailwindcss @tailwindcss/vite
```

### 3. Configure Tailwind
In `frontend/src/index.css`, replace contents with:
```css
@import "tailwindcss";
```

In `frontend/vite.config.ts`:
```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
    },
  },
})
```

### 4. Scaffold the backend
```bash
cd ../
mkdir -p backend/routers backend/services
cd backend
python3 -m venv venv
source venv/bin/activate
pip install fastapi uvicorn yfinance httpx
pip freeze > requirements.txt
```

### 5. Create `backend/main.py` skeleton
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="OWL Fund Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/health")
def health():
    return {"status": "ok"}
```

### 6. Initialize git
```bash
cd /Users/hiterharrisiv/Desktop/owl-fund-intelligence
git init
echo "node_modules/\nbackend/venv/\n__pycache__/\n.DS_Store\n*.pyc" > .gitignore
git add .
git commit -m "chore: initial scaffold"
```

## Verification
- `cd frontend && npm run dev` → browser opens at `http://localhost:5173` with Vite default page
- `cd backend && source venv/bin/activate && uvicorn main:app --reload` → `http://localhost:8000/health` returns `{"status":"ok"}`
- `http://localhost:8000/docs` shows the auto-generated FastAPI Swagger UI
