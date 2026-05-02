// data.jsx — seed data, BP categorization, i18n strings, helpers

// ── i18n ────────────────────────────────────────────────────────────────────
const I18N = {
  en: {
    appName: "Blood Pressure Diary",
    tagline: "Track, review and understand your readings.",
    newEntry: "New entry",
    howTo: "How to measure",
    entries: "Entries",
    entry: "entry",
    entries_p: "entries",
    showing: "Showing",
    of: "of",
    avgSys: "Avg SYS",
    avgDia: "Avg DIA",
    avgPul: "Avg PUL",
    last7: "Last 7 days",
    last30: "Last 30 days",
    allTime: "All time",
    chart: "Trend",
    list: "Log",
    date: "Date",
    time: "Time",
    when: "When",
    sys: "SYS",
    dia: "DIA",
    pul: "PUL",
    sysLong: "Systolic",
    diaLong: "Diastolic",
    pulLong: "Pulse",
    mmHg: "mmHg",
    bpm: "/min",
    comment: "Comment",
    commentOpt: "Comment (optional)",
    optional: "optional",
    category: "Category",
    actions: "",
    save: "Save entry",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    filters: "Filters",
    clearFilters: "Clear filters",
    from: "From",
    to: "To",
    valueFilter: "Value filter",
    field: "Field",
    operator: "Operator",
    value: "Value",
    add: "Add",
    none: "None",
    noEntries: "No entries yet",
    noEntriesHint: "Tap “New entry” to record your first measurement.",
    noResults: "No entries match your filters",
    noResultsHint: "Try widening the date range or removing a value filter.",
    confirmDelete: "Delete this entry?",
    measureTitle: "How to measure correctly",
    measureIntro: "Reliable readings depend on technique. A few minutes of preparation makes the difference between a true number and a misleading one.",
    close: "Close",
    placeholderComment: "e.g. after coffee, slightly stressed…",
    op_gt: "greater than",
    op_gte: "≥ at least",
    op_eq: "equals",
    op_lt: "less than",
    op_lte: "≤ at most",
    cat_optimal: "Optimal",
    cat_normal: "Normal",
    cat_high_normal: "High-normal",
    cat_grade1: "Grade 1",
    cat_grade2: "Grade 2",
    cat_grade3: "Grade 3",
    cat_low: "Low",
    today: "Today",
    yesterday: "Yesterday",
    daysAgo: "d ago",
    sortBy: "Sort by",
    asc: "Ascending",
    desc: "Descending",
    quickRange: "Range",
    custom: "Custom",
    addEntry: "Add entry",
    editEntry: "Edit entry",
    measurements: "measurements",
    menu: "Menu",
    language: "Language",
    exportPdf: "Export PDF",
    exportData: "Export data",
    importData: "Import data",
    importFound: "{n} entries found in file.",
    importChoose: "Add to existing entries or replace all current data?",
    importAdd: "Add",
    importReplace: "Replace",
    importError: "Could not import: invalid file format",
    viewComment: "View comment",
    hasComment: "Has comment",
    showPul: "Show pulse",
    darkMode: "Dark mode",
    deleteAllData: "Delete all data",
    confirmDeleteAll: "Delete all entries? This cannot be undone.",
    arrhythmia: "Arrhythmia detected",
  },
  de: {
    appName: "Blutdruck Tagebuch",
    tagline: "Werte erfassen, prüfen und verstehen.",
    newEntry: "Neuer Eintrag",
    howTo: "Richtig messen",
    entries: "Einträge",
    entry: "Eintrag",
    entries_p: "Einträge",
    showing: "Es werden",
    of: "von",
    avgSys: "Ø SYS",
    avgDia: "Ø DIA",
    avgPul: "Ø PUL",
    last7: "Letzte 7 Tage",
    last30: "Letzte 30 Tage",
    allTime: "Gesamt",
    chart: "Verlauf",
    list: "Protokoll",
    date: "Datum",
    time: "Uhrzeit",
    when: "Zeitpunkt",
    sys: "SYS",
    dia: "DIA",
    pul: "PUL",
    sysLong: "Systolisch",
    diaLong: "Diastolisch",
    pulLong: "Puls",
    mmHg: "mmHg",
    bpm: "/min",
    comment: "Kommentar",
    commentOpt: "Kommentar (optional)",
    optional: "optional",
    category: "Kategorie",
    actions: "",
    save: "Eintrag speichern",
    cancel: "Abbrechen",
    delete: "Löschen",
    edit: "Bearbeiten",
    filters: "Filter",
    clearFilters: "Filter zurücksetzen",
    from: "Von",
    to: "Bis",
    valueFilter: "Wertefilter",
    field: "Feld",
    operator: "Operator",
    value: "Wert",
    add: "Hinzufügen",
    none: "Keine",
    noEntries: "Noch keine Einträge",
    noEntriesHint: "Klicken Sie auf „Neuer Eintrag“, um Ihre erste Messung zu erfassen.",
    noResults: "Keine Einträge entsprechen Ihren Filtern",
    noResultsHint: "Erweitern Sie den Zeitraum oder entfernen Sie einen Wertefilter.",
    confirmDelete: "Diesen Eintrag wirklich löschen?",
    measureTitle: "So messen Sie richtig",
    measureIntro: "Verlässliche Werte hängen von der Technik ab. Wenige Minuten Vorbereitung machen den Unterschied zwischen einem echten Wert und einem irreführenden.",
    close: "Schließen",
    placeholderComment: "z. B. nach Kaffee, leicht gestresst…",
    op_gt: "größer als",
    op_gte: "≥ mindestens",
    op_eq: "gleich",
    op_lt: "kleiner als",
    op_lte: "≤ höchstens",
    cat_optimal: "Optimal",
    cat_normal: "Normal",
    cat_high_normal: "Hoch-normal",
    cat_grade1: "Grad 1",
    cat_grade2: "Grad 2",
    cat_grade3: "Grad 3",
    cat_low: "Niedrig",
    today: "Heute",
    yesterday: "Gestern",
    daysAgo: " T",
    sortBy: "Sortieren",
    asc: "Aufsteigend",
    desc: "Absteigend",
    quickRange: "Zeitraum",
    custom: "Benutzerdefiniert",
    addEntry: "Eintrag hinzufügen",
    editEntry: "Eintrag bearbeiten",
    measurements: "Messungen",
    menu: "Menü",
    language: "Sprache",
    exportPdf: "PDF-Export",
    exportData: "Daten exportieren",
    importData: "Daten importieren",
    importFound: "{n} Einträge in Datei gefunden.",
    importChoose: "Zu vorhandenen Einträgen hinzufügen oder alle aktuellen Daten ersetzen?",
    importAdd: "Hinzufügen",
    importReplace: "Ersetzen",
    importError: "Import fehlgeschlagen: ungültiges Dateiformat",
    viewComment: "Kommentar anzeigen",
    hasComment: "Hat einen Kommentar",
    showPul: "Puls anzeigen",
    darkMode: "Dunkler Modus",
    deleteAllData: "Alle Daten löschen",
    confirmDeleteAll: "Alle Einträge löschen? Das kann nicht rückgängig gemacht werden.",
    arrhythmia: "Herzrhythmusstörung erkannt",
  },
};

