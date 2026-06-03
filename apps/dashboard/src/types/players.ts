import type { InferSelectModel } from "drizzle-orm";
import type {
  players,
  playerCategories,
  categories,
  playerMedia,
} from "@/lib/db/schema";

export type Player = InferSelectModel<typeof players>;

export type PlayerWithRelations = Player & {
  playerCategories: (InferSelectModel<typeof playerCategories> & {
    category: InferSelectModel<typeof categories>;
  })[];
  playerMedia: InferSelectModel<typeof playerMedia>[];
};
