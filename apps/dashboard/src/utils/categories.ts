import { eq } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import type { Category } from "@/types/category";
import { ConflictError, NotFoundError } from "@/utils/errors";

function slugify(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug.length > 0 ? slug : "category";
}

function postgresError(error: unknown): object | null {
  let current: unknown = error;
  while (typeof current === "object" && current !== null) {
    if ("code" in current && typeof current.code === "string") {
      return current;
    }
    current = "cause" in current ? current.cause : undefined;
  }
  return null;
}

function isUniqueViolation(error: unknown): boolean {
  const pgError = postgresError(error);
  return pgError !== null && "code" in pgError && pgError.code === "23505";
}

function isForeignKeyViolation(error: unknown): boolean {
  const pgError = postgresError(error);
  return pgError !== null && "code" in pgError && pgError.code === "23503";
}

export async function createCategory(
  db: Database,
  name: string,
): Promise<Category> {
  try {
    const [row] = await db
      .insert(schema.categories)
      .values({ name, slug: slugify(name) })
      .returning({
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
      });

    if (!row) {
      throw new Error("createCategory returned no row");
    }

    return row;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("A Category with this name already exists.");
    }

    throw error;
  }
}

export async function renameCategory(
  db: Database,
  id: string,
  name: string,
): Promise<Category> {
  try {
    const [row] = await db
      .update(schema.categories)
      .set({ name, slug: slugify(name), updatedAt: new Date() })
      .where(eq(schema.categories.id, id))
      .returning({
        id: schema.categories.id,
        name: schema.categories.name,
        slug: schema.categories.slug,
      });

    if (!row) {
      throw new NotFoundError("Category");
    }

    return row;
  } catch (error) {
    if (isUniqueViolation(error)) {
      throw new ConflictError("A Category with this name already exists.");
    }

    throw error;
  }
}

export async function getCategory(
  db: Database,
  id: string,
): Promise<Category | null> {
  const [row] = await db
    .select({
      id: schema.categories.id,
      name: schema.categories.name,
      slug: schema.categories.slug,
    })
    .from(schema.categories)
    .where(eq(schema.categories.id, id))
    .limit(1);

  return row ?? null;
}

export async function deleteCategory(db: Database, id: string): Promise<void> {
  try {
    const [row] = await db
      .delete(schema.categories)
      .where(eq(schema.categories.id, id))
      .returning({ id: schema.categories.id });

    if (!row) {
      throw new NotFoundError("Category");
    }
  } catch (error) {
    if (isForeignKeyViolation(error)) {
      throw new ConflictError(
        "You cannot delete a Category while a Player has it.",
      );
    }

    throw error;
  }
}
