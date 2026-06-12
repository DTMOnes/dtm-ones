// Vercel Blob
import { upload } from "@vercel/blob/client";

const MULTIPART_THRESHOLD_BYTES = 5 * 1024 * 1024;

export async function uploadPublicFile(file: File, pathname: string) {
  return upload(pathname, file, {
    access: "public",
    handleUploadUrl: "/api/blob/upload",
    contentType: file.type || "application/octet-stream",
    multipart: file.size > MULTIPART_THRESHOLD_BYTES,
  });
}
