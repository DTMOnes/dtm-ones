"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

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
import { createCategorySchema } from "@/lib/validation/categories";
import { toast } from "sonner";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

type FormValues = z.infer<typeof createCategorySchema>;

export default function CreateCategoryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: { name: "" },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  async function onSubmit(data: FormValues): Promise<void> {
    setPending(true);
    try {
      const result = await createCategoryAction(data);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Category created successfully.");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[CreateCategoryDialog]", error);
      toast.error("Could not create the category.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          New category
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>New category</DialogTitle>
          <DialogDescription>
            Assign a short name that identifies the group well in filters and
            cards.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <TextField
              name="name"
              label="Name"
              placeholder="Ex. First division"
              disabled={pending}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <SubmitButton label="Save" isExecuting={pending} />
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
