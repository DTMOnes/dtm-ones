import assert from "node:assert/strict";
import { test } from "node:test";

import {
  setCoachVisibilitySchema,
  updateCoachSchema,
} from "./coaches";

test("update Coach treats an empty Eurobasket URL as absent", () => {
  const parsed = updateCoachSchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
    eurobasketLink: "",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(parsed.data.eurobasketLink, null);
  }
});

test("update Coach accepts a Eurobasket URL", () => {
  const parsed = updateCoachSchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    name: "Pat Riley",
    nationality: "USA",
    lastClub: "Miami Heat",
    eurobasketLink: "https://basketball.eurobasket.com/coach/Pat-Riley/1",
  });

  assert.equal(parsed.success, true);
  if (parsed.success) {
    assert.equal(
      parsed.data.eurobasketLink,
      "https://basketball.eurobasket.com/coach/Pat-Riley/1",
    );
  }
});

test("Visibility is public or private", () => {
  const parsed = setCoachVisibilitySchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    visibility: "public",
  });
  assert.equal(parsed.success, true);

  const draft = setCoachVisibilitySchema.safeParse({
    id: "00000000-0000-4000-8000-000000000001",
    visibility: "draft",
  });
  assert.equal(draft.success, false);
});
