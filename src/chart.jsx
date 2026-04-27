const {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ReferenceArea, ResponsiveContainer,
} = Recharts;

function TrendChart({ entries, t, lang, showCategories, showPul }) {
  const sorted = React.useMemo(
    () => [...entries].sort((a, b) => a.ts - b.ts),
    [entries]
  );

  // Aggregate entries into daily averages
  const data = React.useMemo(() => {
    const byDay = {};
    for (const e of sorted) {
      const day = toISODate(e.ts);
      if (!byDay[day]) byDay[day] = [];
      byDay[day].push(e);
    }
    return Object.entries(byDay).map(([day, dayEntries]) => {
      const avg = (key) => {
        const vals = dayEntries.map(e => e[key]).filter(v => v != null);
        return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
      };
      const [y, m, d] = day.split("-").map(Number);
      return {
        ts: new Date(y, m - 1, d, 12, 0, 0).getTime(),
        sys: avg("sys"), dia: avg("dia"), pul: avg("pul"),
        count: dayEntries.length,
      };
    }).sort((a, b) => a.ts - b.ts);
  }, [sorted]);

  if (data.length === 0) {
    return <div className="chart-empty"><span>{t.noEntries}</span></div>;
  }

  const allVals = data.flatMap(e => (showPul ? [e.sys, e.dia, e.pul] : [e.sys, e.dia]).filter(v => v != null));
  const yMax = Math.ceil((Math.max(...allVals) + 10) / 10) * 10;
  const yMin = Math.floor((Math.min(...allVals) - 10) / 10) * 10;

  const fmtDate = (ts) => new Date(ts).toLocaleDateString(
    lang === "de" ? "de-DE" : "en-GB", { day: "2-digit", month: "short" }
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const get = (key) => payload.find(p => p.dataKey === key)?.value;
    const sys = get("sys"), dia = get("dia"), pul = get("pul");
    const count = payload[0]?.payload?.count;
    const avgLabel = lang === "de" ? "Ø" : "avg";
    return (
      <div className="chart-tip" style={{ position: "static" }}>
        <div className="chart-tip-date">
          {new Date(label).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB",
            { day: "2-digit", month: "short", year: "numeric" })}
          {count > 1 && <span className="muted"> · {avgLabel} {count}</span>}
        </div>
        <div className="chart-tip-rows">
          {sys != null && dia != null && <span><b>{sys}</b>/<b>{dia}</b> {t.mmHg}</span>}
          {showPul && pul != null && <span className="muted">{pul} {t.bpm}</span>}
        </div>
      </div>
    );
  };

  const tickStyle = { fontSize: 12, fill: "var(--fg-50)", fontFamily: "var(--mono)" };

  return (
    <div className="chart-wrap">
      <div className="chart-legend">
        <span className="legend-item"><i style={{ background: "var(--accent)" }} />{t.sys} <span className="muted">{t.mmHg}</span></span>
        <span className="legend-item"><i style={{ background: "var(--accent)", opacity: 0.4 }} />{t.dia} <span className="muted">{t.mmHg}</span></span>
        {showPul && <span className="legend-item"><i style={{ background: "transparent", border: "1px dashed var(--fg-50)" }} />{t.pul} <span className="muted">{t.bpm}</span></span>}
      </div>
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={data} margin={{ top: 8, right: 16, bottom: 4, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />

          {showCategories && (
            <g>
              <ReferenceArea y1={Math.max(yMin, 140)} y2={yMax}                        fill="oklch(0.92 0.07 35)" fillOpacity={0.35} />
              <ReferenceArea y1={Math.max(yMin, 130)} y2={Math.min(yMax, 140)} fill="oklch(0.94 0.06 60)" fillOpacity={0.45} />
              <ReferenceArea y1={Math.max(yMin, 120)} y2={Math.min(yMax, 130)} fill="oklch(0.94 0.05 90)" fillOpacity={0.45} />
            </g>
          )}

          <XAxis
            dataKey="ts"
            type="number"
            scale="time"
            domain={["dataMin", "dataMax"]}
            tickFormatter={fmtDate}
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            minTickGap={48}
          />
          <YAxis
            domain={[yMin, yMax]}
            tick={tickStyle}
            tickLine={false}
            axisLine={false}
            width={38}
          />
          <Tooltip content={<CustomTooltip />} />

          <Line dataKey="sys" stroke="var(--accent)" strokeWidth={1.75}
                dot={{ r: 3, fill: "var(--bg)", stroke: "var(--accent)", strokeWidth: 1.5 }}
                activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
          <Line dataKey="dia" stroke="var(--accent)" strokeWidth={1.5} strokeOpacity={0.45}
                dot={{ r: 3, fill: "var(--bg)", stroke: "var(--accent)", strokeOpacity: 0.55, strokeWidth: 1.5 }}
                activeDot={{ r: 4 }} connectNulls isAnimationActive={false} />
          {showPul && (
            <Line dataKey="pul" stroke="var(--fg-50)" strokeWidth={1.25} strokeDasharray="4 3"
                  dot={false} connectNulls isAnimationActive={false} />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

window.TrendChart = TrendChart;
