import { useEffect, useRef, useState } from "react";

export default function TimeframePicker({ options, value, favorites, onChange, onToggleFavorite }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    function handleOutside(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  const selected = options.find((item) => item.value === value) || options[0];

  return (
    <div ref={rootRef} className="relative">
      <button type="button" className="select-neon min-w-[92px] text-left" onClick={() => setOpen((v) => !v)}>
        {selected?.label || "TF"} <span className="ml-2 text-textDim">▾</span>
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 max-h-72 w-44 overflow-auto rounded-xl border border-accent/35 bg-panel p-1 shadow-glow">
          {options.map((item) => {
            const fav = favorites.includes(item.value);
            const active = value === item.value;
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={`timeframe-item ${active ? "timeframe-item-active" : ""}`}
              >
                <span>{item.label}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(event) => {
                    event.stopPropagation();
                    onToggleFavorite(item.value);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      onToggleFavorite(item.value);
                    }
                  }}
                  title={fav ? "Remove favorite" : "Add favorite"}
                  className={`ml-3 rounded px-1.5 text-sm ${fav ? "text-accent" : "text-textDim"}`}
                >
                  {fav ? "★" : "☆"}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
