import { redirect } from "next/navigation";
import { getSession } from "@/utils/get-session";
import { SignInForm } from "@/components/auth/signin-form";

export default async function SignInPage() {
  const session = await getSession();

  // If already authenticated, redirect to dashboard
  if (session?.user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <div className="flex flex-col gap-2 text-center">
          <h1 className="text-2xl font-semibold">Iniciar Sesión</h1>
          <p className="text-muted-foreground text-sm">
            Ingresa tus credenciales para acceder al dashboard
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