// How-to-measure tips, per language. Plain factual technique guidance.
const MEASURE_TIPS = {
  en: [
    { n: "01", title: "Wait & rest", body: "Sit quietly for 5 minutes before measuring. Don't smoke, eat, exercise or drink caffeine for at least 30 minutes beforehand." },
    { n: "02", title: "Empty bladder", body: "A full bladder can raise readings by several mmHg. Use the bathroom first." },
    { n: "03", title: "Sit correctly", body: "Both feet flat on the floor, back supported, legs uncrossed. Don't talk during the measurement." },
    { n: "04", title: "Position the cuff", body: "Place the cuff on bare skin, directly above the elbow. The lower edge sits about 2 cm above the bend of the arm." },
    { n: "05", title: "Arm at heart level", body: "Rest the arm on a table so the cuff is roughly at the height of your heart. Too high reads low; too low reads high." },
    { n: "06", title: "Measure twice", body: "Take two readings one minute apart. Record the second one — or the average. Always use the same arm." },
    { n: "07", title: "Same time of day", body: "Morning before medication and again in the evening gives the most useful long-term picture." },
  ],
  de: [
    { n: "01", title: "Ruhe vor der Messung", body: "Vor der Messung 5 Minuten ruhig sitzen. Mindestens 30 Minuten vorher nicht rauchen, essen, Sport treiben oder Koffein trinken." },
    { n: "02", title: "Blase entleeren", body: "Eine volle Blase kann den Wert um mehrere mmHg erhöhen. Vorher zur Toilette gehen." },
    { n: "03", title: "Richtige Sitzhaltung", body: "Beide Füße flach auf dem Boden, Rücken angelehnt, Beine nicht überkreuzt. Während der Messung nicht sprechen." },
    { n: "04", title: "Manschette anlegen", body: "Die Manschette auf der bloßen Haut direkt über dem Ellenbogen anlegen. Der untere Rand sitzt etwa 2 cm über der Armbeuge." },
    { n: "05", title: "Arm auf Herzhöhe", body: "Den Arm auf einem Tisch ablegen, sodass die Manschette etwa auf Höhe des Herzens liegt. Zu hoch ergibt zu niedrige Werte, zu tief ergibt zu hohe." },
    { n: "06", title: "Zweimal messen", body: "Zwei Messungen im Abstand von einer Minute durchführen. Den zweiten Wert oder den Mittelwert notieren. Immer denselben Arm verwenden." },
    { n: "07", title: "Gleiche Tageszeit", body: "Morgens vor der Medikation und abends — das ergibt das aussagekräftigste Langzeitbild." },
  ],
};

