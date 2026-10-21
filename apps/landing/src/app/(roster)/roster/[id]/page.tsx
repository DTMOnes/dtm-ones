import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { listAgencyPosts, postsWithHashtag } from "@/lib/instagram";
import { getPublicRosterPlayer } from "@/lib/roster/queries";
import Profile from "@/components/Profile";
import type { NewsPost } from "@/types/roster";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const client = await getPublicRosterPlayer(id);

  if (!client) {
    return { title: "Roster | DTMones" };
  }

  return {
    title: `${client.full_name} | DTMones`,
    description: `Profile for ${client.full_name} at DTMones.`,
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const client = await getPublicRosterPlayer(id);

  if (!client) {
    notFound();
  }

  // Two rows of four: the agency's Instagram posts tagged with this Client's hashtag.
  const news: NewsPost[] = client.instagram_hashtag
    ? postsWithHashtag(
        await listAgencyPosts(),
        client.instagram_hashtag,
        8,
      ).map((post) => ({
        src: post.image,
        alt:
          post.caption.split("\n")[0]?.slice(0, 120) ||
          `${client.full_name} on Instagram`,
        href: post.permalink,
      }))
    : [];

  return <Profile client={client} news={news} />;
}
