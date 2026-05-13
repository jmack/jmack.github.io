import { describe, it } from "node:test";
import { strict as assert } from "node:assert";
import { readFileSync } from "node:fs";
import {
  classifyFictionNonfiction,
  classifyInformational,
  mapFictionGenre,
  collectSubjectBlob,
} from "../mapping.js";

const fixtures = JSON.parse(
  readFileSync(new URL("./fixtures.json", import.meta.url), "utf-8"),
);

const fiction = fixtures.filter((f) => f.expectedBranch === "fiction");
const nonfiction = fixtures.filter((f) => f.expectedBranch === "nonfiction");

describe("Fiction vs Nonfiction", () => {
  for (const f of fixtures) {
    it(`${f.isbn} "${f.edition.title}" → ${f.expectedBranch}`, () => {
      const branch = classifyFictionNonfiction(f.edition, f.work);
      assert.equal(
        branch,
        f.expectedBranch,
        `Expected ${f.expectedBranch} but got ${branch}`,
      );
    });
  }
});

describe("Fiction genre", () => {
  for (const f of fiction) {
    it(`${f.isbn} "${f.edition.title}" → ${f.expectedCategory}`, () => {
      const title = String(f.edition.title || f.work?.title || "");
      const blob =
        `${collectSubjectBlob(f.edition, f.work)} ${title}`.toLowerCase();
      const genre = mapFictionGenre(blob);
      assert.equal(
        genre,
        f.expectedCategory,
        `Expected ${f.expectedCategory} but got ${genre}`,
      );
    });
  }
});

describe("Informational category", () => {
  for (const f of nonfiction) {
    it(`${f.isbn} "${f.edition.title}" → ${f.expectedCategory}`, () => {
      const category = classifyInformational(f.edition, f.work);
      assert.equal(
        category,
        f.expectedCategory,
        `Expected ${f.expectedCategory} but got ${category}`,
      );
    });
  }
});
