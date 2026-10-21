import Image from "next/image";
import Link from "next/link";

import { ArrowRightIcon } from "@/components/icons";
import type { PublicRosterPlayer } from "@/types/roster";
import {
  formatHeight,
  formatStat,
  positionLabel,
  splitName,
} from "@/utils/player-display";

import styles from "./styles.module.scss";

export default function Cards({ player }: { player: PublicRosterPlayer }) {
  const href = `/roster/${player.id}`;
  const { first, last } = splitName(player.full_name);
  const position = positionLabel(player);
  const stats = player.season_stats;

  const facts = [
    { label: "Team", value: player.last_club },
    { label: "League", value: player.league },
    { label: "Country", value: player.nationality },
    { label: "Height", value: formatHeight(player.height_cm) },
  ].filter((fact) => Boolean(fact.value));

  return (
    <article className={styles.card}>
      <div className={styles.top}>
        <div className={styles.photoCol}>
          <div className={styles.photo}>
            {player.presentation_image_url ? (
              <Image
                src={player.presentation_image_url}
                alt={player.full_name}
                fill
                sizes="132px"
              />
            ) : null}
          </div>
          {position ? <div className={styles.position}>{position}</div> : null}
        </div>
        <div className={styles.info}>
          <Link href={href} className={styles.name} tabIndex={-1} aria-hidden>
            <span className={styles.first}>{first}</span>
            <span className={styles.last}>{last}</span>
          </Link>
          <dl className={styles.facts}>
            {facts.map((fact) => (
              <div key={fact.label} className={styles.fact}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>

      {/* Without stats the dark box stays, empty, so every card keeps the same layout. */}
      <div
        className={
          stats ? styles.stats : `${styles.stats} ${styles.statsEmpty}`
        }
        aria-hidden={stats ? undefined : true}
      >
        <p className={styles.statsTitle}>{stats?.season ?? ""} stats</p>
        <dl className={styles.statsRow}>
          <div>
            <dt>Pts</dt>
            <dd>{formatStat(stats?.ppg)}</dd>
          </div>
          <div>
            <dt>Reb</dt>
            <dd>{formatStat(stats?.rpg)}</dd>
          </div>
          <div>
            <dt>Ast</dt>
            <dd>{formatStat(stats?.apg)}</dd>
          </div>
          <div>
            <dt>FG%</dt>
            <dd>{formatStat(stats?.fg_pct, true)}</dd>
          </div>
        </dl>
      </div>

      <Link href={href} className={styles.foot}>
        View profile<span className="sr-only">: {player.full_name}</span>
        <ArrowRightIcon />
      </Link>
    </article>
  );
}
