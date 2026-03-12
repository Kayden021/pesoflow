import { useEffect, useMemo, useRef, useState } from "react";

const TOOL_ITEMS = [
  { id: "cursor", icon: "+", label: "Cursor" },
  { id: "trend", icon: "/", label: "Trendline" },
  { id: "fib", icon: "F", label: "Fibonacci" },
  { id: "position", icon: "L/S", label: "Long/Short" },
];

function buildSma(candles, windowSize = 5) {
  const output = [];
  for (let i = 0; i < candles.length; i += 1) {
    if (i < windowSize - 1) {
      continue;
    }
    let sum = 0;
    for (let j = i - windowSize + 1; j <= i; j += 1) {
      sum += candles[j].close;
    }
    output.push({
      time: candles[i].time,
      value: sum / windowSize,
    });
  }
  return output;
}

export default function StockChart({
  data,
  showSma = false,
  markers = [],
  activeTool = "cursor",
  onToolSelect,
  onToggleSma,
  drawings = [],
  onAddDrawing,
  height = 420,
}) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);
  const [draftPoint, setDraftPoint] = useState(null);

  useEffect(() => {
    setDraftPoint(null);
  }, [activeTool, data]);

  const projectedDrawings = useMemo(() => {
    if (!chartRef.current || !seriesRef.current || !drawings.length) {
      return [];
    }

    return drawings
      .map((drawing) => {
        const x1 = chartRef.current.timeScale().timeToCoordinate(drawing.start.time);
        const y1 = seriesRef.current.priceToCoordinate(drawing.start.price);
        const x2 = chartRef.current.timeScale().timeToCoordinate(drawing.end.time);
        const y2 = seriesRef.current.priceToCoordinate(drawing.end.price);

        if ([x1, y1, x2, y2].some((v) => v === null || Number.isNaN(v))) {
          return null;
        }

        return {
          ...drawing,
          x1,
          y1,
          x2,
          y2,
        };
      })
      .filter(Boolean);
  }, [drawings, data]);

  const safeMarkers = useMemo(() => {
    return [...markers]
      .filter((marker) => typeof marker.time === "number" && Number.isFinite(marker.time))
      .sort((a, b) => a.time - b.time);
  }, [markers]);

  useEffect(() => {
    let chart;
    let resizeObserver;
    let disposed = false;

    async function buildChart() {
      const { createChart } = await import("lightweight-charts");
      if (!containerRef.current || disposed) {
        return;
      }

      // Strict mode and fast refresh can leave stale canvases in-place.
      containerRef.current.innerHTML = "";

      chart = createChart(containerRef.current, {
        layout: {
          background: { color: "#0f1f18" },
          textColor: "#98b8ab",
        },
        width: containerRef.current.clientWidth,
        height,
        rightPriceScale: {
          borderColor: "#1a3a2c",
        },
        timeScale: {
          borderColor: "#1a3a2c",
        },
        grid: {
          vertLines: { color: "rgba(28, 60, 43, 0.55)" },
          horzLines: { color: "rgba(28, 60, 43, 0.55)" },
        },
      });
      chartRef.current = chart;

      const candleSeries = chart.addCandlestickSeries({
        upColor: "#2dff9e",
        downColor: "#ff5a5f",
        borderUpColor: "#2dff9e",
        borderDownColor: "#ff5a5f",
        wickUpColor: "#2dff9e",
        wickDownColor: "#ff5a5f",
      });
      seriesRef.current = candleSeries;

      candleSeries.setData(data);
      candleSeries.setMarkers(safeMarkers);

      if (showSma) {
        const smaSeries = chart.addLineSeries({
          color: "#a8ffcf",
          lineWidth: 2,
          crosshairMarkerVisible: false,
          priceLineVisible: false,
          lastValueVisible: false,
        });
        smaSeries.setData(buildSma(data, 5));
      }

      chart.timeScale().fitContent();

      resizeObserver = new ResizeObserver(() => {
        if (containerRef.current && chart) {
          chart.applyOptions({ width: containerRef.current.clientWidth, height });
        }
      });

      resizeObserver.observe(containerRef.current);

      return () => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      };
    }

    let cleanup;
    buildChart().then((fn) => {
      if (disposed) {
        if (chart) {
          chart.remove();
        }
        return;
      }
      cleanup = fn;
    });

    return () => {
      disposed = true;
      if (cleanup) {
        cleanup();
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
      }
      if (chart) {
        chart.remove();
      }
      chartRef.current = null;
      seriesRef.current = null;
    };
  }, [data, showSma, safeMarkers, height]);

  function handleOverlayClick(event) {
    if (!chartRef.current || !seriesRef.current || activeTool === "cursor") {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const time = chartRef.current.timeScale().coordinateToTime(x);
    const price = seriesRef.current.coordinateToPrice(y);

    if (time === null || price === null || typeof time !== "number") {
      return;
    }

    const point = { time, price };

    if (!draftPoint) {
      setDraftPoint(point);
      return;
    }

    if (onAddDrawing) {
      onAddDrawing({
        id: `${Date.now()}-${Math.random()}`,
        type: activeTool,
        start: draftPoint,
        end: point,
      });
    }
    setDraftPoint(null);
  }

  return (
    <div className="relative">
      <div className="chart-tool-rail">
        {TOOL_ITEMS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            title={tool.label}
            onClick={() => onToolSelect && onToolSelect(tool.id)}
            className={`chart-tool-btn ${activeTool === tool.id ? "chart-tool-btn-active" : ""}`}
          >
            {tool.icon}
          </button>
        ))}
        <button
          type="button"
          title="SMA Indicator"
          onClick={() => onToggleSma && onToggleSma()}
          className={`chart-tool-btn ${showSma ? "chart-tool-btn-active" : ""}`}
        >
          I
        </button>
      </div>

      <div ref={containerRef} className="w-full rounded-xl" />

      <div
        className={`absolute inset-0 z-10 ${activeTool === "cursor" ? "pointer-events-none" : "cursor-crosshair"}`}
        onClick={handleOverlayClick}
      >
        <svg className="h-full w-full">
          {projectedDrawings.map((drawing) => {
            if (drawing.type === "trend") {
              return (
                <line
                  key={drawing.id}
                  x1={drawing.x1}
                  y1={drawing.y1}
                  x2={drawing.x2}
                  y2={drawing.y2}
                  stroke="#5effbb"
                  strokeWidth="2"
                />
              );
            }

            if (drawing.type === "fib") {
              const top = Math.min(drawing.y1, drawing.y2);
              const bottom = Math.max(drawing.y1, drawing.y2);
              const left = Math.min(drawing.x1, drawing.x2);
              const width = Math.abs(drawing.x2 - drawing.x1);
              const levels = [0, 0.382, 0.5, 0.618, 1];
              return (
                <g key={drawing.id}>
                  <rect
                    x={left}
                    y={top}
                    width={Math.max(width, 1)}
                    height={Math.max(bottom - top, 1)}
                    fill="rgba(45,255,158,0.06)"
                    stroke="rgba(45,255,158,0.45)"
                  />
                  {levels.map((level) => {
                    const y = top + (bottom - top) * level;
                    return (
                      <line
                        key={`${drawing.id}-${level}`}
                        x1={left}
                        y1={y}
                        x2={left + Math.max(width, 1)}
                        y2={y}
                        stroke="rgba(45,255,158,0.7)"
                        strokeDasharray="4 4"
                      />
                    );
                  })}
                </g>
              );
            }

            if (drawing.type === "position") {
              const left = Math.min(drawing.x1, drawing.x2);
              const width = Math.abs(drawing.x2 - drawing.x1);
              const top = Math.min(drawing.y1, drawing.y2);
              const heightRect = Math.abs(drawing.y2 - drawing.y1);
              const long = drawing.y2 < drawing.y1;
              return (
                <rect
                  key={drawing.id}
                  x={left}
                  y={top}
                  width={Math.max(width, 1)}
                  height={Math.max(heightRect, 1)}
                  fill={long ? "rgba(45,255,158,0.18)" : "rgba(255,90,95,0.18)"}
                  stroke={long ? "rgba(45,255,158,0.9)" : "rgba(255,90,95,0.9)"}
                />
              );
            }

            return null;
          })}

          {draftPoint && chartRef.current && seriesRef.current && (() => {
            const x = chartRef.current.timeScale().timeToCoordinate(draftPoint.time);
            const y = seriesRef.current.priceToCoordinate(draftPoint.price);
            if (x === null || y === null) {
              return null;
            }
            return <circle cx={x} cy={y} r="5" fill="#2dff9e" />;
          })()}
        </svg>
      </div>
    </div>
  );
}
