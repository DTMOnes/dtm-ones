"use client";

// React
import { useCallback, useState } from "react";

// Lib
import { uploadPublicFile } from "@/lib/blob-client";

export function useBlobUpload({
  pathPrefix,
  onUploaded,
}: {
  pathPrefix: string;
  onUploaded: (url: string) => Promise<void> | void;
}) {
  const [isUploading, setIsUploading] = useState(false);

  const upload = useCallback(
    async (file: File) => {
      setIsUploading(true);
      try {
        const blob = await uploadPublicFile(file, `${pathPrefix}/${file.name}`);
        await onUploaded(blob.url);
      } finally {
        setIsUploading(false);
      }
    },
    [pathPrefix, onUploaded],
  );

  return { upload, isUploading };
}
