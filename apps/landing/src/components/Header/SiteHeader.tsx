"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/Header";

export default function SiteHeader() {
  const pathname = usePathname();

  // Home draws the header over the hero; every other page stacks it above the content.
  return <Header overlay={pathname === "/"} />;
}
