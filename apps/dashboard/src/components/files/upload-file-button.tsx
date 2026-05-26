"use client";

// React
import { useState } from "react";

// Supabase
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Shadcn
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Phosphor
import { UploadIcon } from "@phosphor-icons/react";

export default function UploadFileButton({
  file,
  namespace,
  disabled = false,
  onSuccess,
}: {
  file: File | null;
  namespace: string;
  disabled?: boolean;
  onSuccess: (data: { id: string; path: string; fullPath?: string }) => void;
}) {
  const [isUploading, setIsUploading] = useState(false);
  const supabase = createSupabaseBrowserClient();

  const handleClick = async (file: File) => {
    setIsUploading(true);

    const uuid = crypto.randomUUID();
    const filePath = `${namespace}/${uuid}`;

    const { data, error } = await supabase.storage
      .from("public-assets")
      .upload(filePath, file, { upsert: false, contentType: file.type });

    if (error) {
      toast.error("There was an error uploading the file", {
        description: error.message,
      });
      setIsUploading(false);
      return;
    }

    if (data) {
      toast.success("File uploaded successfully");
      onSuccess(data);
      setIsUploading(false);
      return;
    }
  };

  return (
    <Button
      variant="outline"
      disabled={!file || isUploading || disabled}
      onClick={() => file && handleClick(file)}
      className="relative"
    >
      <span
        className={`inline-flex items-center gap-2 ${
          isUploading ? "opacity-0" : ""
        }`}
      >
        <UploadIcon className="size-4" /> Upload
      </span>
      {isUploading ? (
        <span className="absolute inset-0 flex items-center justify-center">
          <Spinner />
        </span>
      ) : null}
    </Button>
  );
}
