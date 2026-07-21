import Link from "next/link";

import { PlayerCard } from "@/components/players/player-card";
import type { PublicRosterPlayer } from "@/types/roster";

import styles from "./styles.module.scss";

type RosterProps = {
  players: PublicRosterPlayer[];
};

export default function Roster({ players }: RosterProps) {
  return (
    <section id="roster" className={styles.container} aria-label="Roster">
      <div className={styles.content}>
        <h2 className={styles.title}>Meet Our Roster</h2>
        <p className={styles.subtitle}>
          Our roster is a diverse group of talent that is dedicated to providing
          the best possible service to our clients.
        </p>
        <Link href="/roster" className={styles.button}>
          Check Our Roster
        </Link>

        {players.length === 0 ? (
          <p className={styles.empty}>
            No published players to show yet. Check the full roster for updates.
          </p>
        ) : (
          <div className={styles.cards_container}>
            {players.map((player) => (
              <PlayerCard
                key={player.id}
                slug={player.slug}
                fullName={player.full_name}
                presentationImageUrl={player.presentation_image_url}
                categoryName={player.categories[0]?.name ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
