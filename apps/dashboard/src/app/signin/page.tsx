import { redirect } from "next/navigation";

import { SignInForm } from "@/components/auth/signin-form";
import { getSession } from "@/utils/auth/get-session";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; next?: string }>;
}) {
  const params = await searchParams;
  const denied = params.denied === "1";

  // Full role session (not cookie alone). Keeps AC-1 after proxy stopped
  // bouncing cookie holders away from /signin.
  const session = await getSession();
  if (session && !denied) {
    const nextPath = params.next;
    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
      redirect(nextPath);
    }
    redirect("/contacts");
  }

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col text-center">
          <h1 className="text-3xl font-semibold tracking-tight">DTM Ones</h1>
          <p className="text-muted-foreground text-sm">
            Administrative Dashboard
          </p>
        </div>
        <SignInForm showDenied={denied} />
      </div>
    </div>
  );
}
