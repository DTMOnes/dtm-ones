// Components
import Landing from "@/components/landing";

// API
import { getPlayers } from "@/lib/api/players";

export default async function Page() {
  const players = await getPlayers();

  return <Landing players={players} />;
}
