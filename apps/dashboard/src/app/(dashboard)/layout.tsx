// Next
import { redirect } from "next/navigation";

// Components
import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";

// Shadcn
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

// Lib
import { serverApiFetch } from "@/lib/api/server-client";
import type { ApiAuthSessionUser } from "@/lib/api/types";

async function loadUser(): Promise<ApiAuthSessionUser> {
  try {
    return await serverApiFetch<ApiAuthSessionUser>("/auth/me");
  } catch {
    // Middleware should prevent this, but guard against an invalid session.
    redirect("/auth/signin");
  }
}

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await loadUser();

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" user={user} isAdmin={user.role === "admin"} />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
