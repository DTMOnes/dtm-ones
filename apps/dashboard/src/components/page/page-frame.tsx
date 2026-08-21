import Link from "next/link";
import { ArrowLeftIcon, CaretRightIcon } from "@phosphor-icons/react/ssr";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { ItemGroup, ItemMedia } from "@/components/ui/item";
import { Skeleton } from "@/components/ui/skeleton";
import { personInitials } from "@/utils/list-row";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full min-h-0 w-full flex-1 flex-col gap-8 p-6 md:p-10">
      {children}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
  status,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  backHref?: string;
  backLabel?: string;
  status?: string;
}) {
  const iconOnlyBack = Boolean(backHref) && !backLabel;
  const backButton = backHref ? (
    <Button
      asChild
      variant="ghost"
      size={backLabel ? "sm" : "icon-sm"}
      className={
        backLabel
          ? "text-muted-foreground -ml-2 w-fit"
          : "text-muted-foreground -ml-2 mt-0.5 shrink-0"
      }
    >
      <Link href={backHref} aria-label={backLabel ?? "Go back"}>
        <ArrowLeftIcon />
        {backLabel}
      </Link>
    </Button>
  ) : null;

  const heading = (
    <div className="flex min-w-0 flex-1 flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <h1 className="text-2xl font-semibold tracking-tight break-words">
            {title}
          </h1>
          {status ? (
            <span className="text-muted-foreground text-sm font-medium">
              {status}
            </span>
          ) : null}
        </div>
        {description ? (
          <p className="text-muted-foreground text-sm">{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  );

  if (iconOnlyBack) {
    return (
      <div className="flex items-start gap-1">
        {backButton}
        {heading}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {backButton}
      {heading}
    </div>
  );
}

export function PageToolbar({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-2">{children}</div>
  );
}

export function DetailLayout({
  main,
  rail,
}: {
  main: React.ReactNode;
  rail: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 w-full flex-col gap-6">
      {main}
      {rail}
    </div>
  );
}

export function ListEmpty({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <ItemGroup className="flex-1" role="presentation">
      <Empty className="min-h-56 flex-1">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <Icon />
          </EmptyMedia>
          <EmptyTitle>{title}</EmptyTitle>
          <EmptyDescription>{description}</EmptyDescription>
        </EmptyHeader>
        {action ? <EmptyContent>{action}</EmptyContent> : null}
      </Empty>
    </ItemGroup>
  );
}

export function ListRowAvatar({ name }: { name: string }) {
  return (
    <ItemMedia variant="image">
      <span className="text-muted-foreground text-xs font-medium">
        {personInitials(name)}
      </span>
    </ItemMedia>
  );
}

export function ListRowMeta({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-muted-foreground text-sm font-medium">
      {children}
    </span>
  );
}

export function ListRowChevron() {
  return (
    <CaretRightIcon
      aria-hidden
      className="text-muted-foreground size-4 shrink-0 opacity-40 transition-opacity group-hover/item:opacity-100"
    />
  );
}

export function ListRowSkeleton({
  count = 5,
  leading = true,
}: {
  count?: number;
  leading?: boolean;
}) {
  return (
    <ItemGroup role="presentation">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="flex items-center gap-3 rounded-lg bg-muted/45 px-3.5 py-3"
        >
          {leading ? (
            <Skeleton className="size-10 shrink-0 rounded-lg" />
          ) : null}
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
      ))}
    </ItemGroup>
  );
}
