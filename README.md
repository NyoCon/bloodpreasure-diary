# Blood Pressure Diary · Blutdruck Tagebuch

A personal blood pressure diary — bilingual (EN/DE), runs entirely in the browser with no backend or account required. Log readings, visualise trends, filter by date and value, and export to PDF or JSON.

---

## Features

- **Log readings** — Date, time, systolic (SYS), diastolic (DIA), optional pulse (PUL), free-text comment, and arrhythmia flag
- **Automatic classification** — Each entry is classified per ESH/ESC guidelines: Optimal, Normal, High-normal, Grade 1–3, Low
- **Trend chart** — SYS/DIA/PUL over time with reference bands, daily aggregation, and hover tooltip
- **Summary cards** — Average SYS/DIA and average pulse for the currently filtered range
- **Filtering & sorting** — Quick ranges (7 days, 30 days, all time, custom), value filters with operators (>, >=, =, <, <=), sortable columns
- **PDF export** — Printable report with optional chart and category column
- **JSON export / import** — Full data backup and restore; import can add to or replace existing entries
- **Pulse visibility toggle** — Show or hide pulse column and summary card
- **How-to-measure guide** — 7-step technique guide based on ESH/ESC recommendations
- **Bilingual** — English and German, preference stored in browser
- **PWA** — Installable on mobile and desktop, works offline after first load
- **No backend, no account** — All data lives in the browser's IndexedDB

---

## Running with Docker

### Requirements

- Docker
- Docker Compose

### Production

```bash
docker compose up --build
```

The app is available at [http://localhost:8080](http://localhost:8080).  
On first launch the app loads with demo entries so you can explore the UI immediately.

```bash
docker compose down
```

### Development (hot reload)

```bash
docker compose -f docker-compose.dev.yml up --build
```

Uses [browser-sync](https://browsersync.io/) with a bind mount — any change to `src/`, `index.html`, `sw.js`, or `manifest.json` reloads the browser automatically. No rebuild needed.

---

## Data & Backup

All data is stored in **IndexedDB in the browser** — there is no server-side database. The Docker container only serves static files.

**To back up your data:** open the app → menu (⋮) → *Export data*. This downloads a JSON file with all entries.

**To restore or migrate:** menu → *Import data* → choose your JSON file → add to existing or replace all.

Data is tied to the browser and origin (host + port). Clearing browser site data or switching browsers will lose local data unless you have a JSON export.

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 (CDN), JSX via Babel Standalone |
| Charts | Recharts 2 |
| Storage | IndexedDB (client-side, no server) |
| Styles | Plain CSS, CSS custom properties |
| PDF | Custom SVG renderer (no library) |
| Server | nginx:alpine |
| Dev server | browser-sync (Node:alpine) |
| PWA | Service Worker (cache-first, v9) |

No build step — the app runs directly from source files served by nginx.

---

## License

MIT — see [LICENSE](LICENSE).
