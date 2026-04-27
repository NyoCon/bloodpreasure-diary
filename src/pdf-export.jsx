// pdf-export.jsx — PDF export modal: pick a date range, open a printable
// report in a new window and trigger print-to-PDF.

function ExportModal({ open, onClose, entries, t, lang }) {
  // Determine min/max from entries (sorted ascending by ts).
  const sorted = React.useMemo(
    () => [...entries].sort((a, b) => a.ts - b.ts),
    [entries]
  );
  const minTs = sorted.length ? sorted[0].ts : Date.now();
  const maxTs = sorted.length ? sorted[sorted.length - 1].ts : Date.now();
  const minDate = toISODate(minTs);
  const maxDate = toISODate(maxTs);

  const [from, setFrom] = React.useState(minDate);
  const [to, setTo] = React.useState(maxDate);
  const [includeChart, setIncludeChart] = React.useState(true);
  const [includeCategory, setIncludeCategory] = React.useState(true);

  React.useEffect(() => {
    if (open) { setFrom(minDate); setTo(maxDate); }
  }, [open, minDate, maxDate]);

  const inRange = entries
    .filter(e => {
      const fromTs = fromInputs(from, "00:00");
      const toTs = fromInputs(to, "23:59");
      return e.ts >= fromTs && e.ts <= toTs;
    })
    .sort((a, b) => a.ts - b.ts);

  const buildChartSVG = (rows) => {
    if (rows.length === 0) return "";
    const W = 1000, H = 280;
    const PAD = { l: 36, r: 12, t: 18, b: 30 };
    const innerW = W - PAD.l - PAD.r;
    const innerH = H - PAD.t - PAD.b;
    const minTs = rows[0].ts, maxTs = rows[rows.length - 1].ts;
    const tsRange = Math.max(1, maxTs - minTs);
    const allVals = rows.flatMap(e => [e.sys, e.dia, e.pul].filter(v => v != null));
    const yMax = Math.max(180, Math.ceil((Math.max(...allVals) + 5) / 10) * 10);
    const yMin = Math.min(50, Math.floor((Math.min(...allVals) - 5) / 10) * 10);
    const x = (ts) => rows.length === 1
      ? PAD.l + innerW / 2
      : PAD.l + ((ts - minTs) / tsRange) * innerW;
    const y = (v) => PAD.t + (1 - (v - yMin) / (yMax - yMin)) * innerH;
    const path = (key) => {
      let started = false;
      return rows.map((e) => {
        if (e[key] == null) { started = false; return ""; }
        const cmd = started ? "L" : "M";
        started = true;
        return cmd + x(e.ts).toFixed(1) + " " + y(e[key]).toFixed(1);
      }).filter(Boolean).join(" ");
    };
    const ticks = [];
    for (let v = Math.ceil(yMin / 20) * 20; v <= yMax; v += 20) ticks.push(v);
    const labelCount = Math.min(6, rows.length);
    const xLabels = [];
    if (labelCount > 1) {
      for (let i = 0; i < labelCount; i++) {
        const idx = Math.round((i / (labelCount - 1)) * (rows.length - 1));
        xLabels.push(rows[idx]);
      }
    } else { xLabels.push(rows[0]); }
    const fmtX = (ts) => new Date(ts).toLocaleDateString(lang === "de" ? "de-DE" : "en-GB",
      { day: "2-digit", month: "short" });

    return `<svg viewBox="0 0 ${W} ${H}" class="chart" preserveAspectRatio="none">
      ${ticks.map(v => `
        <line x1="${PAD.l}" x2="${W - PAD.r}" y1="${y(v)}" y2="${y(v)}" stroke="#e5e5e5" stroke-width="1"/>
        <text x="${PAD.l - 6}" y="${y(v) + 3}" text-anchor="end" font-size="9" fill="#888"
              font-family="JetBrains Mono, Menlo, monospace">${v}</text>
      `).join("")}
      ${xLabels.map(e => `<text x="${x(e.ts)}" y="${H - 10}" text-anchor="middle" font-size="9" fill="#888">${fmtX(e.ts)}</text>`).join("")}
      <path d="${path("dia")}" fill="none" stroke="#0d0d0d" stroke-opacity="0.4" stroke-width="1.5"/>
      <path d="${path("sys")}" fill="none" stroke="#0d0d0d" stroke-width="1.75"/>
      <path d="${path("pul")}" fill="none" stroke="#888" stroke-width="1.25" stroke-dasharray="3 3"/>
      ${rows.map(e => `
        <circle cx="${x(e.ts)}" cy="${y(e.sys)}" r="2.2" fill="#fff" stroke="#0d0d0d" stroke-width="1.3"/>
        <circle cx="${x(e.ts)}" cy="${y(e.dia)}" r="2.2" fill="#fff" stroke="#0d0d0d" stroke-opacity="0.55" stroke-width="1.3"/>
      `).join("")}
    </svg>`;
  };

  const doExport = () => {
    const w = window.open("", "_blank");
    if (!w) return;
    const avg = (k) => inRange.length
      ? Math.round(inRange.reduce((s, e) => s + e[k], 0) / inRange.length) : 0;
    const aSys = avg("sys"), aDia = avg("dia"), aPul = avg("pul");
    const cat = inRange.length ? categorize(aSys, aDia) : null;
    const title = lang === "de" ? "Blutdruck Tagebuch" : "Blood Pressure Diary";
    const subtitle = (lang === "de" ? "Bericht" : "Report")
      + " · " + formatDate(fromInputs(from, "00:00"), lang)
      + " – " + formatDate(fromInputs(to, "23:59"), lang);
    const labels = lang === "de"
      ? { date: "Datum", time: "Uhrzeit", sys: "SYS", dia: "DIA", pul: "PUL",
          cat: "Kategorie", comment: "Kommentar", count: "Messungen",
          avgSysDia: "Ø SYS / DIA", avgPul: "Ø PUL", generated: "Erstellt am",
          trend: "Verlauf", legSys: "SYS", legDia: "DIA", legPul: "PUL" }
      : { date: "Date", time: "Time", sys: "SYS", dia: "DIA", pul: "PUL",
          cat: "Category", comment: "Comment", count: "Measurements",
          avgSysDia: "Avg SYS / DIA", avgPul: "Avg PUL", generated: "Generated",
          trend: "Trend", legSys: "SYS", legDia: "DIA", legPul: "PUL" };

    const rows = inRange.map(e => {
      const c = categorize(e.sys, e.dia);
      return `<tr>
        <td>${formatDate(e.ts, lang)}</td>
        <td>${formatTime(e.ts, lang)}</td>
        <td class="num">${e.sys}</td>
        <td class="num">${e.dia}</td>
        <td class="num">${e.pul == null ? "—" : e.pul}</td>
        ${includeCategory ? `<td><span class="cat" style="color:${c.color};border-color:${c.color};background:${c.swatch}">${t["cat_" + c.key]}</span></td>` : ""}
        <td class="cmt">${(e.comment || "").replace(/[<>&]/g, s => ({ "<":"&lt;", ">":"&gt;", "&":"&amp;" }[s]))}</td>
      </tr>`;
    }).join("");

    // Average pulse should ignore missing values
    const pulVals = inRange.map(e => e.pul).filter(v => v != null);
    const aPulSafe = pulVals.length ? Math.round(pulVals.reduce((s, v) => s + v, 0) / pulVals.length) : null;

    const html = `<!doctype html><html lang="${lang}"><head><meta charset="utf-8">
<title>${title} — ${subtitle}</title>
<style>
  @page { size: A4; margin: 18mm 16mm; }
  * { box-sizing: border-box; }
  body { font: 11px/1.45 -apple-system, "Segoe UI", Helvetica, sans-serif; color: #0d0d0d; margin: 0; }
  h1 { font-size: 18px; margin: 0 0 4px; letter-spacing: -0.01em; }
  .sub { color: #555; font-size: 11px; margin-bottom: 16px; }
  .summary { display: flex; gap: 16px; padding: 12px 14px; border: 1px solid #ddd; border-radius: 6px; margin-bottom: 14px; }
  .sc { display: flex; flex-direction: column; gap: 2px; }
  .sc-l { font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; color: #666; font-weight: 600; }
  .sc-v { font-family: "JetBrains Mono", Menlo, monospace; font-size: 18px; font-weight: 500; }
  .sc-v small { font-size: 11px; color: #777; }
  table { width: 100%; border-collapse: collapse; }
  th { text-align: left; font-size: 9px; letter-spacing: 0.06em; text-transform: uppercase; color: #555; font-weight: 600; padding: 8px 6px; border-bottom: 1px solid #999; }
  td { padding: 6px; border-bottom: 1px solid #eee; vertical-align: top; }
  td.num { font-family: "JetBrains Mono", Menlo, monospace; text-align: right; font-variant-numeric: tabular-nums; width: 38px; }
  td.cmt { color: #555; }
  .cat { display: inline-block; font-size: 9px; font-weight: 600; padding: 1px 6px; border-radius: 999px; border: 1px solid; }
  tr { page-break-inside: avoid; }
  thead { display: table-header-group; }
  .ft { margin-top: 24px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #777; display: flex; justify-content: space-between; }
  .chart-block { margin: 0 0 16px; padding: 10px 12px 4px; border: 1px solid #ddd; border-radius: 6px; page-break-inside: avoid; }
  .chart-hd { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px; }
  .chart-hd h2 { font-size: 11px; margin: 0; letter-spacing: 0.04em; text-transform: uppercase; color: #555; font-weight: 600; }
  .chart-legend { display: flex; gap: 12px; font-size: 9px; color: #555; }
  .chart-legend i { display: inline-block; width: 14px; height: 2px; vertical-align: middle; margin-right: 4px; }
  .chart { width: 100%; height: 220px; display: block; }
  @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
</style></head><body>
<h1>${title}</h1>
<div class="sub">${subtitle}</div>
${inRange.length ? `<div class="summary">
  <div class="sc"><span class="sc-l">${labels.avgSysDia}</span><span class="sc-v">${aSys} / ${aDia} <small>mmHg</small></span></div>
  <div class="sc"><span class="sc-l">${labels.avgPul}</span><span class="sc-v">${aPulSafe == null ? "—" : aPulSafe} <small>${lang === "de" ? "/min" : "/min"}</small></span></div>
  <div class="sc"><span class="sc-l">${labels.count}</span><span class="sc-v">${inRange.length}</span></div>
  ${cat && includeCategory ? `<div class="sc" style="margin-left:auto;align-items:flex-end"><span class="sc-l">${labels.cat}</span><span class="cat" style="color:${cat.color};border-color:${cat.color};background:${cat.swatch};font-size:11px;padding:2px 10px">${t["cat_" + cat.key]}</span></div>` : ""}
</div>` : ""}
${includeChart && inRange.length ? `<div class="chart-block">
  <div class="chart-hd">
    <h2>${labels.trend}</h2>
    <div class="chart-legend">
      <span><i style="background:#0d0d0d"></i>${labels.legSys}</span>
      <span><i style="background:#0d0d0d;opacity:0.4"></i>${labels.legDia}</span>
      <span><i style="background:transparent;border-top:1px dashed #888;height:0"></i>${labels.legPul}</span>
    </div>
  </div>
  ${buildChartSVG(inRange)}
</div>` : ""}
<table>
  <thead><tr>
    <th>${labels.date}</th><th>${labels.time}</th>
    <th class="num">${labels.sys}</th><th class="num">${labels.dia}</th><th class="num">${labels.pul}</th>
    ${includeCategory ? `<th>${labels.cat}</th>` : ""}<th>${labels.comment}</th>
  </tr></thead>
  <tbody>${rows}</tbody>
</table>
<div class="ft"><span>${labels.generated}: ${formatDate(Date.now(), lang)}</span><span>${title}</span></div>
<script>window.addEventListener('load', () => setTimeout(() => window.print(), 200));<\/script>
</body></html>`;
    w.document.open();
    w.document.write(html);
    w.document.close();
    onClose();
  };

  const exportLabel = lang === "de" ? "Als PDF exportieren" : "Export as PDF";
  const titleLbl = lang === "de" ? "PDF-Export" : "Export PDF";
  const previewLbl = lang === "de" ? "Einträge im Zeitraum" : "Entries in range";
  const fromLbl = lang === "de" ? "Von" : "From";
  const toLbl = lang === "de" ? "Bis" : "To";
  const chartLbl = lang === "de" ? "Diagramm einbeziehen" : "Include chart";
  const catLbl = lang === "de" ? "Kategorie einbeziehen" : "Include category";

  return (
    <Modal open={open} onClose={onClose}>
      <header className="modal-hd">
        <h2>{titleLbl}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}>✕</button>
      </header>
      <div className="modal-body">
        <div className="field-row">
          <label className="field">
            <span className="field-lbl">{fromLbl}</span>
            <input type="date" className="input" value={from} min={minDate} max={maxDate}
                   onChange={(e) => setFrom(e.target.value)} />
          </label>
          <label className="field">
            <span className="field-lbl">{toLbl}</span>
            <input type="date" className="input" value={to} min={minDate} max={maxDate}
                   onChange={(e) => setTo(e.target.value)} />
          </label>
        </div>
        <label className="check-row">
          <input type="checkbox" checked={includeChart}
                 onChange={(e) => setIncludeChart(e.target.checked)} />
          <span>{chartLbl}</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={includeCategory}
                 onChange={(e) => setIncludeCategory(e.target.checked)} />
          <span>{catLbl}</span>
        </label>
        <div className="preview-row">
          <span className="preview-lbl">{previewLbl}</span>
          <span style={{ fontFamily: "var(--mono)", fontWeight: 500 }}>{inRange.length}</span>
        </div>
      </div>
      <footer className="modal-ft">
        <button type="button" className="btn ghost" onClick={onClose}>{t.cancel}</button>
        <button type="button" className="btn primary" disabled={inRange.length === 0}
                onClick={doExport}>{exportLabel}</button>
      </footer>
    </Modal>
  );
}

window.ExportModal = ExportModal;
