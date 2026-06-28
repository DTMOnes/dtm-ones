// Next
import Link from "next/link";
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

// Types
import type { Player } from "@/types/player";

export default function Roster({ players }: { players: Player[] }) {
  console.log(players);

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

        <div className={styles.cards_container}>
          {players.map((player) => (
            <div className={styles.card} key={player.id}>
              <div className={styles.image_container}>
                <div className={styles.image_background}></div>
                <Image
                  src="/assets/images/christian-alaekwe.png"
                  alt="Christian Alaekwe"
                  width={1025}
                  height={1280}
                  className={styles.image}
                />
                <div className={styles.image_overlay}></div>
              </div>
              <span className={styles.player_number}>24</span>
              <div className={styles.player_info}>
                <span className={styles.player_category}>Point Guard</span>
                <h5 className={styles.player_name}>Christian Alaekwe</h5>
                <span className={styles.player_league}>European League</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
