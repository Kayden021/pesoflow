from datetime import datetime
from typing import List

from pydantic import BaseModel, ConfigDict, Field


class StockOut(BaseModel):
    symbol: str
    price: float
    change_percent: float


class Candle(BaseModel):
    time: int
    open: float
    high: float
    low: float
    close: float


class StockDetailOut(BaseModel):
    symbol: str
    price: float
    change_percent: float
    candles: List[Candle]


class WatchlistCreate(BaseModel):
    symbol: str = Field(min_length=1, max_length=20)


class PositionOut(BaseModel):
    symbol: str
    quantity: int
    avg_price: float
    current_price: float
    unrealized_pnl: float


class PortfolioOut(BaseModel):
    cash_balance: float
    market_value: float
    total_equity: float
    total_pnl: float
    positions: List[PositionOut]


class TradeIn(BaseModel):
    side: str
    symbol: str
    quantity: int = Field(gt=0)
    price: float = Field(gt=0)


class TradeOut(BaseModel):
    id: int
    side: str
    symbol: str
    quantity: int
    price: float
    executed_at: datetime
    model_config = ConfigDict(from_attributes=True)


class TradeResponse(BaseModel):
    message: str
    trade: TradeOut
