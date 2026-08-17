"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { createPlayerAction } from "@/actions/players/createPlayer";
import OptionsField from "@/components/form/options-field";
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
import { createPlayerSchema } from "@/lib/validation/players";

type FormValues = {
  name: string;
  nationality: string;
  lastClub: string;
  heightCm: string;
  categoryId: string;
};

export function CreatePlayerDialog({
  categories,
}: {
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues, unknown, z.output<typeof createPlayerSchema>>({
    resolver: zodResolver(createPlayerSchema) as Resolver<
      FormValues,
      unknown,
      z.output<typeof createPlayerSchema>
    >,
    defaultValues: {
      name: "",
      nationality: "",
      lastClub: "",
      heightCm: "",
      categoryId: "",
    },
  });

  const { executeAsync, isExecuting } = useAction(createPlayerAction, {
    onSuccess: () => {
      toast.success("Player created successfully.");
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
        <Button variant="outline">
          <PlusIcon />
          New player
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>New player</DialogTitle>
          <DialogDescription>
            A Player starts private. Public requires a complete profile.
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
                placeholder="Manu Ginobili"
                disabled={isExecuting}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Argentina"
                disabled={isExecuting}
              />
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="San Antonio Spurs"
                disabled={isExecuting}
              />
              <TextField
                name="heightCm"
                label="Height (cm)"
                placeholder="198"
                disabled={isExecuting}
              />
              <OptionsField
                name="categoryId"
                label="Category"
                options={categories}
                emptyMessage="No categories created yet"
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
                <SubmitButton label="Create player" isExecuting={isExecuting} />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
