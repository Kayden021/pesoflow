from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from database import get_db
from models import Position, Trade
from schemas import TradeIn, TradeOut, TradeResponse
from services.market_data import get_stock_snapshot
from services.portfolio_service import get_or_create_account

router = APIRouter(tags=["trading"])


@router.get("/trades", response_model=list[TradeOut])
def list_trades(limit: int = 50, db: Session = Depends(get_db)):
    safe_limit = max(1, min(limit, 200))
    trades = db.query(Trade).order_by(Trade.executed_at.desc()).limit(safe_limit).all()
    return trades


@router.post("/trade", response_model=TradeResponse)
def place_trade(payload: TradeIn, db: Session = Depends(get_db)):
    side = payload.side.lower().strip()
    if side not in {"buy", "sell"}:
        raise HTTPException(status_code=400, detail="Side must be 'buy' or 'sell'")

    symbol = payload.symbol.upper().strip()
    stock = get_stock_snapshot(symbol)
    if not stock:
        raise HTTPException(status_code=404, detail="Symbol not supported in dummy data")

    account = get_or_create_account(db)
    position = db.query(Position).filter(Position.symbol == symbol).first()
    notional = payload.quantity * payload.price

    if side == "buy":
        if account.cash_balance < notional:
            raise HTTPException(status_code=400, detail="Insufficient cash for buy order")

        account.cash_balance -= notional

        if position:
            total_qty = position.quantity + payload.quantity
            weighted_cost = (position.avg_price * position.quantity) + notional
            position.avg_price = weighted_cost / total_qty
            position.quantity = total_qty
            position.current_price = payload.price
        else:
            position = Position(
                symbol=symbol,
                quantity=payload.quantity,
                avg_price=payload.price,
                current_price=payload.price,
                unrealized_pnl=0.0,
            )
            db.add(position)

    if side == "sell":
        if not position or position.quantity < payload.quantity:
            raise HTTPException(status_code=400, detail="Not enough shares to sell")

        account.cash_balance += notional
        position.quantity -= payload.quantity
        position.current_price = payload.price

        if position.quantity == 0:
            db.delete(position)

    trade = Trade(
        side=side,
        symbol=symbol,
        quantity=payload.quantity,
        price=payload.price,
    )

    db.add(trade)
    db.commit()
    db.refresh(trade)

    return {
        "message": "Trade executed successfully",
        "trade": {
            "id": trade.id,
            "side": trade.side,
            "symbol": trade.symbol,
            "quantity": trade.quantity,
            "price": trade.price,
            "executed_at": trade.executed_at,
        },
    }
