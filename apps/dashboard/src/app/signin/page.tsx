import { redirect } from "next/navigation";
import Image from "next/image";

import { SignInForm } from "@/components/auth/signin-form";
import { getSession } from "@/utils/auth/get-session";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ denied?: string; next?: string }>;
}) {
  const params = await searchParams;
  const denied = params.denied === "1";
  const session = await getSession();

  if (session && !denied) {
    const nextPath = params.next;
    if (nextPath?.startsWith("/") && !nextPath.startsWith("//")) {
      redirect(nextPath);
    }
    redirect("/contacts");
  }

  return (
    <div className="dark bg-background text-foreground flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex flex-col items-center gap-3">
          <h1>
            <Image
              src="/assets/dtm-ones-wordmark.png"
              alt="DTMones"
              width={197}
              height={32}
              priority
            />
          </h1>
          <p className="text-muted-foreground text-xs font-bold tracking-[0.3em] uppercase">
            Dashboard
          </p>
        </div>
        <SignInForm showDenied={denied} />
      </div>
    </div>
  );
}
