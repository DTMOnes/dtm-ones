"use client";

import { useRouter } from "next/navigation";

import { uploadGalleryImageAction } from "@/actions/players/galleryImage";
import { uploadPresentationImageAction } from "@/actions/players/presentationImage";
import { ImageUpload } from "@/components/media/image-upload";
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
      onSubmitFile={async (file) => {
        const formData = new FormData();
        formData.set("playerId", playerId);
        formData.set("file", file);

        try {
          const result =
            kind === "presentation"
              ? await uploadPresentationImageAction(formData)
              : await uploadGalleryImageAction(formData);

          if (result.error) {
            toast.error(result.error.message);
            return;
          }

          toast.success(
            kind === "presentation"
              ? "Institutional picture updated."
              : "Gallery image added.",
          );
          router.refresh();
        } catch (error) {
          console.error("[PlayerImageField]", error);
          toast.error("There was an error processing the uploaded file");
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
