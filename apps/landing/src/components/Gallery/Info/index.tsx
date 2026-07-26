// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Info({ player }: { player: PublicRosterPlayer }) {
  return (
    <div className={styles.player_info}>
      <div className={styles.player_name}>
        <p>{player.categories[0].name}</p>
        <h1>{player.full_name}</h1>
      </div>

      <div className={styles.player_stats}>
        <div className={styles.player_stats_item}>
          <p>Height</p>
          <h2>185 cm</h2>
        </div>
        <div className={styles.player_stats_item}>
          <p>Nationality</p>
          <h2>Brazil</h2>
        </div>
        <div className={styles.player_stats_item}>
          <p>Last Club</p>
          <h2>Barcelona</h2>
        </div>
      </div>
    </div>
  );
}
