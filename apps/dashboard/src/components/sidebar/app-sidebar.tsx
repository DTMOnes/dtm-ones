"use client";

import * as React from "react";
import {
  EnvelopeSimpleIcon,
  FolderIcon,
  UserGearIcon,
  UsersIcon,
} from "@phosphor-icons/react";

// Shadcn
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

// Components
import { NavGroup, type MenuItem } from "@/components/sidebar/nav-group";
import { NavUser, type NavUserData } from "@/components/sidebar/nav-user";

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
    title: "Contact Requests",
    url: "/contact-requests",
    icon: EnvelopeSimpleIcon,
  },
  {
    title: "Users",
    url: "/users",
    icon: UserGearIcon,
  },
];

export function AppSidebar({
  user,
  isAdmin,
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: NavUserData;
  isAdmin: boolean;
}) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <div className="px-2 py-2">
          <span className="[font-family:var(--font-bebas-neue)] text-3xl">
            DTM-ONES
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <NavGroup label="Players Content" items={playersItems} />
        {isAdmin ? (
          <NavGroup label="Administration" items={usersItems} />
        ) : null}
      </SidebarContent>
      <SidebarRail />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <NavUser user={user} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
