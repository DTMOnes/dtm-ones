import "server-only";

import { getInstagramToken } from "@dtm/database";

import { env } from "@/config/env";
import { db } from "@/lib/db";

import type { InstagramPost } from "./hashtags";

export { postsWithHashtag, type InstagramPost } from "./hashtags";

type MediaItem = {
  id: string;
  caption?: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  permalink: string;
};

const FIELDS = "id,caption,media_type,media_url,thumbnail_url,permalink";
// ponytail: scans the latest 4 × 100 posts; older tagged posts drop off the feeds.
const MAX_PAGES = 4;
/** Instagram data is cached for an hour: fresh enough, far below the API rate limit. */
const REVALIDATE_SECONDS = 3600;

function toPost(item: MediaItem): InstagramPost | null {
  const image = item.media_type === "VIDEO" ? item.thumbnail_url : item.media_url;
  return image
    ? { id: item.id, image, permalink: item.permalink, caption: item.caption ?? "" }
    : null;
}

/**
 * The token the dashboard keeps renewed, else the one in the environment (before the
 * first one is saved, or if the database read fails).
 */
async function accessToken(): Promise<string | undefined> {
  try {
    const stored = await getInstagramToken(db);
    if (stored) return stored.accessToken;
  } catch (error) {
    console.error({ source: "instagram-token", message: (error as Error).message });
  }
  return env.INSTAGRAM_ACCESS_TOKEN;
}

/**
 * The agency's own posts, newest first, through the Instagram API with Instagram Login.
 * Returns [] without a token or when Instagram fails, so pages fall back instead of breaking.
 */
export async function listAgencyPosts(): Promise<InstagramPost[]> {
  const token = await accessToken();
  if (!token) return [];

  const posts: InstagramPost[] = [];
  let url: string | undefined =
    `https://graph.instagram.com/me/media?fields=${FIELDS}&limit=100&access_token=${encodeURIComponent(token)}`;

  try {
    for (let page = 0; url && page < MAX_PAGES; page++) {
      const response: Response = await fetch(url, {
        next: { revalidate: REVALIDATE_SECONDS, tags: ["instagram"] },
      });
      if (!response.ok) {
        throw new Error(`Instagram API ${response.status}: ${await response.text()}`);
      }
      const body = (await response.json()) as {
        data: MediaItem[];
        paging?: { next?: string };
      };
      for (const item of body.data) {
        const post = toPost(item);
        if (post) posts.push(post);
      }
      url = body.paging?.next;
    }
  } catch (error) {
    console.error({ source: "instagram", message: (error as Error).message });
  }

  return posts;
}

export async function hasInstagram(): Promise<boolean> {
  return Boolean(await accessToken());
}
