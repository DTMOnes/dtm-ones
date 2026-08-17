"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { addPlayerVideoAction } from "@/actions/players/playerVideo";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { addPlayerVideoSchema } from "@/lib/validation/players";

import { InfoIcon } from "@phosphor-icons/react";

type FormValues = z.input<typeof addPlayerVideoSchema>;

export function PlayerVideoField({ playerId }: { playerId: string }) {
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(addPlayerVideoSchema),
    defaultValues: { playerId, youtubeUrl: "" },
  });

  const { executeAsync, isExecuting } = useAction(addPlayerVideoAction, {
    onSuccess: () => {
      toast.success("Video added successfully.");
      methods.reset({ playerId, youtubeUrl: "" });
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        onSubmit={methods.handleSubmit((values) => executeAsync(values))}
        noValidate
      >
        <input type="hidden" {...methods.register("playerId")} />
        <FieldGroup className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <TextField
                name="youtubeUrl"
                label="YouTube URL"
                placeholder="https://www.youtube.com/watch?v=..."
                disabled={isExecuting}
              />
            </div>
            <SubmitButton label="Save" isExecuting={isExecuting} />
          </div>
          <FieldDescription className="text-muted-foreground flex items-center gap-1 text-sm">
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
