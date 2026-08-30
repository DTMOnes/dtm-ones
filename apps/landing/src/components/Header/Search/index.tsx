"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useDebouncedCallback } from "use-debounce";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import { cn } from "@/lib/utils";

export default function Search({
  autoFocus = false,
  variant = "pill",
}: {
  autoFocus?: boolean;
  variant?: "pill" | "panel";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!autoFocus) return;
    const frame = window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
    return () => window.cancelAnimationFrame(frame);
  }, [autoFocus]);

  const handleSearch = useDebouncedCallback((next: string) => {
    const params = new URLSearchParams(searchParams);

    if (next) {
      params.set("q", next);
    } else {
      params.delete("q");
    }

    startRosterTransition(() => {
      replace(`${pathname}?${params.toString()}`);
    });
  }, 300);

  const clearSearch = () => {
    setValue("");
    handleSearch("");
    inputRef.current?.focus();
  };

  if (variant === "panel") {
    return (
      <input
        ref={inputRef}
        className="w-full appearance-none bg-transparent py-1 text-[15px] text-white outline-none placeholder:text-white/32 [&::-webkit-search-cancel-button]:hidden"
        type="search"
        aria-label="Search by name"
        placeholder="Search by name"
        value={value}
        onChange={(event) => {
          const next = event.target.value;
          setValue(next);
          handleSearch(next);
        }}
      />
    );
  }

  return (
    <div className="w-full">
      <label className="search-pill">
        <MagnifyingGlass
          className={cn(
            "relative size-5 shrink-0 text-neutral-500 transition-colors duration-200",
            (focused || value.length > 0) && "text-neutral-300",
          )}
          weight="bold"
          aria-hidden
        />

        <input
          ref={inputRef}
          className="min-w-0 flex-1 appearance-none bg-transparent text-[15px] text-white outline-none placeholder:text-neutral-500 [&::-webkit-search-cancel-button]:hidden"
          type="search"
          aria-label="Search by name"
          placeholder="Search by name"
          value={value}
          onChange={(event) => {
            const next = event.target.value;
            setValue(next);
            handleSearch(next);
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        <button
          type="button"
          className={cn(
            "relative shrink-0 cursor-pointer text-neutral-500 transition-all duration-200 hover:text-white",
            value.length === 0
              ? "pointer-events-none opacity-0"
              : "opacity-100",
          )}
          aria-label="Clear search"
          tabIndex={value.length === 0 ? -1 : 0}
          onClick={clearSearch}
        >
          <X className="size-5" weight="bold" aria-hidden />
        </button>
      </label>
    </div>
  );
}
