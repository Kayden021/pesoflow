export default function WatchlistPanel({ stocks, onRemove, selectedSymbol, onSelectSymbol }) {
  return (
    <div className="flex h-full min-h-0 flex-col rounded-2xl border border-accent/30 bg-panel p-4 shadow-glow">
      <h2 className="mb-4 text-lg font-semibold">Watchlist</h2>
      <div className="flex-1 space-y-2 overflow-auto pr-1">
        {stocks.length === 0 ? (
          <p className="text-sm text-textDim">No symbols yet.</p>
        ) : (
          stocks.map((stock) => {
            const positive = stock.change_percent >= 0;
            const active = selectedSymbol === stock.symbol;
            return (
              <button
                key={stock.symbol}
                type="button"
                onClick={() => onSelectSymbol(stock.symbol)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition ${
                  active
                    ? "border-accent/60 bg-accent/10 shadow-[0_0_0_1px_rgba(45,255,158,0.3)]"
                    : "border-accent/15 bg-panelSoft"
                }`}
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium">{stock.symbol}</p>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onRemove(stock.symbol);
                    }}
                    className="text-xs text-textDim hover:text-danger focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                  >
                    Remove
                  </button>
                </div>
                <div className="mt-1 flex items-center justify-between text-sm">
                  <span>PHP {Number(stock.price).toFixed(2)}</span>
                  <span className={positive ? "text-accent" : "text-danger"}>
                    {positive ? "+" : ""}
                    {Number(stock.change_percent).toFixed(2)}%
                  </span>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
