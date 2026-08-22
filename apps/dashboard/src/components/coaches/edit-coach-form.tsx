"use client";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { ArrowCounterClockwiseIcon, FloppyDiskIcon } from "@phosphor-icons/react";

import { updateCoachAction } from "@/actions/coaches/updateCoach";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { updateCoachSchema } from "@/lib/validation/coaches";
import type { Coach } from "@/types/coach";

type FormValues = {
  id: string;
  name: string;
  nationality: string;
  lastClub: string;
  eurobasketLink: string;
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
      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            A public Coach needs name, nationality, last club, and a Eurobasket
            link. Height, Category, and media are Player facts.
          </CardDescription>
        </CardHeader>
        <form
          className="contents"
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
          noValidate
        >
          <CardContent>
            <FieldGroup>
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Name"
                placeholder="Pat Riley"
                disabled={isExecuting}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="USA"
                disabled={isExecuting}
              />
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="Miami Heat"
                disabled={isExecuting}
              />
              <TextField
                name="eurobasketLink"
                label="Eurobasket link"
                placeholder="https://basketball.eurobasket.com/..."
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="gap-2">
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
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
