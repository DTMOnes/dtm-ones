"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { z } from "zod";

import { updateCategoryAction } from "@/actions/categories/updateCategory";
import TextField from "@/components/form/text-field";
import SubmitButton from "@/components/form/submit-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { updateCategorySchema } from "@/lib/validation/categories";
import { toast } from "sonner";

type EditCategoryFormValues = z.infer<typeof updateCategorySchema>;

export default function EditCategoryForm({
  category,
}: {
  category: { id: string; name: string };
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const methods = useForm<EditCategoryFormValues>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: category.id,
      name: category.name,
    },
  });

  async function onSubmit(data: EditCategoryFormValues): Promise<void> {
    setPending(true);
    try {
      const result = await updateCategoryAction(data);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Category updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("[EditCategoryForm]", error);
      toast.error("Could not update the category.");
    } finally {
      setPending(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>General information</CardTitle>
          <CardDescription>Update the category name.</CardDescription>
        </CardHeader>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Nombre"
                placeholder="Ej. Primera división"
                disabled={pending}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Guardar cambios" isExecuting={pending} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
