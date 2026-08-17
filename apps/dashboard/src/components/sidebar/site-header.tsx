"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";

const routeLabels: Array<{ prefix: string; label: string }> = [
  { prefix: "/contacts", label: "Contacts" },
  { prefix: "/players", label: "Players" },
  { prefix: "/coaches", label: "Coaches" },
  { prefix: "/categories", label: "Categories" },
  { prefix: "/users", label: "Users" },
];

function labelForPath(pathname: string): string {
  const match = routeLabels.find(
    (route) =>
      pathname === route.prefix || pathname.startsWith(`${route.prefix}/`),
  );
  return match?.label ?? "Dashboard";
}

export function SiteHeader() {
  const pathname = usePathname();
  const label = labelForPath(pathname);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbPage>{label}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    </header>
  );
}
