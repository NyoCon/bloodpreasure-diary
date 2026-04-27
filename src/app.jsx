function App() {
  const [lang, setLang] = React.useState(() => localStorage.getItem("lang") || "en");

  const changeLang = (l) => { localStorage.setItem("lang", l); setLang(l); };
  const t = I18N[lang];

  const [entries, setEntries] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    dbGetAll()
      .then(data => { setEntries(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const [filters, setFilters] = React.useState({
    quickRange: "all",
    from: "",
    to: "",
    valueFilters: [],
    sortKey: "ts",
    sortDir: "desc",
  });

  const [showForm, setShowForm] = React.useState(false);
  const [editing, setEditing] = React.useState(null);
  const [showMeasure, setShowMeasure] = React.useState(false);
  const [showExport, setShowExport] = React.useState(false);

  const filtered = React.useMemo(() => {
    let arr = entries;
    if (filters.from) {
      const fromTs = fromInputs(filters.from, "00:00");
      arr = arr.filter(e => e.ts >= fromTs);
    }
    if (filters.to) {
      const toTs = fromInputs(filters.to, "23:59");
      arr = arr.filter(e => e.ts <= toTs);
    }
    for (const vf of filters.valueFilters) {
      const v = Number(vf.value);
      arr = arr.filter(e => {
        const x = e[vf.field];
        if (x == null) return false;
        switch (vf.op) {
          case "gt":  return x > v;
          case "gte": return x >= v;
          case "eq":  return x === v;
          case "lt":  return x < v;
          case "lte": return x <= v;
        }
        return true;
      });
    }
    const dir = filters.sortDir === "asc" ? 1 : -1;
    arr = [...arr].sort((a, b) => {
      const av = a[filters.sortKey], bv = b[filters.sortKey];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      return (av - bv) * dir;
    });
    return arr;
  }, [entries, filters]);

  const setSort = (key) => {
    if (filters.sortKey === key) {
      setFilters({ ...filters, sortDir: filters.sortDir === "asc" ? "desc" : "asc" });
    } else {
      setFilters({ ...filters, sortKey: key, sortDir: "desc" });
    }
  };

  const handleSave = (entry) => {
    dbPut(entry).then(saved => setEntries(prev => {
      const idx = prev.findIndex(e => e.id === saved.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = saved; return next; }
      return [saved, ...prev];
    }));
    setEditing(null);
  };

  const handleDelete = (entry) => {
    if (window.confirm(t.confirmDelete)) {
      dbDelete(entry.id).then(() => setEntries(prev => prev.filter(e => e.id !== entry.id)));
    }
  };

  const openEdit = (entry) => { setEditing(entry); setShowForm(true); };
  const openNew = () => { setEditing(null); setShowForm(true); };

  if (loading) {
    return (
      <div className="app" style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
        <span style={{ color: "var(--fg-50)", fontFamily: "var(--mono)" }}>Loading…</span>
      </div>
    );
  }

  return (
    <div className="app">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M3 12h4l2-7 4 14 2-7h6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="brand-text">
            <h1>{t.appName}</h1>
            <p>{t.tagline}</p>
          </div>
        </div>
        <div className="topbar-actions">
          <div className="lang-switch" role="radiogroup" aria-label="Language">
            <button type="button" className={lang === "en" ? "lang on" : "lang"}
                    onClick={() => changeLang("en")}>EN</button>
            <button type="button" className={lang === "de" ? "lang on" : "lang"}
                    onClick={() => changeLang("de")}>DE</button>
          </div>
          <button type="button" className="btn ghost" onClick={() => setShowMeasure(true)}
                  aria-label={t.howTo} title={t.howTo}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="12" r="9" />
              <path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 .9-1 1.7M12 17h.01" strokeLinecap="round" />
            </svg>
            <span>{t.howTo}</span>
          </button>
          <button type="button" className="btn ghost" onClick={() => setShowExport(true)}
                  disabled={entries.length === 0}
                  title={lang === "de" ? "PDF-Export" : "Export PDF"}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 4v12M7 11l5 5 5-5M5 20h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>PDF</span>
          </button>
          <button type="button" className="btn primary" onClick={openNew}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            <span>{t.newEntry}</span>
          </button>
        </div>
      </header>

      <main className="content">
        {entries.length === 0 ? (
          <div className="empty-state big">
            <h3>{t.noEntries}</h3>
            <p>{t.noEntriesHint}</p>
            <button type="button" className="btn primary" onClick={openNew}>{t.newEntry}</button>
          </div>
        ) : (
          <>
            <SummaryCards entries={filtered} t={t} />

            <section className="panel">
              <div className="panel-hd">
                <h2>{t.chart}</h2>
              </div>
              <TrendChart entries={filtered} t={t} lang={lang} showCategories={true} />
            </section>

            <section className="panel">
              <div className="panel-hd">
                <h2>{t.list}</h2>
              </div>
              <FilterBar filters={filters} setFilters={setFilters} t={t} lang={lang}
                         total={entries.length} shown={filtered.length} />
              <EntriesTable entries={filtered} sortKey={filters.sortKey} sortDir={filters.sortDir}
                            setSort={setSort} onEdit={openEdit} onDelete={handleDelete}
                            density="compact" showCategories={true}
                            t={t} lang={lang} />
            </section>
          </>
        )}
      </main>

      <EntryFormModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
                      onSave={handleSave} editing={editing} t={t} lang={lang} />
      <MeasureModal open={showMeasure} onClose={() => setShowMeasure(false)} t={t} lang={lang} />
      <ExportModal open={showExport} onClose={() => setShowExport(false)} entries={entries} t={t} lang={lang} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
