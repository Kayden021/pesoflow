const TOOLS = [
  { id: "cursor", label: "Cursor" },
  { id: "trend", label: "Trendline" },
  { id: "fib", label: "Fibonacci" },
  { id: "position", label: "Long/Short" },
];

export default function ChartToolsDock({ activeTool, onToolSelect, showSma, onToggleSma }) {
  return (
    <aside className="rounded-2xl border border-accent/30 bg-panel p-3 shadow-glow">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold">Chart Tools</h3>
        <span className="rounded-full border border-accent/40 px-2 py-0.5 text-[10px] uppercase tracking-wider text-accent">
          Sample
        </span>
      </div>

      <div className="space-y-2">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            type="button"
            onClick={() => onToolSelect(tool.id)}
            className={`tool-button ${activeTool === tool.id ? "tool-button-active" : ""}`}
          >
            {tool.label}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-accent/20 pt-3">
        <button
          type="button"
          onClick={onToggleSma}
          className={`tool-button w-full ${showSma ? "tool-button-active" : ""}`}
        >
          SMA Indicator
        </button>
      </div>
    </aside>
  );
}
