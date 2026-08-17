import { headers } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { findDashboardUser } from "@/utils/auth/find-dashboard-user";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const requestHeaders = await headers();
  const baSession = await auth.api.getSession({
    headers: requestHeaders,
  });

  if (!baSession?.user) {
    redirect("/signin");
  }

  let user;
  try {
    user = await findDashboardUser(baSession.user.id);
  } catch (error) {
    console.error("[dashboard-layout]", error);
    redirect("/signin");
  }

  if (!user) {
    // Layouts cannot clear cookies. Route handler signs out and redirects.
    redirect("/api/auth/deny");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar
        variant="inset"
        user={user}
        isOwner={user.role === "owner"}
      />
      <SidebarInset>
        <SiteHeader />
        {children}
      </SidebarInset>
    </SidebarProvider>
  );
}
