import Link from "next/link";
import Image from "next/image";

export default function Logo() {
  return (
    <Link href="/" className="flex size-11 items-center justify-center">
      <Image
        className="block"
        src="/assets/dtm-ones-logo.svg"
        alt="DTM Ones"
        width={30}
        height={25}
      />
    </Link>
  );
}
