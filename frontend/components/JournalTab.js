import { useMemo, useState } from "react";

function toPhp(value) {
  return `PHP ${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function dateKey(date) {
  return date.toISOString().split("T")[0];
}

function buildJournal(trades) {
  const sorted = [...trades].sort((a, b) => new Date(a.executed_at) - new Date(b.executed_at));
  const inventory = {};
  const daily = {};
  let winningTrades = 0;
  let losingTrades = 0;

  for (const trade of sorted) {
    const key = dateKey(new Date(trade.executed_at));
    daily[key] = daily[key] || { pnl: 0, trades: 0 };
    daily[key].trades += 1;

    const symbol = trade.symbol;
    inventory[symbol] = inventory[symbol] || { qty: 0, avg: 0 };

    if (trade.side === "buy") {
      const totalQty = inventory[symbol].qty + trade.quantity;
      const weighted = inventory[symbol].avg * inventory[symbol].qty + trade.price * trade.quantity;
      inventory[symbol].qty = totalQty;
      inventory[symbol].avg = totalQty === 0 ? 0 : weighted / totalQty;
    }

    if (trade.side === "sell") {
      const closable = Math.min(inventory[symbol].qty, trade.quantity);
      const realized = (trade.price - inventory[symbol].avg) * closable;
      daily[key].pnl += realized;
      inventory[symbol].qty -= closable;

      if (realized > 0) {
        winningTrades += 1;
      } else if (realized < 0) {
        losingTrades += 1;
      }
    }
  }

  const totalPnL = Object.values(daily).reduce((sum, day) => sum + day.pnl, 0);
  const totalTrades = sorted.length;
  const longCount = sorted.filter((t) => t.side === "buy").length;
  const shortCount = sorted.filter((t) => t.side === "sell").length;
  const closedTrades = winningTrades + losingTrades;
  const winRate = closedTrades === 0 ? 0 : (winningTrades / closedTrades) * 100;

  const bestDay = Object.entries(daily).sort((a, b) => b[1].pnl - a[1].pnl)[0] || null;
  const worstDay = Object.entries(daily).sort((a, b) => a[1].pnl - b[1].pnl)[0] || null;

  return {
    daily,
    stats: {
      totalPnL,
      totalTrades,
      longCount,
      shortCount,
      winRate,
      winningTrades,
      losingTrades,
      bestDay,
      worstDay,
    },
  };
}

function monthMatrix(currentMonth) {
  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();
  const firstDay = new Date(year, month, 1);
  const start = new Date(firstDay);
  start.setDate(start.getDate() - firstDay.getDay());

  const cells = [];
  for (let i = 0; i < 42; i += 1) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    cells.push(d);
  }

  return cells;
}

function StatCard({ label, value, tone = "neutral" }) {
  const toneClass = tone === "good" ? "text-accent" : tone === "bad" ? "text-danger" : "text-textMain";
  return (
    <div className="rounded-xl border border-accent/20 bg-panelSoft p-3">
      <p className="text-xs uppercase tracking-wide text-textDim">{label}</p>
      <p className={`mt-1 text-lg font-bold ${toneClass}`}>{value}</p>
    </div>
  );
}

export default function JournalTab({ trades }) {
  const [month, setMonth] = useState(new Date());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState("all");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerYear, setPickerYear] = useState(new Date().getFullYear());
  const [pickerMonth, setPickerMonth] = useState(new Date().getMonth() + 1);
  const [pickerDay, setPickerDay] = useState("all");
  const { daily, stats } = useMemo(() => buildJournal(trades), [trades]);

  const cells = useMemo(() => monthMatrix(month), [month]);
  const monthName = month.toLocaleDateString(undefined, { month: "long", year: "numeric" });

  const monthKeys = cells
    .filter((d) => d.getMonth() === month.getMonth())
    .map((d) => dateKey(d));

  const monthlyPnL = monthKeys.reduce((sum, key) => sum + (daily[key]?.pnl || 0), 0);
  const monthlyTrades = monthKeys.reduce((sum, key) => sum + (daily[key]?.trades || 0), 0);
  const tradingDays = monthKeys.filter((key) => (daily[key]?.trades || 0) > 0).length;

  const years = useMemo(() => {
    const yearSet = new Set();
    Object.keys(daily).forEach((key) => yearSet.add(Number(key.slice(0, 4))));
    yearSet.add(new Date().getFullYear());
    return [...yearSet].sort((a, b) => b - a);
  }, [daily]);

  const dayOptions = useMemo(() => {
    const max = new Date(selectedYear, selectedMonth, 0).getDate();
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [selectedYear, selectedMonth]);

  const filteredKeys = useMemo(() => {
    return Object.keys(daily).filter((key) => {
      const [y, m, d] = key.split("-").map(Number);
      if (y !== selectedYear || m !== selectedMonth) {
        return false;
      }
      if (selectedDay !== "all" && d !== Number(selectedDay)) {
        return false;
      }
      return true;
    });
  }, [daily, selectedYear, selectedMonth, selectedDay]);

  const filteredPnL = filteredKeys.reduce((sum, key) => sum + (daily[key]?.pnl || 0), 0);
  const filteredTrades = filteredKeys.reduce((sum, key) => sum + (daily[key]?.trades || 0), 0);

  function applyPicker() {
    setSelectedYear(pickerYear);
    setSelectedMonth(pickerMonth);
    setSelectedDay(pickerDay);
    setMonth(new Date(pickerYear, pickerMonth - 1, 1));
    setShowDatePicker(false);
  }

  return (
    <section className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} tone={stats.winRate >= 50 ? "good" : "bad"} />
        <StatCard label="Total Realized PnL" value={toPhp(stats.totalPnL)} tone={stats.totalPnL >= 0 ? "good" : "bad"} />
        <StatCard label="Long Orders" value={stats.longCount} />
        <StatCard label="Short Orders" value={stats.shortCount} />
        <StatCard label="Winning Trades" value={stats.winningTrades} tone="good" />
        <StatCard label="Losing Trades" value={stats.losingTrades} tone="bad" />
        <StatCard
          label="Best Day"
          value={stats.bestDay ? `${stats.bestDay[0]} (${toPhp(stats.bestDay[1].pnl)})` : "-"}
          tone="good"
        />
        <StatCard
          label="Worst Day"
          value={stats.worstDay ? `${stats.worstDay[0]} (${toPhp(stats.worstDay[1].pnl)})` : "-"}
          tone="bad"
        />
      </div>

      <div className="rounded-2xl border border-accent/25 bg-panel p-4 shadow-glow">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <button type="button" className="btn-neon text-xs" onClick={() => setMonth(new Date())}>
              Today
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
            >
              ←
            </button>
            <button
              type="button"
              className="btn-ghost text-base"
              onClick={() => setShowDatePicker((v) => !v)}
            >
              {monthName}
            </button>
            <button
              type="button"
              className="btn-ghost"
              onClick={() => setMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
            >
              →
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-md border border-accent/25 bg-panelSoft px-2 py-1">
              Monthly: <b className={monthlyPnL >= 0 ? "text-accent" : "text-danger"}>{toPhp(monthlyPnL)}</b>
            </span>
            <span className="rounded-md border border-accent/25 bg-panelSoft px-2 py-1">Trading days: {tradingDays}</span>
            <span className="rounded-md border border-accent/25 bg-panelSoft px-2 py-1">Trades: {monthlyTrades}</span>
          </div>
        </div>

        {showDatePicker && (
          <div className="mb-4 rounded-xl border border-accent/20 bg-panelSoft p-3">
            <div className="grid gap-2 md:grid-cols-3">
              <label className="text-sm">
                <span className="mb-1 block text-xs uppercase tracking-wide text-textDim">Year</span>
                <select
                  className="select-neon w-full"
                  value={pickerYear}
                  onChange={(e) => setPickerYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-xs uppercase tracking-wide text-textDim">Month</span>
                <select
                  className="select-neon w-full"
                  value={pickerMonth}
                  onChange={(e) => setPickerMonth(Number(e.target.value))}
                >
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <option key={m} value={m}>
                      {new Date(2026, m - 1, 1).toLocaleDateString(undefined, { month: "long" })}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-sm">
                <span className="mb-1 block text-xs uppercase tracking-wide text-textDim">Day</span>
                <select className="select-neon w-full" value={pickerDay} onChange={(e) => setPickerDay(e.target.value)}>
                  <option value="all">All days</option>
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-3 flex items-center justify-between">
              <div className="rounded-md border border-accent/20 bg-panel px-3 py-2 text-sm">
                Filtered view: <span className={filteredPnL >= 0 ? "text-accent" : "text-danger"}>{toPhp(filteredPnL)}</span>
                <span className="ml-3 text-textDim">Trades: {filteredTrades}</span>
              </div>
              <button type="button" className="btn-neon text-xs" onClick={applyPicker}>
                Apply
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-7 overflow-hidden rounded-xl border border-accent/20">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="border-b border-r border-accent/10 bg-panelSoft p-2 text-xs uppercase tracking-wide text-textDim last:border-r-0">
              {day}
            </div>
          ))}

          {cells.map((d, index) => {
            const key = dateKey(d);
            const cellData = daily[key];
            const inMonth = d.getMonth() === month.getMonth();
            const positive = (cellData?.pnl || 0) >= 0;

            return (
              <div
                key={`${key}-${index}`}
                className={`calendar-cell ${inMonth ? "" : "calendar-cell-out"} ${
                  cellData ? (positive ? "calendar-cell-win" : "calendar-cell-loss") : ""
                }`}
              >
                <p className="text-xs text-textDim">{d.getDate()}</p>
                {cellData && (
                  <div className="mt-2 text-sm">
                    <p className={positive ? "font-semibold text-accent" : "font-semibold text-danger"}>
                      {cellData.pnl >= 0 ? "+" : ""}
                      {toPhp(cellData.pnl).replace("PHP ", "")}
                    </p>
                    <p className="text-xs text-textDim">Trades: {cellData.trades}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <p className="mt-3 text-center text-xs text-textDim">
          Trades are grouped by your local machine time.
        </p>
      </div>
    </section>
  );
}
