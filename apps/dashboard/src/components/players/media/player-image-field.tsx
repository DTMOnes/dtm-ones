"use client";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { uploadPlayerImage } from "@/actions/player-media";

// Shadcn
import { toast } from "sonner";

// Components
import { ImageUpload } from "@/components/media/image-upload";

export default function PlayerImageField({
  playerId,
  mediaType = "image",
  label = "Player Image",
}: {
  playerId: string;
  mediaType?: "image" | "institutional_picture";
  label?: string;
}) {
  const { executeAsync } = useAction(uploadPlayerImage, {
    onSuccess: ({ data }: { data: { message: string } }) => {
      toast.success(data.message);
    },
    onError: () => {
      toast.error("There was an error processing the uploaded file");
    },
  });

  return (
    <ImageUpload
      pathPrefix="player-assets"
      onUploaded={async (url) => {
        await executeAsync({ playerId, mediaType, url });
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
