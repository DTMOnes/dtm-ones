"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { updatePlayer } from "@/actions/players";

// Validation Schema
import {
  updatePlayerSchema,
  type UpdatePlayerInput,
} from "@/lib/validation/players";

// Types
import type { CategoryData } from "@/lib/validation/categories";
import type { PlayerWithRelations } from "@/types/players";

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

// Components
import TextField from "@/components/form/text-field";
import OptionsField from "@/components/form/options-field";
import SubmitButton from "@/components/form/submit-button";

export default function EditPlayerForm({
  player,
  categories,
}: {
  player: PlayerWithRelations;
  categories: CategoryData[];
}) {
  const router = useRouter();

  const methods = useForm<UpdatePlayerInput>({
    resolver: zodResolver(updatePlayerSchema),
    defaultValues: {
      id: player.id,
      fullName: player.fullName,
      dateOfBirth: player.dateOfBirth,
      nationality: player.nationality,
      height: player.height,
      lastClub: player.lastClub,
      categoryIds: player.playerCategories.map(({ categoryId }) => categoryId),
    },
  });

  const { execute, isExecuting } = useAction(updatePlayer, {
    onSuccess: ({ data }) => {
      toast.success(data.message);
      router.refresh();
    },
    onError: ({ error }) => {
      toast.error("Failed to update player.", {
        description: error.serverError,
      });
    },
  });

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
          onSubmit={methods.handleSubmit((data) => execute(data))}
          noValidate
        >
          <CardContent className="pb-6">
            <FieldGroup className="gap-6">
              <TextField
                name="fullName"
                label="Full name"
                placeholder="John Doe"
                disabled={isExecuting}
              />
              <TextField
                name="dateOfBirth"
                label="Date of birth"
                placeholder="DD/MM/YYYY"
                disabled={isExecuting}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Argentina"
                disabled={isExecuting}
              />
              <TextField
                name="height"
                label="Height (cm)"
                placeholder="185"
                disabled={isExecuting}
              />
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="Club name"
                disabled={isExecuting}
              />
              <OptionsField
                name="categoryIds"
                label="Categories"
                options={categories}
                emptyMessage="No categories created yet"
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end">
            <SubmitButton label="Save changes" isExecuting={isExecuting} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
