import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Hero from "@/components/Hero";
import { ArrowRightIcon } from "@/components/icons";
import { signings, socials } from "@/config/site";
import {
  hasInstagram,
  listAgencyPosts,
  postsWithHashtag,
} from "@/lib/instagram";
import { listPublicRosterPlayers } from "@/lib/roster/queries";

import styles from "./styles.module.scss";

export const metadata: Metadata = {
  title: "DTMones | The line of your dreams",
  description: "Basketball player representation, worldwide.",
};

export default async function Page() {
  const [{ clients: players }, agencyPosts] = await Promise.all([
    listPublicRosterPlayers({ kind: "player", limit: 5 }),
    listAgencyPosts(),
  ]);
  // Two rows of six: the agency's latest Instagram posts tagged #dtmsigned (what it uses) or #signed.
  const signedPosts = postsWithHashtag(agencyPosts, ["dtmsigned", "signed"], 12);
  // Until Instagram is connected, the static posters stand in.
  const showStaticSignings = !hasInstagram();

  return (
    <main>
      <Hero />

      <section id="roster" className={styles.roster}>
        <div className={styles.head}>
          <div>
            <p className="kicker">The team</p>
            <h2 className={styles.display}>Clients</h2>
          </div>
          <Link className="btn btn-ghost" href="/players">
            View all clients
            <ArrowRightIcon />
          </Link>
        </div>
        {players.length > 0 ? (
          <ul className={styles.tiles}>
            {players.map((player) => (
              <li key={player.id}>
                <div className={styles.tile}>
                  {player.presentation_image_url ? (
                    <Image
                      src={player.presentation_image_url}
                      alt={player.full_name}
                      fill
                      sizes="(width < 720px) 60vw, 20vw"
                    />
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      {signedPosts.length > 0 || showStaticSignings ? (
        <section className={styles.signed}>
          <div className={styles.head}>
            <div>
              <p className="kicker">Latest signings</p>
              <h2 className={styles.signedTitle}>Signed</h2>
            </div>
            <a
              className="btn btn-ghost"
              href={socials.instagram}
              target="_blank"
              rel="noreferrer"
            >
              See the full feed
            </a>
          </div>
          <ul className={styles.posters}>
            {signedPosts.length > 0
              ? signedPosts.map((post) => (
                  <li key={post.id}>
                    <a
                      className={styles.poster}
                      href={post.permalink}
                      target="_blank"
                      rel="noreferrer"
                    >
                      <Image
                        src={post.image}
                        alt={
                          post.caption.split("\n")[0]?.slice(0, 120) ||
                          "Signed on Instagram"
                        }
                        width={300}
                        height={400}
                        unoptimized
                      />
                    </a>
                  </li>
                ))
              : signings.map((signing) => (
                  <li key={signing.src}>
                    <div className={styles.poster}>
                      <Image
                        src={signing.src}
                        alt={`${signing.name} signed`}
                        width={300}
                        height={400}
                      />
                    </div>
                  </li>
                ))}
          </ul>
        </section>
      ) : null}

      <section className={styles.cta}>
        <div className={styles.ctaInner}>
          <div>
            <p className={`kicker ${styles.ctaKicker}`}>Work with us</p>
            <h2 className={styles.ctaTitle}>
              <span>Your next contract</span>
              <span className={styles.ctaAccent}>starts here</span>
            </h2>
            <p className={styles.ctaCopy}>
              Players, coaches and clubs — get in touch.
            </p>
            <div className={styles.ctaActions}>
              <Link className="btn btn-red" href="/contact">
                Contact us
              </Link>
              <Link className="btn btn-navy" href="/about">
                About DTMones
              </Link>
            </div>
          </div>
          <Image
            className={styles.ctaLogo}
            src="/assets/images/line-of-your-dreams.png"
            alt="DTMones — The line of your dreams"
            width={1035}
            height={220}
          />
        </div>
      </section>
    </main>
  );
}
