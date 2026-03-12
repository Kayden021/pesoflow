import { useCallback, useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function useWatchlist() {
  const [stocks, setStocks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchStocks = useCallback(async () => {
    setLoading(true);
    const response = await fetch(`${API_BASE}/stocks`);
    if (!response.ok) {
      setLoading(false);
      throw new Error("Unable to load watchlist.");
    }
    const data = await response.json();
    setStocks(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStocks().catch(() => {
      setLoading(false);
    });
  }, [fetchStocks]);

  const addSymbol = async (symbol) => {
    const response = await fetch(`${API_BASE}/watchlist`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: symbol.toUpperCase() }),
    });
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.detail || "Unable to add symbol.");
    }
    await fetchStocks();
  };

  const removeSymbol = async (symbol) => {
    const response = await fetch(`${API_BASE}/watchlist/${symbol}`, {
      method: "DELETE",
    });
    if (!response.ok) {
      const body = await response.json();
      throw new Error(body.detail || "Unable to remove symbol.");
    }
    await fetchStocks();
  };

  return { stocks, loading, addSymbol, removeSymbol, refresh: fetchStocks };
}
