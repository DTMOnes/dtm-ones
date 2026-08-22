import { and, desc, eq, ilike, isNull } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

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

export async function listClients(
  db: Database,
  options: { kind?: ClientKind; q?: string } = {},
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
      q ? ilike(schema.clients.name, `%${q}%`) : undefined,
    ),
    orderBy: [desc(schema.clients.createdAt)],
  });
}
