export type InstagramPost = {
  id: string;
  /** Image to show: the photo, the first carousel image, or the video thumbnail. */
  image: string;
  permalink: string;
  caption: string;
};

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** True when the caption carries #tag as a whole hashtag (case-insensitive). */
export function hasHashtag(caption: string, tag: string): boolean {
  const clean = tag.trim().replace(/^#+/, "");
  if (!clean) return false;
  return new RegExp(
    `(^|[^\\p{L}\\p{N}_])#${escapeRegExp(clean)}(?![\\p{L}\\p{N}_])`,
    "iu",
  ).test(caption);
}

/** Newest-first posts tagged with `tag` (or any of `tags`), at most `limit`. */
export function postsWithHashtag(
  posts: InstagramPost[],
  tag: string | string[],
  limit: number,
): InstagramPost[] {
  const tags = Array.isArray(tag) ? tag : [tag];
  return posts
    .filter((post) => tags.some((t) => hasHashtag(post.caption, t)))
    .slice(0, limit);
}
