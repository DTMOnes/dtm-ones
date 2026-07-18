"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { markContactReadAction } from "@/actions/contacts";
import { ContactRequestCard } from "@/components/contacts/contact-request-card";
import { ContactRequestDialog } from "@/components/contacts/contact-request-dialog";
import { ContactRequestFilter as ContactRequestFilterControl } from "@/components/contacts/contact-request-filter";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import type {
  ContactRequest,
  ContactsInboxFilter,
} from "@/types/contact-request";

const FALLBACK_ERROR_MESSAGE =
  "The contact request could not be validated. Please try again.";

type ContactsInboxProps = {
  initialRequests: ContactRequest[];
};

function filterRequests(
  requests: ContactRequest[],
  filter: ContactsInboxFilter,
): ContactRequest[] {
  if (filter === "active") {
    return requests.filter(
      (request) => request.status === "new" || request.status === "read",
    );
  }

  return requests.filter((request) => request.status === filter);
}

function emptyCopy(filter: ContactsInboxFilter): {
  title: string;
  description: string;
} {
  if (filter === "active") {
    return {
      title: "No active contact requests",
      description:
        "New and read messages appear here. Check Archived to see older requests.",
    };
  }

  if (filter === "new") {
    return {
      title: "No new contact requests",
      description: "Incoming messages from the public form will show up here.",
    };
  }

  if (filter === "read") {
    return {
      title: "No read contact requests",
      description: "Requests you open move here until they are archived.",
    };
  }

  return {
    title: "No archived contact requests",
    description: "Archived messages are kept here until you delete them.",
  };
}

export function ContactsInbox({ initialRequests }: ContactsInboxProps) {
  const router = useRouter();
  const [requests, setRequests] = useState<ContactRequest[]>(initialRequests);
  const [filter, setFilter] = useState<ContactsInboxFilter>("active");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    setRequests(initialRequests);
  }, [initialRequests]);

  const visibleRequests = useMemo(
    () => filterRequests(requests, filter),
    [filter, requests],
  );

  const selectedRequest =
    selectedId === null
      ? null
      : (requests.find((request) => request.id === selectedId) ?? null);

  const empty = emptyCopy(filter);

  const markRead = useAction(markContactReadAction, {
    onSuccess: ({ data }) => {
      if (!data) return;

      setRequests((current) =>
        current.map((row) =>
          row.id === data.request.id ? data.request : row,
        ),
      );
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError?.message ?? FALLBACK_ERROR_MESSAGE);
    },
  });

  function openRequest(request: ContactRequest) {
    setSelectedId(request.id);

    if (request.status === "new" && !markRead.isPending) {
      markRead.execute({ id: request.id });
    }
  }

  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm">
            Messages submitted from the public contact form.
          </p>
        </div>
        <ContactRequestFilterControl value={filter} onChange={setFilter} />
      </div>

      <div className="bg-background rounded-lg border border-border p-4 dark:border-input dark:bg-input/30">
        {visibleRequests.length === 0 ? (
          <Empty className="min-h-56">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <EnvelopeSimpleIcon />
              </EmptyMedia>
              <EmptyTitle>{empty.title}</EmptyTitle>
              <EmptyDescription>{empty.description}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleRequests.map((request) => (
              <ContactRequestCard
                key={request.id}
                request={request}
                onOpen={openRequest}
              />
            ))}
          </div>
        )}
      </div>

      <ContactRequestDialog
        key={selectedRequest?.id ?? "closed"}
        request={selectedRequest}
        open={selectedRequest !== null}
        onOpenChange={(open) => {
          if (!open && !markRead.isPending) {
            setSelectedId(null);
          }
        }}
      />
    </main>
  );
}
