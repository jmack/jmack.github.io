import {
  classifyFictionNonfiction,
  classifyInformational,
  collectSubjectBlob,
  mapFictionGenre,
} from "./mapping.js";

/**
 * @typedef {{
 *   version: number,
 *   defaultImage: string,
 *   categories: Record<string, { displayName: string, image: string }>
 * }} CategoryManifest
 *
 * @typedef {{
 *   id: string,
 *   isbn: string,
 *   title: string,
 *   state: "ok" | "error",
 *   branch: "fiction" | "nonfiction" | null,
 *   categoryKey: string | null,
 *   errorMessage: string | null
 * }} BookRow
 */

// ---------------------------------------------------------------------------
//  Constants
// ---------------------------------------------------------------------------

const MANIFEST_URLS = {
  fiction: "data/fiction.json",
  informational: "data/informational.json",
};

const STORAGE_KEY = "labelReferenceRows_v1";
const AUTO_SUBMIT_DELAY_MS = 400;

const ISBN_10_RE = /^\d{9}[\dX]$/;
const ISBN_13_RE = /^\d{13}$/;

// ---------------------------------------------------------------------------
//  Safe HTML tagged template
// ---------------------------------------------------------------------------

class SafeString {
  /** @param {string} value */
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

function escapeHtml(text) {
  const el = document.createElement("span");
  el.textContent = String(text);
  return el.innerHTML;
}

/**
 * Tagged template that auto-escapes interpolated values.
 * Returns a SafeString so nested html`` calls compose without double-escaping.
 * Arrays of SafeStrings are concatenated as raw HTML.
 */
function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) {
    const val = values[i];
    if (val instanceof SafeString) {
      out += val.value;
    } else if (Array.isArray(val)) {
      out += val
        .map((v) => (v instanceof SafeString ? v.value : escapeHtml(v)))
        .join("");
    } else {
      out += escapeHtml(val);
    }
    out += strings[i + 1];
  }
  return new SafeString(out);
}

// ---------------------------------------------------------------------------
//  State
// ---------------------------------------------------------------------------

/** @type {CategoryManifest | null} */
let fictionManifest = null;

/** @type {CategoryManifest | null} */
let informationalManifest = null;

/** @type {BookRow[]} */
let rows = [];

/** Guards against overlapping lookups from rapid input. */
let isLookupInProgress = false;

// ---------------------------------------------------------------------------
//  Manifest loading
// ---------------------------------------------------------------------------

