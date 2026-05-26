"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";

import { updateUser } from "@/actions/users";
import { z } from "zod";
import { updateUserSchema } from "@/lib/validation/users";

import PasswordField from "@/components/form/password-field";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";

type EditUserFormValues = z.infer<typeof updateUserSchema>;

type EditUserFormProps = {
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

  return date.toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function EditUserForm({ user }: EditUserFormProps) {
  const router = useRouter();

  const methods = useForm<EditUserFormValues>({
    resolver: zodResolver(updateUserSchema as never),
    defaultValues: {
      id: user.id,
      name: user.name ?? "",
      email: user.email,
      password: "",
    },
  });

  const { execute, isExecuting } = useAction(updateUser, {
    onSuccess: ({ data }) => {
      toast.success("User updated successfully.");
      router.refresh();
    },
    onError: ({ error }) => {
      console.error(error);
      toast.error("There was an error updating the user.", {
        description: error.serverError,
      });
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Editar usuario</CardTitle>
        <CardDescription>
          Modifica email, nombre y contraseña. Si dejas la contraseña vacía no
          se realiza ningún cambio.
        </CardDescription>
      </CardHeader>
      <FormProvider {...methods}>
        <form
          onSubmit={methods.handleSubmit((data) => execute(data))}
          className="flex flex-col gap-6"
        >
          <CardContent className="space-y-4">
            <input type="hidden" {...methods.register("id")} />

            <TextField
              name="name"
              label="Nombre"
              placeholder="Nombre y apellido"
              disabled={isExecuting}
            />
            <TextField
              name="email"
              label="Email"
              placeholder="usuario@email.com"
              disabled={isExecuting}
            />
            <PasswordField
              name="password"
              label="Nueva contraseña"
              disabled={isExecuting}
            />

            <p className="text-muted-foreground text-xs">
              Rol actual: {user.role ?? "user"} · Alta:{" "}
              {formatDate(user.createdAt)} · Última actualización:{" "}
              {formatDate(user.updatedAt)}
            </p>
          </CardContent>

          <CardFooter>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? "Updating..." : "Update user"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
