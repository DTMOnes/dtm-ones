import type { Metadata } from "next";

import Landing from "@/components/landing";
import { listPublicRosterPlayers } from "@/lib/roster/queries";

export const metadata: Metadata = {
  title: "DTM Ones | The name talent trusts",
  description:
    "Basketball talent agency built on trust. Browse the roster and reach out as a player or recruiter.",
};

export default async function Page() {
  const players = await listPublicRosterPlayers({ limit: 3 });

  return <Landing players={players} />;
}
