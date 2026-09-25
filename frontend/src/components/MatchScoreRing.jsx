export function MatchScoreRing({ score = 0, size = 140, stroke = 12, label = "Match" }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score));
  const offset = c - (pct / 100) * c;

  const color = pct >= 80 ? "hsl(142 71% 40%)" : pct >= 60 ? "hsl(151 45% 22%)" : pct >= 45 ? "hsl(38 92% 50%)" : "hsl(11 89% 56%)";

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }} data-testid="match-score-ring">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(214 32% 91%)" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-display text-3xl font-bold" style={{ color }}>{pct}%</span>
        <span className="text-xs text-muted-foreground mt-0.5">{label}</span>
      </div>
    </div>
  );
}
