"use client";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";

// Shadcn
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Phosphor
import { TrashIcon } from "@phosphor-icons/react";

export default function DeleteFileButton<
  TInput extends Record<string, unknown>,
>({
  action,
  input,
  disabled = false,
  onDeleted,
  "aria-label": ariaLabel = "Delete file",
}: {
  action: any;
  input: TInput;
  disabled?: boolean;
  onDeleted?: () => void;
  "aria-label"?: string;
}) {
  const { execute, isExecuting } = useAction(action, {
    onSuccess: ({ data }: { data?: { message?: string } }) => {
      if (data?.message) {
        toast.success(data.message);
      } else {
        toast.success("File deleted successfully");
      }
      onDeleted?.();
    },
    onError: () => {
      toast.error("There was an error deleting the file");
    },
  });

  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={disabled || isExecuting}
      aria-label={ariaLabel}
      onClick={() => execute(input)}
    >
      {isExecuting ? <Spinner /> : <TrashIcon className="size-4" />}
    </Button>
  );
}
