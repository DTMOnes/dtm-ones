"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import { signInAction } from "@/actions/auth";
import { NOT_AUTHORIZED } from "@/lib/action-result";
import { signInSchema as schema } from "@/lib/validation/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TextField from "@/components/form/text-field";
import PasswordField from "@/components/form/password-field";

type FormValues = z.infer<typeof schema>;

export function SignInForm({
  showDenied = false,
}: {
  showDenied?: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    if (!showDenied) {
      return;
    }
    toast.error(NOT_AUTHORIZED);
  }, [showDenied]);

  async function onSubmit(values: FormValues) {
    setPending(true);
    try {
      const { data, error } = await signInAction(values);

      if (error) {
        methods.setValue("password", "");
        toast.error(error.message);
        return;
      }

      if (!data) {
        return;
      }

      toast.success("Signed in successfully");
      router.push("/contacts");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

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
            onSubmit={methods.handleSubmit(onSubmit)}
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
          disabled={pending}
        >
          {pending ? "Signing in..." : "Sign In"}
        </Button>
      </CardFooter>
    </Card>
  );
}
