import { and, desc, eq, ilike, isNull, like } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import { slugify } from "@/utils/categories";

export type ClientKind = "player" | "coach";

export type ClientListItem = {
  id: string;
  kind: ClientKind;
  name: string | null;
  visibility: "public" | "private";
};

export function clientDisplayName(
  kind: ClientKind,
  name: string | null,
): string {
  const trimmed = name?.trim();
  if (trimmed) {
    return trimmed;
  }

  return kind === "player" ? "Untitled Player" : "Untitled Coach";
}

export function kindLabel(kind: ClientKind): string {
  return kind === "player" ? "Player" : "Coach";
}

export async function createClient(
  db: Database,
  input: { kind: ClientKind },
): Promise<ClientListItem> {
  const [row] = await db
    .insert(schema.clients)
    .values({
      kind: input.kind,
      visibility: "private",
    })
    .returning({
      id: schema.clients.id,
      kind: schema.clients.kind,
      name: schema.clients.name,
      visibility: schema.clients.visibility,
    });

  if (!row) {
    throw new Error("createClient returned no row");
  }

  return row;
}

/**
 * Gives a Client its profile link (/roster/<slug>) from its name, once: later
 * renames keep the slug so shared links keep working. Repeated names get -2, -3.
 */
export async function assignClientSlug(db: Database, id: string): Promise<void> {
  const client = await db.query.clients.findFirst({
    columns: { name: true, slug: true },
    where: eq(schema.clients.id, id),
  });
  const base = slugify(client?.name ?? "");
  if (!client || client.slug || !base) {
    return;
  }

  const taken = new Set(
    (
      await db
        .select({ slug: schema.clients.slug })
        .from(schema.clients)
        .where(like(schema.clients.slug, `${base}%`))
    ).map((row) => row.slug),
  );
  let slug = base;
  for (let n = 2; taken.has(slug); n++) {
    slug = `${base}-${n}`;
  }

  await db
    .update(schema.clients)
    .set({ slug })
    .where(and(eq(schema.clients.id, id), isNull(schema.clients.slug)));
}

export async function listClients(
  db: Database,
  options: {
    kind?: ClientKind;
    visibility?: ClientListItem["visibility"];
    q?: string;
  } = {},
): Promise<ClientListItem[]> {
  const q = options.q?.trim();

  return db.query.clients.findMany({
    columns: {
      id: true,
      kind: true,
      name: true,
      visibility: true,
    },
    where: and(
      isNull(schema.clients.trashedAt),
      options.kind ? eq(schema.clients.kind, options.kind) : undefined,
      options.visibility
        ? eq(schema.clients.visibility, options.visibility)
        : undefined,
      q ? ilike(schema.clients.name, `%${q}%`) : undefined,
    ),
    orderBy: [desc(schema.clients.createdAt)],
  });
}
