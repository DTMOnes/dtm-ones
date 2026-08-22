"use client";

import { useRef, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { useReducedMotion } from "motion/react";
import { useDebouncedCallback } from "use-debounce";

import { useHeaderOverride } from "@/components/Header/HeaderProvider";
import ShinyText from "@/components/ShinyText";
import { cn } from "@/lib/utils";

export default function Search() {
  const inputRef = useRef<HTMLInputElement>(null);
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { startRosterTransition } = useHeaderOverride();
  const reduce = useReducedMotion() ?? false;
  const [value, setValue] = useState(searchParams.get("q") ?? "");
  const [focused, setFocused] = useState(false);

  const showHint = !focused && value.length === 0;

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

        <span className="relative min-w-0 flex-1">
          {showHint ? (
            <span className="pointer-events-none absolute inset-0 flex items-center">
              <ShinyText
                text="Search by name"
                speed={2.2}
                delay={0.35}
                color="#a3a3a3"
                shineColor="#ffffff"
                disabled={reduce}
                className="text-[15px]"
              />
            </span>
          ) : null}
          <input
            ref={inputRef}
            className="relative z-10 w-full appearance-none bg-transparent text-[15px] text-white outline-none [&::-webkit-search-cancel-button]:hidden"
            type="search"
            aria-label="Search by name"
            value={value}
            onChange={(event) => {
              const next = event.target.value;
              setValue(next);
              handleSearch(next);
            }}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
          />
        </span>

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
          onClick={() => {
            setValue("");
            handleSearch("");
            inputRef.current?.focus();
          }}
        >
          <X className="size-5" weight="bold" aria-hidden />
        </button>
      </label>
    </div>
  );
}