// ── Categorization (ESH/ESC adult guidelines) ──────────────────────────────
// Returns { key, color, swatch } where the worse of SYS/DIA wins.
const CATEGORIES = {
  low:         { key: "low",         color: "oklch(0.55 0.10 240)", swatch: "oklch(0.92 0.04 240)" },
  optimal:     { key: "optimal",     color: "oklch(0.50 0.12 155)", swatch: "oklch(0.93 0.05 155)" },
  normal:      { key: "normal",      color: "oklch(0.55 0.10 130)", swatch: "oklch(0.94 0.04 130)" },
  high_normal: { key: "high_normal", color: "oklch(0.58 0.13 90)",  swatch: "oklch(0.94 0.05 90)"  },
  grade1:     { key: "grade1",      color: "oklch(0.62 0.16 60)",  swatch: "oklch(0.94 0.06 60)"  },
  grade2:     { key: "grade2",      color: "oklch(0.55 0.18 35)",  swatch: "oklch(0.92 0.07 35)"  },
  grade3:     { key: "grade3",      color: "oklch(0.45 0.20 25)",  swatch: "oklch(0.90 0.08 25)"  },
};

function categorize(sys, dia) {
  if (sys < 90 || dia < 60) return CATEGORIES.low;
  if (sys >= 180 || dia >= 110) return CATEGORIES.grade3;
  if (sys >= 160 || dia >= 100) return CATEGORIES.grade2;
  if (sys >= 140 || dia >= 90)  return CATEGORIES.grade1;
  if (sys >= 130 || dia >= 85)  return CATEGORIES.high_normal;
  if (sys >= 120 || dia >= 80)  return CATEGORIES.normal;
  return CATEGORIES.optimal;
}

// ── Seed data — 21 realistic entries spread across ~5 weeks ────────────────
function buildSeed() {
  const now = new Date();
  // Anchor "now" at 9am today so seed is stable across reloads within a day.
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const make = (daysAgo, hours, minutes, sys, dia, pul, comment = "") => {
    const d = new Date(base);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(hours, minutes, 0, 0);
    return {
      id: "seed-" + daysAgo + "-" + hours + "-" + minutes,
      ts: d.getTime(), sys, dia, pul, comment,
    };
  };
  return [
    make(0,  7, 12, 128, 82, 71, "After morning walk"),
    make(0, 19, 45, 134, 86, 76, ""),
    make(1,  7, 30, 142, 91, 78, "Slept poorly"),
    make(1, 20,  5, 131, 84, 72, ""),
    make(2,  8,  0, 125, 79, 68, ""),
    make(3,  7, 50, 138, 88, 74, "After coffee"),
    make(3, 21, 10, 129, 81, 70, ""),
    make(5,  8, 15, 147, 95, 82, "Stressful day at work"),
    make(6,  7, 40, 122, 78, 66, ""),
    make(7, 19, 30, 119, 76, 64, "Evening, relaxed"),
    make(9,  8,  5, 152, 98, 85, "Forgot medication"),
    make(10, 7, 25, 133, 85, 71, ""),
    make(12, 8, 30, 127, 80, 69, ""),
    make(14, 7, 55, 141, 90, 77, ""),
    make(16, 20, 15, 124, 79, 67, ""),
    make(18, 7, 35, 136, 86, 73, "Light headache"),
    make(21, 8, 10, 118, 75, 65, ""),
    make(24, 7, 45, 145, 93, 80, ""),
    make(27, 8, 20, 130, 82, 70, ""),
    make(30, 7, 50, 138, 88, 75, ""),
    make(34, 8,  0, 126, 80, 68, "Vacation, very calm"),
  ];
}

