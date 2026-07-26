"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { updatePlayerAction } from "@/actions/players/updatePlayer";
import OptionsField from "@/components/form/options-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  updatePlayerSchema,
  type UpdatePlayerInput,
} from "@/lib/validation/players";
import type { PlayerDetail } from "@/types/player";
import { toast } from "sonner";

export default function EditPlayerForm({
  player,
  categories,
}: {
  player: PlayerDetail;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const methods = useForm<UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      id: player.id,
      fullName: player.full_name,
      nationality: player.nationality,
      heightCm: String(player.height_cm),
      lastClub: player.last_club,
      status: player.status,
      categoryIds: player.categories.map((category) => category.id),
    },
  });

  async function onSubmit(data: UpdatePlayerInput): Promise<void> {
    setPending(true);
    try {
      const result = await updatePlayerAction(data);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Player updated successfully.");
      router.refresh();
    } catch (error) {
      console.error("[EditPlayerForm]", error);
      toast.error("Could not update the player.");
    } finally {
      setPending(false);
    }
  }

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>General information</CardTitle>
          <CardDescription>
            Update the player&apos;s profile details and category assignments.
          </CardDescription>
        </CardHeader>
        <form onSubmit={methods.handleSubmit(onSubmit)} noValidate>
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <TextField
                name="fullName"
                label="Full name"
                placeholder="John Doe"
                disabled={pending}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Argentina"
                disabled={pending}
              />
              <TextField
                name="heightCm"
                label="Height (cm)"
                placeholder="185"
                disabled={pending}
              />
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="FC Barcelona"
                disabled={pending}
              />
              <Field className="flex flex-col gap-2">
                <FieldLabel>Status</FieldLabel>
                <Controller
                  name="status"
                  control={methods.control}
                  render={({ field, fieldState }) => (
                    <>
                      <ToggleGroup
                        type="single"
                        size="sm"
                        variant="outline"
                        spacing={2}
                        className="flex flex-wrap gap-2"
                        disabled={pending}
                        value={field.value}
                        onValueChange={(value) => {
                          if (value === "draft" || value === "published") {
                            field.onChange(value);
                          }
                        }}
                      >
                        <ToggleGroupItem value="draft">Draft</ToggleGroupItem>
                        <ToggleGroupItem value="published">
                          Published
                        </ToggleGroupItem>
                      </ToggleGroup>
                      {fieldState.error?.message ? (
                        <FieldError
                          errors={[{ message: fieldState.error.message }]}
                        />
                      ) : null}
                    </>
                  )}
                />
              </Field>
              <OptionsField
                name="categoryIds"
                label="Categories"
                options={categories}
                emptyMessage="No categories created yet"
                disabled={pending}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Save changes" isExecuting={pending} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
