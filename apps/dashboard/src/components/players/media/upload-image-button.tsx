"use client";

// Shadcn
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Phosphor
import { UploadIcon } from "@phosphor-icons/react";

export default function UploadImageButton({
  file,
  disabled,
  isUploading,
  onUpload,
}: {
  file: File | null;
  disabled?: boolean;
  isUploading?: boolean;
  onUpload: (file: File) => Promise<void>;
}) {
  const isDisabled = disabled || isUploading || !file;

  const handleClick = async () => {
    if (!file) return;

    try {
      await onUpload(file);
    } catch {
      toast.error("There was an error uploading the image");
    }
  };

  return (
    <Button
      type="button"
      variant="default"
      disabled={isDisabled}
      onClick={handleClick}
    >
      {isUploading ? (
        <Spinner />
      ) : (
        <>
          <UploadIcon />
          <span>Upload Image</span>
        </>
      )}
    </Button>
  );
}
