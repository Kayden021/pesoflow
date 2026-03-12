from sqlalchemy.orm import Session

from models import Account, Position
from services.market_data import get_stock_snapshot


def get_or_create_account(db: Session) -> Account:
    account = db.query(Account).filter(Account.id == 1).first()
    if account:
        return account

    account = Account(id=1, cash_balance=100000.0, starting_balance=100000.0)
    db.add(account)
    db.commit()
    db.refresh(account)
    return account


def refresh_position_prices(db: Session):
    positions = db.query(Position).all()
    for position in positions:
        stock = get_stock_snapshot(position.symbol)
        if stock:
            position.current_price = stock["price"]
            position.unrealized_pnl = (position.current_price - position.avg_price) * position.quantity

    db.commit()


def build_portfolio_summary(db: Session):
    refresh_position_prices(db)
    account = get_or_create_account(db)
    positions = db.query(Position).all()

    market_value = sum(p.current_price * p.quantity for p in positions)
    total_equity = account.cash_balance + market_value
    total_pnl = total_equity - account.starting_balance

    return {
        "cash_balance": round(account.cash_balance, 2),
        "market_value": round(market_value, 2),
        "total_equity": round(total_equity, 2),
        "total_pnl": round(total_pnl, 2),
        "positions": [
            {
                "symbol": p.symbol,
                "quantity": p.quantity,
                "avg_price": round(p.avg_price, 2),
                "current_price": round(p.current_price, 2),
                "unrealized_pnl": round(p.unrealized_pnl, 2),
            }
            for p in positions
        ],
    }
