"use client";

import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { z } from "zod";
import { toast } from "sonner";

import { signInAction } from "@/actions/auth";
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

const FALLBACK_ERROR_MESSAGE =
  "Sign in could not be validated. Please check your details and try again.";

type FormValues = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { execute, isPending } = useAction(signInAction, {
    onSuccess: ({ data }) => {
      if (!data) return;

      toast.success("Signed in successfully");
      router.push("/contacts");
      router.refresh();
    },
    onError: ({ error }) => {
      methods.setValue("password", "");
      toast.error(error.serverError?.message ?? FALLBACK_ERROR_MESSAGE);
    },
  });

  const onSubmit = (values: FormValues) => {
    execute(values);
  };

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
          disabled={isPending}
        >
          {isPending ? "Signing in..." : "Sign In"}
        </Button>
      </CardFooter>
    </Card>
  );
}
