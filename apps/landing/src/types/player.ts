import type { Category } from "@/types/category";

export type PlayerMedia = {
  id: string;
  player_id: string;
  media_type: "image" | "institutional_picture" | "video";
  url: string;
  created_at: string;
};

export type Player = {
  id: string;
  full_name: string;
  height: string;
  date_of_birth: string;
  nationality: string;
  last_club: string;
  created_at: string;
  updated_at: string;
  categories: Category[];
  media: PlayerMedia[];
};
