"use client";

// Next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// React
import { useMemo } from "react";

// Shadcn
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Empty, EmptyDescription } from "@/components/ui/empty";

// Phosphor
import { FunnelSimpleIcon } from "@phosphor-icons/react";

// Utils
import { cn } from "@/lib/utils";

export default function FilterButton({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const selected = useMemo(
    () => new Set(searchParams.getAll("c")),
    [searchParams],
  );

  const handleToggle = (id: string, checked: boolean) => {
    const params = new URLSearchParams(searchParams);

    if (checked) {
      params.append("c", id);
    } else {
      params.delete("c", id);
    }

    replace(`${pathname}?${params.toString()}`);
  };

  const handleClear = () => {
    const params = new URLSearchParams(searchParams);

    params.delete("c");

    replace(`${pathname}?${params.toString()}`);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label="Filter by category"
          aria-pressed={selected.size > 0}
          className={cn(
            selected.size > 0 && "border-foreground/40 bg-muted",
          )}
        >
          <FunnelSimpleIcon />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Categories</DropdownMenuLabel>
        {categories.length === 0 ? (
          <Empty className="border-0 bg-muted p-3 gap-0">
            <EmptyDescription className="text-xs">
              No categories created yet
            </EmptyDescription>
          </Empty>
        ) : (
          categories.map((cat) => {
            const id = cat.id.toString();

            return (
              <DropdownMenuCheckboxItem
                key={cat.id}
                checked={selected.has(id)}
                onCheckedChange={(checked) => handleToggle(id, checked)}
                onSelect={(e) => e.preventDefault()}
              >
                {cat.name}
              </DropdownMenuCheckboxItem>
            );
          })
        )}
        {selected.size > 0 ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-muted-foreground focus:text-foreground"
              onSelect={() => handleClear()}
            >
              Clear filters
            </DropdownMenuItem>
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
