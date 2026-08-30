import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  isDesktopFilterActive,
  isMobileSearchControlActive,
} from "./search-chrome-active";

describe("isDesktopFilterActive", () => {
  it("is false for search-only", () => {
    assert.equal(
      isDesktopFilterActive({ c: null, kind: null }),
      false,
    );
  });

  it("is true for category or coaches", () => {
    assert.equal(
      isDesktopFilterActive({ c: "uuid", kind: null }),
      true,
    );
    assert.equal(
      isDesktopFilterActive({ c: null, kind: "coach" }),
      true,
    );
  });
});

describe("isMobileSearchControlActive", () => {
  it("is true for q, c, or kind", () => {
    assert.equal(
      isMobileSearchControlActive({ q: "ana", c: null, kind: null }),
      true,
    );
    assert.equal(
      isMobileSearchControlActive({ q: null, c: "uuid", kind: null }),
      true,
    );
    assert.equal(
      isMobileSearchControlActive({ q: "  ", c: null, kind: null }),
      false,
    );
  });
});
