"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";

import { createCategory } from "@/actions/categories";
import { createCategorySchema } from "@/lib/validation/categories";

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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import SubmitButton from "@/components/form/submit-button";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

type FormValues = z.infer<typeof createCategorySchema>;

export default function CreateCategoryDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setError,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(createCategorySchema as never),
    defaultValues: { name: "" },
  });

  const { execute, isExecuting } = useAction(createCategory, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        reset();
        setOpen(false);
        router.refresh();
      }
    },
    onError: ({ error }) => {
      const nameMessages = error.validationErrors?.name;
      if (Array.isArray(nameMessages) && nameMessages[0]) {
        setError("name", { message: String(nameMessages[0]) });
        return;
      }
      toast.error("No se pudo crear la categoría.", {
        description: error.serverError,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const nameError = errors.name?.message;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          Nueva categoría
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>Nueva categoría</DialogTitle>
          <DialogDescription>
            Asigna un nombre breve que identifique bien el grupo en filtros y
            fichas.
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit((data) => execute(data))}
          className="flex flex-col gap-4"
          noValidate
        >
          <FieldGroup>
            <Field className="gap-2">
              <FieldLabel htmlFor="category-name">Nombre</FieldLabel>
              <Input
                id="category-name"
                placeholder="Ej. Primera división"
                autoComplete="off"
                disabled={isExecuting}
                maxLength={100}
                aria-invalid={!!nameError}
                {...register("name")}
              />
              {nameError ? (
                <FieldError errors={[{ message: nameError }]} />
              ) : null}
            </Field>
          </FieldGroup>
          <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="flex-1 sm:flex-initial"
              disabled={isExecuting}
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <div className="flex-1 sm:flex-initial">
              <SubmitButton label="Guardar" isExecuting={isExecuting} />
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
