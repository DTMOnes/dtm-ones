"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

import Header from "@/components/Header";
import SearchCluster from "@/components/Header/SearchCluster";

export default function SiteHeader() {
  const pathname = usePathname();
  const isHome = pathname === "/";

  const search = isHome ? (
    <Suspense fallback={null}>
      <SearchCluster />
    </Suspense>
  ) : null;

  return (
    <Header search={search} overlay={pathname.startsWith("/roster/")} />
  );
}
