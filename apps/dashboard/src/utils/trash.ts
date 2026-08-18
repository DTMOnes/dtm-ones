import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import { NotFoundError } from "@/utils/errors";

export async function trashClient(db: Database, id: string): Promise<void> {
  const [row] = await db
    .update(schema.clients)
    .set({ trashedAt: new Date(), updatedAt: new Date() })
    .where(and(eq(schema.clients.id, id), isNull(schema.clients.trashedAt)))
    .returning({ id: schema.clients.id });

  if (!row) {
    throw new NotFoundError("Client");
  }
}

export async function restoreClient(db: Database, id: string): Promise<void> {
  const [row] = await db
    .update(schema.clients)
    .set({ trashedAt: null, updatedAt: new Date() })
    .where(and(eq(schema.clients.id, id), isNotNull(schema.clients.trashedAt)))
    .returning({ id: schema.clients.id });

  if (!row) {
    throw new NotFoundError("Client");
  }
}

export async function deleteClientFromTrash(
  db: Database,
  id: string,
  deleteBlobs: (keys: string[]) => Promise<void>,
): Promise<void> {
  const client = await db.query.clients.findFirst({
    columns: {
      id: true,
      presentationImageKey: true,
    },
    where: and(eq(schema.clients.id, id), isNotNull(schema.clients.trashedAt)),
    with: {
      galleryImages: {
        columns: {
          storageKey: true,
        },
      },
    },
  });

  if (!client) {
    throw new NotFoundError("Client");
  }

  const blobKeys = [
    client.presentationImageKey,
    ...client.galleryImages.map((image) => image.storageKey),
  ].filter((key): key is string => key != null && key.length > 0);

  await deleteBlobs(blobKeys);

  await db.delete(schema.clients).where(eq(schema.clients.id, id));
}
