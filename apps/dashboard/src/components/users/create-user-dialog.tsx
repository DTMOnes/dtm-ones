"use client";

import { useEffect, useState } from "react";
import {
  Controller,
  FormProvider,
  useForm,
  type UseFormSetError,
} from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { createUserSchema } from "@/lib/validation/users";
import { ApiError } from "@/lib/api/errors";
import { useCreateUserMutation } from "@/hooks/api/use-users";

import PasswordField from "@/components/form/password-field";
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
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SubmitButton from "@/components/form/submit-button";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

type FormValues = z.infer<typeof createUserSchema>;

function setFieldErrors(
  setError: UseFormSetError<FormValues>,
  validationErrors: Record<string, unknown> | undefined,
) {
  if (!validationErrors) return;
  (["name", "email", "password", "role"] as const).forEach((field) => {
    const messages = validationErrors[field];
    if (Array.isArray(messages) && messages[0]) {
      setError(field, { message: String(messages[0]) });
    }
  });
}

export default function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createUserSchema as never),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "user",
    },
  });

  const {
    register,
    handleSubmit,
    reset,
    setError,
    control,
    formState: { errors },
  } = methods;

  const { mutate: submitCreateUser, isPending } = useCreateUserMutation();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const emailError = errors.email?.message;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          New user
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isPending}>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>
            Create an account with email and password. The user can sign in to
            the dashboard according to the assigned role.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) =>
              submitCreateUser(data, {
                onSuccess: () => {
                  toast.success("User created successfully.");
                  reset();
                  setOpen(false);
                  router.refresh();
                },
                onError: (error) => {
                  if (error instanceof ApiError) {
                    setFieldErrors(setError, error.fieldErrors);
                    if (
                      error.fieldErrors &&
                      Object.keys(error.fieldErrors).length > 0
                    ) {
                      return;
                    }
                    toast.error("Could not create user.", {
                      description: error.message,
                    });
                    return;
                  }

                  toast.error("Could not create user.");
                },
              }),
            )}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={isPending}
              />
              <Field className="gap-2">
                <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
                <Input
                  id="create-user-email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@email.com"
                  disabled={isPending}
                  aria-invalid={!!emailError}
                  {...register("email")}
                />
                {emailError ? (
                  <FieldError errors={[{ message: emailError }]} />
                ) : null}
              </Field>
              <PasswordField
                name="password"
                label="Password"
                disabled={isPending}
              />
              <Field className="gap-2">
                <FieldLabel htmlFor="create-user-role">Role</FieldLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="create-user-role"
                        className="w-full"
                        aria-invalid={!!errors.role}
                      >
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">User</SelectItem>
                        <SelectItem value="admin">Administrator</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.role?.message ? (
                  <FieldError
                    errors={[{ message: String(errors.role.message) }]}
                  />
                ) : null}
              </Field>
            </FieldGroup>
            <DialogFooter className="gap-2 border-t pt-4 sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="flex-1 sm:flex-initial"
                disabled={isPending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <div className="flex-1 sm:flex-initial">
                <SubmitButton label="Create user" isExecuting={isPending} />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
