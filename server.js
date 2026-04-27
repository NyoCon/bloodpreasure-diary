const express = require('express');
const Database = require('better-sqlite3');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

// ── Database ─────────────────────────────────────────────────────────────────
const db = new Database(path.join(DATA_DIR, 'entries.db'));
db.exec(`
  CREATE TABLE IF NOT EXISTS entries (
    id      TEXT PRIMARY KEY,
    ts      INTEGER NOT NULL,
    sys     INTEGER NOT NULL,
    dia     INTEGER NOT NULL,
    pul     INTEGER,
    comment TEXT NOT NULL DEFAULT ''
  )
`);

// Seed on first run
if (db.prepare('SELECT COUNT(*) AS n FROM entries').get().n === 0) {
  const insert = db.prepare(
    'INSERT INTO entries (id, ts, sys, dia, pul, comment) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const make = (daysAgo, h, m, sys, dia, pul, comment = '') => {
    const d = new Date(base);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(h, m, 0, 0);
    return { id: `seed-${daysAgo}-${h}-${m}`, ts: d.getTime(), sys, dia, pul, comment };
  };
  const seed = [
    make(0,  7, 12, 128, 82, 71, 'After morning walk'),
    make(0, 19, 45, 134, 86, 76, ''),
    make(1,  7, 30, 142, 91, 78, 'Slept poorly'),
    make(1, 20,  5, 131, 84, 72, ''),
    make(2,  8,  0, 125, 79, 68, ''),
    make(3,  7, 50, 138, 88, 74, 'After coffee'),
    make(3, 21, 10, 129, 81, 70, ''),
    make(5,  8, 15, 147, 95, 82, 'Stressful day at work'),
    make(6,  7, 40, 122, 78, 66, ''),
    make(7, 19, 30, 119, 76, 64, 'Evening, relaxed'),
    make(9,  8,  5, 152, 98, 85, 'Forgot medication'),
    make(10, 7, 25, 133, 85, 71, ''),
    make(12, 8, 30, 127, 80, 69, ''),
    make(14, 7, 55, 141, 90, 77, ''),
    make(16, 20, 15, 124, 79, 67, ''),
    make(18, 7, 35, 136, 86, 73, 'Light headache'),
    make(21, 8, 10, 118, 75, 65, ''),
    make(24, 7, 45, 145, 93, 80, ''),
    make(27, 8, 20, 130, 82, 70, ''),
    make(30, 7, 50, 138, 88, 75, ''),
    make(34, 8,  0, 126, 80, 68, 'Vacation, very calm'),
  ];
  db.transaction(rows => {
    for (const r of rows) insert.run(r.id, r.ts, r.sys, r.dia, r.pul, r.comment);
  })(seed);
  console.log('Seeded database with demo entries.');
}

// ── Livereload ────────────────────────────────────────────────────────────────
const lrServer = livereload.createServer({ port: 35729 });
lrServer.watch(__dirname);

// ── Express ───────────────────────────────────────────────────────────────────
const app = express();
app.use(connectLivereload({ port: 35729 }));
app.use(express.json());
app.use(express.static(__dirname));

// ── API ───────────────────────────────────────────────────────────────────────
app.get('/api/entries', (_req, res) => {
  res.json(db.prepare('SELECT * FROM entries ORDER BY ts DESC').all());
});

app.post('/api/entries', (req, res) => {
  const { id, ts, sys, dia, pul, comment } = req.body;
  db.prepare('INSERT INTO entries (id, ts, sys, dia, pul, comment) VALUES (?, ?, ?, ?, ?, ?)')
    .run(id, ts, sys, dia, pul ?? null, comment ?? '');
  res.status(201).json(req.body);
});

app.put('/api/entries/:id', (req, res) => {
  const { ts, sys, dia, pul, comment } = req.body;
  const info = db.prepare(
    'UPDATE entries SET ts=?, sys=?, dia=?, pul=?, comment=? WHERE id=?'
  ).run(ts, sys, dia, pul ?? null, comment ?? '', req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'not found' });
  res.json({ ...req.body, id: req.params.id });
});

app.delete('/api/entries/:id', (req, res) => {
  db.prepare('DELETE FROM entries WHERE id=?').run(req.params.id);
  res.json({ ok: true });
});

app.listen(8080, () => console.log('Running on http://localhost:8080'));
