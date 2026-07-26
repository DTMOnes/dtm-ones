"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createPlayerAction } from "@/actions/players/createPlayer";
import OptionsField from "@/components/form/options-field";
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
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import {
  createPlayerSchema,
  type CreatePlayerInput,
} from "@/lib/validation/players";
import { toast } from "sonner";

import { PlusIcon } from "@phosphor-icons/react/dist/ssr";

export default function CreatePlayerDialog({
  categories,
}: {
  categories: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const methods = useForm<CreatePlayerInput>({
    resolver: zodResolver(createPlayerSchema),
    defaultValues: {
      fullName: "",
      heightCm: "",
      nationality: "",
      lastClub: "",
      categoryIds: [],
    },
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  async function onSubmit(data: CreatePlayerInput): Promise<void> {
    setPending(true);
    try {
      const result = await createPlayerAction(data);
      if (result.error) {
        toast.error(result.error.message);
        return;
      }

      toast.success("Player created successfully.");
      reset();
      setOpen(false);
      router.refresh();
    } catch (error) {
      console.error("[CreatePlayerDialog]", error);
      toast.error("Could not create the player.");
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <PlusIcon />
          New player
        </Button>
      </DialogTrigger>
      <DialogContent
        showCloseButton={!pending}
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
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
            noValidate
          >
            <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
              <FieldGroup className="gap-4">
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
                <OptionsField
                  name="categoryIds"
                  label="Categories"
                  options={categories}
                  emptyMessage="No categories created yet"
                  disabled={pending}
                />
              </FieldGroup>
            </div>
            <DialogFooter className="shrink-0 gap-2 border-t px-6 py-4 sm:justify-end bg-muted/20">
              <Button
                type="submit"
                variant="outline"
                disabled={pending}
                aria-label="submit"
              >
                {pending ? <Spinner /> : "Create player"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
