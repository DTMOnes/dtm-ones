"use client";

// Next
import { useRouter } from "next/navigation";

// React
import { useState } from "react";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { uploadPlayerImage } from "@/actions/player-media";

// Lib
import { uploadPublicFile } from "@/lib/blob-client";

// Shadcn
import { toast } from "sonner";

// Components
import ImageField from "@/components/media/image-field";
import UploadImageButton from "./upload-image-button";

export default function PlayerImageField({
  playerId,
  mediaType = "image",
  label = "Player Image",
  onUploadSuccess,
}: {
  playerId: string;
  mediaType?: "image" | "institutional_picture";
  label?: string;
  onUploadSuccess?: () => void;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [isBlobUploading, setIsBlobUploading] = useState(false);

  const { executeAsync, isExecuting } = useAction(uploadPlayerImage, {
    onSuccess: ({ data }: { data: { message: string } }) => {
      toast.success(data.message);
      setFile(null);
      router.refresh();
      onUploadSuccess?.();
    },
    onError: () => {
      toast.error("There was an error processing the uploaded file");
    },
  });

  const isUploading = isBlobUploading || isExecuting;

  const handleUpload = async (selected: File) => {
    setIsBlobUploading(true);
    try {
      const blob = await uploadPublicFile(
        selected,
        `player-assets/${crypto.randomUUID()}`,
      );
      await executeAsync({ playerId, mediaType, url: blob.url });
    } finally {
      setIsBlobUploading(false);
    }
  };

  return (
    <ImageField
      label={label}
      file={file}
      onFileChange={setFile}
      disabled={isUploading}
      action={
        <UploadImageButton
          file={file}
          disabled={isUploading}
          isUploading={isUploading}
          onUpload={handleUpload}
        />
      }
    />
  );
}
