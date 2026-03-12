export default function LogoMark() {
  return (
    <div className="inline-flex items-center gap-3 rounded-xl border border-accent/40 bg-panel px-4 py-3 shadow-glow">
      <div className="grid h-11 w-11 place-items-center rounded-lg bg-[radial-gradient(circle_at_35%_35%,#d6ffe9_0%,#2dff9e_30%,#0f3b29_100%)] text-slate-900">
        <span className="text-base font-black">PF</span>
      </div>
      <div>
        <h1 className="text-2xl font-black tracking-wide text-white">PesoFlow</h1>
      </div>
    </div>
  );
}
