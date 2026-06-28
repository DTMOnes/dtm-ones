// Next
import { notFound } from "next/navigation";

// Components
import ContactRequestDetailView from "@/components/contact-requests/contact-request-detail-view";

// Lib
import { getContactRequestByIdServer } from "@/lib/api/server-queries";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const contactRequest = await getContactRequestByIdServer(id);

  if (!contactRequest) {
    notFound();
  }

  return <ContactRequestDetailView contactRequest={contactRequest} />;
}
