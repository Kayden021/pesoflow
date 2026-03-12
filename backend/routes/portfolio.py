from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from database import get_db
from schemas import PortfolioOut
from services.portfolio_service import build_portfolio_summary

router = APIRouter(tags=["portfolio"])


@router.get("/portfolio", response_model=PortfolioOut)
def get_portfolio(db: Session = Depends(get_db)):
    return build_portfolio_summary(db)
