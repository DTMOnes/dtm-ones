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
        width={360}
        height={420}
        draggable={false}
      />

      <div className={styles.content}>
        <div className={styles.top}>
          <p className={styles.number}>24</p>
          <Image
            src="/assets/svg/dtm-ones-ball.svg"
            alt="Dtm Ones Ball"
            width={40}
            height={33}
            draggable={false}
          />
        </div>

        <div className={styles.bottom}>
          <p className={styles.position}>{player.categories[0].name}</p>
          <h1 className={styles.name}>{player.full_name}</h1>
        </div>
      </div>
    </div>
  );
}
