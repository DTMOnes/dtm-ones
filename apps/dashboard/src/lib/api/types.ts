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

export type ApiCategory = {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type ApiCategoryWithCount = ApiCategory & {
  player_count: number;
};

export type ApiPlayerSummary = {
  id: string;
  full_name: string;
  height: string;
  date_of_birth: string;
  nationality: string;
  last_club: string;
  created_at: string;
  updated_at: string;
};

export type ApiPlayerMedia = {
  id: string;
  player_id: string;
  media_type: "image" | "institutional_picture" | "video";
  url: string;
  created_at: string;
};

export type ApiPlayer = ApiPlayerSummary & {
  categories: ApiCategory[];
  media: ApiPlayerMedia[];
};

export type ApiCategoryDetail = ApiCategory & {
  players: ApiPlayerSummary[];
};

export type ApiContactRequest = {
  id: string;
  reason: "hire_services" | "seek_representation";
  email: string;
  message: string;
  created_at: string;
};

export type ApiAuthSessionUser = ApiUser;

export type ApiTokenResponse = {
  access_token: string;
  refresh_token: string;
  token_type: "bearer";
  expires_in: number;
  user: ApiAuthSessionUser;
};
