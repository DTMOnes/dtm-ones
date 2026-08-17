import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function Unauthorized() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-4 p-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        Your session expired
      </h1>
      <p className="text-muted-foreground text-sm">
        You need to sign in again.
      </p>
      <Button asChild>
        <Link href="/signin">Sign in</Link>
      </Button>
    </main>
  );
}
