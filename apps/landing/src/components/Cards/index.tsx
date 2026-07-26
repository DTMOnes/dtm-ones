// Next
import Image from "next/image";

// Styles
import styles from "./styles.module.scss";

// Types
import { PublicRosterPlayer } from "@/types/roster";

export default function Cards({
  player,
  onSelect,
}: {
  player: PublicRosterPlayer;
  onSelect: () => void;
}) {
  return (
    <div key={player.id} className={styles.card} onClick={onSelect}>
      <Image
        className={styles.image}
        src={player.presentation_image_url ?? ""}
        alt={player.full_name}
        fill
        draggable={false}
      />

      <div className={styles.card_description}>
        <h1 className={styles.player_name}>{player.full_name}</h1>
        <p className={styles.player_position}>{player.categories[0].name}</p>
      </div>
    </div>
  );
}
