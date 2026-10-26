import Image from "next/image";
import Link from "next/link";

import {
  ArrowLeftIcon,
  ExternalIcon,
  StarIcon,
  TrophyIcon,
} from "@/components/icons";
import { socials } from "@/config/site";
import type { NewsPost } from "@/types/roster";
import type { PublicRosterPlayer, PublicRosterSeasonStats } from "@/types/roster";
import {
  ageFrom,
  formatHeight,
  formatLeague,
  formatStat,
  positionLabel,
  previousLeagues,
  splitName,
} from "@/utils/player-display";

import Gallery from "./Gallery";
import Highlights from "./Highlights";
import ShowMore from "./ShowMore";
import WatchHighlightsLink from "./WatchHighlightsLink";
import styles from "./styles.module.scss";

const STAT_LABELS: Array<{
  key: Exclude<keyof PublicRosterSeasonStats, "season">;
  label: string;
  percent?: boolean;
}> = [
  { key: "ppg", label: "PPG" },
  { key: "rpg", label: "RPG" },
  { key: "apg", label: "APG" },
  { key: "mpg", label: "MPG" },
  { key: "spg", label: "SPG" },
  { key: "bpg", label: "BPG" },
  { key: "fg_pct", label: "FG%", percent: true },
  { key: "three_pct", label: "3PT%", percent: true },
  { key: "ft_pct", label: "FT%", percent: true },
];

