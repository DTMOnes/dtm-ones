"use client";

// Components
import DeleteContactRequestCard from "@/components/contact-requests/delete-contact-request-card";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Types
import type { ApiContactRequest } from "@/lib/api/types";

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

function reasonLabel(reason: "hire_services" | "seek_representation") {
  return reason === "hire_services" ? "Hire services" : "Seek representation";
}

export default function ContactRequestDetailView({
  contactRequest,
}: {
  contactRequest: ApiContactRequest;
}) {
  return (
    <main className="p-10 flex flex-col gap-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold">{contactRequest.email}</h1>
          <p className="text-sm text-muted-foreground">
            Contact request · {formatDate(contactRequest.created_at)}
          </p>
        </div>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-6">
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Message</CardTitle>
            <CardDescription>
              Full message submitted from the public contact form.
            </CardDescription>
          </CardHeader>
          <CardContent className="pb-6">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground text-sm">
                  {contactRequest.email}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Reason</p>
                <p className="text-muted-foreground text-sm">
                  {reasonLabel(contactRequest.reason)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Received</p>
                <p className="text-muted-foreground text-sm">
                  {formatDate(contactRequest.created_at)}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium">Message</p>
                <p className="text-muted-foreground mt-2 whitespace-pre-wrap rounded-md border bg-muted/30 p-4 text-sm leading-relaxed">
                  {contactRequest.message}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <DeleteContactRequestCard
          requestId={contactRequest.id}
          requestEmail={contactRequest.email}
        />
      </div>
    </main>
  );
}
