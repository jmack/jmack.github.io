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
| [scripts/serve-local.ps1](scripts/serve-local.ps1) | Local HTTP server for `fetch()` / JSON (Python) |

## Local preview

Run the script (it `Set-Location`s to the repo root next to `scripts/`):

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File path\to\jmack.github.io\scripts\serve-local.ps1
```

From the repo root you can use `.\scripts\serve-local.ps1` instead. Optional port: `-Port 9000`. Open `http://127.0.0.1:8765/` (or your port). A local server is required so `fetch()` can load JSON (not `file://`).

## Category images (`assets/labels/*.png`)

Numbered exports are wired in the JSON manifests as follows (if your sheet order differs, renumber files or edit the manifests):

| Files | Chart | Order |
| --- | --- | --- |
| `1.png`–`20.png` | Fiction (3×8), **excluding** the four unused tiles | **Row-major**: left→right, top→bottom (Realistic → … → Classic). |
| `21.png`–`24.png` | Same grid, bottom-right “extra” tiles from the poster | **Not** assigned in the app (Informational / Awards / TV / Class favorites). |
| `25.png`–`51.png` | Informational (9×3) | **Row-major** each row left→right (row 1: general / chemistry / pets … row 9: physics / transportation / American history). |
| `52.png` | — | **Graphic novel / comic** (not on the original fiction poster). |

Replace paths in [data/fiction.json](data/fiction.json) and [data/informational.json](data/informational.json) if your export order is column-first instead.
