"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import {
  FolderIcon,
  HouseIcon,
  UserGearIcon,
  UsersIcon,
} from "@phosphor-icons/react";

// Components
import { NavUser } from "@/components/dashboard/nav-user";

type MenuItem = {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Landing Page Content — deshabilitado por ahora
// const landingItems: MenuItem[] = [
//   {
//     title: "Content",
//     url: "/dashboard/landing",
//     icon: BrowsersIcon,
//   },
// ];

const playersItems: MenuItem[] = [
  {
    title: "Players",
    url: "/dashboard/players",
    icon: UsersIcon,
  },
  {
    title: "Categories",
    url: "/dashboard/categories",
    icon: FolderIcon,
  },
];

const usersItems: MenuItem[] = [
  {
    title: "Manage users",
    url: "/dashboard/users",
    icon: UserGearIcon,
  },
];

function isItemActive(pathname: string, url: string) {
  return pathname === url || pathname.startsWith(`${url}/`);
}

function NavGroup({ label, items }: { label: string; items: MenuItem[] }) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton
                asChild
                isActive={isItemActive(pathname, item.url)}
                tooltip={item.title}
              >
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offExamples" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-2">
          <div className="bg-primary text-primary-foreground flex size-8 items-center justify-center rounded-md">
            <HouseIcon className="size-4" />
          </div>
          <span className="font-semibold group-data-[collapsible=icon]:hidden">
            DTM-ONES
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* <NavGroup label="Landing Page Content" items={landingItems} /> */}
        <NavGroup label="Players Content" items={playersItems} />
        <NavGroup label="Users" items={usersItems} />
      </SidebarContent>
      <SidebarRail />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavUser />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
