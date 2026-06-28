"use client";

// Next
import Link from "next/link";

// Components
import { Spinner } from "@/components/ui/spinner";
import { useContactRequestsQuery } from "@/hooks/api/use-contact-requests";

// Shadcn
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemTitle,
} from "@/components/ui/item";

// Phosphor
import {
  EnvelopeSimpleIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react/ssr";

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function messagePreview(message: string) {
  const normalized = message.trim().replace(/\s+/g, " ");
  if (normalized.length <= 140) return normalized;
  return `${normalized.slice(0, 140)}...`;
}

function reasonLabel(reason: "hire_services" | "seek_representation") {
  return reason === "hire_services" ? "Hire services" : "Seek representation";
}

export default function ContactRequestsListView() {
  const { data: contactRequests = [], isLoading, isError } =
    useContactRequestsQuery();

  return (
    <main className="w-full h-full p-10 flex flex-col gap-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">Contact Requests</h1>
          <p className="text-sm text-muted-foreground">
            Messages submitted from the public contact form.
          </p>
        </div>
      </div>

      <ItemGroup className="w-full h-full p-4 flex flex-col gap-4 rounded-lg border border-border bg-background shadox-xs dark:border-input dark:bg-input/30">
        {isLoading ? (
          <div className="flex min-h-40 items-center justify-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <WarningCircleIcon />
              </EmptyMedia>
              <EmptyTitle>Could not load contact requests</EmptyTitle>
              <EmptyDescription>
                Something went wrong while fetching contact requests. Please try
                again.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : contactRequests.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <EnvelopeSimpleIcon />
              </EmptyMedia>
              <EmptyTitle>No contact requests found</EmptyTitle>
              <EmptyDescription>
                New messages submitted from the landing page will appear here.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          contactRequests.map((request) => (
            <Item key={request.id} variant="muted" asChild>
              <Link
                href={`/contact-requests/${request.id}`}
                className="w-full flex items-start justify-between gap-4"
              >
                <ItemContent>
                  <ItemTitle>{request.email}</ItemTitle>
                  <ItemDescription>
                    {reasonLabel(request.reason)} · {messagePreview(request.message)}
                  </ItemDescription>
                </ItemContent>
                <span className="text-muted-foreground shrink-0 text-xs">
                  {formatDate(request.created_at)}
                </span>
              </Link>
            </Item>
          ))
        )}
      </ItemGroup>
    </main>
  );
}
