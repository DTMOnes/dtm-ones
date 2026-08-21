"use client";

import { Button } from "@/components/ui/button";
import {
  ListEmpty,
  PageHeader,
  PageShell,
} from "@/components/page/page-frame";

export function PageErrorState({
  title,
  description,
  icon,
  errorTitle,
  errorDescription,
  reset,
}: {
  title: string;
  description?: string;
  icon: React.ComponentType<{ className?: string }>;
  errorTitle: string;
  errorDescription: string;
  reset: () => void;
}) {
  return (
    <PageShell>
      <PageHeader title={title} description={description} />
      <ListEmpty
        icon={icon}
        title={errorTitle}
        description={errorDescription}
        action={
          <Button type="button" onClick={reset}>
            Try again
          </Button>
        }
      />
    </PageShell>
  );
}
