import { SignInForm } from "@/components/auth/signin-form";

export default function SignInPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col text-center">
          <h1 className="text-3xl font-semibold tracking-tight">DTM Ones</h1>
          <p className="text-muted-foreground text-sm">
            Administrative Dashboard
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
