import {
  classifyFictionNonfiction,
  collectSubjectBlob,
  deweyToInformationalKey,
  mapFictionGenre,
  parsePrimaryDewey,
} from "./mapping.js";

/**
 * @typedef {{ version: number, defaultImage: string, categories: Record<string, { displayName: string, image: string }> }} CategoryManifest
 * @typedef {{ id: string, isbn: string, title: string, state: "ok"|"error", branch: "fiction"|"nonfiction"|null, categoryKey: string|null, errorMessage: string|null }} BookRow
 */

const MANIFEST_URLS = {
  fiction: "data/fiction.json",
  informational: "data/informational.json",
};

const STORAGE_KEY = "labelReferenceRows_v1";

/** @type {CategoryManifest | null} */
let fictionManifest = null;
/** @type {CategoryManifest | null} */
let informationalManifest = null;

/** @type {BookRow[]} */
let rows = [];

/**
 * @param {string} url
 * @returns {Promise<CategoryManifest>}
 */
async function loadManifest(url) {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) {
    throw new Error(`Failed to load ${url}: ${res.status}`);
  }
  return res.json();
}

function validateManifest(manifest, label) {
  if (!manifest || typeof manifest.categories !== "object") {
    throw new Error(`${label}: invalid manifest`);
  }
  const keys = Object.keys(manifest.categories);
  if (keys.length === 0) {
    throw new Error(`${label}: no categories`);
  }
  for (const key of keys) {
    const c = manifest.categories[key];
    if (!c.displayName || !c.image) {
      throw new Error(`${label}: missing displayName/image for ${key}`);
    }
  }
}

function setBootStatus(message, isError) {
  const el = document.getElementById("boot-status");
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
  el.style.color = isError ? "var(--danger)" : "";
}

function hideBootStatus() {
  const el = document.getElementById("boot-status");
  if (el) el.hidden = true;
}

function newRowId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * @param {string} raw
 * @returns {string|null}
 */
function normalizeIsbn(raw) {
  const cleaned = String(raw).replace(/[^0-9Xx]/g, "").toUpperCase();
  if (!/^\d{9}[\dX]$|^\d{13}$/.test(cleaned)) {
    return null;
  }
  return cleaned;
}

function loadRowsFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (!Array.isArray(data)) return;
    rows = data.filter(
      (r) =>
        r &&
        typeof r.id === "string" &&
        typeof r.isbn === "string" &&
        typeof r.title === "string" &&
        (r.state === "ok" || r.state === "error"),
    );
  } catch {
    rows = [];
  }
}

function saveRowsToStorage() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
  } catch {
    /* ignore quota */
  }
}

/**
 * @param {string} isbn
 * @returns {BookRow|null}
 */
function findRowByIsbn(isbn) {
  return rows.find((r) => r.isbn === isbn) ?? null;
}

/**
 * @param {string} isbn
 * @param {object} edition
 * @param {object|null} work
 * @returns {BookRow}
 */
function buildRowFromOpenLibrary(isbn, edition, work) {
  const title = String(edition.title || work?.title || "Unknown title");
  const branch = classifyFictionNonfiction(edition, work);

  if (branch === "fiction") {
    const blob = `${collectSubjectBlob(edition, work)} ${title}`.toLowerCase();
    const categoryKey = mapFictionGenre(blob);
    return {
      id: newRowId(),
      isbn,
      title,
      state: "ok",
      branch: "fiction",
      categoryKey,
      errorMessage: null,
    };
  }

  const dewey = parsePrimaryDewey(edition, work);
  if (dewey === null) {
    return {
      id: newRowId(),
      isbn,
      title,
      state: "error",
      branch: "nonfiction",
      categoryKey: null,
      errorMessage:
        "No Dewey decimal found in Open Library for this non-fiction record.",
    };
  }
  const categoryKey = deweyToInformationalKey(dewey);
  return {
    id: newRowId(),
    isbn,
    title,
    state: "ok",
    branch: "nonfiction",
    categoryKey,
    errorMessage: null,
  };
}

/**
 * @param {string} isbn
 */
