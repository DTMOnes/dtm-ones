"use client";

import Link from "next/link";
import Image from "next/image";
import { useReducedMotion } from "motion/react";
import MetallicPaint from "./MetallicPaint";

const LOGO_BLACK = "/assets/images/logo-dtm-ones-negro.png";
const LOGO_WHITE = "/assets/images/logo-dtm-ones-blanco.png";

/** Native size of logo-dtm-ones-negro.png */
const LOGO_W = 1280;
const LOGO_H = 300;

export default function Logo() {
  const reduce = useReducedMotion();

  return (
    <Link
      href="/"
      className="relative block h-11 overflow-hidden"
      style={{ aspectRatio: `${LOGO_W} / ${LOGO_H}` }}
      aria-label="DTM Ones"
    >
      {reduce ? (
        <Image
          className="object-contain"
          src={LOGO_WHITE}
          alt=""
          fill
          sizes="200px"
        />
      ) : (
        <MetallicPaint
          imageSrc={LOGO_BLACK}
          tintColor="#ffffff"
          speed={0.3}
        />
      )}
    </Link>
  );
}
