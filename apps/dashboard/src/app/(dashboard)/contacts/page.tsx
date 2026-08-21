import { Suspense } from "react";
import { desc } from "drizzle-orm";
import { schema } from "@dtm/database";

import { ContactsInbox } from "@/components/contacts/contacts-inbox";
import { PageShell } from "@/components/page/page-frame";
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
    <PageShell>
      <Suspense>
        <ContactsInbox requests={requests} />
      </Suspense>
    </PageShell>
  );
}
