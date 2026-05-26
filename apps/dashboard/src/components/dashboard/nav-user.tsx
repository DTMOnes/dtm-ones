"use client";

import { useRouter } from "next/navigation";
import { DotsThreeVerticalIcon, SignOutIcon } from "@phosphor-icons/react";

// Better Auth
import { authClient } from "@/lib/auth/client";

// Components
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

// Hooks
import { useIsMobile } from "@/hooks/use-mobile";

function displayName(user: {
  name?: string | null;
  email?: string | null;
}): string {
  const trimmed = user.name?.trim();
  if (trimmed) return trimmed;
  return user.email?.split("@")[0] ?? "Usuario";
}

export function NavUser() {
  const router = useRouter();
  const isMobile = useIsMobile();
  const { data: session, isPending } = authClient.useSession();
  const user = session?.user ?? null;

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/auth/signin");
    router.refresh();
  };

  if (isPending) {
    return (
      <SidebarMenu>
        <SidebarMenuItem>
          <SidebarMenuButton size="lg" disabled>
            <span className="text-muted-foreground text-sm">Cargando…</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    );
  }

  if (!user) {
    return null;
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
            >
              <Avatar className="h-8 w-8 rounded-lg grayscale">
                <AvatarFallback className="rounded-lg">
                  {displayName(user).slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-medium">
                  {displayName(user)}
                </span>
                <span className="text-muted-foreground truncate text-xs">
                  {user.email}
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
            <DropdownMenuItem onClick={() => void handleSignOut()}>
              <SignOutIcon className="size-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
