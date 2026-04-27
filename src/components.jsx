// components.jsx — modals, filters, table, summary cards

// ── Helpers ────────────────────────────────────────────────────────────────
function CategoryBadge({ sys, dia, t, mode = "dot" }) {
  const cat = categorize(sys, dia);
  const label = t["cat_" + cat.key];
  if (mode === "dot") {
    return (
      <span className="cat-dot" title={label}
            style={{ background: cat.color }} />
    );
  }
  return (
    <span className="cat-badge"
          style={{ background: cat.swatch, color: cat.color, borderColor: cat.color }}>
      {label}
    </span>
  );
}

// ── Modal shell ────────────────────────────────────────────────────────────
function Modal({ open, onClose, children, wide = false }) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-scrim" onClick={onClose}>
      <div className={"modal " + (wide ? "modal-wide" : "")} onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

// ── Entry form modal ───────────────────────────────────────────────────────
function EntryFormModal({ open, onClose, onSave, editing, t, lang }) {
  const now = Date.now();
  const [date, setDate] = React.useState(toISODate(now));
  const [time, setTime] = React.useState(toISOTime(now));
  const [sys, setSys] = React.useState("");
  const [dia, setDia] = React.useState("");
  const [pul, setPul] = React.useState("");
  const [comment, setComment] = React.useState("");
  const [err, setErr] = React.useState({});

  React.useEffect(() => {
    if (!open) return;
    if (editing) {
      setDate(toISODate(editing.ts));
      setTime(toISOTime(editing.ts));
      setSys(String(editing.sys));
      setDia(String(editing.dia));
      setPul(editing.pul == null ? "" : String(editing.pul));
      setComment(editing.comment || "");
    } else {
      const n = Date.now();
      setDate(toISODate(n));
      setTime(toISOTime(n));
      setSys(""); setDia(""); setPul(""); setComment("");
    }
    setErr({});
  }, [open, editing]);

  const validate = () => {
    const e = {};
    const s = Number(sys), d = Number(dia);
    if (!sys || isNaN(s) || s < 50 || s > 260) e.sys = true;
    if (!dia || isNaN(d) || d < 30 || d > 200) e.dia = true;
    if (pul) {
      const p = Number(pul);
      if (isNaN(p) || p < 30 || p > 220) e.pul = true;
    }
    if (!date) e.date = true;
    if (!time) e.time = true;
    setErr(e);
    return Object.keys(e).length === 0;
  };

  const submit = (ev) => {
    ev.preventDefault();
    if (!validate()) return;
    onSave({
      id: editing ? editing.id : "e-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7),
      ts: fromInputs(date, time),
      sys: Number(sys),
      dia: Number(dia),
      pul: pul === "" ? null : Number(pul),
      comment: comment.trim(),
    });
    onClose();
  };

  // Live preview
  const preview = (sys && dia && !isNaN(Number(sys)) && !isNaN(Number(dia)))
    ? categorize(Number(sys), Number(dia)) : null;

  return (
    <Modal open={open} onClose={onClose}>
      <form onSubmit={submit} className="entry-form">
        <header className="modal-hd">
          <h2>{editing ? t.editEntry : t.addEntry}</h2>
          <button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}>✕</button>
        </header>

        <div className="modal-body">
          <div className="field-row">
            <label className="field">
              <span className="field-lbl">{t.date}</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                     onClick={(e) => e.target.showPicker?.()}
                     className={err.date ? "input err" : "input"} />
            </label>
            <label className="field">
              <span className="field-lbl">{t.time}</span>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                     onClick={(e) => e.target.showPicker?.()}
                     className={err.time ? "input err" : "input"} />
            </label>
          </div>

          <div className="field-row triple">
            <label className="field">
              <span className="field-lbl">{t.sys} <span className="unit">{t.mmHg}</span></span>
              <input type="number" inputMode="numeric" value={sys} placeholder="120"
                     onChange={(e) => setSys(e.target.value)}
                     className={err.sys ? "input num err" : "input num"} />
            </label>
            <label className="field">
              <span className="field-lbl">{t.dia} <span className="unit">{t.mmHg}</span></span>
              <input type="number" inputMode="numeric" value={dia} placeholder="80"
                     onChange={(e) => setDia(e.target.value)}
                     className={err.dia ? "input num err" : "input num"} />
            </label>
            <label className="field">
              <span className="field-lbl">{t.pul} <span className="unit">{t.bpm}</span></span>
              <input type="number" inputMode="numeric" value={pul} placeholder="70"
                     onChange={(e) => setPul(e.target.value)}
                     className={err.pul ? "input num err" : "input num"} />
            </label>
          </div>

          {preview && (
            <div className="preview-row">
              <span className="preview-lbl">{t.category}</span>
              <CategoryBadge sys={Number(sys)} dia={Number(dia)} t={t} mode="badge" />
            </div>
          )}

          <label className="field">
            <span className="field-lbl">{t.commentOpt}</span>
            <textarea rows="2" value={comment} placeholder={t.placeholderComment}
                      onChange={(e) => setComment(e.target.value)}
                      className="input textarea" />
          </label>
        </div>

        <footer className="modal-ft">
          <button type="button" className="btn ghost" onClick={onClose}>{t.cancel}</button>
          <button type="submit" className="btn primary">{t.save}</button>
        </footer>
      </form>
    </Modal>
  );
}

