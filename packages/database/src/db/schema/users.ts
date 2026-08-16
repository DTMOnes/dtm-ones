import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

import { user } from "./auth";
import { userRole } from "./enums";

export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  email: text("email").notNull().unique(),
  role: userRole("role").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});
