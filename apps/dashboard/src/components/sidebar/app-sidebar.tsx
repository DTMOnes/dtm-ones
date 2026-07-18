"use client";

import * as React from "react";
import {
  EnvelopeSimpleIcon,
  FolderIcon,
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

const contactsItems: MenuItem[] = [
  {
    title: "Contacts",
    url: "/contacts",
    icon: EnvelopeSimpleIcon,
  },
];

const playersItems: MenuItem[] = [
  {
    title: "Players",
    url: "/players",
    icon: UsersIcon,
  },
  {
    title: "Categories",
    url: "/categories",
    icon: FolderIcon,
  },
];

const usersItems: MenuItem[] = [
  {
    title: "Users",
    url: "/users",
    icon: UserGearIcon,
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
        <div className="px-2 py-2">
          <span className="text-lg font-semibold tracking-tight">DTM Ones</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Inbox" items={contactsItems} />
        <NavGroup label="Players Content" items={playersItems} />
        {isOwner ? (
          <NavGroup label="Administration" items={usersItems} />
        ) : null}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
