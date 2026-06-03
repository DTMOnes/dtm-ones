"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { setUserRole } from "@/actions/users";

// Validation Schema
import { setUserRoleSchema } from "@/lib/validation/users";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

type ChangeUserRoleFormValues = z.infer<typeof setUserRoleSchema>;

type ChangeUserRoleFormProps = {
  userId: string;
  currentRole: string | null;
  isOnlyAdmin: boolean;
};

function roleLabel(role: string | null) {
  if (role === "admin") return "Administrator";
  return "User";
}

export default function ChangeUserRoleForm({
  userId,
  currentRole,
  isOnlyAdmin,
}: ChangeUserRoleFormProps) {
  const router = useRouter();
  const role = currentRole === "admin" ? "admin" : "user";

  const methods = useForm<ChangeUserRoleFormValues>({
    resolver: zodResolver(setUserRoleSchema),
    defaultValues: {
      userId,
      role,
    },
  });

  const { execute, isExecuting } = useAction(setUserRole, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "Role updated successfully.");
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error("Could not update role.", {
        description: error.serverError,
      });
    },
  });

  const selectedRole = methods.watch("role");
  const cannotDemote = isOnlyAdmin && selectedRole === "user";

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Role</CardTitle>
          <CardDescription>
            Current role: {roleLabel(currentRole)}. Administrators can manage
            users; standard users can only access players and categories.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((data) => execute(data))}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <input type="hidden" {...methods.register("userId")} />
              <Field className="gap-2">
                <FieldLabel htmlFor="change-user-role">New role</FieldLabel>
                <Controller
                  name="role"
                  control={methods.control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isExecuting}
                    >
                      <SelectTrigger
                        id="change-user-role"
                        className="w-full"
                        aria-invalid={!!methods.formState.errors.role}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user" disabled={isOnlyAdmin}>
                          User
                        </SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {methods.formState.errors.role?.message ? (
                  <FieldError
                    errors={[
                      {
                        message: String(methods.formState.errors.role.message),
                      },
                    ]}
                  />
                ) : null}
              </Field>
              {isOnlyAdmin ? (
                <p className="text-muted-foreground text-xs">
                  This is the only administrator. You cannot assign the User
                  role until you promote another user or create a new
                  administrator.
                </p>
              ) : null}
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isExecuting || cannotDemote}>
              {isExecuting ? <Spinner /> : "Save role"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
