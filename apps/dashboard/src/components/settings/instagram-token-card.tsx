"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { ArrowsClockwiseIcon } from "@phosphor-icons/react";

import {
  renewInstagramTokenAction,
  setInstagramTokenAction,
} from "@/actions/settings/instagramToken";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { setInstagramTokenSchema } from "@/lib/validation/settings";

function onServerError({
  error,
}: {
  error: { serverError?: { message: string } };
}) {
  if (error.serverError) {
    toast.error(error.serverError.message);
  }
}

/** Owner only: when the Instagram token expires, renew it now, or paste a new one. */
export function InstagramTokenCard({
  status,
}: {
  /** Dates already formatted on the server; null until a token is saved here. */
  status: { expires: string; renewed: string; daysLeft: number } | null;
}) {
  const router = useRouter();
  const methods = useForm<z.input<typeof setInstagramTokenSchema>>({
    resolver: zodResolver(setInstagramTokenSchema),
    defaultValues: { token: "" },
  });

  const save = useAction(setInstagramTokenAction, {
    onSuccess: () => {
      toast.success("Instagram token saved.");
      methods.reset({ token: "" });
      router.refresh();
    },
    onError: onServerError,
  });
  const renew = useAction(renewInstagramTokenAction, {
    onSuccess: () => {
      toast.success("Instagram token renewed.");
      router.refresh();
    },
    onError: onServerError,
  });

  return (
    <FormProvider {...methods}>
      <Card>
        <CardHeader>
          <CardTitle>Instagram connection</CardTitle>
          <CardDescription>
            The website&apos;s Signed and NEWS sections read the agency&apos;s Instagram
            with this token. It lasts 60 days and renews itself every Monday.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {status ? (
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Expires </span>
                <span className="font-medium">{status.expires}</span>
                <span
                  className={
                    status.daysLeft < 14
                      ? "text-destructive ml-2 font-medium"
                      : "text-muted-foreground ml-2"
                  }
                >
                  ({status.daysLeft} days left)
                </span>
              </p>
              <p className="text-muted-foreground">Last renewed {status.renewed}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={renew.isExecuting}
                onClick={() => renew.execute()}
              >
                {renew.isExecuting ? <Spinner /> : <ArrowsClockwiseIcon />}
                Renew now
              </Button>
            </div>
          ) : (
            <p className="border-primary/30 bg-accent text-accent-foreground border px-3 py-2 text-sm">
              Not saved here yet: the website still uses the token from Vercel, which
              does not renew itself. Paste it below once (Vercel → dtm-ones-landing →
              Settings → Environment Variables → INSTAGRAM_ACCESS_TOKEN) to turn on
              automatic renewal.
            </p>
          )}
          <form
            className="flex flex-col gap-3"
            onSubmit={methods.handleSubmit((values) => save.executeAsync(values))}
            noValidate
          >
            <TextField
              name="token"
              label={status ? "Replace with a new token" : "Instagram token"}
              placeholder="Paste the long-lived token"
              disabled={save.isExecuting}
            />
            <div>
              <SubmitButton label="Save token" isExecuting={save.isExecuting} />
            </div>
          </form>
        </CardContent>
        <CardFooter className="text-muted-foreground justify-start text-xs">
          The token is never shown here again after you save it.
        </CardFooter>
      </Card>
    </FormProvider>
  );
}
