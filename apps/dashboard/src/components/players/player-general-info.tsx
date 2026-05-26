"use client";

// Next
import { useRouter } from "next/navigation";

// React
import { useEffect, useState } from "react";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { updatePlayer } from "@/actions/players";

// Validation Schema
import { updatePlayerSchema } from "@/lib/validation/players";

// Types
import { type PlayerData } from "@/lib/validation/players";
import { type CategoryData } from "@/lib/validation/categories";

// Shadcn
import { FieldGroup } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";

// Zod
import { z } from "zod";

// Components
import TextField from "@/components/form/text-field";
import OptionsField from "@/components/form/options-field";
import SubmitButton from "@/components/form/submit-button";

// Phosphor
import { PencilSimpleIcon } from "@phosphor-icons/react";

type FormValues = z.infer<typeof updatePlayerSchema>;

export default function PlayerGeneralInfo({
  player,
  categories,
}: {
  player: PlayerData;
  categories: CategoryData[];
}) {
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(updatePlayerSchema as never),
    defaultValues: {
      id: player.id,
      fullName: player.fullName,
      dateOfBirth: player.dateOfBirth,
      nationality: player.nationality,
      height: player.height,
      lastClub: player.lastClub,
      playerCategories: player.playerCategories.map(({ categoryId }) =>
        categoryId.toString(),
      ),
    },
  });

  const { execute, isExecuting } = useAction(updatePlayer, {
    onSuccess: ({ data }) => {
      if (!data?.success) {
        return;
      }

      toast.success(data.message);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error("No se pudo actualizar el jugador.", {
        description: error.serverError,
      });
    },
  });

  useEffect(() => {
    if (!open) {
      methods.reset({
        id: player.id,
        fullName: player.fullName,
        dateOfBirth: player.dateOfBirth,
        nationality: player.nationality,
        height: player.height,
        lastClub: player.lastClub,
        playerCategories: player.playerCategories.map(({ categoryId }) =>
          categoryId.toString(),
        ),
      });
    }
  }, [methods, player]);

  const onSubmit = (data: FormValues) => {
    execute(data);
  };

  return (
    <FormProvider {...methods}>
      <Card>
        <CardContent>
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="flex flex-col gap-4"
          >
            <FieldGroup>
              <TextField name="fullName" label="Nombre completo" />
              <TextField name="dateOfBirth" label="Fecha de nacimiento" />
              <TextField name="nationality" label="Nacionalidad" />
              <TextField name="height" label="Altura" />
              <TextField name="lastClub" label="Último club" />
              <OptionsField
                name="playerCategories"
                label="Categorías"
                options={categories}
              />
            </FieldGroup>
            <SubmitButton label="Guardar cambios" isExecuting={isExecuting} />
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
}
