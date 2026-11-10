"use client";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import {
  ArrowCounterClockwiseIcon,
  BasketballIcon,
  FloppyDiskIcon,
  IdentificationCardIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { updateCoachAction } from "@/actions/coaches/updateCoach";
import { ProfileSection } from "@/components/clients/editor-layout";
import TextareaField from "@/components/form/textarea-field";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updateCoachSchema } from "@/lib/validation/coaches";
import type { Coach } from "@/types/coach";

type FormValues = {
  id: string;
  name: string;
  nationality: string;
  lastClub: string;
  eurobasketLink: string;
  league: string;
  bio: string;
  instagramHashtag: string;
};

export function EditCoachForm({ coach }: { coach: Coach }) {
  const router = useRouter();

  const methods = useForm<FormValues, unknown, z.output<typeof updateCoachSchema>>({
    resolver: zodResolver(updateCoachSchema) as Resolver<
      FormValues,
      unknown,
      z.output<typeof updateCoachSchema>
    >,
    defaultValues: {
      id: coach.id,
      name: coach.name ?? "",
      nationality: coach.nationality ?? "",
      lastClub: coach.lastClub ?? "",
      eurobasketLink: coach.eurobasketLink ?? "",
      league: coach.league ?? "",
      bio: coach.bio ?? "",
      instagramHashtag: coach.instagramHashtag ?? "",
    },
  });

  const { executeAsync, isExecuting } = useAction(updateCoachAction, {
    onSuccess: () => {
      toast.success("Coach updated successfully.");
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
        className="flex flex-col gap-6"
        onSubmit={methods.handleSubmit((values) => executeAsync(values))}
        noValidate
      >
        <input type="hidden" {...methods.register("id")} />
        <div className="grid gap-6 2xl:grid-cols-2">
          <ProfileSection
            id="identity"
            number={1}
            title="Identity"
            icon={<IdentificationCardIcon />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={isExecuting}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Country"
                disabled={isExecuting}
              />
            </div>
          </ProfileSection>
          <ProfileSection
            id="basketball"
            number={2}
            title="Basketball"
            icon={<BasketballIcon />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="Club"
                disabled={isExecuting}
              />
              <TextField
                name="league"
                label="Last league"
                placeholder="League - Country"
                disabled={isExecuting}
              />
              <div className="sm:col-span-2">
                <TextField
                  name="eurobasketLink"
                  label="Eurobasket link"
                  placeholder="https://basketball.eurobasket.com/..."
                  disabled={isExecuting}
                />
              </div>
            </div>
          </ProfileSection>
        </div>
        <ProfileSection id="about" number={3} title="About" icon={<UserIcon />}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <TextareaField
              name="bio"
              label="About"
              placeholder={"Title\n\nDescription"}
              disabled={isExecuting}
            />
            <TextField
              name="instagramHashtag"
              label="Instagram hashtag (for NEWS)"
              placeholder="NameLastname"
              disabled={isExecuting}
            />
          </div>
        </ProfileSection>
        <div className="bg-card ring-foreground/10 sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 px-4 py-3 ring-1 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.35)]">
          <p className="text-muted-foreground mr-auto text-sm">
            Sections 1 to 3 save together.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={isExecuting}
            onClick={() => methods.reset()}
          >
            <ArrowCounterClockwiseIcon />
            Reset
          </Button>
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <Spinner />
            ) : (
              <>
                <FloppyDiskIcon />
                Save profile
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