// ── Date helpers ────────────────────────────────────────────────────────────
function pad(n) { return n < 10 ? "0" + n : "" + n; }
function toISODate(ts) {
  const d = new Date(ts);
  return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
}
function toISOTime(ts) {
  const d = new Date(ts);
  return pad(d.getHours()) + ":" + pad(d.getMinutes());
}
function fromInputs(date, time) {
  // date: "YYYY-MM-DD", time: "HH:MM"
  const [y, m, d] = date.split("-").map(Number);
  const [h, min] = time.split(":").map(Number);
  return new Date(y, m - 1, d, h, min, 0, 0).getTime();
}
function formatDate(ts, lang) {
  const d = new Date(ts);
  return d.toLocaleDateString(lang === "de" ? "de-DE" : "en-GB", {
    day: "2-digit", month: "short", year: "numeric",
  });
}
function formatTime(ts, lang) {
  const d = new Date(ts);
  return d.toLocaleTimeString(lang === "de" ? "de-DE" : "en-GB", {
    hour: "2-digit", minute: "2-digit",
  });
}
function relativeDay(ts, lang, t) {
  const now = new Date();
  const d = new Date(ts);
  const startOfDay = (x) => new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime();
  const diffDays = Math.round((startOfDay(now) - startOfDay(d)) / 86400000);
  if (diffDays === 0) return t.today;
  if (diffDays === 1) return t.yesterday;
  if (diffDays > 1 && diffDays < 14) return diffDays + (lang === "de" ? " T" : "d");
  return formatDate(ts, lang);
}

// ── IndexedDB ───────────────────────────────────────────────────────────────
const DB_NAME = "bp-diary";
const DB_VERSION = 1;
const STORE_NAME = "entries";

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("ts", "ts");
      }
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

function dbGetAll() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const req = tx.objectStore(STORE_NAME).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));
}

function dbPut(entry) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).put(entry);
    req.onsuccess = () => resolve(entry);
    req.onerror = () => reject(req.error);
  }));
}

function dbDelete(id) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  }));
}

function dbClear() {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const req = tx.objectStore(STORE_NAME).clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  }));
}

// ── JSON import/export ──────────────────────────────────────────────────────
function exportJSON(entries) {
  const payload = {
    version: 1,
    exported: new Date().toISOString(),
    entries,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "bp-diary-" + toISODate(Date.now()) + ".json";
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 100);
}

function importJSON() {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json,application/json";
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return resolve(null);
      file.text().then(text => {
        try {
          const data = JSON.parse(text);
          const list = Array.isArray(data) ? data : data && data.entries;
          if (!Array.isArray(list)) return reject(new Error("not an array"));
          const valid = list.filter(e =>
            e && typeof e.id === "string" &&
            typeof e.ts === "number" &&
            typeof e.sys === "number" &&
            typeof e.dia === "number"
          ).map(e => ({
            id: e.id,
            ts: e.ts,
            sys: e.sys,
            dia: e.dia,
            pul: typeof e.pul === "number" ? e.pul : null,
            comment: typeof e.comment === "string" ? e.comment : "",
            arrhythmia: !!e.arrhythmia,
          }));
          if (!valid.length) return reject(new Error("no valid entries"));
          resolve(valid);
        } catch (err) {
          reject(err);
        }
      });
    };
    input.click();
  });
}

Object.assign(window, {
  I18N, MEASURE_TIPS, CATEGORIES, categorize, buildSeed,
  toISODate, toISOTime, fromInputs, formatDate, formatTime, relativeDay,
  dbGetAll, dbPut, dbDelete, dbClear, exportJSON, importJSON,
});
