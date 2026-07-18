import { redirect, unstable_rethrow } from "next/navigation";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { createInsforgeAuthActions } from "@/lib/insforge-server";
import { getSession } from "@/utils/auth/get-session";

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let session;
  try {
    session = await getSession();
  } catch (error) {
    unstable_rethrow(error);
    console.error("[dashboard/layout]", error);
    session = null;
  }

  if (session?.status === "authenticated") {
    const user = session.user;

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

  if (session?.status !== "unauthenticated") {
    const auth = await createInsforgeAuthActions();
    const { error } = await auth.signOut();
    if (error) {
      console.error("[dashboard/layout]", error);
    }
  }

  redirect("/signin");
}
