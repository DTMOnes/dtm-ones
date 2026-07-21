import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { AppSidebar } from "@/components/sidebar/app-sidebar";
import { SiteHeader } from "@/components/sidebar/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { auth } from "@/lib/auth";
import { createInsforgeServerWithUserId } from "@/lib/insforge-server";
import type { Session } from "@/types/auth/session";
import { getSession } from "@/utils/auth/get-session";

const roleSchema = z.enum(["owner", "staff"]);

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  let user: Session["user"] | null = (await getSession())?.user ?? null;

  if (!user) {
    const requestHeaders = await headers();
    const baSession = await auth.api.getSession({
      headers: requestHeaders,
    });

    if (!baSession?.user) {
      redirect("/signin");
    }

    // Better Auth session exists but getSession found no app role. Confirm
    // before treating the user as unauthorized (avoid a false deny on a
    // transient DB error).
    const insforge = createInsforgeServerWithUserId(baSession.user.id);
    const { data, error } = await insforge.database
      .from("users")
      .select("id, email, role")
      .eq("id", baSession.user.id)
      .maybeSingle();

    if (error) {
      console.error("[dashboard-layout]", error);
      redirect("/signin");
    }

    const role = roleSchema.safeParse(data?.role);
    if (!data || !role.success) {
      // Layouts cannot clear cookies. Route handler signs out and redirects.
      redirect("/api/auth/deny");
    }

    user = {
      id: data.id,
      email: data.email,
      role: role.data,
    };
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
