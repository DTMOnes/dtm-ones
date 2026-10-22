"use client";

import * as React from "react";
import Image from "next/image";
import {
  EnvelopeSimpleIcon,
  FolderIcon,
  GearSixIcon,
  TrashIcon,
  UserGearIcon,
  UsersIcon,
} from "@phosphor-icons/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { NavGroup, type MenuItem } from "@/components/sidebar/nav-group";
import { NavUser, type NavUserData } from "@/components/sidebar/nav-user";

const inboxItems: MenuItem[] = [
  {
    title: "Inbox",
    url: "/contacts",
    icon: EnvelopeSimpleIcon,
  },
];

const clientItems: MenuItem[] = [
  {
    title: "Clients",
    url: "/clients",
    icon: UsersIcon,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderIcon,
  },
  {
    title: "Trash",
    url: "/trash",
    icon: TrashIcon,
  },
];

const adminItems: MenuItem[] = [
  {
    title: "Users",
    url: "/users",
    icon: UserGearIcon,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: GearSixIcon,
  },
];

export function AppSidebar({
  user,
  isOwner,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NavUserData;
  isOwner: boolean;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="flex items-center px-2 py-3">
          <Image
            src="/assets/dtm-ones-wordmark.png"
            alt="DTMones"
            width={123}
            height={20}
            priority
          />
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup items={inboxItems} />
        <NavGroup items={clientItems} />
        {isOwner ? (
          <NavGroup label="Administration" items={adminItems} />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
