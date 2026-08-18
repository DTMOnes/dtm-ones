"use client";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { updatePlayerAction } from "@/actions/players/updatePlayer";
import OptionsField from "@/components/form/options-field";
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
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { updatePlayerSchema } from "@/lib/validation/players";
import type { PlayerDetail } from "@/types/player";

type FormValues = {
  id: string;
  name: string;
  nationality: string;
  lastClub: string;
  heightCm: string;
  categoryId: string;
  eurobasketLink: string;
};

export function EditPlayerForm({
  player,
  categories,
}: {
  player: PlayerDetail;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();

  const methods = useForm<FormValues, unknown, z.output<typeof updatePlayerSchema>>({
    resolver: zodResolver(updatePlayerSchema) as Resolver<
      FormValues,
      unknown,
      z.output<typeof updatePlayerSchema>
    >,
    defaultValues: {
      id: player.id,
      name: player.name,
      nationality: player.nationality,
      lastClub: player.lastClub,
      heightCm: player.heightCm == null ? "" : String(player.heightCm),
      categoryId: player.categoryId ?? "",
      eurobasketLink: player.eurobasketLink ?? "",
    },
  });

  const { executeAsync, isExecuting } = useAction(updatePlayerAction, {
    onSuccess: () => {
      toast.success("Player updated successfully.");
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
      <Card className="shadow-sm">
        <CardHeader className="border-b">
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            A public Player needs name, Category, presentation image, height,
            nationality, and last club. Upload the presentation image on Media.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
          noValidate
        >
          <CardContent>
            <FieldGroup>
              <input type="hidden" {...methods.register("id")} />
              <TextField
                name="name"
                label="Name"
                placeholder="Manu Ginobili"
                disabled={isExecuting}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Argentina"
                disabled={isExecuting}
              />
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="San Antonio Spurs"
                disabled={isExecuting}
              />
              <TextField
                name="heightCm"
                label="Height (cm)"
                placeholder="198"
                disabled={isExecuting}
              />
              <OptionsField
                name="categoryId"
                label="Category"
                options={categories}
                emptyMessage="No categories created yet"
                disabled={isExecuting}
              />
              <TextField
                name="eurobasketLink"
                label="Eurobasket link"
                placeholder="https://basketball.eurobasket.com/..."
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isExecuting}
              onClick={() => methods.reset()}
            >
              Reset
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? <Spinner /> : "Save profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