/** @param {string} url */
async function loadManifest(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}: ${res.status}`);
  return /** @type {Promise<CategoryManifest>} */ (res.json());
}

function validateManifest(manifest, label) {
  if (!manifest || typeof manifest.categories !== "object") {
    throw new Error(`${label}: invalid manifest`);
  }
  for (const [key, cat] of Object.entries(manifest.categories)) {
    if (!cat.displayName || !cat.image) {
      throw new Error(`${label}: missing displayName/image for ${key}`);
    }
  }
}

// ---------------------------------------------------------------------------
//  Boot status
// ---------------------------------------------------------------------------

function setBootStatus(message, isError = false) {
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

// ---------------------------------------------------------------------------
//  Helpers
// ---------------------------------------------------------------------------

function generateId() {
  if (crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** @returns {string | null} Cleaned ISBN or null when invalid. */
function normalizeIsbn(raw) {
  const cleaned = String(raw).replace(/[^0-9Xx]/g, "").toUpperCase();
  if (ISBN_10_RE.test(cleaned) || ISBN_13_RE.test(cleaned)) return cleaned;
  return null;
}

/** Schedule a callback after two animation frames (lets the DOM settle). */
function afterPaint(fn) {
  requestAnimationFrame(() => requestAnimationFrame(fn));
}

// ---------------------------------------------------------------------------
//  Local storage
// ---------------------------------------------------------------------------

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
    /* quota exceeded — silently ignore */
  }
}

// ---------------------------------------------------------------------------
//  Row helpers
// ---------------------------------------------------------------------------

/** @returns {BookRow | null} */
function findRowByIsbn(isbn) {
  return rows.find((r) => r.isbn === isbn) ?? null;
}

function makeErrorRow(isbn, message) {
  return /** @type {BookRow} */ ({
    id: generateId(),
    isbn,
    title: "—",
    state: "error",
    branch: null,
    categoryKey: null,
    errorMessage: message,
  });
}

/**
 * Build a categorised row from Open Library edition + work data.
 * @param {string} isbn
 * @param {object} edition
 * @param {object | null} work
 * @returns {BookRow}
 */
function buildRow(isbn, edition, work) {
  const title = String(edition.title || work?.title || "Unknown title");
  const branch = classifyFictionNonfiction(edition, work);

  if (branch === "fiction") {
    const blob = `${collectSubjectBlob(edition, work)} ${title}`.toLowerCase();
    return {
      id: generateId(),
      isbn,
      title,
      state: "ok",
      branch: "fiction",
      categoryKey: mapFictionGenre(blob),
      errorMessage: null,
    };
  }

  const categoryKey = classifyInformational(edition, work);
  if (!categoryKey) {
    return {
      id: generateId(),
      isbn,
      title,
      state: "error",
      branch: "nonfiction",
      categoryKey: null,
      errorMessage: "Unable to classify this non-fiction record (no subjects or Dewey data).",
    };
  }

  return {
    id: generateId(),
    isbn,
    title,
    state: "ok",
    branch: "nonfiction",
    categoryKey,
    errorMessage: null,
  };
}

// ---------------------------------------------------------------------------
//  Open Library lookup
// ---------------------------------------------------------------------------

/**
 * Fetch book metadata from Open Library and return a classified BookRow.
 * Does not mutate module state.
 * @param {string} isbn
 * @returns {Promise<BookRow>}
 */
async function lookupIsbn(isbn) {
  const editionRes = await fetch(
    `https://openlibrary.org/isbn/${isbn}.json`,
    { mode: "cors" },
  );

  if (editionRes.status === 404) {
    return makeErrorRow(isbn, "Book not found in Open Library.");
  }
  if (!editionRes.ok) {
    throw new Error(`Open Library error ${editionRes.status}`);
  }

  const edition = await editionRes.json();

  let work = null;
  const workKey = edition.works?.[0]?.key;
  if (workKey) {
    const workRes = await fetch(
      `https://openlibrary.org${workKey}.json`,
      { mode: "cors" },
    );
    if (workRes.ok) work = await workRes.json();
  }

  return buildRow(isbn, edition, work);
}

// ---------------------------------------------------------------------------
//  Manifest → display helpers
// ---------------------------------------------------------------------------

function categoryImageUrl(branch, key) {
  const manifest = branch === "fiction" ? fictionManifest : informationalManifest;
  return manifest?.categories?.[key]?.image
    ?? manifest?.defaultImage
    ?? "assets/labels/category-placeholder.png";
}

function categoryDisplayName(branch, key) {
  const manifest = branch === "fiction" ? fictionManifest : informationalManifest;
  return manifest?.categories?.[key]?.displayName ?? key;
}

// ---------------------------------------------------------------------------
//  Scroll & flash
// ---------------------------------------------------------------------------

function scrollToRow(rowId) {
  const tr = document.querySelector(`tr[data-row-id="${rowId}"]`);
  tr?.scrollIntoView({ behavior: "smooth", block: "center" });
}

function flashRow(rowId) {
  const tr = document.querySelector(`tr[data-row-id="${rowId}"]`);
  if (!tr) return;
  tr.classList.add("row--flash");
  const cleanup = () => tr.classList.remove("row--flash");
  tr.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 4_000);
}

// ---------------------------------------------------------------------------
//  Render
// ---------------------------------------------------------------------------

