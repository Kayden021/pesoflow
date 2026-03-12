const DUMMY_CANDLES = {
  BDO: [
    { time: 1707696000, open: 127.0, high: 128.6, low: 126.4, close: 128.1 },
    { time: 1707782400, open: 128.1, high: 129.5, low: 127.3, close: 127.8 },
    { time: 1707868800, open: 127.8, high: 129.1, low: 127.1, close: 128.7 },
    { time: 1707955200, open: 128.7, high: 130.3, low: 128.4, close: 129.9 },
    { time: 1708041600, open: 129.9, high: 131.0, low: 129.0, close: 130.6 },
    { time: 1708300800, open: 130.6, high: 131.8, low: 129.9, close: 130.2 },
    { time: 1708387200, open: 130.2, high: 132.1, low: 129.8, close: 131.7 },
    { time: 1708473600, open: 131.7, high: 132.8, low: 130.9, close: 132.1 },
    { time: 1708560000, open: 132.1, high: 133.5, low: 131.5, close: 132.9 },
    { time: 1708646400, open: 132.9, high: 134.0, low: 132.2, close: 133.8 },
    { time: 1708905600, open: 133.8, high: 134.6, low: 132.9, close: 133.3 },
    { time: 1708992000, open: 133.3, high: 135.4, low: 133.0, close: 135.0 },
    { time: 1709078400, open: 135.0, high: 135.7, low: 133.8, close: 134.2 },
    { time: 1709164800, open: 134.2, high: 136.2, low: 133.9, close: 135.8 },
    { time: 1709251200, open: 135.8, high: 137.1, low: 135.2, close: 136.9 }
  ],
  SMPH: [
    { time: 1707696000, open: 31.8, high: 32.2, low: 31.6, close: 32.1 },
    { time: 1707782400, open: 32.1, high: 32.4, low: 31.9, close: 32.0 },
    { time: 1707868800, open: 32.0, high: 32.7, low: 31.8, close: 32.5 },
    { time: 1707955200, open: 32.5, high: 32.9, low: 32.1, close: 32.3 },
    { time: 1708041600, open: 32.3, high: 33.0, low: 32.0, close: 32.8 },
    { time: 1708300800, open: 32.8, high: 33.2, low: 32.4, close: 32.7 },
    { time: 1708387200, open: 32.7, high: 33.3, low: 32.6, close: 33.1 },
    { time: 1708473600, open: 33.1, high: 33.6, low: 32.9, close: 33.2 },
    { time: 1708560000, open: 33.2, high: 33.8, low: 33.0, close: 33.6 },
    { time: 1708646400, open: 33.6, high: 34.1, low: 33.2, close: 33.5 },
    { time: 1708905600, open: 33.5, high: 34.0, low: 33.1, close: 33.7 },
    { time: 1708992000, open: 33.7, high: 34.3, low: 33.4, close: 34.1 },
    { time: 1709078400, open: 34.1, high: 34.5, low: 33.9, close: 34.0 },
    { time: 1709164800, open: 34.0, high: 34.8, low: 33.7, close: 34.6 },
    { time: 1709251200, open: 34.6, high: 35.1, low: 34.2, close: 34.9 }
  ],
  JFC: [
    { time: 1707696000, open: 247.0, high: 249.8, low: 246.2, close: 248.1 },
    { time: 1707782400, open: 248.1, high: 250.6, low: 247.3, close: 249.9 },
    { time: 1707868800, open: 249.9, high: 251.0, low: 248.4, close: 249.1 },
    { time: 1707955200, open: 249.1, high: 252.2, low: 248.9, close: 251.6 },
    { time: 1708041600, open: 251.6, high: 253.5, low: 250.7, close: 252.9 },
    { time: 1708300800, open: 252.9, high: 254.1, low: 251.4, close: 253.2 },
    { time: 1708387200, open: 253.2, high: 255.3, low: 252.7, close: 254.8 },
    { time: 1708473600, open: 254.8, high: 256.1, low: 253.6, close: 255.2 },
    { time: 1708560000, open: 255.2, high: 257.4, low: 254.9, close: 256.9 },
    { time: 1708646400, open: 256.9, high: 258.0, low: 255.8, close: 256.3 },
    { time: 1708905600, open: 256.3, high: 259.2, low: 255.5, close: 258.8 },
    { time: 1708992000, open: 258.8, high: 260.1, low: 257.2, close: 257.9 },
    { time: 1709078400, open: 257.9, high: 259.5, low: 256.4, close: 258.4 },
    { time: 1709164800, open: 258.4, high: 261.1, low: 257.8, close: 260.7 },
    { time: 1709251200, open: 260.7, high: 262.0, low: 259.1, close: 261.4 }
  ]
};

