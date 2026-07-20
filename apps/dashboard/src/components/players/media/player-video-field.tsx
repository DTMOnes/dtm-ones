"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { addPlayerVideoAction } from "@/actions/players/playerVideo";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { FieldDescription, FieldGroup } from "@/components/ui/field";
import { playerVideoFormSchema } from "@/lib/validation/player-media";
import { toast } from "sonner";

import { InfoIcon } from "@phosphor-icons/react";

type FormValues = z.infer<typeof playerVideoFormSchema>;

export default function PlayerVideoField({
  playerId,
}: {
  playerId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(playerVideoFormSchema),
    defaultValues: { url: "" },
  });

  const onSubmit = methods.handleSubmit(async ({ url }) => {
    setPending(true);
    try {
      const result = await addPlayerVideoAction({
        playerId,
        youtube_url: url,
      });
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Video added successfully.");
      methods.reset();
      router.refresh();
    } catch (error) {
      console.error("[PlayerVideoField]", error);
      toast.error("There was an error saving the video link");
    } finally {
      setPending(false);
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
                disabled={pending}
              />
            </div>
            <SubmitButton label="Save" isExecuting={pending} />
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
