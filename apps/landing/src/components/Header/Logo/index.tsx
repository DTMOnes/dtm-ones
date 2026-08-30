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
      className="relative block h-11 overflow-hidden"
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
