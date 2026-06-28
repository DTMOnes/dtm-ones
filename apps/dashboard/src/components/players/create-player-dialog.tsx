"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  createPlayerSchema,
  type CreatePlayerInput,
} from "@/lib/validation/players";
import { ApiError } from "@/lib/api/errors";
import { useCreatePlayerMutation } from "@/hooks/api/use-players";

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
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

// Components
import TextField from "@/components/form/text-field";
import OptionsField from "@/components/form/options-field";

// Icons
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

export default function CreatePlayerDialog({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const methods = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      fullName: "",
      height: "",
      dateOfBirth: "",
      nationality: "",
      lastClub: "",
      categoryIds: [],
    },
  });

  const { handleSubmit, reset } = methods;

  const { mutate: submitCreatePlayer, isPending } = useCreatePlayerMutation();

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
          New player
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!isPending}
        className="flex max-h-[90vh] max-w-[calc(100%-2rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg"
      >
        <DialogHeader className="shrink-0 border-b px-6 py-4">
          <DialogTitle>New player</DialogTitle>
          <DialogDescription>
            Fill in the basic details; you can expand the profile later from the
            detail page.
          </DialogDescription>
        </DialogHeader>
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit((data) =>
              submitCreatePlayer(data, {
                onSuccess: () => {
                  toast.success("Player created successfully.");
                  reset();
                  setOpen(false);
                  router.refresh();
                },
                onError: (error) => {
                  toast.error("Failed to create player.", {
                    description:
                      error instanceof ApiError ? error.message : undefined,
                  });
                },
              }),
            )}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <FieldGroup className="gap-4">
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
            </div>
            <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:justify-end bg-muted/20">
              <Button
                type="submit"
                variant="outline"
                disabled={isPending}
                aria-label="submit"
              >
                {isPending ? <Spinner /> : "Create player"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
