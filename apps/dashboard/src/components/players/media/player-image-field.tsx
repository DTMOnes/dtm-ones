"use client";

import { useRouter } from "next/navigation";

import {
  beginGalleryImageUploadAction,
  commitGalleryImageUploadAction,
} from "@/actions/players/galleryImage";
import {
  beginPresentationImageUploadAction,
  commitPresentationImageUploadAction,
} from "@/actions/players/presentationImage";
import { ImageUpload } from "@/components/media/image-upload";
import { createBridgedInsforgeClient } from "@/lib/insforge-browser-upload";
import { validateNormalizedImageFile } from "@/lib/players/image-upload";
import { normalizePlayerImage } from "@/lib/players/normalize-image";
import { MAX_IMAGE_INPUT_BYTES } from "@/lib/validation/player-media";
import { toast } from "sonner";

export default function PlayerImageField({
  playerId,
  kind,
  label = "Player Image",
}: {
  playerId: string;
  kind: "presentation" | "gallery";
  label?: string;
}) {
  const router = useRouter();

  return (
    <ImageUpload
      maxBytes={MAX_IMAGE_INPUT_BYTES}
      onSubmitFile={async (file) => {
        try {
          const normalized = await normalizePlayerImage(file);
          const normalizedError = validateNormalizedImageFile(normalized);
          if (normalizedError) {
            toast.error(normalizedError);
            return;
          }

          if (kind === "presentation") {
            const beginResult = await beginPresentationImageUploadAction({
              playerId,
            });
            if (beginResult.error || !beginResult.data) {
              toast.error(
                beginResult.error?.message ??
                  "Could not start the upload. Please try again.",
              );
              return;
            }

            const client = await createBridgedInsforgeClient();
            const { data: uploaded, error: uploadError } = await client.storage
              .from(beginResult.data.bucket)
              .upload(beginResult.data.key, normalized);

            if (uploadError || !uploaded?.url || !uploaded.key) {
              console.error("[PlayerImageField/upload]", uploadError);
              toast.error("There was an error uploading the image.");
              return;
            }

            const commitResult = await commitPresentationImageUploadAction({
              playerId,
              bucket: uploaded.bucket,
              key: uploaded.key,
              url: uploaded.url,
            });

            if (commitResult.error) {
              toast.error(commitResult.error.message);
              return;
            }

            toast.success("Institutional picture updated.");
          } else {
            const beginResult = await beginGalleryImageUploadAction({
              playerId,
            });
            if (beginResult.error || !beginResult.data) {
              toast.error(
                beginResult.error?.message ??
                  "Could not start the upload. Please try again.",
              );
              return;
            }

            const client = await createBridgedInsforgeClient();
            const { data: uploaded, error: uploadError } = await client.storage
              .from(beginResult.data.bucket)
              .upload(beginResult.data.key, normalized);

            if (uploadError || !uploaded?.url || !uploaded.key) {
              console.error("[PlayerImageField/upload]", uploadError);
              toast.error("There was an error uploading the image.");
              return;
            }

            const commitResult = await commitGalleryImageUploadAction({
              playerId,
              imageId: beginResult.data.imageId,
              bucket: uploaded.bucket,
              key: uploaded.key,
              url: uploaded.url,
            });

            if (commitResult.error) {
              toast.error(commitResult.error.message);
              return;
            }

            toast.success("Gallery image added.");
          }

          router.refresh();
        } catch (error) {
          console.error("[PlayerImageField]", error);
          toast.error(
            error instanceof Error
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
