"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DotsThreeVerticalIcon,
  SignOutIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";

import { signOutAction } from "@/actions/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";
import type { DashboardRole } from "@/lib/auth/types";

export type NavUserData = {
  email: string;
  role: DashboardRole;
  name?: string | null;
};

function displayName(user: NavUserData): string {
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed;
  return user.email.split("@")[0] ?? "User";
}

function roleLabel(role: DashboardRole): string {
  return role === "owner" ? "Owner" : "Staff";
}

export function NavUser({ user }: { user: NavUserData }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const [pending, setPending] = useState(false);

  async function handleSignOut() {
    setPending(true);
    try {
      const result = await signOutAction();

      if (result.serverError) {
        toast.error(result.serverError.message);
      }

      router.push("/signin");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              tooltip={displayName(user)}
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              disabled={pending}
            >
              <Avatar className="size-8 overflow-hidden rounded-full grayscale">
                <AvatarFallback className="overflow-hidden rounded-full">
                  <UserIcon className="size-4" weight="bold" aria-hidden />
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {displayName(user)}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {roleLabel(user.role)} · {user.email}
                </span>
              </div>
              <DotsThreeVerticalIcon className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
          >
            <DropdownMenuItem
              onClick={() => {
                void handleSignOut();
              }}
              disabled={pending}
            >
              <SignOutIcon className="size-4" />
              Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
