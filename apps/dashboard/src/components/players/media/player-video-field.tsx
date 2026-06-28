"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation Schema
import { playerVideoFormSchema } from "@/lib/validation/player-media";

// Zod
import { z } from "zod";

// Shadcn
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { useUploadPlayerVideoMutation } from "@/hooks/api/use-player-media";

// Components
import TextField from "@/components/form/text-field";
import SubmitButton from "@/components/form/submit-button";

// Phosphor
import { InfoIcon } from "@phosphor-icons/react";

type FormValues = z.infer<typeof playerVideoFormSchema>;

export default function PlayerVideoField({
  playerId,
}: {
  playerId: string;
}) {
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(playerVideoFormSchema),
    defaultValues: { url: "" },
  });

  const { mutateAsync: uploadVideo, isPending } = useUploadPlayerVideoMutation();

  const onSubmit = methods.handleSubmit(async ({ url }) => {
    try {
      await uploadVideo({ playerId, url });
      toast.success("Video added successfully.");
      methods.reset();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof ApiError
          ? error.message
          : "There was an error saving the video link",
      );
    }
  });

  return (
    <FormProvider {...methods}>
      <form onSubmit={onSubmit}>
        <FieldGroup className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <TextField
                name="url"
                label="YouTube URL"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isPending}
              />
            </div>
            <SubmitButton label="Save" isExecuting={isPending} />
          </div>
          <FieldDescription className="flex items-center gap-1 text-sm text-muted-foreground">
            <InfoIcon />
            <span>
              Paste a public YouTube link (e.g. youtube.com/watch?v=... or
              youtu.be/...).
            </span>
          </FieldDescription>
        </FieldGroup>
      </form>
    </FormProvider>
  );
}
