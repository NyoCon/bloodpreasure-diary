// chart.jsx — minimal multi-series line chart for SYS / DIA / PUL over time

function TrendChart({ entries, accent, t, lang, showCategories }) {
  // Sort ascending for time-axis plotting
  const sorted = React.useMemo(
    () => [...entries].sort((a, b) => a.ts - b.ts),
    [entries]
  );

  const W = 1000;
  const H = 300;
  const PAD = { l: 40, r: 16, t: 24, b: 36 };
  const innerW = W - PAD.l - PAD.r;
  const innerH = H - PAD.t - PAD.b;

  if (sorted.length === 0) {
    return (
      <div className="chart-empty">
        <span>{t.noEntries}</span>
      </div>
    );
  }

  const minTs = sorted[0].ts;
  const maxTs = sorted[sorted.length - 1].ts;
  const tsRange = Math.max(1, maxTs - minTs);

  // Y axis: cover 50–180 by default, but expand if data exceeds
  const allVals = sorted.flatMap(e => [e.sys, e.dia, e.pul].filter(v => v != null));
  const yMax = Math.max(180, Math.ceil((Math.max(...allVals) + 5) / 10) * 10);
  const yMin = Math.min(50, Math.floor((Math.min(...allVals) - 5) / 10) * 10);

  const x = (ts) => PAD.l + ((ts - minTs) / tsRange) * innerW;
  const y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * innerH;

  const seriesPath = (key) => {
    let started = false;
    return sorted.map((e) => {
      if (e[key] == null) { started = false; return ""; }
      const cmd = started ? "L" : "M";
      started = true;
      return cmd + x(e.ts).toFixed(1) + " " + y(e[key]).toFixed(1);
    }).filter(Boolean).join(" ");
  };

  // Y ticks every 20
  const ticks = [];
  for (let v = Math.ceil(yMin / 20) * 20; v <= yMax; v += 20) ticks.push(v);

  // X date labels — pick ~5 evenly spaced points
  const xLabels = [];
  const labelCount = Math.min(6, sorted.length);
  if (labelCount > 1) {
    for (let i = 0; i < labelCount; i++) {
      const idx = Math.round((i / (labelCount - 1)) * (sorted.length - 1));
      xLabels.push(sorted[idx]);
    }
  } else {
    xLabels.push(sorted[0]);
  }

  // Hover state
  const [hoverIdx, setHoverIdx] = React.useState(null);
  const svgRef = React.useRef(null);

  const onMove = (e) => {
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * W;
    // Find nearest entry by x
    let best = 0, bestD = Infinity;
    sorted.forEach((entry, i) => {
      const d = Math.abs(x(entry.ts) - px);
      if (d < bestD) { bestD = d; best = i; }
    });
    setHoverIdx(best);
  };

  const hovered = hoverIdx != null ? sorted[hoverIdx] : null;

  // Reference bands for hypertension thresholds (subtle)
  const bandTop = y(140);
  const bandMid = y(130);
  const bandLow = y(120);

  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span className="legend-item"><i style={{ background: "var(--accent)" }} />{t.sys} <span className="muted">{t.mmHg}</span></span>
        <span className="legend-item"><i style={{ background: "var(--accent)", opacity: 0.4 }} />{t.dia} <span className="muted">{t.mmHg}</span></span>
        <span className="legend-item"><i style={{ background: "transparent", border: "1px dashed var(--fg-50)" }} />{t.pul} <span className="muted">{t.bpm}</span></span>
      </div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="chart-svg"
        onMouseMove={onMove}
        onMouseLeave={() => setHoverIdx(null)}
        preserveAspectRatio="none"
      >
        {/* Reference bands for SYS thresholds */}
        {showCategories && (
          <g>
            <rect x={PAD.l} y={PAD.t} width={innerW} height={Math.max(0, bandTop - PAD.t)}
                  fill="oklch(0.92 0.07 35)" opacity="0.35" />
            <rect x={PAD.l} y={bandTop} width={innerW} height={Math.max(0, bandMid - bandTop)}
                  fill="oklch(0.94 0.06 60)" opacity="0.45" />
            <rect x={PAD.l} y={bandMid} width={innerW} height={Math.max(0, bandLow - bandMid)}
                  fill="oklch(0.94 0.05 90)" opacity="0.45" />
          </g>
        )}

        {/* Y grid + labels */}
        {ticks.map(v => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)}
                  stroke="var(--border)" strokeWidth="1" />
            <text x={PAD.l - 8} y={y(v) + 3} textAnchor="end"
                  fontSize="10" fill="var(--fg-50)"
                  style={{ fontFamily: "var(--mono)" }}>{v}</text>
          </g>
        ))}

        {/* X labels */}
        {xLabels.map((e, i) => (
          <text key={i} x={x(e.ts)} y={H - 12} textAnchor="middle"
                fontSize="10" fill="var(--fg-50)">
            {new Date(e.ts).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB",
              { day: "2-digit", month: "short" })}
          </text>
        ))}

        {/* Lines */}
        <path d={seriesPath("dia")} fill="none" stroke="var(--accent)" strokeOpacity="0.4" strokeWidth="1.5" />
        <path d={seriesPath("sys")} fill="none" stroke="var(--accent)" strokeWidth="1.75" />
        <path d={seriesPath("pul")} fill="none" stroke="var(--fg-50)" strokeWidth="1.25" strokeDasharray="3 3" />

        {/* Points */}
        {sorted.map((e, i) => (
          <g key={e.id}>
            <circle cx={x(e.ts)} cy={y(e.sys)} r={hoverIdx === i ? 4 : 2.5}
                    fill="var(--bg)" stroke="var(--accent)" strokeWidth="1.5" />
            <circle cx={x(e.ts)} cy={y(e.dia)} r={hoverIdx === i ? 4 : 2.5}
                    fill="var(--bg)" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.5" />
          </g>
        ))}

        {/* Hover crosshair + tooltip */}
        {hovered && (
          <g>
            <line x1={x(hovered.ts)} x2={x(hovered.ts)} y1={PAD.t} y2={H - PAD.b}
                  stroke="var(--fg)" strokeOpacity="0.15" strokeWidth="1" />
          </g>
        )}
      </svg>
      {hovered && (
        <div className="chart-tip" style={{
          left: `${(x(hovered.ts) / W) * 100}%`,
        }}>
          <div className="chart-tip-date">
            {new Date(hovered.ts).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB",
              { day: "2-digit", month: "short", year: "numeric" })}
            {" · "}
            {new Date(hovered.ts).toLocaleTimeString(lang === "de" ? "de-DE" : "en-GB",
              { hour: "2-digit", minute: "2-digit" })}
          </div>
          <div className="chart-tip-rows">
            <span><b>{hovered.sys}</b>/<b>{hovered.dia}</b> {t.mmHg}</span>
            {hovered.pul != null && <span className="muted">{hovered.pul} {t.bpm}</span>}
          </div>
        </div>
      )}
    </div>
  );
}

window.TrendChart = TrendChart;
