import { getRosterAccess, getRosterPassword } from "@dtm/database";

import { PageHeader, PageShell } from "@/components/page/page-frame";
import { ClientsPasswordForm } from "@/components/settings/clients-password-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { db } from "@/lib/db";

const changedAt = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Argentina/Buenos_Aires",
});

/** Must match the landing default (apps/landing/src/lib/roster/access.ts). */
const DEFAULT_PASSWORD = "dtm-access";

export default async function Page() {
  const [access, password] = await Promise.all([
    getRosterAccess(db),
    getRosterPassword(db),
  ]);

  return (
    <PageShell>
      <PageHeader title="Settings" description="Site-wide options. Owner only." />
      <ClientsPasswordForm
        lastChanged={access ? `${changedAt.format(access.updatedAt)} (Argentina time)` : null}
      />
      <Card>
        <CardHeader>
          <CardTitle>Current password</CardTitle>
          <CardDescription>
            {access
              ? "The password the website asks for right now."
              : "Not changed yet: the website uses the default password."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="bg-accent border-border border px-3 py-2 font-mono text-base select-all">
            {access ? (password ?? "Not available. Save a new password to see it here.") : DEFAULT_PASSWORD}
          </p>
        </CardContent>
      </Card>
    </PageShell>
  );
}