async function addBookByIsbn(isbn) {
  const edition = await fetch(`https://openlibrary.org/isbn/${isbn}.json`, {
    mode: "cors",
  });
  if (edition.status === 404) {
    rows.push({
      id: newRowId(),
      isbn,
      title: "—",
      state: "error",
      branch: null,
      categoryKey: null,
      errorMessage: "Book not found in Open Library for this ISBN.",
    });
    return;
  }
  if (!edition.ok) {
    throw new Error(`Open Library error ${edition.status}`);
  }
  /** @type {object} */
  const editionJson = await edition.json();
  let work = null;
  const workKey = editionJson.works?.[0]?.key;
  if (workKey) {
    const wr = await fetch(`https://openlibrary.org${workKey}.json`, { mode: "cors" });
    if (wr.ok) {
      work = await wr.json();
    }
  }
  rows.push(buildRowFromOpenLibrary(isbn, editionJson, work));
}

/**
 * @param {string} text
 */
function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

/**
 * @param {string} rowId
 */
function flashRow(rowId) {
  const tr = document.querySelector(`tr[data-row-id="${rowId}"]`);
  if (!tr) return;
  tr.classList.add("row--flash");
  const done = () => {
    tr.classList.remove("row--flash");
  };
  tr.addEventListener("animationend", done, { once: true });
  window.setTimeout(done, 4000);
}

/**
 * @param {string} rowId
 */
function scrollToRow(rowId) {
  const tr = document.querySelector(`tr[data-row-id="${rowId}"]`);
  if (!tr) return;
  tr.scrollIntoView({ behavior: "smooth", block: "center" });
}

/**
 * @param {string} branch
 * @param {string} categoryKey
 * @returns {string}
 */
function categoryImageUrl(branch, categoryKey) {
  const manifest = branch === "fiction" ? fictionManifest : informationalManifest;
  const def = manifest?.defaultImage ?? "assets/labels/category-placeholder.png";
  const cat = manifest?.categories?.[categoryKey];
  return cat?.image ?? def;
}

/**
 * @param {string} branch
 * @param {string} categoryKey
 * @returns {string}
 */
function categoryDisplayName(branch, categoryKey) {
  const manifest = branch === "fiction" ? fictionManifest : informationalManifest;
  return manifest?.categories?.[categoryKey]?.displayName ?? categoryKey;
}

function render() {
  const container = document.getElementById("category-sections");
  const emptyEl = document.getElementById("empty-state");
  if (!container || !fictionManifest || !informationalManifest) return;

  const errors = rows.filter((r) => r.state === "error");
  const ok = rows.filter((r) => r.state === "ok");

  if (emptyEl) {
    emptyEl.hidden = rows.length > 0;
  }

  const fragments = [];

  if (errors.length > 0) {
    const errRows = errors
      .map(
        (r) => `
      <tr data-row-id="${escapeHtml(r.id)}" class="row row--error">
        <td>${escapeHtml(r.isbn)}</td>
        <td>${escapeHtml(r.title)}</td>
        <td class="col-error">${escapeHtml(r.errorMessage || "Error")}</td>
        <td class="col-actions"><button type="button" class="btn-remove" data-remove-id="${escapeHtml(r.id)}" aria-label="Remove">×</button></td>
      </tr>`,
      )
      .join("");
    fragments.push(`
      <section class="category-block category-block--errors" aria-labelledby="needs-attention-heading">
        <header class="category-block__header category-block__header--errors">
          <h2 id="needs-attention-heading" class="category-block__title">Needs attention</h2>
          <p class="category-block__sub">Fix or remove these rows, then rescan if needed.</p>
        </header>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ISBN</th><th>Title</th><th>Detail</th><th></th></tr></thead>
            <tbody>${errRows}</tbody>
          </table>
        </div>
      </section>`);
  }

  /**
   * @param {"fiction"|"nonfiction"} branch
   */
  function sectionsForBranch(branch) {
    const inBranch = ok.filter((r) => r.branch === branch);
    const byKey = new Map();
    for (const r of inBranch) {
      if (!r.categoryKey) continue;
      if (!byKey.has(r.categoryKey)) byKey.set(r.categoryKey, []);
      byKey.get(r.categoryKey).push(r);
    }
    const keys = [...byKey.keys()].sort((a, b) =>
      categoryDisplayName(branch, a).localeCompare(categoryDisplayName(branch, b), undefined, {
        sensitivity: "base",
      }),
    );
    const htmlParts = [];
    for (const key of keys) {
      const list = byKey.get(key) ?? [];
      const display = categoryDisplayName(branch, key);
      const img = categoryImageUrl(branch, key);
      const body = list
        .map(
          (r) => `
        <tr data-row-id="${escapeHtml(r.id)}">
          <td>${escapeHtml(r.isbn)}</td>
          <td>${escapeHtml(r.title)}</td>
          <td class="col-actions"><button type="button" class="btn-remove" data-remove-id="${escapeHtml(r.id)}" aria-label="Remove">×</button></td>
        </tr>`,
        )
        .join("");
      htmlParts.push(`
        <section class="category-block" data-branch="${branch}" data-category-key="${escapeHtml(key)}">
          <header class="category-block__header">
            <img class="category-block__icon" src="${escapeHtml(img)}" width="300" height="300" alt="" loading="lazy" />
            <h2 class="category-block__title">${escapeHtml(display)}</h2>
          </header>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>ISBN</th><th>Title</th><th></th></tr></thead>
              <tbody>${body}</tbody>
            </table>
          </div>
        </section>`);
    }
    return htmlParts.join("");
  }

  const fictionHtml = sectionsForBranch("fiction");
  const nfHtml = sectionsForBranch("nonfiction");
  container.innerHTML = fragments.join("") + fictionHtml + nfHtml;

  container.querySelectorAll("[data-remove-id]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.getAttribute("data-remove-id");
      if (!id) return;
      rows = rows.filter((r) => r.id !== id);
      saveRowsToStorage();
      render();
    });
  });
}

