"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";

import { createPlayer } from "@/actions/players";
import { createPlayerSchema as schema } from "@/lib/validation/players";

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
import TextField from "@/components/form/text-field";
import OptionsField from "@/components/form/options-field";
import SubmitButton from "@/components/form/submit-button";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { toast } from "sonner";

type FormValues = z.infer<typeof schema>;

export default function CreatePlayerDialog({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      fullName: "",
      height: "",
      dateOfBirth: "",
      nationality: "",
      lastClub: "",
      playerCategories: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const { execute, isExecuting } = useAction(createPlayer, {
    onSuccess: ({ data }) => {
      if (data?.success) {
        toast.success(data.message ?? "Jugador creado correctamente");
        reset();
        setOpen(false);
        router.refresh();
      }
    },
    onError: ({ error }) => {
      toast.error("Error al crear el jugador.", {
        description: error.serverError,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          Nuevo jugador
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!isExecuting}
        className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>Nuevo jugador</DialogTitle>
          <DialogDescription>
            Completa los datos básicos; podrás ampliar la ficha después desde el
            detalle.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) => execute(data))}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <FieldGroup className="gap-4">
                <TextField
                  name="fullName"
                  label="Nombre completo"
                  placeholder="Juan Pérez"
                  disabled={isExecuting}
                />
                <TextField
                  name="dateOfBirth"
                  label="Fecha de nacimiento"
                  placeholder="DD/MM/YYYY"
                  disabled={isExecuting}
                />
                <TextField
                  name="nationality"
                  label="Nacionalidad"
                  placeholder="Argentina"
                  disabled={isExecuting}
                />
                <TextField
                  name="height"
                  label="Altura"
                  placeholder="1,85 m"
                  disabled={isExecuting}
                />
                <TextField
                  name="lastClub"
                  label="Último club"
                  placeholder="Nombre del club"
                  disabled={isExecuting}
                />
                <OptionsField
                  name="playerCategories"
                  label="Categorías"
                  options={categories}
                  disabled={isExecuting}
                />
              </FieldGroup>
            </div>
            <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:justify-end">
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
                <SubmitButton label="Guardar" isExecuting={isExecuting} />
              </div>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
