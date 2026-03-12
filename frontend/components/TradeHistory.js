export default function TradeHistory({ trades }) {
  return (
    <div className="rounded-2xl border border-accent/30 bg-panel p-4 shadow-glow">
      <h2 className="mb-4 text-lg font-semibold">Recent Trades</h2>
      {trades.length === 0 ? (
        <p className="text-sm text-textDim">No trades yet.</p>
      ) : (
        <div className="space-y-2">
          {trades.map((trade) => {
            const buy = trade.side === "buy";
            return (
              <div key={trade.id} className="rounded-lg border border-accent/15 bg-panelSoft px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`font-semibold uppercase ${buy ? "text-accent" : "text-danger"}`}>
                      {trade.side}
                    </span>
                    <span>{trade.symbol}</span>
                  </div>
                  <span className="text-textDim">{new Date(trade.executed_at).toLocaleString()}</span>
                </div>
                <div className="mt-1 flex items-center justify-between text-textDim">
                  <span>{trade.quantity} shares</span>
                  <span>PHP {Number(trade.price).toFixed(2)}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
