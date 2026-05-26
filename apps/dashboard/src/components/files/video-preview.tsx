"use client";

// React
import { useMemo } from "react";

// Supabase
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Utils
import { cn } from "@/lib/utils";
import DeleteFileButton from "@/components/files/delete-file-button";

const DEFAULT_BUCKET = "public-assets";

export default function VideoPreview({
  storagePath,
  bucket = DEFAULT_BUCKET,
  className,
  deleteAction,
  deleteInput,
  onDeleted,
}: {
  storagePath: string;
  bucket?: string;
  className?: string;
  deleteAction?: any;
  deleteInput?: Record<string, unknown>;
  onDeleted?: () => void;
}) {
  const src = useMemo(() => {
    const supabase = createSupabaseBrowserClient();
    const { data } = supabase.storage.from(bucket).getPublicUrl(storagePath);
    return data.publicUrl;
  }, [storagePath, bucket]);

  return (
    <div className="relative w-full max-w-xl">
      {deleteAction && deleteInput ? (
        <div className="absolute top-2 right-2 z-10">
          <DeleteFileButton
            action={deleteAction}
            input={deleteInput}
            onDeleted={onDeleted}
          />
        </div>
      ) : null}
      <video
        src={src}
        controls
        preload="metadata"
        className={cn(
          "w-full rounded-md border bg-black object-contain",
          className,
        )}
      />
    </div>
  );
}
