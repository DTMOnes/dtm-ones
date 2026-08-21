"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { FloppyDiskIcon } from "@phosphor-icons/react";

import { setUserRoleAction } from "@/actions/users/setUserRole";
import SelectField from "@/components/form/select-field";
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
        <CardHeader>
          <CardTitle>Role</CardTitle>
          <CardDescription>
            Current role: {currentRole === "owner" ? "Owner" : "Staff"}. Owners
            can manage Users; Staff can manage Clients and ContactRequests.
          </CardDescription>
        </CardHeader>
        <form
          className="contents"
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
          noValidate
        >
          <CardContent>
            <FieldGroup>
              <input type="hidden" {...methods.register("userId")} />
              <SelectField
                name="role"
                label="New role"
                placeholder="Select role"
                disabled={isExecuting}
                options={[
                  { id: "staff", name: "Staff", disabled: cannotDemote },
                  { id: "owner", name: "Owner" },
                ]}
              />
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
          <CardFooter>
            <Button type="submit" disabled={isExecuting || blockedDemotion}>
              {isExecuting ? (
                <Spinner />
              ) : (
                <>
                  <FloppyDiskIcon />
                  Save role
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
