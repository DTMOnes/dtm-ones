"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation Schema
import { changeUserPasswordSchema } from "@/lib/validation/users";
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
import { useChangeUserPasswordMutation } from "@/hooks/api/use-users";

// Components
import PasswordField from "@/components/form/password-field";
import SubmitButton from "@/components/form/submit-button";

type ChangeUserPasswordFormValues = z.infer<typeof changeUserPasswordSchema>;

type ChangeUserPasswordFormProps = {
  userId: string;
};

export default function ChangeUserPasswordForm({
  userId,
}: ChangeUserPasswordFormProps) {
  const router = useRouter();

  const methods = useForm<ChangeUserPasswordFormValues>({
    resolver: zodResolver(changeUserPasswordSchema),
    defaultValues: {
      userId,
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: submitPassword, isPending } = useChangeUserPasswordMutation();

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Change password</CardTitle>
          <CardDescription>
            Set a new password for this user.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((data) =>
            submitPassword(data, {
              onSuccess: (response) => {
                toast.success(response.message);
                methods.reset({ userId, password: "", confirmPassword: "" });
                router.refresh();
              },
              onError: (error) => {
                toast.error("Could not update password.", {
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
              <input type="hidden" {...methods.register("userId")} />
              <PasswordField
                name="password"
                label="New password"
                disabled={isPending}
              />
              <PasswordField
                name="confirmPassword"
                label="Confirm new password"
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton
              label="Update password"
              isExecuting={isPending}
            />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
