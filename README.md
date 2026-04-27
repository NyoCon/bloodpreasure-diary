# Blood Pressure Diary

A personal blood pressure diary web app. Log readings, filter and visualise trends, and export to PDF. Bilingual (EN/DE), categorised according to ESH/ESC guidelines.

## Running with Docker

### Requirements

- Docker
- Docker Compose

### Start

```bash
docker compose up --build
```

The app is then available at [http://localhost:8080](http://localhost:8080).

On first launch the database is automatically seeded with demo entries.

### Stop

```bash
docker compose down
```

---

## Data Persistence

### Default: Docker Named Volume

By default the app stores the SQLite database in a Docker-managed volume (`db-data`). Data is retained as long as the volume exists — including across `docker compose down`. Only `docker compose down -v` removes the volume and deletes all data.

### External: Bind Mount to a Host Directory

To store the database at a specific location on the host (e.g. for backups), update `docker-compose.yml` as follows:

```yaml
services:
  app:
    volumes:
      - .:/app
      - /app/node_modules
      - /path/to/your/data:/app/data   # ← your own directory

volumes:             # ← this section can then be removed
  db-data:
```

The specified directory must exist and be writable. The database file is named `entries.db`.

**Example using a directory in the home folder:**

```yaml
- /home/lars/blutdruck-data:/app/data
```

### Backup

The entire database consists of a single file:

```bash
# Named volume: copy the file out of the container
docker cp blutdruck-tagebuch_app_1:/app/data/entries.db ./backup-entries.db

# Bind mount: copy directly from the host
cp /path/to/your/data/entries.db ./backup-entries.db
```
