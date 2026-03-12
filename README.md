# PesoFlow (MVP)

A modern web-based trading dashboard MVP focused on Philippine stock traders.

## Stack

- Frontend: Next.js + React + TailwindCSS
- Backend: FastAPI + SQLAlchemy
- Charting: TradingView Lightweight Charts
- Database: PostgreSQL

## Folder Structure

```text
ph-trading-platform
|
|- frontend
|  |- pages
|  |- components
|  |- charts
|  |- watchlist
|  |- styles
|
|- backend
|  |- main.py
|  |- database.py
|  |- models.py
|  |- schemas.py
|  |- routes
|  |- services
|
|- database
   |- models
      |- schema.sql
```

## Features in this MVP

- Dashboard page with:
  - Candlestick stock chart
  - Watchlist with add/remove
  - Portfolio summary
  - Paper trading form
- Timeframe switching on chart (1D, 1W)
- Simulated buy/sell orders
- Portfolio and balance updates
- Recent trade history panel
- Watchlist and positions stored in PostgreSQL
- Dummy stock data (no external market API yet)

## API Endpoints

- `GET /stocks`
- `GET /stock/{symbol}`
- `GET /portfolio`
- `POST /trade`
- `GET /trades`
- `POST /watchlist`
- `DELETE /watchlist/{symbol}`

## Local Setup

### 1) Start PostgreSQL

Create a database named `ph_trading_terminal`.

### 2) Run Backend (FastAPI)

```bash
cd ph-trading-platform/backend
python -m venv .venv
# Windows PowerShell:
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
copy .env.example .env
uvicorn main:app --reload --port 8000
```

Backend runs at http://localhost:8000

### 3) Run Frontend (Next.js)

```bash
cd ph-trading-platform/frontend
npm install
copy .env.local.example .env.local
npm run dev
```

Frontend runs at http://localhost:3000

## One-Command Run (Docker)

```bash
cd ph-trading-platform
docker compose up --build
```

Services:

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- PostgreSQL: localhost:5432

Stop containers:

```bash
docker compose down
```

## Notes

- On startup, backend auto-creates DB tables and seeds default watchlist symbols (`BDO`, `SMPH`, `JFC`) plus a paper account with `PHP 100,000`.
- Trading uses dummy prices and simulated execution.
- This codebase is intentionally simple for solo developer extension.
