export default function PortfolioSummary({ portfolio }) {
  return (
    <div className="rounded-2xl border border-accent/30 bg-panel p-4 shadow-glow">
      <h2 className="mb-4 text-lg font-semibold">Portfolio Summary</h2>
      <div className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <SummaryCard label="Cash" value={`PHP ${Number(portfolio.cash_balance || 0).toFixed(2)}`} />
        <SummaryCard
          label="Market Value"
          value={`PHP ${Number(portfolio.market_value || 0).toFixed(2)}`}
        />
        <SummaryCard
          label="Equity"
          value={`PHP ${Number(portfolio.total_equity || 0).toFixed(2)}`}
        />
        <SummaryCard
          label="PnL"
          value={`${Number(portfolio.total_pnl || 0) >= 0 ? "+" : ""}${Number(
            portfolio.total_pnl || 0
          ).toFixed(2)}`}
          accent={Number(portfolio.total_pnl || 0) >= 0 ? "text-accent" : "text-danger"}
        />
      </div>

      <div className="mt-4 space-y-2">
        {(portfolio.positions || []).length === 0 ? (
          <p className="text-sm text-textDim">No open positions yet.</p>
        ) : (
          portfolio.positions.map((position) => (
            <div key={position.symbol} className="rounded-lg border border-accent/15 bg-panelSoft px-3 py-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">{position.symbol}</span>
                <span>{position.quantity} shares</span>
              </div>
              <div className="mt-1 flex justify-between text-textDim">
                <span>Avg {Number(position.avg_price).toFixed(2)}</span>
                <span>Last {Number(position.current_price).toFixed(2)}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, accent = "" }) {
  return (
    <div className="rounded-lg border border-accent/15 bg-panelSoft px-3 py-3">
      <p className="text-xs uppercase tracking-wide text-textDim">{label}</p>
      <p className={`mt-1 text-base font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
