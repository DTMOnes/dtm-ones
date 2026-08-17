"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { renameCategoryAction } from "@/actions/categories/renameCategory";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { renameCategorySchema } from "@/lib/validation/categories";

type RenameCategoryFormValues = z.infer<typeof renameCategorySchema>;

type RenameCategoryFormProps = {
  categoryId: string;
  currentName: string;
};

export function RenameCategoryForm({
  categoryId,
  currentName,
}: RenameCategoryFormProps) {
  const router = useRouter();

  const methods = useForm<RenameCategoryFormValues>({
    resolver: zodResolver(renameCategorySchema),
    defaultValues: {
      id: categoryId,
      name: currentName,
    },
  });

  const { executeAsync, isExecuting } = useAction(renameCategoryAction, {
    onSuccess: () => {
      toast.success("Name updated successfully.");
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

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Name</CardTitle>
          <CardDescription>
            Shown on the Categories list and this page.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Name"
                placeholder="Guards"
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isExecuting}
              onClick={() => methods.reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? <Spinner /> : "Save name"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
