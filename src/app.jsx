function App() {
  const [lang, setLang] = React.useState(() => localStorage.getItem("lang") || "en");
  const [showPul, setShowPul] = React.useState(() => localStorage.getItem("showPul") !== "false");

  const changeLang = (l) => { localStorage.setItem("lang", l); setLang(l); };
  const toggleShowPul = () => setShowPul(prev => {
    const next = !prev;
    localStorage.setItem("showPul", String(next));
    return next;
  });
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
  const [pendingImport, setPendingImport] = React.useState(null);
  const [viewingComment, setViewingComment] = React.useState(null);

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

  const handleExportData = () => exportJSON(entries);

  const handleImportData = () => {
    importJSON()
      .then(imported => { if (imported) setPendingImport(imported); })
      .catch(() => window.alert(t.importError));
  };

  const finishImport = (mode) => {
    const imported = pendingImport;
    setPendingImport(null);
    if (!imported) return;
    const op = mode === "replace"
      ? dbClear().then(() => Promise.all(imported.map(e => dbPut(e))))
      : Promise.all(imported.map(e => dbPut(e)));
    op.then(() => dbGetAll()).then(setEntries);
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
              <TrendChart entries={filtered} t={t} lang={lang} showCategories={true} showPul={showPul} />
            </section>

            <section className="panel">
              <div className="panel-hd">
                <h2>{t.list}</h2>
              </div>
              <FilterBar filters={filters} setFilters={setFilters} t={t} lang={lang}
                         total={entries.length} shown={filtered.length} />
              <EntriesTable entries={filtered} sortKey={filters.sortKey} sortDir={filters.sortDir}
                            setSort={setSort} onEdit={openEdit} onDelete={handleDelete}
                            onShowComment={setViewingComment}
                            density="compact" showCategories={true} showPul={showPul}
                            t={t} lang={lang} />
            </section>
          </>
        )}
      </main>

      <div className="fab-stack">
        <TopMenu lang={lang} onChangeLang={changeLang}
                 showPul={showPul} onToggleShowPul={toggleShowPul}
                 onShowMeasure={() => setShowMeasure(true)}
                 onExportPdf={() => setShowExport(true)}
                 onExportData={handleExportData}
                 onImportData={handleImportData}
                 hasEntries={entries.length > 0} t={t} />
        {entries.length > 0 && (
          <button type="button" className="fab" onClick={openNew}
                  aria-label={t.newEntry} title={t.newEntry}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      <EntryFormModal open={showForm} onClose={() => { setShowForm(false); setEditing(null); }}
                      onSave={handleSave} editing={editing} t={t} lang={lang} />
      <MeasureModal open={showMeasure} onClose={() => setShowMeasure(false)} t={t} lang={lang} />
      <ExportModal open={showExport} onClose={() => setShowExport(false)} entries={entries} t={t} lang={lang} />
      <ImportModal open={pendingImport !== null}
                   onClose={() => setPendingImport(null)}
                   count={pendingImport ? pendingImport.length : 0}
                   onReplace={() => finishImport("replace")}
                   onAdd={() => finishImport("add")}
                   t={t} />
      <CommentModal open={viewingComment !== null}
                    onClose={() => setViewingComment(null)}
                    comment={viewingComment || ""} t={t} />
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
