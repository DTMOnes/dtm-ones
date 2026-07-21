import { listUsers } from "@/lib/users/queries";
import { UsersListView } from "@/components/users/users-list-view";

export default async function Page() {
  const users = await listUsers();

  return <UsersListView users={users} />;
}
