"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

import { createUserAction } from "@/actions/users/createUser";
import PasswordField from "@/components/form/password-field";
import SelectField from "@/components/form/select-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";
import { createUserSchema } from "@/lib/validation/users";

type FormValues = z.infer<typeof createUserSchema>;

const DUPLICATE_EMAIL_CODES = new Set([
  "USER_ALREADY_EXISTS",
  "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL",
]);

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
    },
  });

  const { executeAsync, isExecuting } = useAction(createUserAction, {
    onSuccess: () => {
      toast.success("User created successfully.");
      methods.reset();
      setOpen(false);
      router.refresh();
    },
    onError: ({ error }) => {
      if (
        error.serverError &&
        DUPLICATE_EMAIL_CODES.has(error.serverError.code)
      ) {
        methods.setError("email", {
          message: "This email already belongs to a User.",
        });
        return;
      }

      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  useEffect(() => {
    if (!open) {
      methods.reset();
    }
  }, [open, methods]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          New user
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>
            Create a User with email and password. They can sign in to the
            dashboard with the assigned role.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={methods.handleSubmit((values) => executeAsync(values))}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
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
              <PasswordField
                name="password"
                label="Password"
                disabled={isExecuting}
              />
              <SelectField
                name="role"
                label="Role"
                disabled={isExecuting}
                options={[
                  { id: "staff", name: "Staff" },
                  { id: "owner", name: "Owner" },
                ]}
              />
            </FieldGroup>
            <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial"
                disabled={isExecuting}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <div className="flex-1 sm:flex-initial">
                <SubmitButton label="Create user" isExecuting={isExecuting} />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
