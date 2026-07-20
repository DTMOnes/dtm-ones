export type UserRole = "user" | "admin";

export type ApiMessageResponse = {
  message: string;
};

export type ApiUser = {
  id: string;
  email: string;
  name: string;
  role: UserRole | null;
  created_at: string;
  updated_at: string;
};

export type ApiUserDetail = ApiUser & {
  admin_count: number;
  is_only_admin: boolean;
};
