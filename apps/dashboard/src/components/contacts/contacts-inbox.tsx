"use client";

import { useOptimistic, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { EnvelopeSimpleIcon } from "@phosphor-icons/react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { markContactRequestReadAction } from "@/actions/contacts/markContactRequestRead";
import { ContactRequestCard } from "@/components/contacts/contact-request-card";
import { ContactRequestDialog } from "@/components/contacts/contact-request-dialog";
import { ContactRequestFilter } from "@/components/contacts/contact-request-filter";
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
import {
  inboxFilterCounts,
  isContactsInboxFilter,
  visibleInboxRequests,
} from "@/utils/contacts-inbox";

type ContactsInboxProps = {
  requests: ContactRequest[];
};

const EMPTY_COPY: Record<
  ContactsInboxFilter,
  { title: string; description: string }
> = {
  active: {
    title: "No active contact requests",
    description:
      "New and read messages appear here. Check Archived to see older requests.",
  },
  new: {
    title: "No new contact requests",
    description: "Incoming messages from the public form will show up here.",
  },
  read: {
    title: "No read contact requests",
    description: "Requests you open move here until they are archived.",
  },
  archived: {
    title: "No archived contact requests",
    description: "Archived messages are kept here until you delete them.",
  },
};

export function ContactsInbox({ requests }: ContactsInboxProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const { executeAsync: markRead } = useAction(markContactRequestReadAction, {
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  const rawFilter = searchParams.get("filter");
  const filter: ContactsInboxFilter =
    rawFilter !== null && isContactsInboxFilter(rawFilter)
      ? rawFilter
      : "active";

  const [optimisticRequests, setOptimisticStatus] = useOptimistic(
    requests,
    (
      current: ContactRequest[],
      update: { id: string; status: "read" },
    ): ContactRequest[] =>
      current.map((row) =>
        row.id === update.id ? { ...row, status: update.status } : row,
      ),
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [displayRequest, setDisplayRequest] = useState<ContactRequest | null>(
    null,
  );

  const counts = inboxFilterCounts(optimisticRequests);
  const visibleRequests = visibleInboxRequests(optimisticRequests, filter);

  const selectedRequest =
    selectedId === null
      ? null
      : (optimisticRequests.find((request) => request.id === selectedId) ??
        null);

  if (selectedRequest !== null) {
    if (
      displayRequest === null ||
      displayRequest.id !== selectedRequest.id ||
      displayRequest.status !== selectedRequest.status
    ) {
      setDisplayRequest(selectedRequest);
    }
  }

  const empty = EMPTY_COPY[filter];

  function setFilter(next: ContactsInboxFilter): void {
    const params = new URLSearchParams(searchParams.toString());

    if (next === "active") {
      params.delete("filter");
    } else {
      params.set("filter", next);
    }

    const query = params.toString();
    router.replace(query.length > 0 ? `${pathname}?${query}` : pathname);
  }

  function openRequest(request: ContactRequest): void {
    setSelectedId(request.id);

    if (request.status !== "new") {
      return;
    }

    startTransition(async () => {
      setOptimisticStatus({ id: request.id, status: "read" });

      const result = await markRead({ id: request.id });
      if (result?.data?.ok) {
        router.refresh();
      }
    });
  }

  return (
    <div className="flex h-full w-full flex-col gap-8">
      <div className="flex flex-col gap-6">
        <div className="flex min-w-0 flex-col gap-1">
          <h1 className="text-2xl font-bold">Contacts</h1>
          <p className="text-muted-foreground text-sm">
            Messages submitted from the public contact form.
          </p>
        </div>
        <ContactRequestFilter
          value={filter}
          counts={counts}
          onChange={setFilter}
        />
      </div>

      {visibleRequests.length === 0 ? (
        <Empty className="min-h-56 flex-1 border border-dashed">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <EnvelopeSimpleIcon />
            </EmptyMedia>
            <EmptyTitle>{empty.title}</EmptyTitle>
            <EmptyDescription>{empty.description}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {visibleRequests.map((request) => (
            <ContactRequestCard
              key={request.id}
              request={request}
              onOpen={openRequest}
            />
          ))}
        </div>
      )}

      <ContactRequestDialog
        request={displayRequest}
        open={selectedId !== null}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedId(null);
          }
        }}
      />
    </div>
  );
}
