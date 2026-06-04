"use client";

// Next
import { usePathname, useRouter, useSearchParams } from "next/navigation";

// Debounce
import { useDebouncedCallback } from "use-debounce";

// Shadcn
import { Input } from "@/components/ui/input";

export default function SearchBar({
  placeholder = "Buscar por nombre...",
}: {
  placeholder?: string;
}) {
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleSearch = useDebouncedCallback((value: string) => {
    const params = new URLSearchParams(searchParams);

    if (value) {
      params.set("q", value);
    } else {
      params.delete("q");
    }

    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <Input
      placeholder={placeholder}
      onChange={(e) => handleSearch(e.target.value)}
      defaultValue={searchParams.get("q")?.toString()}
    />
  );
}
