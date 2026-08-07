"use client";

import { Suspense, useMemo } from "react";
import { usePathname } from "next/navigation";

// Components
import Header from "@/components/Header";
import Logo from "@/components/Header/Logo";
import Search from "@/components/Header/Search";
import Filters from "@/components/Header/Filters";
import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import {
  PLAYER_SECTIONS,
  type PlayerSectionId,
} from "@/components/Header/Filters/player-sections";

import type { FilterItem } from "@/components/Header/Filters";

export default function SiteHeader({
  categories,
}: {
  categories: FilterItem[];
}) {
  const pathname = usePathname();
  const { override } = useHeaderOverride();
  const isHome = pathname === "/";

  const playerSlots = useMemo(() => {
    if (override?.type !== "player") return null;

    return {
      brand: <Logo title={override.playerName} />,
      search: null,
      filters: (
        <Filters
          items={[...PLAYER_SECTIONS]}
          variant="sections"
          name="section"
          value={override.section}
          onChange={(id) => override.onSectionChange(id as PlayerSectionId)}
        />
      ),
    };
  }, [override]);

  const brand = playerSlots?.brand;
  const search = playerSlots
    ? playerSlots.search
    : isHome ? (
        <Suspense fallback={null}>
          <Search />
        </Suspense>
      ) : null;
  const filters = playerSlots
    ? playerSlots.filters
    : isHome ? (
        <Suspense fallback={null}>
          <Filters items={categories} />
        </Suspense>
      ) : null;

  return <Header brand={brand} search={search} filters={filters} />;
}
