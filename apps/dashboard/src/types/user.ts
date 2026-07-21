import type { DashboardRole } from "@/lib/auth/types";

export type DashboardUserRow = {
  id: string;
  email: string;
  name: string;
  role: DashboardRole;
  created_at: string;
  updated_at: string;
};

export type DashboardUserDetail = DashboardUserRow & {
  owner_count: number;
  is_only_owner: boolean;
};
