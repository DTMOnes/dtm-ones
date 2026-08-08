"use client";

import { Suspense, useMemo } from "react";
import { usePathname } from "next/navigation";

// Components
import Header from "@/components/Header";
import Search from "@/components/Header/Search";
import Filters from "@/components/Header/Filters";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import {
  PLAYER_SECTIONS,
  type PlayerSectionId,
} from "@/components/Header/Filters/player-sections";

export default function SiteHeader() {
  const pathname = usePathname();
  const { override, categoryFilters } = useHeaderOverride();
  const isHome = pathname === "/";
  const isPlayer = override?.type === "player";

  const search = useMemo(() => {
    if (override?.type === "player") {
      return (
        <Filters
          items={[...PLAYER_SECTIONS]}
          variant="sections"
          name="section"
          value={override.section}
          onChange={(id) => override.onSectionChange(id as PlayerSectionId)}
        />
      );
    }

    if (isHome) {
      return (
        <Suspense fallback={null}>
          <Search />
        </Suspense>
      );
    }

    return null;
  }, [override, isHome]);

  const filters =
    isHome && categoryFilters ? (
      <Suspense fallback={null}>
        <Filters items={categoryFilters} />
      </Suspense>
    ) : null;

  return (
    <Header
      search={search}
      filters={filters}
      stackCenterOnMobile={isPlayer}
    />
  );
}
