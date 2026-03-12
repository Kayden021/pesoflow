import { useEffect, useMemo, useState } from "react";
import JournalTab from "../components/JournalTab";
import LogoMark from "../components/LogoMark";
import PaperTradeForm from "../components/PaperTradeForm";
import PortfolioSummary from "../components/PortfolioSummary";
import StockChart from "../components/StockChart";
import TimeframePicker from "../components/TimeframePicker";
import TradeHistory from "../components/TradeHistory";
import WatchlistPanel from "../components/WatchlistPanel";
import { DEFAULT_SYMBOLS, getSymbolCandles } from "../charts/dummyData";
import { useWatchlist } from "../watchlist/useWatchlist";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";
const TIMEFRAME_OPTIONS = [
  { label: "1m", value: "1m" },
  { label: "3m", value: "3m" },
  { label: "5m", value: "5m" },
  { label: "15m", value: "15m" },
  { label: "30m", value: "30m" },
  { label: "1h", value: "1h" },
  { label: "4h", value: "4h" },
  { label: "1D", value: "1D" },
  { label: "1W", value: "1W" },
  { label: "1M", value: "1mo" },
  { label: "1Y", value: "1y" },
];
const TIMEFRAME_ORDER = TIMEFRAME_OPTIONS.map((item) => item.value);

