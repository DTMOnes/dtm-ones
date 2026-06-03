"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { updateUserGeneral } from "@/actions/users";

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
    createdAt: string | Date;
    updatedAt: string | Date;
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

  const { execute, isExecuting } = useAction(updateUserGeneral, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "Profile updated successfully.");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error("Could not update profile.", {
        description: error.serverError,
      });
    },
  });

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
          onSubmit={methods.handleSubmit((data) => execute(data))}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={isExecuting}
              />
              <TextField
                name="email"
                label="Email"
                placeholder="user@email.com"
                disabled={isExecuting}
              />
              <p className="text-muted-foreground text-xs">
                Current role: {roleLabel(user.role)} · Joined:{" "}
                {formatDate(user.createdAt)} · Last updated:{" "}
                {formatDate(user.updatedAt)}
              </p>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Save changes" isExecuting={isExecuting} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
