"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { updateCategory } from "@/actions/categories";

// Validation Schema
import { updateCategorySchema } from "@/lib/validation/categories";
import { z } from "zod";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";

// Components
import TextField from "@/components/form/text-field";
import SubmitButton from "@/components/form/submit-button";

type EditCategoryFormValues = z.infer<typeof updateCategorySchema>;

function formatDate(value: Date) {
  return value.toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EditCategoryForm({
  category,
}: {
  category: { id: string; name: string };
}) {
  const router = useRouter();

  const methods = useForm<EditCategoryFormValues>({
    resolver: zodResolver(updateCategorySchema),
    defaultValues: {
      id: category.id,
      name: category.name,
    },
  });

  const { execute, isExecuting } = useAction(updateCategory, {
    onSuccess: ({ data }) => {
      toast.success(data?.message);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error(error.serverError ?? "Could not update the category.");
    },
  });

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>General information</CardTitle>
          <CardDescription>Update the category name.</CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((data) => execute(data))}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Nombre"
                placeholder="Ej. Primera división"
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Guardar cambios" isExecuting={isExecuting} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