function toMarker(trade) {
  const ts = Math.floor(new Date(trade.executed_at).getTime() / 1000);
  const isBuy = trade.side === "buy";
  return {
    time: ts,
    position: isBuy ? "belowBar" : "aboveBar",
    color: isBuy ? "#2dff9e" : "#ff5a5f",
    shape: isBuy ? "arrowUp" : "arrowDown",
    text: `${trade.side.toUpperCase()} ${trade.symbol}`,
  };
}

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [utilityPanel, setUtilityPanel] = useState(null);
  const [selectedSymbol, setSelectedSymbol] = useState("BDO");
  const [secondarySymbol, setSecondarySymbol] = useState("SMPH");
  const [showSplitChart, setShowSplitChart] = useState(false);
  const [timeframe, setTimeframe] = useState("15m");
  const [favoriteTimeframes, setFavoriteTimeframes] = useState(["1m", "15m", "1D"]);
  const [portfolio, setPortfolio] = useState({ positions: [] });
  const [trades, setTrades] = useState([]);
  const [newSymbol, setNewSymbol] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [activeTool, setActiveTool] = useState("cursor");
  const [showSma, setShowSma] = useState(false);
  const [drawings, setDrawings] = useState([]);
  const [timeNow, setTimeNow] = useState(new Date());
  const [viewportWidth, setViewportWidth] = useState(1280);

  const { stocks, loading, addSymbol, removeSymbol, refresh } = useWatchlist();

  const symbols = useMemo(() => {
    if (stocks.length === 0) {
      return DEFAULT_SYMBOLS;
    }
    return stocks.map((s) => s.symbol);
  }, [stocks]);

  const chartData = useMemo(
    () => getSymbolCandles(selectedSymbol || "BDO", timeframe),
    [selectedSymbol, timeframe]
  );

  const secondChartData = useMemo(
    () => getSymbolCandles(secondarySymbol || selectedSymbol || "BDO", timeframe),
    [secondarySymbol, selectedSymbol, timeframe]
  );

  const tradeMarkers = useMemo(
    () => trades.filter((t) => t.symbol === selectedSymbol).map(toMarker),
    [trades, selectedSymbol]
  );

  const timeframeLabelMap = useMemo(() => {
    const map = {};
    TIMEFRAME_OPTIONS.forEach((item) => {
      map[item.value] = item.label;
    });
    return map;
  }, []);

  const favoriteFramesResolved = useMemo(() => {
    return favoriteTimeframes
      .filter((value) => timeframeLabelMap[value])
      .sort((a, b) => TIMEFRAME_ORDER.indexOf(a) - TIMEFRAME_ORDER.indexOf(b));
  }, [favoriteTimeframes, timeframeLabelMap]);

  useEffect(() => {
    if (!symbols.includes(selectedSymbol)) {
      setSelectedSymbol(symbols[0]);
    }
  }, [symbols, selectedSymbol]);

  useEffect(() => {
    if (!symbols.includes(secondarySymbol)) {
      setSecondarySymbol(symbols.find((s) => s !== selectedSymbol) || symbols[0]);
    }
  }, [symbols, secondarySymbol, selectedSymbol]);

  useEffect(() => {
    const timer = setInterval(() => setTimeNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function onResize() {
      setViewportWidth(window.innerWidth);
    }

    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    // Keep default view to one chart unless user explicitly enables split mode.
    setShowSplitChart(false);
  }, []);

  async function loadDashboardData() {
    setError("");
    try {
      await Promise.all([fetchPortfolio(), fetchTrades()]);
    } catch (err) {
      setError(err.message || "Failed to load dashboard data.");
    }
  }

  async function fetchPortfolio() {
    const response = await fetch(`${API_BASE}/portfolio`);
    if (!response.ok) {
      throw new Error("Unable to load portfolio.");
    }
    const data = await response.json();
    setPortfolio(data);
  }

  async function fetchTrades() {
    const response = await fetch(`${API_BASE}/trades?limit=500`);
    if (!response.ok) {
      throw new Error("Unable to load recent trades.");
    }
    const data = await response.json();
    setTrades(data);
  }

  async function handleAddSymbol(event) {
    event.preventDefault();
    if (!newSymbol.trim()) {
      return;
    }

    try {
      setError("");
      await addSymbol(newSymbol.trim());
      setNewSymbol("");
    } catch (err) {
      setError(err.message || "Unable to add symbol.");
    }
  }

  async function handleRemoveSymbol(symbol) {
    try {
      setError("");
      await removeSymbol(symbol);
      if (selectedSymbol === symbol && symbols.length > 1) {
        const nextSymbol = symbols.find((item) => item !== symbol);
        if (nextSymbol) {
          setSelectedSymbol(nextSymbol);
        }
      }
    } catch (err) {
      setError(err.message || "Unable to remove symbol.");
    }
  }

  async function handleTrade(order) {
    try {
      setError("");
      setBusy(true);
      const response = await fetch(`${API_BASE}/trade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(order),
      });

      if (!response.ok) {
        const body = await response.json();
        throw new Error(body.detail || "Trade failed.");
      }

      await Promise.all([fetchPortfolio(), fetchTrades(), refresh()]);
    } catch (err) {
      setError(err.message || "Unable to submit trade.");
    } finally {
      setBusy(false);
    }
  }

  function toggleFavoriteTimeframe(tf) {
    setFavoriteTimeframes((prev) => {
      if (prev.includes(tf)) {
        return prev.filter((item) => item !== tf);
      }
      return [...prev, tf];
    });
  }

  function handleAddDrawing(drawing) {
    setDrawings((prev) => [...prev, drawing]);
  }

  const chartViewportHeight = viewportWidth < 640 ? 340 : viewportWidth < 1024 ? 440 : 540;
  const chartSplitGap = 12;
  const chartHeight = showSplitChart ? Math.floor((chartViewportHeight - chartSplitGap) / 2) : chartViewportHeight;

  return (
    <main className="mx-auto w-full max-w-[1540px] px-3 py-4 sm:px-5">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <LogoMark />
          <button
            type="button"
            className={`icon-btn ${utilityPanel === "profile" ? "icon-btn-active" : ""}`}
            onClick={() => setUtilityPanel((prev) => (prev === "profile" ? null : "profile"))}
            title="Profile"
            aria-label="Profile"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="8" r="4" />
              <path d="M4 20c2-4 5-6 8-6s6 2 8 6" />
            </svg>
          </button>
          <button
            type="button"
            className={`icon-btn ${utilityPanel === "settings" ? "icon-btn-active" : ""}`}
            onClick={() => setUtilityPanel((prev) => (prev === "settings" ? null : "settings"))}
            title="Settings"
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.82 2.82l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 .6 1.7 1.7 0 0 0-.4 1.08V21a2 2 0 1 1-4 0v-.08a1.7 1.7 0 0 0-.4-1.08 1.7 1.7 0 0 0-1-.6 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.82-2.82l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-.6-1 1.7 1.7 0 0 0-1.08-.4H2.9a2 2 0 1 1 0-4h.08a1.7 1.7 0 0 0 1.08-.4 1.7 1.7 0 0 0 .6-1 1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.82-2.82l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-.6 1.7 1.7 0 0 0 .4-1.08V2.9a2 2 0 1 1 4 0v.08a1.7 1.7 0 0 0 .4 1.08 1.7 1.7 0 0 0 1 .6 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.82 2.82l-.06.06A1.7 1.7 0 0 0 19.4 9c.27.28.47.62.6 1 .08.32.3.6.6.8.28.2.62.3.96.3h.08a2 2 0 1 1 0 4h-.08a1.7 1.7 0 0 0-.96.3c-.3.2-.52.48-.6.8-.13.38-.33.72-.6 1z" />
            </svg>
          </button>
        </div>

        <div className="rounded-xl border border-accent/30 bg-panel px-3 py-2 text-sm text-textMain shadow-glow">
          {timeNow.toLocaleTimeString()}
        </div>
      </header>

      <div className="mb-4 flex items-center gap-2 rounded-xl border border-accent/30 bg-panel px-2 py-2 shadow-glow">
        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`tab-btn ${activeTab === "dashboard" ? "tab-btn-active" : ""}`}
        >
          Dashboard
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("journal")}
          className={`tab-btn ${activeTab === "journal" ? "tab-btn-active" : ""}`}
        >
          Journal
        </button>
      </div>

      {utilityPanel && (
        <section className="mb-4 rounded-2xl border border-accent/30 bg-panel p-5 shadow-glow">
          <h2 className="text-lg font-semibold text-textMain">
            {utilityPanel === "profile" ? "Profile" : "Settings"}
          </h2>
          <div className="mt-4 min-h-[160px] rounded-xl border border-accent/15 bg-panelSoft" />
        </section>
      )}

      {activeTab === "dashboard" ? (
        <>
          <section className="grid items-stretch gap-4 lg:grid-cols-[1fr_350px]">
            <div className="rounded-2xl border border-accent/30 bg-panel p-4 shadow-glow">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div className="flex flex-wrap items-center gap-2">
                  <label className="text-xs uppercase tracking-wide text-textDim">Symbol</label>
                  <select
                    value={selectedSymbol}
                    onChange={(e) => setSelectedSymbol(e.target.value)}
                    className="select-neon"
                  >
                    {symbols.map((symbol) => (
                      <option key={symbol} value={symbol}>
                        {symbol}
                      </option>
                    ))}
                  </select>

                  <button type="button" className="btn-ghost" onClick={() => setShowSplitChart((v) => !v)}>
                    {showSplitChart ? "Remove extra chart" : "Add another chart"}
                  </button>

                  {showSplitChart && (
                    <>
                      <label className="text-xs uppercase tracking-wide text-textDim">Second Symbol</label>
                      <select
                        value={secondarySymbol}
                        onChange={(e) => setSecondarySymbol(e.target.value)}
                        className="select-neon"
                      >
                        {symbols.map((symbol) => (
                          <option key={symbol} value={symbol}>
                            {symbol}
                          </option>
                        ))}
                      </select>
                    </>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {favoriteFramesResolved.map((tf) => (
                    <button
                      key={tf}
                      type="button"
                      onClick={() => setTimeframe(tf)}
                      className={`mini-btn ${tf === timeframe ? "mini-btn-active" : ""}`}
                    >
                      {timeframeLabelMap[tf]}
                    </button>
                  ))}

                  <TimeframePicker
                    options={TIMEFRAME_OPTIONS}
                    value={timeframe}
                    favorites={favoriteTimeframes}
                    onChange={setTimeframe}
                    onToggleFavorite={toggleFavoriteTimeframe}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <StockChart
                  data={chartData}
                  showSma={showSma}
                  markers={tradeMarkers}
                  activeTool={activeTool}
                  onToolSelect={setActiveTool}
                  onToggleSma={() => setShowSma((v) => !v)}
                  drawings={drawings}
                  onAddDrawing={handleAddDrawing}
                  height={chartHeight}
                />

                {showSplitChart && (
                  <StockChart
                    data={secondChartData}
                    showSma={showSma}
                    markers={[]}
                    activeTool={activeTool}
                    onToolSelect={setActiveTool}
                    onToggleSma={() => setShowSma((v) => !v)}
                    drawings={[]}
                    height={chartHeight}
                  />
                )}
              </div>
            </div>

            <aside className="flex h-full min-h-0 flex-col gap-4">
              <div className="rounded-2xl border border-accent/30 bg-panel p-4 shadow-glow">
                <form onSubmit={handleAddSymbol} className="flex gap-2">
                  <input
                    value={newSymbol}
                    onChange={(e) => setNewSymbol(e.target.value.toUpperCase())}
                    placeholder="Add symbol"
                    className="input-neon"
                  />
                  <button type="submit" className="btn-neon text-xs">
                    Add
                  </button>
                </form>
              </div>

              <div className="min-h-0 flex-1">
                {loading ? (
                  <div className="rounded-2xl border border-accent/20 bg-panel p-4">Loading watchlist...</div>
                ) : (
                  <WatchlistPanel
                    stocks={stocks}
                    onRemove={handleRemoveSymbol}
                    selectedSymbol={selectedSymbol}
                    onSelectSymbol={setSelectedSymbol}
                  />
                )}
              </div>

              <PaperTradeForm symbols={symbols} onSubmit={handleTrade} />
            </aside>
          </section>

          <section className="mt-4 grid gap-4 lg:grid-cols-2">
            <PortfolioSummary portfolio={portfolio} />
            <TradeHistory trades={trades.slice(0, 20)} />
          </section>
        </>
      ) : (
        <JournalTab trades={trades} />
      )}

      {error && <div className="mt-3 rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-red-200">{error}</div>}
      {busy && <p className="mt-3 text-sm text-textDim">Placing simulated order...</p>}
    </main>
  );
}
