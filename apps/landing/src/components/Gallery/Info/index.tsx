// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Info({ player }: { player: PublicRosterPlayer }) {
  const lastClub = player.last_club.trim();
  const categoryName = player.categories[0]?.name ?? "";

  return (
    <div className={styles.player_info}>
      <div className={styles.player_name}>
        <p>{categoryName}</p>
        <h1>{player.full_name}</h1>
      </div>

      <div className={styles.player_stats}>
        <div className={styles.player_stats_item}>
          <p>Height</p>
          <h2>{player.height_cm} cm</h2>
        </div>
        <div className={styles.player_stats_item}>
          <p>Nationality</p>
          <h2>{player.nationality}</h2>
        </div>
        <div className={styles.player_stats_item}>
          <p>Last Club</p>
          <h2>{lastClub.length > 0 ? lastClub : "-"}</h2>
        </div>
      </div>
    </div>
  );
}