function render() {
  const container = document.getElementById("category-sections");
  const emptyEl = document.getElementById("empty-state");
  if (!container || !fictionManifest || !informationalManifest) return;

  if (emptyEl) emptyEl.hidden = rows.length > 0;

  const errors = rows.filter((r) => r.state === "error");
  const ok = rows.filter((r) => r.state === "ok");

  const fragments = [];

  if (errors.length > 0) {
    const errorRowsHtml = errors.map(
      (r) => html`
        <tr data-row-id="${r.id}" class="row row--error">
          <td>${r.isbn}</td>
          <td>${r.title}</td>
          <td class="col-error">${r.errorMessage || "Error"}</td>
          <td class="col-actions">
            <button type="button" class="btn-remove" data-remove-id="${r.id}" aria-label="Remove">\u00d7</button>
          </td>
        </tr>`,
    );

    fragments.push(html`
      <section class="category-block category-block--errors" aria-labelledby="needs-attention-heading">
        <header class="category-block__header category-block__header--errors">
          <h2 id="needs-attention-heading" class="category-block__title">Needs attention</h2>
          <span class="category-block__count">${errors.length}</span>
          <p class="category-block__sub">Fix or remove these rows, then rescan if needed.</p>
        </header>
        <div class="table-wrap">
          <table class="data-table">
            <thead><tr><th>ISBN</th><th>Title</th><th>Detail</th><th></th></tr></thead>
            <tbody>${errorRowsHtml}</tbody>
          </table>
        </div>
      </section>`);
  }

  function renderBranch(branch) {
    const branchRows = ok.filter((r) => r.branch === branch);
    const byKey = new Map();
    for (const r of branchRows) {
      if (!r.categoryKey) continue;
      if (!byKey.has(r.categoryKey)) byKey.set(r.categoryKey, []);
      byKey.get(r.categoryKey).push(r);
    }

    const sortedKeys = [...byKey.keys()].sort((a, b) =>
      categoryDisplayName(branch, a).localeCompare(
        categoryDisplayName(branch, b),
        undefined,
        { sensitivity: "base" },
      ),
    );

    return sortedKeys.map((key) => {
      const list = byKey.get(key) ?? [];
      const display = categoryDisplayName(branch, key);
      const img = categoryImageUrl(branch, key);

      const bodyRows = list.map(
        (r) => html`
          <tr data-row-id="${r.id}">
            <td>${r.isbn}</td>
            <td>${r.title}</td>
            <td class="col-actions">
              <button type="button" class="btn-remove" data-remove-id="${r.id}" aria-label="Remove">\u00d7</button>
            </td>
          </tr>`,
      );

      return html`
        <section class="category-block" data-branch="${branch}" data-category-key="${key}">
          <header class="category-block__header">
            <img class="category-block__icon" src="${img}" alt="" loading="lazy" />
            <h2 class="category-block__title">${display}</h2>
            <span class="category-block__count">${list.length}</span>
            <button type="button" class="btn-print-category" aria-label="Print ${display}" title="Print this category"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9V2h12v7"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg></button>
          </header>
          <div class="table-wrap">
            <table class="data-table">
              <thead><tr><th>ISBN</th><th>Title</th><th></th></tr></thead>
              <tbody>${bodyRows}</tbody>
            </table>
          </div>
        </section>`;
    });
  }

  const allSections = [
    ...fragments,
    ...renderBranch("fiction"),
    ...renderBranch("nonfiction"),
  ];
  container.innerHTML = allSections.map((s) => s.value).join("");
  updatePrintAllVisibility();
}

// ---------------------------------------------------------------------------
//  Post-insert animation
// ---------------------------------------------------------------------------

function afterRowInserted(rowId) {
  render();
  saveRowsToStorage();
  afterPaint(() => {
    scrollToRow(rowId);
    flashRow(rowId);
  });
}

// ---------------------------------------------------------------------------
//  ISBN input handling
// ---------------------------------------------------------------------------

function setInputBusy(input, busy) {
  input.classList.toggle("isbn-field__input--busy", busy);
  input.readOnly = busy;
}

async function handleIsbnSubmit(input) {
  if (isLookupInProgress) return;

  const raw = input.value.trim();
  if (!raw) return;

  const isbn = normalizeIsbn(raw);
  input.value = "";

  if (!isbn) {
    const row = makeErrorRow(raw, "Invalid ISBN (use 10 or 13 digits).");
    rows.push(row);
    afterRowInserted(row.id);
    input.focus();
    return;
  }

  const existing = findRowByIsbn(isbn);
  if (existing) {
    render();
    afterPaint(() => {
      scrollToRow(existing.id);
      flashRow(existing.id);
    });
    input.focus();
    return;
  }

  isLookupInProgress = true;
  setInputBusy(input, true);

  try {
    const row = await lookupIsbn(isbn);
    rows.push(row);
    afterRowInserted(row.id);
  } catch (err) {
    console.error(err);
    const row = makeErrorRow(
      isbn,
      err instanceof Error ? err.message : "Could not reach Open Library.",
    );
    rows.push(row);
    afterRowInserted(row.id);
  } finally {
    isLookupInProgress = false;
    setInputBusy(input, false);
    input.focus();
  }
}

