"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

/** An "All / A / B" toggle kept in one URL search param; "All" removes it. */
export function ParamFilter({
  param,
  label,
  options,
}: {
  param: string;
  label: string;
  options: readonly { value: string; label: string }[];
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const raw = searchParams.get(param);
  const selected = options.some((option) => option.value === raw)
    ? raw!
    : "all";

  return (
    <div className="flex items-center gap-2">
      <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {label}
      </span>
      <ToggleGroup
        type="single"
        size="sm"
        variant="outline"
        spacing={2}
        value={selected}
        aria-label={`Filter by ${label}`}
        onValueChange={(value) => {
          if (!value) {
            return;
          }

          const params = new URLSearchParams(searchParams);

          if (value === "all") {
            params.delete(param);
          } else {
            params.set(param, value);
          }

          const query = params.toString();
          replace(query ? `${pathname}?${query}` : pathname);
        }}
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        {options.map((option) => (
          <ToggleGroupItem key={option.value} value={option.value}>
            {option.label}
          </ToggleGroupItem>
        ))}
      </ToggleGroup>
    </div>
  );
}