// ── How-to-measure modal ───────────────────────────────────────────────────
function MeasureModal({ open, onClose, t, lang }) {
  return (
    <Modal open={open} onClose={onClose} wide>
      <header className="modal-hd">
        <h2>{t.measureTitle}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}>✕</button>
      </header>
      <div className="modal-body measure-body">
        <p className="measure-intro">{t.measureIntro}</p>
        <ol className="measure-list">
          {MEASURE_TIPS[lang].map((tip) => (
            <li key={tip.n} className="measure-tip">
              <span className="tip-n">{tip.n}</span>
              <div>
                <h3>{tip.title}</h3>
                <p>{tip.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <footer className="modal-ft">
        <button type="button" className="btn primary" onClick={onClose}>{t.close}</button>
      </footer>
    </Modal>
  );
}

// ── Filter bar ─────────────────────────────────────────────────────────────
function FilterBar({ filters, setFilters, t, lang, total, shown }) {
  const setField = (k, v) => setFilters({ ...filters, [k]: v });

  const addValueFilter = () => {
    setFilters({
      ...filters,
      valueFilters: [
        ...filters.valueFilters,
        { id: "vf-" + Date.now(), field: "sys", op: "gt", value: 140 },
      ],
    });
  };
  const updateVF = (id, patch) => {
    setFilters({
      ...filters,
      valueFilters: filters.valueFilters.map(vf => vf.id === id ? { ...vf, ...patch } : vf),
    });
  };
  const removeVF = (id) => {
    setFilters({
      ...filters,
      valueFilters: filters.valueFilters.filter(vf => vf.id !== id),
    });
  };

  const setQuickRange = (key) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    let from = "";
    if (key === "7") {
      const d = new Date(today); d.setDate(d.getDate() - 6);
      from = toISODate(d.getTime());
    } else if (key === "30") {
      const d = new Date(today); d.setDate(d.getDate() - 29);
      from = toISODate(d.getTime());
    } else if (key === "custom") {
      from = toISODate(today.getTime());
    }
    const to = key === "all" ? "" : toISODate(today.getTime());
    setFilters({ ...filters, from, to, quickRange: key });
  };

  const hasFilters = filters.from || filters.to || filters.valueFilters.length > 0;

  return (
    <section className="filterbar">
      <div className="filter-row">
        <div className="filter-group">
          <label className="filter-lbl">{t.quickRange}</label>
          <div className="seg">
            {[
              { k: "7",  l: t.last7 },
              { k: "30", l: t.last30 },
              { k: "all", l: t.allTime },
              { k: "custom", l: t.custom },
            ].map(o => (
              <button key={o.k} type="button"
                      className={filters.quickRange === o.k ? "seg-btn on" : "seg-btn"}
                      onClick={() => setQuickRange(o.k)}>
                {o.l}
              </button>
            ))}
          </div>
        </div>

        {filters.quickRange === "custom" && (
          <div className="filter-group">
            <label className="filter-lbl">{t.from}</label>
            <input type="date" className="input small" value={filters.from}
                   onChange={(e) => setField("from", e.target.value)}
                   onClick={(e) => e.target.showPicker?.()}  />
            <label className="filter-lbl">{t.to}</label>
            <input type="date" className="input small" value={filters.to}
                   onChange={(e) => setField("to", e.target.value)}
                   onClick={(e) => e.target.showPicker?.()}  />
          </div>
        )}

        <div className="filter-spacer" />

        <div className="filter-counts">
          <span className="count-num">{shown}</span>
          <span className="count-lbl">{t.of} {total} {t.measurements}</span>
        </div>
      </div>

      <div className="filter-row vf-row">
        <label className="filter-lbl">{t.valueFilter}</label>
        <div className="vf-list">
          {filters.valueFilters.length === 0 && (
            <span className="vf-empty">{t.none}</span>
          )}
          {filters.valueFilters.map(vf => (
            <div key={vf.id} className="vf-chip">
              <select className="vf-select" value={vf.field}
                      onChange={(e) => updateVF(vf.id, { field: e.target.value })}>
                <option value="sys">{t.sys}</option>
                <option value="dia">{t.dia}</option>
                <option value="pul">{t.pul}</option>
              </select>
              <select className="vf-select" value={vf.op}
                      onChange={(e) => updateVF(vf.id, { op: e.target.value })}>
                <option value="gt">{">"} {t.op_gt}</option>
                <option value="gte">{"≥"} {t.op_gte}</option>
                <option value="eq">{"="} {t.op_eq}</option>
                <option value="lt">{"<"} {t.op_lt}</option>
                <option value="lte">{"≤"} {t.op_lte}</option>
              </select>
              <input type="number" className="vf-num" value={vf.value}
                     onChange={(e) => updateVF(vf.id, { value: Number(e.target.value) })} />
              <button type="button" className="vf-x" aria-label="Remove"
                      onClick={() => removeVF(vf.id)}>✕</button>
            </div>
          ))}
          <button type="button" className="vf-add" onClick={addValueFilter}>
            + {t.add}
          </button>
        </div>
        {hasFilters && (
          <button type="button" className="link-btn" onClick={() => setQuickRange("all") || setFilters({ from: "", to: "", quickRange: "all", valueFilters: [], sortKey: filters.sortKey, sortDir: filters.sortDir })}>
            {t.clearFilters}
          </button>
        )}
      </div>
    </section>
  );
}

// ── Entries table ──────────────────────────────────────────────────────────
function EntriesTable({ entries, sortKey, sortDir, setSort, onEdit, onDelete, density, showCategories, t, lang }) {
  const Header = ({ k, label, align, className }) => {
    const active = sortKey === k;
    const cls = [align === "right" ? "th-right" : "", className].filter(Boolean).join(" ");
    return (
      <th className={cls}>
        <button type="button" className={"th-btn " + (active ? "active" : "")}
                onClick={() => setSort(k)}>
          <span>{label}</span>
          <span className="th-sort">
            {active ? (sortDir === "asc" ? "↑" : "↓") : ""}
          </span>
        </button>
      </th>
    );
  };

  if (entries.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-glyph" aria-hidden="true">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.25">
            <path d="M3 12h4l2-7 4 14 2-7h6" />
          </svg>
        </div>
        <h3>{t.noResults}</h3>
        <p>{t.noResultsHint}</p>
      </div>
    );
  }

  return (
    <div className={"table-wrap " + (density === "compact" ? "compact" : "roomy")}>
      <table className="entries-table">
        <thead>
          <tr>
            <Header k="ts"  label={t.when} />
            <Header k="sys" label={t.sys} align="right" />
            <Header k="dia" label={t.dia} align="right" />
            <Header k="pul" label={t.pul} align="right" className="col-pul" />
            {showCategories && <th className="col-cat">{t.category}</th>}
            <th className="col-comment">{t.comment}</th>
            <th aria-label={t.actions} />
          </tr>
        </thead>
        <tbody>
          {entries.map(e => {
            const cat = categorize(e.sys, e.dia);
            return (
              <tr key={e.id}>
                <td className="td-when">
                  <div className="when-rel">{formatDate(e.ts, lang)}</div>
                  <div className="when-time">{formatTime(e.ts, lang)}</div>
                  {showCategories && (
                    <div className="when-cat-mob"><span className="cat-dot" style={{ background: cat.color }} /><span style={{ color: cat.color }}>{t["cat_" + cat.key]}</span></div>
                  )}
                </td>
                <td className="td-num">
                  <span className="num-strong" style={showCategories ? { color: cat.color } : null}>{e.sys}</span>
                </td>
                <td className="td-num">
                  <span className="num" style={showCategories ? { color: cat.color } : null}>{e.dia}</span>
                </td>
                <td className="td-num col-pul">
                  <span className="num muted">{e.pul == null ? "—" : e.pul}</span>
                </td>
                {showCategories && (
                  <td className="col-cat"><CategoryBadge sys={e.sys} dia={e.dia} t={t} mode="badge" /></td>
                )}
                <td className="td-comment col-comment">
                  <span title={e.comment}>{e.comment || <span className="dash">—</span>}</span>
                </td>
                <td className="td-actions">
                  <button type="button" className="row-btn" title={t.edit} onClick={() => onEdit(e)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 3l5 5-11 11H5v-5z"/></svg>
                  </button>
                  <button type="button" className="row-btn danger" title={t.delete} onClick={() => onDelete(e)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/></svg>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Summary cards ──────────────────────────────────────────────────────────
function SummaryCards({ entries, t }) {
  if (entries.length === 0) return null;
  const avg = (k) => {
    const vals = entries.map(e => e[k]).filter(v => v != null);
    return vals.length ? Math.round(vals.reduce((s, v) => s + v, 0) / vals.length) : null;
  };
  const aSys = avg("sys"), aDia = avg("dia"), aPul = avg("pul");
  const cat = categorize(aSys, aDia);
  return (
    <section className="summary">
      <div className="summary-card">
        <div className="sc-lbl">{t.avgSys} / {t.avgDia}</div>
        <div className="sc-val">
          <span className="sc-num">{aSys}</span>
          <span className="sc-sep">/</span>
          <span className="sc-num secondary">{aDia}</span>
          <span className="sc-unit">{t.mmHg}</span>
        </div>
        <div className="sc-meta">
          <span className="cat-dot" style={{ background: cat.color }} />
          <span style={{ color: cat.color }}>{t["cat_" + cat.key]}</span>
        </div>
      </div>
      <div className="summary-card">
        <div className="sc-lbl">{t.avgPul}</div>
        <div className="sc-val">
          <span className="sc-num">{aPul == null ? "—" : aPul}</span>
          <span className="sc-unit">{t.bpm}</span>
        </div>
        <div className="sc-meta muted">{entries.length} {t.measurements}</div>
      </div>
    </section>
  );
}

// ── Import confirmation modal ──────────────────────────────────────────────
function ImportModal({ open, onClose, count, onReplace, onAdd, t }) {
  return (
    <Modal open={open} onClose={onClose}>
      <header className="modal-hd">
        <h2>{t.importData}</h2>
        <button type="button" className="icon-btn" onClick={onClose} aria-label={t.close}>✕</button>
      </header>
      <div className="modal-body import-body">
        <p>{t.importFound.replace("{n}", count)}</p>
        <p className="muted">{t.importChoose}</p>
      </div>
      <footer className="modal-ft">
        <button type="button" className="btn ghost" onClick={onAdd}>{t.importAdd}</button>
        <button type="button" className="btn primary" onClick={onReplace}>{t.importReplace}</button>
      </footer>
    </Modal>
  );
}

// ── Topbar dropdown menu ───────────────────────────────────────────────────
function TopMenu({ lang, onChangeLang, onExportPdf, onExportData, onImportData, hasEntries, t }) {
  const [open, setOpen] = React.useState(false);
  const wrapRef = React.useRef(null);

  React.useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const run = (fn) => () => { setOpen(false); fn(); };

  return (
    <div className="menu-wrap" ref={wrapRef}>
      <button type="button" className="btn ghost menu-trigger"
              onClick={() => setOpen(o => !o)}
              aria-haspopup="menu" aria-expanded={open}
              aria-label={t.menu} title={t.menu}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <circle cx="12" cy="5"  r="1.6" />
          <circle cx="12" cy="12" r="1.6" />
          <circle cx="12" cy="19" r="1.6" />
        </svg>
      </button>
      {open && (
        <div className="menu-pop" role="menu">
          <div className="menu-section">
            <span className="menu-lbl">{t.language}</span>
            <div className="menu-lang">
              <button type="button" className={lang === "en" ? "lang on" : "lang"}
                      onClick={run(() => onChangeLang("en"))}>EN</button>
              <button type="button" className={lang === "de" ? "lang on" : "lang"}
                      onClick={run(() => onChangeLang("de"))}>DE</button>
            </div>
          </div>
          <div className="menu-divider" />
          <button type="button" className="menu-item" role="menuitem"
                  disabled={!hasEntries} onClick={run(onExportPdf)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" strokeLinejoin="round"/>
              <path d="M14 3v6h6" strokeLinejoin="round"/>
            </svg>
            <span>{t.exportPdf}</span>
          </button>
          <button type="button" className="menu-item" role="menuitem"
                  disabled={!hasEntries} onClick={run(onExportData)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v12M7 11l5 5 5-5M5 20h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t.exportData}</span>
          </button>
          <button type="button" className="menu-item" role="menuitem"
                  onClick={run(onImportData)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 20V8M7 13l5-5 5 5M5 4h14" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t.importData}</span>
          </button>
        </div>
      )}
    </div>
  );
}

Object.assign(window, {
  CategoryBadge, Modal, EntryFormModal, MeasureModal, ImportModal,
  FilterBar, EntriesTable, SummaryCards, TopMenu,
});