export default function Profile({
  client,
  news,
}: {
  client: PublicRosterPlayer;
  news: NewsPost[];
}) {
  const { first, last } = splitName(client.full_name);
  const position = positionLabel(client);
  const height = formatHeight(client.height_cm);
  const age = ageFrom(client.birth_date);
  const prevLeagues = previousLeagues(client);
  const stats = client.season_stats;
  const statItems = stats
    ? STAT_LABELS.filter(({ key }) => stats[key] != null)
    : [];
  const hasAbout = Boolean(client.bio?.trim()) || client.strengths.length > 0;
  const hasCareer = client.career.length > 0 || client.awards.length > 0;

  return (
    <main className={styles.main}>
      <div className={styles.dots} aria-hidden />
      <div className={styles.container}>
        <div className={styles.toolbar}>
          <Link className={styles.back} href="/players">
            <ArrowLeftIcon />
            All clients
          </Link>
        </div>

        <article className={styles.card}>
          {/* identity */}
          <div className={styles.identity}>
            <div className={styles.photoWrap}>
              <span className={styles.photoFrame} aria-hidden />
              <div className={styles.photo}>
                {client.presentation_image_url ? (
                  <Image
                    src={client.presentation_image_url}
                    alt={client.full_name}
                    fill
                    sizes="180px"
                    priority
                  />
                ) : null}
              </div>
            </div>
            <div className={styles.who}>
              {first ? <p className={styles.first}>{first}</p> : null}
              <div className={styles.nameRow}>
                <h1 className={styles.last}>
                  <span className="sr-only">{first} </span>
                  {last}
                </h1>
                {position ? <span className={styles.position}>{position}</span> : null}
              </div>
            </div>
            <div className={styles.details}>
              <ul className={styles.meta}>
                {height ? (
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />
                    </svg>
                    <span className={styles.metaStrong}>{height}</span>
                  </li>
                ) : null}
                {age != null ? (
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <rect x="4" y="5" width="16" height="15" rx="1" />
                      <path d="M4 10h16M9 3v4M15 3v4" />
                    </svg>
                    {age} yrs
                  </li>
                ) : null}
                {client.nationality ? (
                  <li>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <circle cx="12" cy="12" r="9" />
                      <path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
                    </svg>
                    {client.nationality}
                  </li>
                ) : null}
              </ul>
              <ul className={styles.tags}>
                {client.league || client.last_club ? (
                  <li className={`${styles.tag} ${styles.tagCurrent}`}>
                    {client.league ? formatLeague(client.league) : client.last_club}
                  </li>
                ) : null}
                {prevLeagues.map((league) => (
                  <li key={league} className={styles.tag}>
                    {league}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* scout band */}
          {client.videos.length > 0 || client.eurobasket_link ? (
            <div className={styles.scout}>
              <p className={styles.scoutTitle}>
                Scout this {client.kind === "coach" ? "coach" : "player"}
              </p>
              <div className={styles.scoutActions}>
                {client.videos.length > 0 ? <WatchHighlightsLink /> : null}
                {client.eurobasket_link ? (
                  <a
                    className="btn btn-ghost"
                    href={client.eurobasket_link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Eurobasket
                    <ExternalIcon />
                  </a>
                ) : null}
              </div>
            </div>
          ) : null}

          {/* about + strengths */}
          {hasAbout ? (
            <section className={styles.about}>
              {client.bio?.trim() ? (
                <div>
                  <h2 className="kicker">About</h2>
                  {client.bio
                    .split(/\n\s*\n/)
                    .map((paragraph, index) => (
                      <p key={index} className={index === 0 ? styles.lead : styles.copy}>
                        {paragraph.trim()}
                      </p>
                    ))}
                </div>
              ) : null}
              {client.strengths.length > 0 ? (
                <div>
                  <h2 className="kicker">Strengths</h2>
                  <ul className={styles.strengths}>
                    {client.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

          {/* season statistics */}
          {stats && statItems.length > 0 ? (
            <section className={styles.section}>
              <h2 className={`kicker ${styles.centerKicker}`}>
                {stats.season} · Season statistics
              </h2>
              <dl className={styles.statGrid}>
                {statItems.map(({ key, label, percent }, index) => (
                  <div key={key} className={index === 0 ? styles.statLead : undefined}>
                    <dt>{label}</dt>
                    <dd>{formatStat(stats[key], percent)}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ) : null}

          {/* career + titles & awards */}
          {hasCareer ? (
            <section className={`${styles.section} ${styles.career}`}>
              {client.career.length > 0 ? (
                <div>
                  <h2 className="kicker">Career</h2>
                  {/* Eight clubs at first; "See more" adds four at a time. */}
                  <ShowMore
                    list="ol"
                    className={styles.timeline}
                    items={client.career.map((entry, index) => (
                      <li
                        key={entry.id}
                        className={index === 0 ? styles.timelineCurrent : undefined}
                      >
                        <span className={styles.season}>{entry.season}</span>
                        <div>
                          <div className={styles.clubRow}>
                            <span className={styles.club}>{entry.club}</span>
                            {index === 0 ? (
                              <span className={styles.currentBadge}>Current</span>
                            ) : null}
                          </div>
                          {entry.league || entry.country ? (
                            <p className={styles.clubMeta}>
                              {[entry.league, entry.country].filter(Boolean).join(" · ")}
                            </p>
                          ) : null}
                        </div>
                      </li>
                    ))}
                  />
                </div>
              ) : null}
              {client.awards.length > 0 ? (
                <div>
                  <h2 className="kicker">Titles &amp; awards</h2>
                  {/* Six titles at first; "See more" adds four at a time. */}
                  <ShowMore
                    className={styles.awards}
                    initial={6}
                    items={client.awards.map((award) => (
                      <li
                        key={award.id}
                        className={
                          award.kind === "individual"
                            ? `${styles.award} ${styles.awardIndividual}`
                            : styles.award
                        }
                      >
                        <span className={styles.awardIcon}>
                          {award.kind === "individual" ? (
                            <StarIcon size={20} color="currentColor" />
                          ) : (
                            <TrophyIcon />
                          )}
                          <span className="sr-only">
                            {award.kind === "individual" ? "Individual award" : "Team title"}
                          </span>
                        </span>
                        <div>
                          <p className={styles.awardTitle}>{award.title}</p>
                          {award.detail ? (
                            <p className={styles.clubMeta}>{award.detail}</p>
                          ) : null}
                        </div>
                        {award.year ? (
                          <span className={styles.awardYear}>{award.year}</span>
                        ) : null}
                      </li>
                    ))}
                  />
                </div>
              ) : null}
            </section>
          ) : null}

          {/* news: Instagram posts about this Client */}
          {news.length > 0 ? (
            <section className={styles.section}>
              <h2 className="kicker">News</h2>
              <ul className={styles.news}>
                {news.map((post) => (
                  <li key={post.src}>
                    <a
                      className={styles.newsItem}
                      href={post.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={post.src}
                        alt={post.alt}
                        width={300}
                        height={400}
                        unoptimized={post.src.startsWith("http")}
                      />
                    </a>
                  </li>
                ))}
              </ul>
              <a
                className={`btn btn-ghost ${styles.feedButton}`}
                href={socials.instagram}
                target="_blank"
                rel="noreferrer"
              >
                See the full feed
              </a>
            </section>
          ) : null}

          {/* highlights */}
          {client.videos.length > 0 ? (
            <section id="highlights" className={styles.section}>
              <h2 className="kicker">Highlights</h2>
              <Highlights videos={client.videos} name={client.full_name} />
            </section>
          ) : null}

          {/* gallery */}
          {client.gallery_images.length > 0 ? (
            <section className={styles.section}>
              <h2 className="kicker">Gallery</h2>
              <Gallery images={client.gallery_images} name={client.full_name} />
            </section>
          ) : null}

        </article>

        <div className={styles.contact}>
          <p className={styles.contactTitle}>Interested in {first || last}?</p>
          <Link className="btn btn-red" href="/contact">
            Contact DTMones
          </Link>
        </div>
      </div>
    </main>
  );
}
