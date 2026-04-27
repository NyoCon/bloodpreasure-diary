# Blutdruck Tagebuch

Persönliches Blutdrucktagebuch als Web-App. Messungen erfassen, filtern, als Trend visualisieren und als PDF exportieren. Zweisprachig (DE/EN), kategorisiert nach ESH/ESC-Leitlinien.

## Betrieb mit Docker

### Voraussetzungen

- Docker
- Docker Compose

### Starten

```bash
docker compose up --build
```

Die App ist anschließend unter [http://localhost:8080](http://localhost:8080) erreichbar.

Beim ersten Start wird die Datenbank automatisch mit Demo-Einträgen befüllt.

### Stoppen

```bash
docker compose down
```

---

## Datenpersistenz

### Standard: Docker Named Volume

Standardmäßig speichert die App die SQLite-Datenbank in einem Docker-verwalteten Volume (`db-data`). Die Daten bleiben erhalten, solange das Volume existiert — also auch nach einem `docker compose down`. Erst `docker compose down -v` löscht das Volume und damit alle Daten.

### Extern: Bind Mount auf ein Host-Verzeichnis

Um die Datenbank an einem eigenen Ort auf dem Host zu speichern (z. B. für Backups), die `docker-compose.yml` wie folgt anpassen:

```yaml
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
      - /pfad/zum/datenverzeichnis:/app/data   # ← eigenes Verzeichnis

volumes:             # ← diese Sektion kann dann entfernt werden
  db-data:
```

Das angegebene Verzeichnis muss existieren und beschreibbar sein. Die Datenbankdatei heißt `entries.db`.

**Beispiel mit einem Verzeichnis im Home-Ordner:**

```yaml
- /home/lars/blutdruck-data:/app/data
```

### Backup

Die gesamte Datenbank besteht aus einer einzigen Datei:

```bash
# Named Volume: Datei aus dem Container kopieren
docker cp blutdruck-tagebuch_app_1:/app/data/entries.db ./backup-entries.db

# Bind Mount: Datei direkt vom Host sichern
cp /pfad/zum/datenverzeichnis/entries.db ./backup-entries.db
```
