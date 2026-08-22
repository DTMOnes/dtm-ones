"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { createClientAction } from "@/actions/clients/createClient";
import OptionsField from "@/components/form/options-field";
import SubmitButton from "@/components/form/submit-button";
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
import { createClientSchema } from "@/lib/validation/clients";

type FormValues = {
  kind: string;
};

const KIND_OPTIONS = [
  { id: "player", name: "Player" },
  { id: "coach", name: "Coach" },
];

export function CreateClientDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues, unknown, z.output<typeof createClientSchema>>({
    resolver: zodResolver(createClientSchema) as Resolver<
      FormValues,
      unknown,
      z.output<typeof createClientSchema>
    >,
    defaultValues: {
      kind: "",
    },
  });

  const { executeAsync, isExecuting } = useAction(createClientAction, {
    onSuccess: () => {
      toast.success("Client created.");
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
          New Client
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>New Client</DialogTitle>
          <DialogDescription>
            Choose Player or Coach. The Client starts private.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((values) => executeAsync(values))}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
              <OptionsField
                name="kind"
                label="Kind"
                options={KIND_OPTIONS}
                disabled={isExecuting}
              />
            </FieldGroup>
            <DialogFooter>
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
                  label="Create Client"
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
