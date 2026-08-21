"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { createCategoryAction } from "@/actions/categories/createCategory";
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
import { createCategorySchema } from "@/lib/validation/categories";

type FormValues = z.infer<typeof createCategorySchema>;

export function CreateCategoryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const { executeAsync, isExecuting } = useAction(createCategoryAction, {
    onSuccess: () => {
      toast.success("Category created successfully.");
      methods.reset();
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError?.code === "CONFLICT") {
        methods.setError("name", { message: error.serverError.message });
        return;
      }

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
          New category
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            A Category is a Player&apos;s position on the court.
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
                placeholder="Guards"
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
                  label="Create category"
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