/**
 * @param {string} rowId
 */
function afterRowInserted(rowId) {
  render();
  saveRowsToStorage();
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      scrollToRow(rowId);
      flashRow(rowId);
    });
  });
}

function initIsbnInput() {
  const input = document.getElementById("isbn-input");
  if (!input) return;
  input.addEventListener("keydown", async (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    const raw = input.value;
    input.value = "";

    const isbn = normalizeIsbn(raw);
    if (!isbn) {
      const errId = newRowId();
      rows.push({
        id: errId,
        isbn: raw.trim() || "—",
        title: "—",
        state: "error",
        branch: null,
        categoryKey: null,
        errorMessage: "Invalid ISBN (use 10 or 13 digits).",
      });
      afterRowInserted(errId);
      input.focus();
      return;
    }

    const existing = findRowByIsbn(isbn);
    if (existing) {
      render();
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          scrollToRow(existing.id);
          flashRow(existing.id);
        });
      });
      input.focus();
      return;
    }

    try {
      await addBookByIsbn(isbn);
      const last = rows[rows.length - 1];
      if (last) afterRowInserted(last.id);
    } catch (err) {
      console.error(err);
      const errId = newRowId();
      rows.push({
        id: errId,
        isbn,
        title: "—",
        state: "error",
        branch: null,
        categoryKey: null,
        errorMessage:
          err instanceof Error ? err.message : "Could not reach Open Library.",
      });
      afterRowInserted(errId);
    }
    input.focus();
  });
}

function initClearButton() {
  const clearBtn = document.getElementById("clear-all-btn");
  if (!clearBtn) return;
  clearBtn.disabled = false;
  clearBtn.addEventListener("click", () => {
    if (!window.confirm("Clear all scanned books from this device?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    rows = [];
    render();
    document.getElementById("isbn-input")?.focus();
  });
}

function initFab() {
  const fab = document.getElementById("fab-top");
  if (!fab) return;
  const threshold = 120;
  const onScroll = () => {
    fab.hidden = window.scrollY <= threshold;
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  fab.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("isbn-input")?.focus();
  });
}

async function init() {
  try {
    const [fiction, informational] = await Promise.all([
      loadManifest(MANIFEST_URLS.fiction),
      loadManifest(MANIFEST_URLS.informational),
    ]);
    validateManifest(fiction, "Fiction");
    validateManifest(informational, "Informational");

    fictionManifest = fiction;
    informationalManifest = informational;

    window.__LABEL_REFERENCE__ = {
      fiction: fictionManifest,
      informational: informationalManifest,
      rows,
    };

    hideBootStatus();

    const sections = document.getElementById("category-sections");
    if (sections) sections.hidden = false;

    loadRowsFromStorage();
    render();

    initIsbnInput();
    initClearButton();
    initFab();

    document.getElementById("isbn-input")?.focus();
  } catch (err) {
    console.error(err);
    setBootStatus(err instanceof Error ? err.message : "Failed to load app data.", true);
  }
}

init();
