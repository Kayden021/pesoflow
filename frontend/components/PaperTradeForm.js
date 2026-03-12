import { useEffect, useState } from "react";

export default function PaperTradeForm({ onSubmit, symbols }) {
  const [form, setForm] = useState({
    side: "buy",
    symbol: symbols[0] || "BDO",
    quantity: 10,
    price: 100,
  });

  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  useEffect(() => {
    if (!symbols.includes(form.symbol)) {
      setForm((prev) => ({ ...prev, symbol: symbols[0] || "BDO" }));
    }
  }, [symbols, form.symbol]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    await onSubmit({
      side: form.side,
      symbol: form.symbol,
      quantity: Number(form.quantity),
      price: Number(form.price),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-accent/30 bg-panel p-4 shadow-glow">
      <h2 className="mb-4 text-lg font-semibold">Paper Trade</h2>
      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="col-span-1">
          <span className="mb-1 block text-textDim">Side</span>
          <select
            value={form.side}
            onChange={(e) => update("side", e.target.value)}
            className="select-neon w-full"
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </select>
        </label>

        <label className="col-span-1">
          <span className="mb-1 block text-textDim">Symbol</span>
          <select
            value={form.symbol}
            onChange={(e) => update("symbol", e.target.value)}
            className="select-neon w-full"
          >
            {symbols.map((symbol) => (
              <option key={symbol} value={symbol}>
                {symbol}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span className="mb-1 block text-textDim">Quantity</span>
          <input
            type="number"
            min="1"
            value={form.quantity}
            onChange={(e) => update("quantity", e.target.value)}
            className="input-neon w-full"
            required
          />
        </label>

        <label>
          <span className="mb-1 block text-textDim">Price</span>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => update("price", e.target.value)}
            className="input-neon w-full"
            required
          />
        </label>
      </div>

      <button
        type="submit"
        className="btn-neon mt-4 w-full font-semibold"
      >
        Submit Order
      </button>
    </form>
  );
}
