// Db
import { db } from "@/lib/db";

// Components
import Landing from "@/components/landing";

export default async function Page() {
  const players = await db.query.players.findMany();

  return <Landing players={players} />;
}
