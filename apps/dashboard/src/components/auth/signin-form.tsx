"use client";

// Next
import { useRouter } from "next/navigation";

// React Hook Form
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// Next Safe Action
import { useAction } from "next-safe-action/hooks";
import { signIn } from "@/actions/auth";

// Zod
import { z } from "zod";

// Validation Schema
import { signInSchema as schema } from "@/lib/validation/auth";

// Shadcn
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Components
import TextField from "@/components/form/text-field";
import PasswordField from "@/components/form/password-field";

type FormValues = z.infer<typeof schema>;

export function SignInForm() {
  const router = useRouter();

  const { execute, isExecuting } = useAction(signIn, {
    onSuccess: ({ data }) => {
      toast.success(data?.message ?? "Signed in successfully");
      router.push("/");
      router.refresh();
    },
    onError: ({ error: actionError }) => {
      toast.error(actionError.serverError ?? "Failed to sign in");
    },
  });

  const methods = useForm<FormValues>({
    resolver: zodResolver(schema as never),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { handleSubmit } = methods;

  const onSubmit = (data: FormValues) => {
    execute(data);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign In</CardTitle>
        <CardDescription>
          Enter your email and password to continue
        </CardDescription>
      </CardHeader>
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 flex flex-col gap-10"
        >
          <CardContent className="space-y-4">
            <TextField name="email" label="Email" placeholder="you@email.com" />
            <PasswordField name="password" label="Password" />
          </CardContent>

          <Separator />

          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isExecuting}>
              {isExecuting ? "Signing in..." : "Sign In"}
            </Button>
          </CardFooter>
        </form>
      </FormProvider>
    </Card>
  );
}
