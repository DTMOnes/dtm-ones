import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { schema } from "@dtm/database";

import { ContactsInbox } from "@/components/contacts/contacts-inbox";
import { db } from "@/lib/db";

export default async function Page() {
  const requests = await db
    .select({
      id: schema.contactRequests.id,
      reason: schema.contactRequests.reason,
      email: schema.contactRequests.email,
      phone: schema.contactRequests.phone,
      message: schema.contactRequests.message,
      status: schema.contactRequests.status,
      createdAt: schema.contactRequests.createdAt,
    })
    .from(schema.contactRequests)
    .orderBy(desc(schema.contactRequests.createdAt));

  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <Suspense>
        <ContactsInbox requests={requests} />
      </Suspense>
    </main>
  );
}
