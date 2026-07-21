"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  Controller,
  FormProvider,
  useForm,
  type UseFormSetError,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

import { createUserAction } from "@/actions/users/createUser";
import PasswordField from "@/components/form/password-field";
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
import { createUserSchema } from "@/lib/validation/users";

type FormValues = z.infer<typeof createUserSchema>;

function setFieldErrors(
  setError: UseFormSetError<FormValues>,
  fieldErrors: Record<string, string[]> | undefined,
): void {
  if (!fieldErrors) {
    return;
  }

  (["name", "email", "password", "role"] as const).forEach((field) => {
    const messages = fieldErrors[field];
    if (messages?.[0]) {
      setError(field, { message: messages[0] });
    }
  });
}

export function CreateUserDialog() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(createUserSchema as never),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: "staff",
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

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  const emailError = errors.email?.message;

  async function onSubmit(data: FormValues): Promise<void> {
    setPending(true);
    try {
      const result = await createUserAction(data);
      if (result.error) {
        setFieldErrors(setError, result.error.fieldErrors);
        if (
          result.error.fieldErrors &&
          Object.keys(result.error.fieldErrors).length > 0
        ) {
          return;
        }
        toast.error(result.error.message);
        return;
      }

      toast.success("User created successfully.");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[CreateUserDialog]", error);
      toast.error("Could not create user.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          New user
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>New user</DialogTitle>
          <DialogDescription>
            Create an account with email and password. The user can sign in to
            the dashboard according to the assigned role.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={pending}
              />
              <Field className="gap-2">
                <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
                <Input
                  id="create-user-email"
                  type="email"
                  autoComplete="email"
                  placeholder="user@email.com"
                  disabled={pending}
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
                disabled={pending}
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
                      disabled={pending}
                    >
                      <SelectTrigger
                        id="create-user-role"
                        className="w-full"
                        aria-invalid={!!errors.role}
                      >
                        <SelectValue placeholder="Role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="staff">Staff</SelectItem>
                        <SelectItem value="owner">Owner</SelectItem>
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
                disabled={pending}
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
              <div className="flex-1 sm:flex-initial">
                <SubmitButton label="Create user" isExecuting={pending} />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
