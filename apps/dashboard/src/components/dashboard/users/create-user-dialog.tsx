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
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";

import { createUser } from "@/actions/users";
import { createUserSchema } from "@/lib/validation/users";

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

  const { execute, isExecuting } = useAction(createUser, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message);
        reset();
        setOpen(false);
        router.refresh();
      }
    },
    onError: ({ error }) => {
      setFieldErrors(setError, error.validationErrors);
      if (
        error.validationErrors &&
        Object.keys(error.validationErrors).length > 0
      ) {
        return;
      }
      toast.error("No se pudo crear el usuario.", {
        description: error.serverError,
      });
    },
  });

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
          Nuevo usuario
        </Button>
      </DialogTrigger>
      <DialogContent showCloseButton={!isExecuting}>
        <DialogHeader>
          <DialogTitle>Nuevo usuario</DialogTitle>
          <DialogDescription>
            Crea una cuenta con email y contraseña. El usuario podrá iniciar
            sesión en el panel según el rol asignado.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) => execute(data))}
            className="flex flex-col gap-4"
            noValidate
          >
            <FieldGroup>
              <TextField
                name="name"
                label="Nombre"
                placeholder="Nombre y apellido"
                disabled={isExecuting}
              />
              <Field className="gap-2">
                <FieldLabel htmlFor="create-user-email">Email</FieldLabel>
                <Input
                  id="create-user-email"
                  type="email"
                  autoComplete="email"
                  placeholder="usuario@email.com"
                  disabled={isExecuting}
                  aria-invalid={!!emailError}
                  {...register("email")}
                />
                {emailError ? (
                  <FieldError errors={[{ message: emailError }]} />
                ) : null}
              </Field>
              <PasswordField
                name="password"
                label="Contraseña"
                disabled={isExecuting}
              />
              <Field className="gap-2">
                <FieldLabel htmlFor="create-user-role">Rol</FieldLabel>
                <Controller
                  name="role"
                  control={control}
                  render={({ field }) => (
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isExecuting}
                    >
                      <SelectTrigger
                        id="create-user-role"
                        className="w-full"
                        aria-invalid={!!errors.role}
                      >
                        <SelectValue placeholder="Rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="user">Usuario</SelectItem>
                        <SelectItem value="admin">Administrador</SelectItem>
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
                disabled={isExecuting}
                onClick={() => setOpen(false)}
              >
                Cancelar
              </Button>
              <div className="flex-1 sm:flex-initial">
                <SubmitButton label="Crear usuario" isExecuting={isExecuting} />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
