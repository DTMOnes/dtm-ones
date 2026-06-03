"use client";

// Next
import { useRouter } from "next/navigation";

// React
import { useState, useRef } from "react";

// Vercel Blob
import { upload } from "@vercel/blob/client";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { uploadPlayerImage } from "@/actions/player-media";

// Shadcn
import { Input } from "@/components/ui/input";
import { Field, FieldDescription } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Phosphor
import { InfoIcon, UploadIcon } from "@phosphor-icons/react";

export default function PlayerImageField({
  playerId,
  onUploadSuccess,
}: {
  playerId: string;
  onUploadSuccess?: () => void;
}) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [hasFile, setHasFile] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [inputKey, setInputKey] = useState(0);

  const { executeAsync } = useAction(uploadPlayerImage, {
    onSuccess: ({ data }: { data: { message: string } }) => {
      toast.success(data.message);
      setInputKey((k) => k + 1);
      router.refresh();
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error("There was an error processing the uploaded file");
    },
  });

  const getFile = () => inputRef.current?.files?.[0] ?? null;

  const handleUpload = async (file: File) => {
    const uuid = crypto.randomUUID();
    const pathname = `player-assets/${uuid}`;

    const blob = await upload(pathname, file, {
      access: "public",
      handleUploadUrl: "/api/blob/upload",
      contentType: file.type || "application/octet-stream",
      multipart: file.size > 1024 * 1024 * 5,
    });

    return blob.url;
  };

  return (
    <Field>
      <div className="w-full flex flex-row gap-2">
        <Input
          key={inputKey}
          ref={inputRef}
          className="w-full"
          type="file"
          accept="image/*"
          autoComplete="off"
          onChange={() => {
            setHasFile(!!getFile());
          }}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          disabled={isUploading || !hasFile}
          onClick={async () => {
            const picked = getFile();
            if (!picked) {
              toast.error("No file picked");
              return;
            }

            setIsUploading(true);
            try {
              const url = await handleUpload(picked);

              await executeAsync({ playerId, url });
            } catch (error) {
              toast.error("There was an error processing the uploaded file");
            } finally {
              setIsUploading(false);
            }
          }}
        >
          {isUploading ? <Spinner /> : <UploadIcon />}
        </Button>
      </div>
      <FieldDescription className="flex items-center gap-1 text-sm text-muted-foreground">
        <InfoIcon />
        <span>Max file size: 5MB</span>
      </FieldDescription>
    </Field>
  );
}
