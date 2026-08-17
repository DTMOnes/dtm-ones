"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { useEffect } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import { signInAction } from "@/actions/auth";
import PasswordField from "@/components/form/password-field";
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
import { signInSchema } from "@/lib/validation/auth";

type FormValues = z.infer<typeof signInSchema>;

export function SignInForm({
  showDenied = false,
}: {
  showDenied?: boolean;
}) {
  const router = useRouter();
  const methods = useForm<FormValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { executeAsync, isExecuting } = useAction(signInAction, {
    onSuccess: () => {
      router.push("/contacts");
      router.refresh();
    },
    onError: ({ error }) => {
      methods.setValue("password", "");
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  useEffect(() => {
    if (!showDenied) {
      return;
    }
    toast.error("You need to sign in again.");
  }, [showDenied]);

  return (
    <Card className="gap-6">
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to continue
        </CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...methods}>
          <form
            id="signin-form"
            onSubmit={methods.handleSubmit((values) => executeAsync(values))}
            className="flex flex-col gap-6"
          >
            <TextField name="email" label="Email" placeholder="you@email.com" />
            <PasswordField name="password" label="Password" />
          </form>
        </FormProvider>
      </CardContent>
      <CardFooter>
        <Button
          type="submit"
          form="signin-form"
          className="w-full"
          disabled={isExecuting}
        >
          {isExecuting ? "Signing in..." : "Sign In"}
        </Button>
      </CardFooter>
    </Card>
  );
}
