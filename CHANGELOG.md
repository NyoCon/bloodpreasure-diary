# Changelog

## [1.0.0] – 2026-05-02

### Added

- Log blood pressure readings with date, time, SYS, DIA, optional pulse (PUL), free-text comment, and arrhythmia flag
- Automatic classification per ESH/ESC guidelines: Optimal, Normal, High-normal, Grade 1 (mild), Grade 2 (moderate), Grade 3 (severe), Low
- Trend chart (SYS / DIA / PUL) with daily aggregation, reference bands, and hover tooltip (powered by Recharts)
- Summary cards showing average SYS/DIA and average pulse for the filtered range
- Filtering by quick time range (last 7 days, last 30 days, all time, custom date picker) and numeric value filters with operators (>, ≥, =, <, ≤) on SYS, DIA, and PUL
- Sortable entries table with compact density
- PDF export with configurable date range, optional trend chart, and optional category column
- JSON export and import — full data backup/restore with add-to-existing or replace-all modes
- Pulse visibility toggle — hides PUL column, summary card, and chart line; persisted in localStorage
- Arrhythmia flag per entry — checkbox in the entry form, red badge in the entries table
- Clickable comment icon in the table opens a comment detail modal directly
- How-to-measure guide — 7-step technique reference based on ESH/ESC recommendations
- Bilingual interface (English / German) with localStorage persistence
- Per-row action menu with edit, delete, and view-comment actions
- Progressive Web App — installable on mobile and desktop, offline-capable via service worker (cache-first strategy)
- Auto-reload when a new service worker version activates, ensuring users always see the latest version
- Docker production setup (nginx:alpine, no build step)
- Docker development setup (browser-sync with bind mount, instant hot reload)
- All data stored in browser IndexedDB — no backend, no account required
