// Next
import Image from "next/image";
import { redirect } from "next/navigation";

// Utils
import { getSession } from "@/utils/get-session";

// Components
import { SignInForm } from "@/components/auth/signin-form";

export default async function SignInPage() {
  const session = await getSession();

  if (session?.user) {
    redirect("/");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col text-center">
          <h1 className="[font-family:var(--font-bebas-neue)] text-5xl">
            DTM ONES
          </h1>
          <p className="text-muted-foreground text-sm">
            Administrative Dashboard
          </p>
        </div>
        <SignInForm />
      </div>
    </div>
  );
}
