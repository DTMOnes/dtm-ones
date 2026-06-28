# Third-party
from vercel.blob import AsyncBlobClient
from vercel.blob import BlobError as VercelBlobError

# Local
from core.env import settings


class BlobError(RuntimeError):
    """Raised when a Vercel Blob operation fails."""


def _require_token() -> str:
    token = settings.BLOB_READ_WRITE_TOKEN
    if not token:
        raise BlobError("BLOB_READ_WRITE_TOKEN is not configured.")
    return token


async def put(
    pathname: str,
    body: bytes,
    *,
    content_type: str | None = None,
    add_random_suffix: bool = True,
    access: str = "public",
) -> dict:
    """Upload a blob to Vercel Blob and return SDK response fields as a dict."""

    try:
        async with AsyncBlobClient(token=_require_token()) as client:
            result = await client.put(
                pathname,
                body,
                access=access,
                content_type=content_type,
                add_random_suffix=add_random_suffix,
            )
    except VercelBlobError as exc:
        raise BlobError(f"Vercel Blob upload failed: {exc}") from exc

    return {
        "url": result.url,
        "downloadUrl": result.download_url,
        "pathname": result.pathname,
        "contentType": result.content_type,
        "contentDisposition": result.content_disposition,
    }


async def delete(urls: str | list[str]) -> None:
    """Delete one or more blobs by URL.

    Like the SDK, a missing blob is not treated as an error.
    """

    token = _require_token()
    url_list = [urls] if isinstance(urls, str) else list(urls)
    if not url_list:
        return

    try:
        async with AsyncBlobClient(token=token) as client:
            await client.delete(url_list)
    except VercelBlobError as exc:
        raise BlobError(f"Vercel Blob delete failed: {exc}") from exc
