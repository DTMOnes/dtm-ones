"use client";

// React
import { useMemo } from "react";

// Next
import Image from "next/image";

// Supabase
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

// Utils
import { cn } from "@/lib/utils";
import DeleteFileButton from "@/components/files/delete-file-button";

const DEFAULT_BUCKET = "public-assets";

export default function ImagePreview({
  storagePath,
  bucket = DEFAULT_BUCKET,
  alt = "",
  className,
  width = 320,
  height = 200,
  deleteAction,
  deleteInput,
  onDeleted,
}: {
  storagePath: string;
  bucket?: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
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
    <div
      className={cn(
        "relative overflow-hidden rounded-md border bg-muted",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}`, maxWidth: "100%" }}
    >
      {deleteAction && deleteInput ? (
        <div className="absolute top-2 right-2 z-10">
          <DeleteFileButton
            action={deleteAction}
            input={deleteInput}
            onDeleted={onDeleted}
          />
        </div>
      ) : null}
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 100vw, 320px"
        className="object-cover"
      />
    </div>
  );
}
