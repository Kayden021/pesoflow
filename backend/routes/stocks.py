from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import WatchlistItem
from schemas import StockDetailOut, StockOut, WatchlistCreate
from services.market_data import get_stock_snapshot

router = APIRouter(tags=["stocks"])


@router.get("/stocks", response_model=list[StockOut])
def get_stocks(db: Session = Depends(get_db)):
    watchlist = db.query(WatchlistItem).all()

    output = []
    for item in watchlist:
        stock = get_stock_snapshot(item.symbol)
        if stock:
            item.price = stock["price"]
            item.change_percent = stock["change_percent"]
            output.append(
                {
                    "symbol": item.symbol,
                    "price": item.price,
                    "change_percent": item.change_percent,
                }
            )

    db.commit()
    return output


@router.get("/stock/{symbol}", response_model=StockDetailOut)
def get_stock(symbol: str):
    stock = get_stock_snapshot(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Symbol not found")

    return {
        "symbol": symbol.upper(),
        "price": stock["price"],
        "change_percent": stock["change_percent"],
        "candles": stock["candles"],
    }


@router.post("/watchlist", response_model=StockOut)
def add_watchlist_item(payload: WatchlistCreate, db: Session = Depends(get_db)):
    symbol = payload.symbol.upper().strip()
    existing = db.query(WatchlistItem).filter(WatchlistItem.symbol == symbol).first()
    if existing:
        return {
            "symbol": existing.symbol,
            "price": existing.price,
            "change_percent": existing.change_percent,
        }

    stock = get_stock_snapshot(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Symbol not supported in dummy data")

    item = WatchlistItem(symbol=symbol, price=stock["price"], change_percent=stock["change_percent"])
    db.add(item)
    db.commit()
    db.refresh(item)

    return {
        "symbol": item.symbol,
        "price": item.price,
        "change_percent": item.change_percent,
    }


@router.delete("/watchlist/{symbol}")
def remove_watchlist_item(symbol: str, db: Session = Depends(get_db)):
    item = db.query(WatchlistItem).filter(WatchlistItem.symbol == symbol.upper()).first()
    if not item:
        raise HTTPException(status_code=404, detail="Symbol not in watchlist")

    db.delete(item)
    db.commit()
    return {"message": f"Removed {symbol.upper()} from watchlist"}
