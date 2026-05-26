"use client";

// React
import { useState, type ChangeEvent } from "react";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";

// Shadcn
import { Input } from "@/components/ui/input";
import { Field, FieldDescription } from "@/components/ui/field";
import { toast } from "sonner";

// Components
import UploadFileButton from "@/components/files/upload-file-button";

// Phosphor
import { InfoIcon } from "@phosphor-icons/react";

type UploadedFileData = { id: string; path: string; fullPath?: string };

export default function FileField({
  action,
  namespace,
  accept = "*/*",
  buildPayload,
  onPersistSuccess,
  infoText = "Max file size: 20MB",
}: {
  action: any;
  namespace: string;
  accept?: string;
  buildPayload: (args: {
    uploadedFile: UploadedFileData;
    file: File;
  }) => unknown;
  onPersistSuccess?: () => void;
  infoText?: string;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const { execute, isExecuting } = useAction(action, {
    onSuccess: ({ data }: { data: { message: string } }) => {
      toast.success(data.message);
      onPersistSuccess?.();
      setFile(null);
      setInputKey((k) => k + 1);
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error("There was an error processing the uploaded file");
    },
  });

  return (
    <Field>
      <div className="w-full flex flex-row gap-2">
        <Input
          key={inputKey}
          className="w-full"
          type="file"
          accept={accept}
          autoComplete="off"
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const picked = event.target.files?.[0] ?? null;

            if (!picked) {
              setFile(null);
              return;
            }

            setFile(picked);
          }}
        />
        <UploadFileButton
          file={file}
          namespace={namespace}
          disabled={isExecuting}
          onSuccess={(uploadedFile) => {
            if (!file) return;
            execute(buildPayload({ uploadedFile, file }));
          }}
        />
      </div>
      <FieldDescription className="flex items-center gap-1 text-sm text-muted-foreground">
        <InfoIcon />
        <span>{infoText}</span>
      </FieldDescription>
    </Field>
  );
}
