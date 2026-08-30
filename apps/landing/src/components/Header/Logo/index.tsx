import Link from "next/link";
import Image from "next/image";

const LOGO_SRC = "/assets/images/logo-dtm-ones.png";

/** Native size of logo-dtm-ones.png */
const LOGO_W = 1082;
const LOGO_H = 259;

export default function Logo() {
  return (
    <Link
      href="/"
      // 40px beside inline nav (`nav` / 1250+); 32px in tighter header bands.
      className="relative block h-8 overflow-hidden nav:h-10"
      style={{ aspectRatio: `${LOGO_W} / ${LOGO_H}` }}
      aria-label="DTM Ones"
    >
      <Image
        className="object-contain"
        src={LOGO_SRC}
        alt=""
        fill
        sizes="200px"
      />
    </Link>
  );
}
