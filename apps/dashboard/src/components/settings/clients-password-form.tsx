"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { setClientsPasswordAction } from "@/actions/settings/setClientsPassword";
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
import { FieldGroup } from "@/components/ui/field";
import { setClientsPasswordSchema } from "@/lib/validation/settings";

export function ClientsPasswordForm({ lastChanged }: { lastChanged: string | null }) {
  const router = useRouter();
  const methods = useForm<z.input<typeof setClientsPasswordSchema>>({
    resolver: zodResolver(setClientsPasswordSchema),
    defaultValues: { password: "" },
  });

  const { executeAsync, isExecuting } = useAction(setClientsPasswordAction, {
    onSuccess: () => {
      toast.success("Clients page password updated.");
      methods.reset({ password: "" });
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
          <CardTitle>Clients page password</CardTitle>
          <CardDescription>
            Visitors type it to see the Clients list on the website (profiles stay
            public). After a change, everyone has to enter the new one.{" "}
            {lastChanged
              ? `Last changed ${lastChanged}.`
              : "Not set yet: the website uses the default password."}
          </CardDescription>
        </CardHeader>
        <form
          className="contents"
          onSubmit={methods.handleSubmit((values) => executeAsync(values))}
          noValidate
        >
          <CardContent>
            <FieldGroup>
              <TextField
                name="password"
                label="New password"
                placeholder="New password"
                disabled={isExecuting}
              />
            </FieldGroup>
          </CardContent>
          <CardFooter>
            <SubmitButton label="Save password" isExecuting={isExecuting} />
          </CardFooter>
        </form>
      </Card>
    </FormProvider>
  );
}
