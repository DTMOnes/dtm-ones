"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation Schema
import { updateUserGeneralSchema } from "@/lib/validation/users";
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
import { ApiError } from "@/lib/api/errors";
import { useUpdateUserGeneralMutation } from "@/hooks/api/use-users";

// Components
import TextField from "@/components/form/text-field";
import SubmitButton from "@/components/form/submit-button";

type EditUserGeneralFormValues = z.infer<typeof updateUserGeneralSchema>;

type EditUserGeneralFormProps = {
  user: {
    id: string;
    email: string;
    name: string | null;
    role?: string | null;
    created_at: string | Date;
    updated_at: string | Date;
  };
};

function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "-";
  }

  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function roleLabel(role: string | null | undefined) {
  if (role === "admin") return "Administrator";
  return "User";
}

export default function EditUserGeneralForm({ user }: EditUserGeneralFormProps) {
  const router = useRouter();

  const methods = useForm<EditUserGeneralFormValues>({
    resolver: zodResolver(updateUserGeneralSchema),
    defaultValues: {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
    },
  });

  const { mutate: submitUpdate, isPending } = useUpdateUserGeneralMutation();

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>General information</CardTitle>
          <CardDescription>
            Update the user&apos;s name and email address.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((data) =>
            submitUpdate(data, {
              onSuccess: () => {
                toast.success("Profile updated successfully.");
                router.refresh();
              },
              onError: (error) => {
                toast.error("Could not update profile.", {
                  description:
                    error instanceof ApiError ? error.message : undefined,
                });
              },
            }),
          )}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={isPending}
              />
              <TextField
                name="email"
                label="Email"
                placeholder="user@email.com"
                disabled={isPending}
              />
              <p className="text-muted-foreground text-xs">
                Current role: {roleLabel(user.role)} · Joined:{" "}
                {formatDate(user.created_at)} · Last updated:{" "}
                {formatDate(user.updated_at)}
              </p>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Save changes" isExecuting={isPending} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
