import { PublicRosterPlayer } from "@/types/roster";
import { GalleryItem } from "@/types/gallery";

export function parseYouTubeVideoId(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1).split("/")[0] || null;
    }

    if (parsed.pathname.startsWith("/embed/")) {
      return parsed.pathname.split("/")[2] || null;
    }

    return parsed.searchParams.get("v");
  } catch {
    return null;
  }
}

export function getYouTubeEmbedUrl(videoId: string): string {
  const params = new URLSearchParams({
    autoplay: "1",
    mute: "1",
    playsinline: "1",
    rel: "0",
  });

  return `https://www.youtube-nocookie.com/embed/${videoId}?${params}`;
}

export function getYouTubeThumbnailUrl(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}

export function buildGalleryItems(player: PublicRosterPlayer): GalleryItem[] {
  const images: GalleryItem[] = player.gallery_images.map((image) => ({
    kind: "image",
    id: image.id,
    url: image.url,
  }));

  const videos: GalleryItem[] = [];

  for (const video of player.videos) {
    const videoId = parseYouTubeVideoId(video.youtube_url);
    if (!videoId) continue;

    videos.push({ kind: "video", id: video.id, videoId });
  }

  return [...images, ...videos];
}
