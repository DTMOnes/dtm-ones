"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";

// Components
import Header from "@/components/Header";
import Search from "@/components/Header/Search";
import Filters from "@/components/Header/Filters";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";

export default function SiteHeader() {
  const pathname = usePathname();
  const { categoryFilters } = useHeaderOverride();
  const isHome = pathname === "/";

  const search = isHome ? (
    <Suspense fallback={null}>
      <Search />
    </Suspense>
  ) : null;

  const filters =
    isHome && categoryFilters ? (
      <Suspense fallback={null}>
        <Filters items={categoryFilters} />
      </Suspense>
    ) : null;

  return <Header search={search} filters={filters} />;
}
