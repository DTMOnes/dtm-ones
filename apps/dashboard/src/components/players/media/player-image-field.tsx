"use client";

// Next
import { useRouter } from "next/navigation";

// Shadcn
import { toast } from "sonner";

// Components
import { ImageUpload } from "@/components/media/image-upload";
import { ApiError } from "@/lib/api/errors";
import { useUploadPlayerImageMutation } from "@/hooks/api/use-player-media";

export default function PlayerImageField({
  playerId,
  mediaType = "image",
  label = "Player Image",
}: {
  playerId: string;
  mediaType?: "image" | "institutional_picture";
  label?: string;
}) {
  const router = useRouter();
  const { mutateAsync: uploadImage } = useUploadPlayerImageMutation();

  return (
    <ImageUpload
      onSubmitFile={async (file) => {
        try {
          await uploadImage({ playerId, mediaType, file });
          toast.success("Media added successfully.");
          router.refresh();
        } catch (error) {
          toast.error(
            error instanceof ApiError
              ? error.message
              : "There was an error processing the uploaded file",
          );
        }
      }}
    >
      <ImageUpload.Label>{label}</ImageUpload.Label>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <ImageUpload.Input />
        <div className="shrink-0">
          <ImageUpload.Button />
        </div>
      </div>
      <ImageUpload.Description />
      <ImageUpload.Error />
    </ImageUpload>
  );
}
