"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

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
import { roleLabel } from "@/utils/auth/roles";
import { setUserRoleSchema } from "@/lib/validation/users";

type ChangeUserRoleFormValues = z.infer<typeof setUserRoleSchema>;

type ChangeUserRoleFormProps = {
  userId: string;
  currentRole: DashboardRole;
  isOnlyOwner: boolean;
};

export function ChangeUserRoleForm({
  userId,
  currentRole,
  isOnlyOwner,
}: ChangeUserRoleFormProps) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const methods = useForm<ChangeUserRoleFormValues>({
    resolver: zodResolver(setUserRoleSchema as never),
    defaultValues: {
      userId,
      role: currentRole,
    },
  });

  const selectedRole = methods.watch("role");
  const cannotDemote = isOnlyOwner && selectedRole === "staff";

  async function onSubmit(data: ChangeUserRoleFormValues): Promise<void> {
    setPending(true);
    try {
      const result = await setUserRoleAction(data);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Role updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("[ChangeUserRoleForm]", error);
      toast.error("Could not update role.");
    } finally {
      setPending(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Role</CardTitle>
          <CardDescription>
            Current role: {roleLabel(currentRole)}. Owners can manage users;
            Staff can access contacts, players, and categories.
          </CardDescription>
        </CardHeader>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
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
                      disabled={pending}
                    >
                      <SelectTrigger
                        id="change-user-role"
                        className="w-full"
                        aria-invalid={!!methods.formState.errors.role}
                      >
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff" disabled={isOnlyOwner}>
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
              {isOnlyOwner ? (
                <p className="text-muted-foreground text-xs">
                  This is the only owner. You cannot assign the Staff role until
                  you promote another user or create a new owner.
                </p>
              ) : null}
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <Button type="submit" disabled={pending || cannotDemote}>
              {pending ? <Spinner /> : "Save role"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
