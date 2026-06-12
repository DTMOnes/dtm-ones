"use client";

// React
import { useEffect, useId, useRef, useState, type ReactNode } from "react";

// Shadcn
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

// Phosphor
import { InfoIcon } from "@phosphor-icons/react";

type InputState =
  | { status: "idle" }
  | { status: "loading"; file: File }
  | { status: "ready"; file: File };

const MAX_BYTES = 5 * 1024 * 1024;

export default function ImageField({
  label,
  disabled,
  maxBytes = MAX_BYTES,
  id,
  file,
  onFileChange,
  action,
}: {
  label: string;
  disabled?: boolean;
  maxBytes?: number;
  id?: string;
  file?: File | null;
  onFileChange?: (file: File | null) => void;
  action?: ReactNode;
}) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);

  const [inputStatus, setInputStatus] = useState<InputState>({
    status: "idle",
  });
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (file === null) {
      if (inputRef.current) {
        inputRef.current.value = "";
      }
      setInputStatus({ status: "idle" });
      setInputError(null);
    }
  }, [file]);

  function validateImageFile(imageFile: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(imageFile);
      const img = new Image();
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve();
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error("Invalid image"));
      };
      img.src = url;
    });
  }

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) {
      setInputStatus({ status: "idle" });
      setInputError(null);
      onFileChange?.(null);
      return;
    }

    if (selectedFile.size > maxBytes) {
      const maxMb = maxBytes / 1024 / 1024;
      setInputError(`File must be ${maxMb}MB or smaller`);
      event.target.value = "";
      setInputStatus({ status: "idle" });
      onFileChange?.(null);
      return;
    }

    setInputError(null);
    setInputStatus({ status: "loading", file: selectedFile });

    try {
      await validateImageFile(selectedFile);
      setInputStatus({ status: "ready", file: selectedFile });
      onFileChange?.(selectedFile);
    } catch {
      setInputError("Could not load that image. Try another file.");
      event.target.value = "";
      setInputStatus({ status: "idle" });
      onFileChange?.(null);
    }
  };

  return (
    <Field>
      <FieldLabel htmlFor={inputId}>{label}</FieldLabel>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
        <Input
          ref={inputRef}
          id={inputId}
          className="min-w-0 flex-1"
          type="file"
          accept="image/*"
          autoComplete="off"
          onChange={handleFileChange}
          disabled={disabled}
        />
        {action && <div className="shrink-0">{action}</div>}
      </div>
      <FieldDescription className="flex items-center gap-1 text-sm text-muted-foreground">
        <InfoIcon />
        <span>Max file size: {maxBytes / 1024 / 1024}MB</span>
      </FieldDescription>

      {(inputError || inputStatus.status === "ready") && (
        <FieldError>{inputError}</FieldError>
      )}
    </Field>
  );
}
