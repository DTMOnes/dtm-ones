"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { createCoachAction } from "@/actions/coaches/createCoach";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { createCoachSchema } from "@/lib/validation/coaches";

type FormValues = {
  name: string;
  nationality: string;
  lastClub: string;
};

export function CreateCoachDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues, unknown, z.output<typeof createCoachSchema>>({
    resolver: zodResolver(createCoachSchema) as Resolver<
      FormValues,
      unknown,
      z.output<typeof createCoachSchema>
    >,
    defaultValues: {
      name: "",
      nationality: "",
      lastClub: "",
    },
  });

  const { executeAsync, isExecuting } = useAction(createCoachAction, {
    onSuccess: () => {
      toast.success("Coach created successfully.");
      methods.reset();
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      methods.reset();
    }
  }, [open, methods]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          New coach
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>New coach</DialogTitle>
          <DialogDescription>
            A Coach starts private. Public requires name, nationality, last
            club, and a Eurobasket link.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((values) => executeAsync(values))}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
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
            </FieldGroup>
            <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial"
                disabled={isExecuting}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <div className="flex-1 sm:flex-initial">
                <SubmitButton
                  label="Create coach"
                  isExecuting={isExecuting}
                  icon={<PlusIcon />}
                />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
