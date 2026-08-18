import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { schema } from "@dtm/database";

import { ContactsInbox } from "@/components/contacts/contacts-inbox";
import { db } from "@/lib/db";

export default async function Page() {
  const requests = await db.query.contactRequests.findMany({
    columns: {
      id: true,
      reason: true,
      email: true,
      phone: true,
      message: true,
      status: true,
      createdAt: true,
    },
    orderBy: [desc(schema.contactRequests.createdAt)],
  });

  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <Suspense>
        <ContactsInbox requests={requests} />
      </Suspense>
    </main>
  );
}
