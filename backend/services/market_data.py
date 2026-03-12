DUMMY_MARKET = {
    "BDO": {
        "price": 136.9,
        "change_percent": 1.22,
        "candles": [
            {"time": 1707696000, "open": 127.0, "high": 128.6, "low": 126.4, "close": 128.1},
            {"time": 1707782400, "open": 128.1, "high": 129.5, "low": 127.3, "close": 127.8},
            {"time": 1707868800, "open": 127.8, "high": 129.1, "low": 127.1, "close": 128.7},
            {"time": 1707955200, "open": 128.7, "high": 130.3, "low": 128.4, "close": 129.9},
            {"time": 1708041600, "open": 129.9, "high": 131.0, "low": 129.0, "close": 130.6},
            {"time": 1708300800, "open": 130.6, "high": 131.8, "low": 129.9, "close": 130.2},
            {"time": 1708387200, "open": 130.2, "high": 132.1, "low": 129.8, "close": 131.7},
            {"time": 1708473600, "open": 131.7, "high": 132.8, "low": 130.9, "close": 132.1},
            {"time": 1708560000, "open": 132.1, "high": 133.5, "low": 131.5, "close": 132.9},
            {"time": 1708646400, "open": 132.9, "high": 134.0, "low": 132.2, "close": 133.8},
        ],
    },
    "SMPH": {
        "price": 34.9,
        "change_percent": 0.86,
        "candles": [
            {"time": 1707696000, "open": 31.8, "high": 32.2, "low": 31.6, "close": 32.1},
            {"time": 1707782400, "open": 32.1, "high": 32.4, "low": 31.9, "close": 32.0},
            {"time": 1707868800, "open": 32.0, "high": 32.7, "low": 31.8, "close": 32.5},
            {"time": 1707955200, "open": 32.5, "high": 32.9, "low": 32.1, "close": 32.3},
            {"time": 1708041600, "open": 32.3, "high": 33.0, "low": 32.0, "close": 32.8},
            {"time": 1708300800, "open": 32.8, "high": 33.2, "low": 32.4, "close": 32.7},
            {"time": 1708387200, "open": 32.7, "high": 33.3, "low": 32.6, "close": 33.1},
            {"time": 1708473600, "open": 33.1, "high": 33.6, "low": 32.9, "close": 33.2},
            {"time": 1708560000, "open": 33.2, "high": 33.8, "low": 33.0, "close": 33.6},
            {"time": 1708646400, "open": 33.6, "high": 34.1, "low": 33.2, "close": 33.5},
        ],
    },
    "JFC": {
        "price": 261.4,
        "change_percent": 1.45,
        "candles": [
            {"time": 1707696000, "open": 247.0, "high": 249.8, "low": 246.2, "close": 248.1},
            {"time": 1707782400, "open": 248.1, "high": 250.6, "low": 247.3, "close": 249.9},
            {"time": 1707868800, "open": 249.9, "high": 251.0, "low": 248.4, "close": 249.1},
            {"time": 1707955200, "open": 249.1, "high": 252.2, "low": 248.9, "close": 251.6},
            {"time": 1708041600, "open": 251.6, "high": 253.5, "low": 250.7, "close": 252.9},
            {"time": 1708300800, "open": 252.9, "high": 254.1, "low": 251.4, "close": 253.2},
            {"time": 1708387200, "open": 253.2, "high": 255.3, "low": 252.7, "close": 254.8},
            {"time": 1708473600, "open": 254.8, "high": 256.1, "low": 253.6, "close": 255.2},
            {"time": 1708560000, "open": 255.2, "high": 257.4, "low": 254.9, "close": 256.9},
            {"time": 1708646400, "open": 256.9, "high": 258.0, "low": 255.8, "close": 256.3},
        ],
    },
    "ACEN": {
        "price": 5.3,
        "change_percent": -0.56,
        "candles": [
            {"time": 1707696000, "open": 5.1, "high": 5.2, "low": 5.0, "close": 5.1},
            {"time": 1707782400, "open": 5.1, "high": 5.3, "low": 5.1, "close": 5.2},
            {"time": 1707868800, "open": 5.2, "high": 5.3, "low": 5.1, "close": 5.2},
            {"time": 1707955200, "open": 5.2, "high": 5.4, "low": 5.1, "close": 5.3},
            {"time": 1708041600, "open": 5.3, "high": 5.4, "low": 5.2, "close": 5.3},
            {"time": 1708300800, "open": 5.3, "high": 5.4, "low": 5.2, "close": 5.3},
            {"time": 1708387200, "open": 5.3, "high": 5.4, "low": 5.2, "close": 5.2},
            {"time": 1708473600, "open": 5.2, "high": 5.3, "low": 5.1, "close": 5.2},
            {"time": 1708560000, "open": 5.2, "high": 5.3, "low": 5.1, "close": 5.3},
            {"time": 1708646400, "open": 5.3, "high": 5.4, "low": 5.2, "close": 5.3},
        ],
    },
}


def get_stock_snapshot(symbol: str):
    return DUMMY_MARKET.get(symbol.upper())


def list_stock_snapshots(symbols: list[str]):
    snapshots = []
    for symbol in symbols:
        stock = get_stock_snapshot(symbol)
        if stock:
            snapshots.append(
                {
                    "symbol": symbol.upper(),
                    "price": stock["price"],
                    "change_percent": stock["change_percent"],
                }
            )
    return snapshots
