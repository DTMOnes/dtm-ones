"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { ArrowCounterClockwiseIcon, FloppyDiskIcon } from "@phosphor-icons/react";

import { setUserNameAction } from "@/actions/users/setUserName";
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
import { setUserNameSchema } from "@/lib/validation/users";

type ChangeUserNameFormValues = z.infer<typeof setUserNameSchema>;

type ChangeUserNameFormProps = {
  userId: string;
  currentName: string;
};

export function ChangeUserNameForm({
  userId,
  currentName,
}: ChangeUserNameFormProps) {
  const router = useRouter();

  const methods = useForm<ChangeUserNameFormValues>({
    resolver: zodResolver(setUserNameSchema),
    defaultValues: {
      userId,
      name: currentName,
    },
  });

  const { executeAsync, isExecuting } = useAction(setUserNameAction, {
    onSuccess: () => {
      toast.success("Name updated successfully.");
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
      <Card>
        <CardHeader>
          <CardTitle>Name</CardTitle>
          <CardDescription>
            Shown on the Users list and this page.
          </CardDescription>
        </CardHeader>
        <form
          className="contents"
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
          noValidate
        >
          <CardContent>
            <FieldGroup>
              <input type="hidden" {...methods.register("userId")} />
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isExecuting}
              onClick={() => methods.reset()}
            >
              <ArrowCounterClockwiseIcon />
              Reset
            </Button>
            <Button type="submit" disabled={isExecuting}>
              {isExecuting ? (
                <Spinner />
              ) : (
                <>
                  <FloppyDiskIcon />
                  Save name
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