function toWeekly(candles) {
  const buckets = {};
  for (const c of candles) {
    const date = new Date(c.time * 1000);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const week = Math.ceil(((date - firstDayOfYear) / 86400000 + firstDayOfYear.getDay() + 1) / 7);
    const key = `${date.getFullYear()}-${week}`;

    if (!buckets[key]) {
      buckets[key] = { ...c };
      continue;
    }

    buckets[key].high = Math.max(buckets[key].high, c.high);
    buckets[key].low = Math.min(buckets[key].low, c.low);
    buckets[key].close = c.close;
    buckets[key].time = c.time;
  }

  return Object.values(buckets).sort((a, b) => a.time - b.time);
}

function toMonthly(candles) {
  const buckets = {};
  for (const c of candles) {
    const date = new Date(c.time * 1000);
    const key = `${date.getFullYear()}-${date.getMonth() + 1}`;

    if (!buckets[key]) {
      buckets[key] = { ...c };
      continue;
    }

    buckets[key].high = Math.max(buckets[key].high, c.high);
    buckets[key].low = Math.min(buckets[key].low, c.low);
    buckets[key].close = c.close;
    buckets[key].time = c.time;
  }

  return Object.values(buckets).sort((a, b) => a.time - b.time);
}

function toYearly(candles) {
  const buckets = {};
  for (const c of candles) {
    const year = new Date(c.time * 1000).getFullYear();
    const key = `${year}`;

    if (!buckets[key]) {
      buckets[key] = { ...c };
      continue;
    }

    buckets[key].high = Math.max(buckets[key].high, c.high);
    buckets[key].low = Math.min(buckets[key].low, c.low);
    buckets[key].close = c.close;
    buckets[key].time = c.time;
  }

  return Object.values(buckets).sort((a, b) => a.time - b.time);
}

function generateIntradaySeries(candles, intervalMinutes, bars = 180) {
  const lastClose = candles[candles.length - 1]?.close || 100;
  const now = Math.floor(Date.now() / 1000);
  const series = [];
  let prevClose = lastClose;

  for (let i = 0; i < bars; i += 1) {
    const t = now - (bars - i) * intervalMinutes * 60;
    const noise = (Math.sin(i * 1.73) + Math.cos(i * 0.87)) * (lastClose * 0.0008);
    const trend = Math.sin(i / 18) * (lastClose * 0.0012);
    const open = prevClose;
    const close = open + noise + trend;
    const wickPad = Math.abs(noise) * 0.7 + lastClose * 0.0007;
    const high = Math.max(open, close) + wickPad;
    const low = Math.min(open, close) - wickPad;

    series.push({
      time: t,
      open: Number(open.toFixed(2)),
      high: Number(high.toFixed(2)),
      low: Number(low.toFixed(2)),
      close: Number(close.toFixed(2)),
    });

    prevClose = close;
  }

  return series;
}

export function getSymbolCandles(symbol, timeframe = "1D") {
  const upperSymbol = symbol.toUpperCase();
  const candles = DUMMY_CANDLES[upperSymbol] || DUMMY_CANDLES.BDO;

  const tf = timeframe.toLowerCase();
  if (tf === "1m") {
    return generateIntradaySeries(candles, 1);
  }
  if (tf === "3m") {
    return generateIntradaySeries(candles, 3);
  }
  if (tf === "5m") {
    return generateIntradaySeries(candles, 5);
  }
  if (tf === "15m") {
    return generateIntradaySeries(candles, 15);
  }
  if (tf === "30m") {
    return generateIntradaySeries(candles, 30);
  }
  if (tf === "1h") {
    return generateIntradaySeries(candles, 60);
  }
  if (tf === "4h") {
    return generateIntradaySeries(candles, 240);
  }
  if (tf === "1w") {
    return toWeekly(candles);
  }
  if (tf === "1mo") {
    return toMonthly(candles);
  }
  if (tf === "1y") {
    return toYearly(candles);
  }

  return candles;
}

export const DEFAULT_SYMBOLS = ["BDO", "SMPH", "JFC"];
