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
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-10">
        <div className="flex items-center justify-center gap-3">
          <Image
            src="/assets/dtm-ones-logo.svg"
            alt="DTM ONES"
            width={25}
            height={21}
          />
          <h1 className="text-2xl font-semibold tracking-tight">DTM ONES</h1>
        </div>
        <SignInForm showDenied={denied} />
      </div>
    </div>
  );
}
