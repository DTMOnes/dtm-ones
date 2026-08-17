"use client";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { setUserRoleAction } from "@/actions/users/setUserRole";
import { Button } from "@/components/ui/button";
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
import { Spinner } from "@/components/ui/spinner";
import type { DashboardRole } from "@/lib/auth/types";
import { setUserRoleSchema } from "@/lib/validation/users";

type ChangeUserRoleFormValues = z.infer<typeof setUserRoleSchema>;

type ChangeUserRoleFormProps = {
  userId: string;
  currentRole: DashboardRole;
  isLastOwner: boolean;
  isSelf: boolean;
};

export function ChangeUserRoleForm({
  userId,
  currentRole,
  isLastOwner,
  isSelf,
}: ChangeUserRoleFormProps) {
  const router = useRouter();
  const cannotDemote = isLastOwner || isSelf;

  const methods = useForm<ChangeUserRoleFormValues>({
    resolver: zodResolver(setUserRoleSchema),
    defaultValues: {
      userId,
      role: currentRole,
    },
  });

  const selectedRole = methods.watch("role");
  const blockedDemotion = cannotDemote && selectedRole === "staff";

  const { executeAsync, isExecuting } = useAction(setUserRoleAction, {
    onSuccess: () => {
      toast.success("Role updated successfully.");
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Role</CardTitle>
          <CardDescription>
            Current role: {currentRole === "owner" ? "Owner" : "Staff"}. Owners
            can manage Users; Staff can manage Clients and ContactRequests.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
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
                        <SelectItem value="staff" disabled={cannotDemote}>
                          Staff
                        </SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
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
              {isLastOwner ? (
                <p className="text-muted-foreground text-xs">
                  This is the last Owner. You cannot assign the Staff role until
                  you promote another User or create a new Owner.
                </p>
              ) : null}
              {isSelf ? (
                <p className="text-muted-foreground text-xs">
                  You cannot change your own role. Another Owner must do it.
                </p>
              ) : null}
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={isExecuting || blockedDemotion}>
              {isExecuting ? <Spinner /> : "Save role"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
