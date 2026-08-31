import Link from "next/link";
import Image from "next/image";

/** Compact ball mark — frees header width below `nav` for socials (#63). */
const BALL_SRC = "/assets/dtm-ones-logo.svg";
const BALL_W = 25;
const BALL_H = 21;

/** Full wordmark — desktop `nav`+ only. */
const WORDMARK_SRC = "/assets/images/logo-dtm-ones.png";
const WORDMARK_W = 1082;
const WORDMARK_H = 259;

export default function Logo() {
  return (
    <Link href="/" className="relative block" aria-label="DTM Ones">
      {/* Below `nav` (1250): ball. Same height band as the old compact wordmark (h-8). */}
      <span
        className="relative block h-8 overflow-hidden nav:hidden"
        style={{ aspectRatio: `${BALL_W} / ${BALL_H}` }}
      >
        <Image
          className="object-contain"
          src={BALL_SRC}
          alt=""
          fill
          sizes="40px"
          priority
        />
      </span>
      {/* `nav`+: full wordmark at the larger header band (h-10). */}
      <span
        className="relative hidden h-10 overflow-hidden nav:block"
        style={{ aspectRatio: `${WORDMARK_W} / ${WORDMARK_H}` }}
      >
        <Image
          className="object-contain"
          src={WORDMARK_SRC}
          alt=""
          fill
          sizes="200px"
          priority
        />
      </span>
    </Link>
  );
}
