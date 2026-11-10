import Link from "next/link";
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  CircleIcon,
} from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { personInitials } from "@/utils/list-row";

/* Presentation only: the Client editor's header, section index and section frames. */

export type IndexItem = { id: string; label: string; done: boolean };

/** The Client's card above the tabs: initials, name, kind, Visibility and how close it is to public. */
export function ProfileHeader({
  name,
  kind,
  isPublic,
  missing,
  progress,
}: {
  name: string;
  kind: "Player" | "Coach";
  isPublic: boolean;
  missing: number;
  progress?: { done: number; total: number };
}) {
  return (
    <div className="flex flex-col gap-3">
      <Button
        asChild
        variant="ghost"
        size="sm"
        className="text-muted-foreground -ml-2 w-fit"
      >
        <Link href="/clients">
          <ArrowLeftIcon />
          Clients
        </Link>
      </Button>
      <div className="bg-card ring-foreground/10 border-t-destructive flex flex-wrap items-center gap-4 border-t-[3px] px-5 py-4 ring-1">
        <div className="bg-sidebar text-sidebar-primary flex size-14 shrink-0 items-center justify-center text-base font-semibold">
          {personInitials(name)}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-1.5">
          <h1 className="text-2xl break-words">{name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span className="bg-secondary text-primary px-2 py-0.5">{kind}</span>
            <span
              className={cn(
                "px-2 py-0.5",
                isPublic
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground",
              )}
            >
              {isPublic ? "Public" : "Private"}
            </span>
          </div>
        </div>
        <a
          href="#visibility"
          className="hover:bg-muted/60 flex min-w-40 flex-col gap-1.5 px-2 py-1 text-right"
        >
          <span className="text-muted-foreground text-xs">
            {missing === 0
              ? "Ready to be public"
              : `${missing} missing to be public`}
          </span>
          {progress ? (
            <span className="bg-secondary block h-1.5 w-full">
              <span
                className="bg-primary block h-1.5"
                style={{
                  width: `${Math.round((progress.done / progress.total) * 100)}%`,
                }}
              />
            </span>
          ) : null}
        </a>
      </div>
    </div>
  );
}

/** The left column: links to each section, ticked when the saved profile has it filled in. */
export function SectionIndex({ items }: { items: IndexItem[] }) {
  return (
    <nav
      aria-label="Profile sections"
      className="bg-card ring-foreground/10 flex flex-col gap-0.5 p-2 ring-1 lg:sticky lg:top-6"
    >
      <p className="text-muted-foreground px-2 pt-1 pb-1.5 text-xs font-medium uppercase tracking-wider">
        Sections
      </p>
      {items.map((item, index) => (
        <a
          key={item.id}
          href={`#${item.id}`}
          className="hover:bg-secondary hover:text-primary flex items-center justify-between gap-2 px-2 py-1.5 text-sm"
        >
          <span>
            <span className="text-muted-foreground mr-1.5 tabular-nums">
              {index + 1}
            </span>
            {item.label}
          </span>
          {item.done ? (
            <CheckCircleIcon
              aria-label="Filled in"
              weight="fill"
              className="text-primary size-4 shrink-0"
            />
          ) : (
            <CircleIcon
              aria-label="Not filled in yet"
              className="text-muted-foreground/60 size-4 shrink-0"
            />
          )}
        </a>
      ))}
    </nav>
  );
}

/** Index on the left, sections on the right; one column on small screens. */
export function EditorLayout({
  index,
  children,
}: {
  index: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="grid w-full gap-6 lg:grid-cols-[13rem_minmax(0,1fr)]">
      <div className="min-w-0">{index}</div>
      <div className="flex min-w-0 flex-col gap-6">{children}</div>
    </div>
  );
}

/** One numbered block of the editor with a light-blue title band. */
export function ProfileSection({
  id,
  number,
  title,
  icon,
  description,
  children,
}: {
  id: string;
  number: number;
  title: string;
  icon: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      className="bg-card ring-foreground/10 min-w-0 scroll-mt-6 ring-1"
    >
      <div className="bg-secondary text-primary flex items-center gap-2.5 border-b px-4 py-2.5">
        <span className="bg-primary text-primary-foreground inline-flex size-6 shrink-0 items-center justify-center text-xs font-semibold">
          {number}
        </span>
        <span aria-hidden className="[&_svg]:size-5">
          {icon}
        </span>
        <h2
          id={`${id}-title`}
          className="font-heading text-lg leading-none tracking-wide uppercase"
        >
          {title}
        </h2>
      </div>
      {description ? (
        <p className="text-muted-foreground border-b px-4 py-2.5 text-sm text-pretty">
          {description}
        </p>
      ) : null}
      <div className="p-4">{children}</div>
    </section>
  );
}
