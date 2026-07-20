import type { DashboardUser } from "@/lib/auth/types";

export type Session = {
  status: "authenticated";
  user: DashboardUser;
};
