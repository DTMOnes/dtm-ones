"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Validation Schema
import {
  updatePlayerSchema,
  type UpdatePlayerInput,
} from "@/lib/validation/players";

import type { ApiPlayer } from "@/lib/api/types";

// Shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/errors";
import { useUpdatePlayerMutation } from "@/hooks/api/use-players";

// Components
import TextField from "@/components/form/text-field";
import OptionsField from "@/components/form/options-field";
import SubmitButton from "@/components/form/submit-button";

export default function EditPlayerForm({
  player,
  categories,
}: {
  player: ApiPlayer;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();

  const methods = useForm<UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      id: player.id,
      fullName: player.full_name,
      dateOfBirth: player.date_of_birth,
      nationality: player.nationality,
      height: player.height,
      lastClub: player.last_club,
      categoryIds: player.categories.map((category) => category.id),
    },
  });

  const { mutate: submitUpdate, isPending } = useUpdatePlayerMutation();

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader className="border-b">
          <CardTitle>General information</CardTitle>
          <CardDescription>
            Update the player&apos;s profile details and category assignments.
          </CardDescription>
        </CardHeader>
        <form
          onSubmit={methods.handleSubmit((data) =>
            submitUpdate(data, {
              onSuccess: () => {
                toast.success("Player updated successfully.");
                router.refresh();
              },
              onError: (error) => {
                toast.error("Failed to update player.", {
                  description:
                    error instanceof ApiError ? error.message : undefined,
                });
              },
            }),
          )}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <TextField
                name="fullName"
                label="Full name"
                placeholder="John Doe"
                disabled={isPending}
              />
              <TextField
                name="dateOfBirth"
                label="Date of birth"
                placeholder="DD/MM/YYYY"
                disabled={isPending}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Argentina"
                disabled={isPending}
              />
              <TextField
                name="height"
                label="Height (cm)"
                placeholder="185"
                disabled={isPending}
              />
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="Club name"
                disabled={isPending}
              />
              <OptionsField
                name="categoryIds"
                label="Categories"
                options={categories}
                emptyMessage="No categories created yet"
                disabled={isPending}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Save changes" isExecuting={isPending} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
