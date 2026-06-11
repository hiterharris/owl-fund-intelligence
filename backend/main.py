from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import metrics, portfolio, allocation, alerts, funds

app = FastAPI(title="OWL Fund Intelligence API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
