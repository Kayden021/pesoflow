import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from database import Base, SessionLocal, engine
from models import WatchlistItem
from routes.portfolio import router as portfolio_router
from routes.stocks import router as stocks_router
from routes.trades import router as trades_router
from services.market_data import get_stock_snapshot
from services.portfolio_service import get_or_create_account

app = FastAPI(title="PesoFlow API", version="0.1.0")

cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000")
origin_list = [origin.strip() for origin in cors_origins.split(",") if origin.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    Base.metadata.create_all(bind=engine)
    seed_defaults()


def seed_defaults():
    db: Session = SessionLocal()
    try:
        get_or_create_account(db)
        watchlist_count = db.query(WatchlistItem).count()
        if watchlist_count == 0:
            for symbol in ["BDO", "SMPH", "JFC"]:
                stock = get_stock_snapshot(symbol)
                if stock:
                    db.add(
                        WatchlistItem(
                            symbol=symbol,
                            price=stock["price"],
                            change_percent=stock["change_percent"],
                        )
                    )
            db.commit()
    finally:
        db.close()


@app.get("/")
def health_check():
    return {"status": "ok", "service": "PesoFlow API"}


app.include_router(stocks_router)
app.include_router(portfolio_router)
app.include_router(trades_router)
