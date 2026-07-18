import { ContactsInbox } from "@/components/contacts/contacts-inbox";
import { listContactRequests } from "@/lib/contacts/queries";

export default async function Page() {
  const initialRequests = await listContactRequests();

  return <ContactsInbox initialRequests={initialRequests} />;
}
