"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

const routeLabels: Array<{ prefix: string; label: string }> = [
  { prefix: "/contacts", label: "Inbox" },
  { prefix: "/players", label: "Players" },
  { prefix: "/coaches", label: "Coaches" },
  { prefix: "/categories", label: "Categories" },
  { prefix: "/trash", label: "Trash" },
  { prefix: "/users", label: "Users" },
];

function crumbsForPath(pathname: string): {
  parent?: { href: string; label: string };
  page: string;
} {
  const match = routeLabels.find(
    (route) =>
      pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );

  if (!match) {
    return { page: "Dashboard" };
  }

  if (pathname === match.prefix) {
    return { page: match.label };
  }

  return {
    parent: { href: match.prefix, label: match.label },
    page: "Profile",
  };
}

export function SiteHeader() {
  const pathname = usePathname();
  const { parent, page } = crumbsForPath(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          {parent ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink asChild>
                  <Link href={parent.href}>{parent.label}</Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
            </>
          ) : null}
          <BreadcrumbItem>
            <BreadcrumbPage>{page}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
