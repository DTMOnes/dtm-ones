export type DashboardRole = "owner" | "staff";

export type DashboardUser = {
  id: string;
  email: string;
  role: DashboardRole;
};

export type SignInSuccess = {
  ok: true;
  user: DashboardUser;
};

export type SignOutSuccess = {
  ok: true;
};