function initIsbnInput() {
  const input = /** @type {HTMLInputElement | null} */ (
    document.getElementById("isbn-input")
  );
  if (!input) return;

  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter") return;
    e.preventDefault();
    handleIsbnSubmit(input);
  });

  let autoSubmitTimer = 0;
  input.addEventListener("input", () => {
    clearTimeout(autoSubmitTimer);
    const cleaned = input.value.replace(/[^0-9Xx]/g, "");
    if (cleaned.length === 10 || cleaned.length === 13) {
      if (normalizeIsbn(cleaned)) {
        autoSubmitTimer = setTimeout(() => handleIsbnSubmit(input), AUTO_SUBMIT_DELAY_MS);
      }
    }
  });
}

// ---------------------------------------------------------------------------
//  Event delegation for remove buttons
// ---------------------------------------------------------------------------

function initRemoveButtons() {
  const container = document.getElementById("category-sections");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = /** @type {Element} */ (e.target).closest("[data-remove-id]");
    if (!btn) return;
    const id = btn.getAttribute("data-remove-id");
    if (!id) return;
    rows = rows.filter((r) => r.id !== id);
    saveRowsToStorage();
    render();
  });
}

// ---------------------------------------------------------------------------
//  Clear button
// ---------------------------------------------------------------------------

function initClearButton() {
  const btn = document.getElementById("clear-all-btn");
  if (!btn) return;

  btn.disabled = false;
  btn.addEventListener("click", () => {
    if (!confirm("Clear all scanned books from this device?")) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch { /* ignore */ }
    rows = [];
    render();
    document.getElementById("isbn-input")?.focus();
  });
}

// ---------------------------------------------------------------------------
//  Back-to-top FAB
// ---------------------------------------------------------------------------

function initFab() {
  const fab = document.getElementById("fab-top");
  if (!fab) return;

  const THRESHOLD = 120;
  const onScroll = () => { fab.hidden = window.scrollY <= THRESHOLD; };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  fab.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("isbn-input")?.focus();
  });
}

// ---------------------------------------------------------------------------
//  Print
// ---------------------------------------------------------------------------

function initPrintAll() {
  const btn = document.getElementById("print-all-btn");
  if (!btn) return;
  btn.addEventListener("click", () => window.print());
}

function updatePrintAllVisibility() {
  const btn = document.getElementById("print-all-btn");
  if (!btn) return;
  btn.hidden = rows.filter((r) => r.state === "ok").length === 0;
}

function initPrintCategory() {
  const container = document.getElementById("category-sections");
  if (!container) return;

  container.addEventListener("click", (e) => {
    const btn = /** @type {Element} */ (e.target).closest(".btn-print-category");
    if (!btn) return;

    const section = btn.closest(".category-block");
    if (!section) return;

    document.body.classList.add("printing-single");
    section.classList.add("printing-target");

    const cleanup = () => {
      document.body.classList.remove("printing-single");
      section.classList.remove("printing-target");
    };

    window.addEventListener("afterprint", cleanup, { once: true });
    window.print();
  });
}

// ---------------------------------------------------------------------------
//  Bootstrap
// ---------------------------------------------------------------------------

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

    hideBootStatus();
    const sections = document.getElementById("category-sections");
    if (sections) sections.hidden = false;

    loadRowsFromStorage();
    render();

    initRemoveButtons();
    initIsbnInput();
    initClearButton();
    initFab();
    initPrintAll();
    initPrintCategory();

    document.getElementById("isbn-input")?.focus();
  } catch (err) {
    console.error(err);
    setBootStatus(
      err instanceof Error ? err.message : "Failed to load app data.",
      true,
    );
  }
}

init();
