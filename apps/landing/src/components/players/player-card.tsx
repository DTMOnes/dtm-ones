import Image from "next/image";
import Link from "next/link";

import styles from "./player-card.module.scss";

const PLACEHOLDER_SRC = "/assets/images/player-placeholder.png";

export type PlayerCardProps = {
  slug: string;
  fullName: string;
  presentationImageUrl: string | null;
  categoryName?: string;
};

export function PlayerCard({
  slug,
  fullName,
  presentationImageUrl,
  categoryName,
}: PlayerCardProps) {
  const imageSrc =
    presentationImageUrl === null || presentationImageUrl.trim() === ""
      ? PLACEHOLDER_SRC
      : presentationImageUrl;

  return (
    <Link href={`/roster/${slug}`} className={styles.card}>
      <div className={styles.image_container}>
        <div className={styles.image_background} />
        <Image
          src={imageSrc}
          alt={fullName}
          width={1025}
          height={1280}
          className={styles.image}
        />
        <div className={styles.image_overlay} />
      </div>
      <div className={styles.player_info}>
        {categoryName ? (
          <span className={styles.player_category}>{categoryName}</span>
        ) : null}
        <h5 className={styles.player_name}>{fullName}</h5>
      </div>
    </Link>
  );
}
