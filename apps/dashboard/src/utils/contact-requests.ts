import { eq } from "drizzle-orm";
import { schema, type Database } from "@dtm/database";

import type {
  ContactRequest,
  ContactRequestStatus,
} from "@/types/contact-request";
import { NotFoundError } from "@/utils/errors";

const contactRequestColumns = {
  id: schema.contactRequests.id,
  reason: schema.contactRequests.reason,
  email: schema.contactRequests.email,
  phone: schema.contactRequests.phone,
  message: schema.contactRequests.message,
  status: schema.contactRequests.status,
  createdAt: schema.contactRequests.createdAt,
};

export async function getContactRequest(
  db: Database,
  id: string,
): Promise<ContactRequest | null> {
  const [row] = await db
    .select(contactRequestColumns)
    .from(schema.contactRequests)
    .where(eq(schema.contactRequests.id, id))
    .limit(1);

  return row ?? null;
}

async function requireContactRequest(
  db: Database,
  id: string,
): Promise<ContactRequest> {
  const existing = await getContactRequest(db, id);
  if (!existing) {
    throw new NotFoundError("ContactRequest");
  }
  return existing;
}

async function setContactRequestStatus(
  db: Database,
  id: string,
  status: ContactRequestStatus,
): Promise<ContactRequest> {
  const [row] = await db
    .update(schema.contactRequests)
    .set({ status, updatedAt: new Date() })
    .where(eq(schema.contactRequests.id, id))
    .returning(contactRequestColumns);

  if (!row) {
    throw new NotFoundError("ContactRequest");
  }

  return row;
}

export async function markContactRequestRead(
  db: Database,
  id: string,
): Promise<ContactRequest> {
  const existing = await requireContactRequest(db, id);
  if (existing.status !== "new") {
    return existing;
  }

  return setContactRequestStatus(db, id, "read");
}

export async function archiveContactRequest(
  db: Database,
  id: string,
): Promise<ContactRequest> {
  const existing = await requireContactRequest(db, id);
  if (existing.status === "archived") {
    return existing;
  }

  return setContactRequestStatus(db, id, "archived");
}

export async function unarchiveContactRequest(
  db: Database,
  id: string,
): Promise<ContactRequest> {
  const existing = await requireContactRequest(db, id);
  if (existing.status !== "archived") {
    return existing;
  }

  return setContactRequestStatus(db, id, "read");
}

export async function deleteContactRequest(
  db: Database,
  id: string,
): Promise<void> {
  const [row] = await db
    .delete(schema.contactRequests)
    .where(eq(schema.contactRequests.id, id))
    .returning({ id: schema.contactRequests.id });

  if (!row) {
    throw new NotFoundError("ContactRequest");
  }
}
