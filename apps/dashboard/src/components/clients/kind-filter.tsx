"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const OPTIONS = [
  { value: "all", label: "All" },
  { value: "player", label: "Player" },
  { value: "coach", label: "Coach" },
] as const;

export function KindFilter() {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get("kind");
  const selected = raw === "player" || raw === "coach" ? raw : "all";

  return (
    <ToggleGroup
      type="single"
      size="sm"
      variant="outline"
      spacing={2}
      value={selected}
      aria-label="Filter by kind"
      onValueChange={(value) => {
        if (!value) {
          return;
        }

        const params = new URLSearchParams(searchParams);

        if (value === "all") {
          params.delete("kind");
        } else {
          params.set("kind", value);
        }

        const query = params.toString();
        replace(query ? `${pathname}?${query}` : pathname);
      }}
    >
      {OPTIONS.map((option) => (
        <ToggleGroupItem key={option.value} value={option.value}>
          {option.label}
        </ToggleGroupItem>
      ))}
    </ToggleGroup>
  );
}
