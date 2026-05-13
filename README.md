# jmack.github.io

Static **ISBN label reference** site for GitHub Pages: scan ISBNs, look up metadata, and group books by fiction genre or informational category.

## Layout

| Path | Purpose |
| --- | --- |
| [index.html](index.html) | App shell: sticky header (ISBN + clear), main, FAB |
| [styles.css](styles.css) | Base layout and components |
| [app.js](app.js) | ES module: Open Library lookup, Dewey/genre mapping, grouped UI, `localStorage`, scan UX |
| [mapping.js](mapping.js) | Fiction vs non-fiction rules, Dewey → informational ranges, fiction genre keywords |
| [data/fiction.json](data/fiction.json) | 21 fiction categories → `displayName`, `image` |
| [data/informational.json](data/informational.json) | 27 informational categories → `displayName`, `image` |
| [assets/labels/category-placeholder.png](assets/labels/category-placeholder.png) | Fallback when an image path is missing |
| [scripts/serve-local.ps1](scripts/serve-local.ps1) | Local HTTP server for Windows (PowerShell + Python) |
| [scripts/serve-local.sh](scripts/serve-local.sh) | Local HTTP server for macOS / Linux (Bash + Python) |

## Local preview

### macOS / Linux

```bash
./scripts/serve-local.sh          # default port 8765
./scripts/serve-local.sh 9000     # custom port
```

### Windows (PowerShell)

```powershell
.\scripts\serve-local.ps1            # default port 8765
.\scripts\serve-local.ps1 -Port 9000 # custom port
```

Open `http://127.0.0.1:8765/` (or your chosen port). A local server is required so `fetch()` can load the JSON manifests (not `file://`).

## Category images (`assets/labels/*.png`)

Label images are named after their category key (e.g. `fantasy.png`, `chemistry.png`). The mapping is defined in the JSON manifests:

- **Fiction** (21 categories) — see [data/fiction.json](data/fiction.json)
- **Informational** (27 categories) — see [data/informational.json](data/informational.json)

Files `21.png`–`24.png` are unused tiles from the original poster grid (Informational / Awards / TV / Class favorites).
