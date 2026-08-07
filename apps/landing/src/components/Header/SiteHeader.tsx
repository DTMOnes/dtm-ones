"use client";

import { Suspense, useMemo } from "react";
import { usePathname } from "next/navigation";

// Components
import Header from "@/components/Header";
import Logo from "@/components/Header/Logo";
import Search from "@/components/Header/Search";
import Filters from "@/components/Header/Filters";
import {
  DEFAULT_BRAND_TITLE,
  useHeaderOverride,
} from "@/components/Header/HeaderProvider";
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
  const { override, pendingTitle } = useHeaderOverride();
  const isHome = pathname === "/";
  const isPlayer = override?.type === "player";

  const playerSlots = useMemo(() => {
    if (override?.type !== "player") return null;

    return {
      // Top row with logo + menu; stacks under 650px via Header CSS.
      search: (
        <Filters
          items={[...PLAYER_SECTIONS]}
          variant="sections"
          name="section"
          value={override.section}
          onChange={(id) => override.onSectionChange(id as PlayerSectionId)}
        />
      ),
      filters: null,
    };
  }, [override]);

  const brandTitle =
    pendingTitle ??
    (isPlayer ? override.playerName : DEFAULT_BRAND_TITLE);

  const brand = <Logo title={brandTitle} />;
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

  return (
    <Header
      brand={brand}
      search={search}
      filters={filters}
      stackCenterOnMobile={isPlayer}
    />
  );
}
