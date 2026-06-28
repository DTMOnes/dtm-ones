"use client";

// React
import { useEffect, useState } from "react";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

// Validation
import { createCategorySchema } from "@/lib/validation/categories";
import { ApiError } from "@/lib/api/errors";
import { useCreateCategoryMutation } from "@/hooks/api/use-categories";

// Components
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";

// Shadcn
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
import { toast } from "sonner";

// Phosphor
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

type FormValues = z.infer<typeof createCategorySchema>;

export default function CreateCategoryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const { handleSubmit, reset } = methods;
  const { mutate: submitCreateCategory, isPending } = useCreateCategoryMutation();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          New category
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Assign a short name that identifies the group well in filters and
            cards.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) =>
              submitCreateCategory(data, {
                onSuccess: () => {
                  toast.success("Category created successfully.");
                  reset();
                  setOpen(false);
                  router.refresh();
                },
                onError: (error) => {
                  toast.error(
                    error instanceof ApiError
                      ? error.message
                      : "Could not create the category.",
                  );
                },
              }),
            )}
            className="flex flex-col gap-4"
            noValidate
          >
            <TextField
              name="name"
              label="Name"
              placeholder="Ex. First division"
              disabled={isPending}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton label="Save" isExecuting={isPending} />
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
