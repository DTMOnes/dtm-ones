import assert from "node:assert/strict";
import { test } from "node:test";

import type { ContactRequest } from "@/types/contact-request";
import {
  inboxFilterCounts,
  isContactsInboxFilter,
  visibleInboxRequests,
} from "./contacts-inbox";

function request(
  partial: Pick<ContactRequest, "id" | "status" | "createdAt">,
): ContactRequest {
  return {
    reason: "seeking_representation",
    email: "alex@example.com",
    phone: "+1234567890",
    message: "I would like representation.",
    ...partial,
  };
}

test("inboxFilterCounts totals active as new plus read", () => {
  const counts = inboxFilterCounts([
    request({ id: "1", status: "new", createdAt: new Date("2026-01-01") }),
    request({ id: "2", status: "new", createdAt: new Date("2026-01-02") }),
    request({ id: "3", status: "read", createdAt: new Date("2026-01-03") }),
    request({
      id: "4",
      status: "archived",
      createdAt: new Date("2026-01-04"),
    }),
  ]);

  assert.deepEqual(counts, { active: 3, new: 2, read: 1, archived: 1 });
});

test("visible active requests put new before read, newest first within status", () => {
  const visible = visibleInboxRequests(
    [
      request({
        id: "older-read",
        status: "read",
        createdAt: new Date("2026-01-02"),
      }),
      request({
        id: "archived",
        status: "archived",
        createdAt: new Date("2026-01-05"),
      }),
      request({
        id: "older-new",
        status: "new",
        createdAt: new Date("2026-01-01"),
      }),
      request({
        id: "newer-read",
        status: "read",
        createdAt: new Date("2026-01-04"),
      }),
      request({
        id: "newer-new",
        status: "new",
        createdAt: new Date("2026-01-03"),
      }),
    ],
    "active",
  );

  assert.deepEqual(
    visible.map((row) => row.id),
    ["newer-new", "older-new", "newer-read", "older-read"],
  );
});

test("isContactsInboxFilter accepts only inbox buckets", () => {
  assert.equal(isContactsInboxFilter("active"), true);
  assert.equal(isContactsInboxFilter("new"), true);
  assert.equal(isContactsInboxFilter("trash"), false);
});
