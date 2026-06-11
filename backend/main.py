import os
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import metrics, portfolio, allocation, alerts, funds

app = FastAPI(title="OWL Fund Intelligence API")

_raw_origins = os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173")
_origins = [o.strip() for o in _raw_origins.split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(metrics.router,    prefix="/api")
app.include_router(portfolio.router,  prefix="/api")
app.include_router(allocation.router, prefix="/api")
app.include_router(alerts.router,     prefix="/api")
app.include_router(funds.router,      prefix="/api")


@app.get("/health")
def health():
    return {"status": "ok"}


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port)
