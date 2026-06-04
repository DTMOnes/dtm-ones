"use client";

// React
import { useEffect, useState } from "react";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";

// Actions
import { createCategory } from "@/actions/categories";

// Validation
import { createCategorySchema } from "@/lib/validation/categories";

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

  const { execute, isExecuting } = useAction(createCategory, {
    onSuccess: ({ data }) => {
      toast.success(data.message);
      reset();
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Could not create the category.");
    },
  });

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
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Assign a short name that identifies the group well in filters and
            cards.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) => execute(data))}
            className="flex flex-col gap-4"
            noValidate
          >
            <TextField
              name="name"
              label="Name"
              placeholder="Ex. First division"
              disabled={isExecuting}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={isExecuting}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton label="Save" isExecuting={isExecuting} />
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
