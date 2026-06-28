"use client";

// React
import {
  createContext,
  use,
  useId,
  useRef,
  useState,
  type ReactNode,
} from "react";

// Shadcn
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";

// Phosphor
import { InfoIcon, UploadIcon } from "@phosphor-icons/react";

const MAX_BYTES = 5 * 1024 * 1024;

function canDecodeImage(file: File): Promise<boolean> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(true);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(false);
    };
    img.src = url;
  });
}

type ImageUploadContextValue = {
  file: File | null;
  error: string | null;
  isUploading: boolean;
  inputId: string;
  inputRef: React.RefObject<HTMLInputElement | null>;
  maxBytes: number;
  selectFile: (file: File | null) => void;
  setError: (message: string | null) => void;
  submit: () => Promise<void>;
};

const ImageUploadContext = createContext<ImageUploadContextValue | null>(null);

function useImageUpload() {
  const context = use(ImageUploadContext);
  if (!context) {
    throw new Error("ImageUpload.* must be used inside <ImageUpload>");
  }
  return context;
}

function ImageUpload({
  onSubmitFile,
  maxBytes = MAX_BYTES,
  children,
}: {
  onSubmitFile: (file: File) => Promise<void>;
  maxBytes?: number;
  children: ReactNode;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const submit = async () => {
    if (!file) return;
    setIsUploading(true);
    try {
      await onSubmitFile(file);
      setFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } finally {
      setIsUploading(false);
    }
  };

  const value: ImageUploadContextValue = {
    file,
    error,
    isUploading,
    inputId,
    inputRef,
    maxBytes,
    selectFile: setFile,
    setError,
    submit,
  };

  return (
    <ImageUploadContext value={value}>
      <Field>{children}</Field>
    </ImageUploadContext>
  );
}

function ImageUploadLabel({ children }: { children: ReactNode }) {
  const { inputId } = useImageUpload();
  return <FieldLabel htmlFor={inputId}>{children}</FieldLabel>;
}

function ImageUploadInput() {
  const { inputId, inputRef, maxBytes, selectFile, setError, error, isUploading } =
    useImageUpload();

  const handleChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selected = event.target.files?.[0] ?? null;
    setError(null);

    if (!selected) {
      selectFile(null);
      return;
    }

    if (selected.size > maxBytes) {
      event.target.value = "";
      setError(`File must be ${maxBytes / 1024 / 1024}MB or smaller`);
      selectFile(null);
      return;
    }

    if (!(await canDecodeImage(selected))) {
      event.target.value = "";
      setError("Could not load that image. Try another file.");
      selectFile(null);
      return;
    }

    selectFile(selected);
  };

  return (
    <Input
      ref={inputRef}
      id={inputId}
      className="min-w-0 flex-1"
      type="file"
      accept="image/*"
      autoComplete="off"
      onChange={handleChange}
      disabled={isUploading}
      aria-invalid={!!error}
    />
  );
}

function ImageUploadButton({ label = "Upload Image" }: { label?: string }) {
  const { file, isUploading, submit } = useImageUpload();

  return (
    <Button
      type="button"
      variant="default"
      disabled={!file || isUploading}
      onClick={submit}
    >
      {isUploading ? (
        <Spinner />
      ) : (
        <>
          <UploadIcon />
          <span>{label}</span>
        </>
      )}
    </Button>
  );
}

function ImageUploadError() {
  const { error } = useImageUpload();
  return error ? <FieldError>{error}</FieldError> : null;
}

function ImageUploadDescription() {
  const { maxBytes } = useImageUpload();
  return (
    <FieldDescription className="flex items-center gap-1 text-sm text-muted-foreground">
      <InfoIcon />
      <span>Max file size: {maxBytes / 1024 / 1024}MB</span>
    </FieldDescription>
  );
}

ImageUpload.Label = ImageUploadLabel;
ImageUpload.Input = ImageUploadInput;
ImageUpload.Button = ImageUploadButton;
ImageUpload.Error = ImageUploadError;
ImageUpload.Description = ImageUploadDescription;

export { ImageUpload };
