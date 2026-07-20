import { ContactsInbox } from "@/components/contacts/contacts-inbox";
import { listContactRequests } from "@/lib/contacts/queries";

export default async function Page() {
  const requests = await listContactRequests();

  return (
    <main className="flex h-full w-full flex-col gap-8 p-6 md:p-10">
      <ContactsInbox requests={requests} />
    </main>
  );
}
