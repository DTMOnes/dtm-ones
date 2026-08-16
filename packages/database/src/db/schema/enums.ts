import { pgEnum } from "drizzle-orm/pg-core";

export const clientKind = pgEnum("client_kind", ["player", "coach"]);

export const clientVisibility = pgEnum("client_visibility", ["public", "private"]);

export const contactRequestReason = pgEnum("contact_request_reason", [
  "seeking_representation",
  "looking_for_a_player",
]);

export const contactRequestStatus = pgEnum("contact_request_status", [
  "new",
  "read",
  "archived",
]);

export const userRole = pgEnum("user_role", ["owner", "staff"]);
