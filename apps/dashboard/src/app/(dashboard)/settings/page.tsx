import { getRosterAccess } from "@dtm/database";

import { PageHeader, PageShell } from "@/components/page/page-frame";
import { ClientsPasswordForm } from "@/components/settings/clients-password-form";
import { db } from "@/lib/db";

const changedAt = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

export default async function Page() {
  const access = await getRosterAccess(db);

  return (
    <PageShell>
      <PageHeader title="Settings" description="Site-wide options. Owner only." />
      <ClientsPasswordForm
        lastChanged={access ? `${changedAt.format(access.updatedAt)} (Argentina time)` : null}
      />
    </PageShell>
  );
}
