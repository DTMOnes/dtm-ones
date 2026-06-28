# Stdlib
from urllib.parse import parse_qs, urlsplit

_YOUTUBE_HOSTS = {"youtube.com", "www.youtube.com", "m.youtube.com"}


def parse_youtube_video_id(url: str) -> str | None:
    """Extract a YouTube video id from a URL.

    Port of `apps/dashboard/src/lib/youtube.ts` `parseYouTubeVideoId`.
    """

    try:
        parsed = urlsplit(url)
    except ValueError:
        return None

    hostname = (parsed.hostname or "").lower()
    path = parsed.path

    if hostname == "youtu.be":
        candidate = path.lstrip("/").split("/")[0]
        return candidate or None

    if hostname in _YOUTUBE_HOSTS:
        if path.startswith("/embed/"):
            segments = path.split("/")
            return segments[2] if len(segments) > 2 and segments[2] else None

        if path.startswith("/shorts/"):
            segments = path.split("/")
            return segments[2] if len(segments) > 2 and segments[2] else None

        values = parse_qs(parsed.query).get("v")
        return values[0] if values and values[0] else None

    return None


def get_youtube_embed_url(video_id: str) -> str:
    return f"https://www.youtube-nocookie.com/embed/{video_id}"


def get_youtube_thumbnail_url(video_id: str) -> str:
    return f"https://img.youtube.com/vi/{video_id}/mqdefault.jpg"
