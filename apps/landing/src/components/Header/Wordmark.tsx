import Image from "next/image";

/** White DTMONES wordmark (1035×168 PNG). */
export default function Wordmark({ height = 22 }: { height?: number }) {
  return (
    <Image
      src="/assets/dtm-ones-wordmark.png"
      alt="DTMones"
      width={Math.round((height * 1035) / 168)}
      height={height}
      priority
    />
  );
}
