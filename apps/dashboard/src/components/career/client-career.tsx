"use client";

import { FormProvider, useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import { PlusIcon, TrashIcon } from "@phosphor-icons/react";
import { latestSeasonTies } from "@dtm/database/career";

import {
  addAwardAction,
  addCareerEntryAction,
  removeAwardAction,
  removeCareerEntryAction,
  setCurrentCareerEntryAction,
} from "@/actions/clients/career";
import SelectField from "@/components/form/select-field";
import SubmitButton from "@/components/form/submit-button";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@/components/ui/item";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { addAwardSchema, addCareerEntrySchema } from "@/lib/validation/career";
import type { Award, CareerEntry } from "@/utils/career";

const AWARD_KINDS = [
  { id: "team", name: "Team title (trophy)" },
  { id: "individual", name: "Individual award (star)" },
];

function onServerError({
  error,
}: {
  error: { serverError?: { message: string } };
}) {
  if (error.serverError) {
    toast.error(error.serverError.message);
  }
}

function DeleteButton({
  label,
  disabled,
  onClick,
}: {
  label: string;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      variant="destructive"
      size="icon"
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
    >
      {disabled ? <Spinner /> : <TrashIcon className="size-4" />}
    </Button>
  );
}

function CareerCard({
  clientId,
  career,
}: {
  clientId: string;
  career: CareerEntry[];
}) {
  const router = useRouter();
  const empty = { clientId, season: "", club: "", league: "", country: "" };
  const methods = useForm<z.input<typeof addCareerEntrySchema>>({
    resolver: zodResolver(addCareerEntrySchema),
    defaultValues: empty,
  });

  const add = useAction(addCareerEntryAction, {
    onSuccess: () => {
      methods.reset(empty);
      router.refresh();
    },
    onError: onServerError,
  });
  const remove = useAction(removeCareerEntryAction, {
    onSuccess: () => router.refresh(),
    onError: onServerError,
  });
  const setCurrent = useAction(setCurrentCareerEntryAction, {
    onSuccess: () => router.refresh(),
    onError: onServerError,
  });
  // Two clubs in the latest season (a mid-season move): Staff picks the current one.
  const tied = latestSeasonTies(career);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career</CardTitle>
        <CardDescription>
          Clubs and seasons, in any order: the profile sorts them by season,
          newest first, and marks the newest as current. A season can be a
          range, such as 2020-2025. If two clubs share the latest season, tick
          the current one.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {tied.size > 0 && !career.some((entry) => tied.has(entry.id) && entry.isCurrent) ? (
          <p className="border-primary/30 bg-accent text-accent-foreground border px-3 py-2 text-sm">
            Two or more clubs share the latest season. Tick &quot;Current team&quot; on the
            club the player is at now.
          </p>
        ) : null}
        {career.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {career.map((entry) => (
              <li key={entry.id}>
                <Item variant="muted" className="items-center">
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {entry.season} · {entry.club}
                    </ItemTitle>
                    <ItemDescription>
                      {[entry.league, entry.country].filter(Boolean).join(" · ") ||
                        "No league or country"}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    {tied.has(entry.id) ? (
                      <div className="flex items-center gap-2">
                        <Checkbox
                          id={`current-${entry.id}`}
                          checked={entry.isCurrent}
                          disabled={setCurrent.isExecuting}
                          onCheckedChange={(checked) =>
                            setCurrent.execute({
                              clientId,
                              entryId: checked === true ? entry.id : null,
                            })
                          }
                        />
                        <Label htmlFor={`current-${entry.id}`} className="text-sm whitespace-nowrap">
                          Current team
                        </Label>
                      </div>
                    ) : null}
                    <DeleteButton
                      label="Delete career entry"
                      disabled={remove.isExecuting}
                      onClick={() =>
                        remove.execute({ clientId, entryId: entry.id })
                      }
                    />
                  </ItemActions>
                </Item>
              </li>
            ))}
          </ul>
        ) : null}
        {career.length > 0 ? <Separator /> : null}
        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-4"
            onSubmit={methods.handleSubmit((values) => add.executeAsync(values))}
            noValidate
          >
            <input type="hidden" {...methods.register("clientId")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField name="season" label="Season or range" placeholder="2020-2025" disabled={add.isExecuting} />
              <TextField name="club" label="Club" placeholder="Mineros" disabled={add.isExecuting} />
              <TextField name="league" label="League (optional)" placeholder="LNBP" disabled={add.isExecuting} />
              <TextField name="country" label="Country (optional)" placeholder="Mexico" disabled={add.isExecuting} />
            </div>
            <div>
              <SubmitButton label="Add club" icon={<PlusIcon />} isExecuting={add.isExecuting} />
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

function AwardsCard({
  clientId,
  awards,
}: {
  clientId: string;
  awards: Award[];
}) {
  const router = useRouter();
  const empty = { clientId, title: "", detail: "", year: "", kind: "team" as const };
  const methods = useForm<z.input<typeof addAwardSchema>>({
    resolver: zodResolver(addAwardSchema),
    defaultValues: empty,
  });

  const add = useAction(addAwardAction, {
    onSuccess: () => {
      methods.reset(empty);
      router.refresh();
    },
    onError: onServerError,
  });
  const remove = useAction(removeAwardAction, {
    onSuccess: () => router.refresh(),
    onError: onServerError,
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Titles &amp; awards</CardTitle>
        <CardDescription>
          Shown on the profile in this order, only when there is at least one.
          Team titles get a trophy icon and individual awards a star.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {awards.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {awards.map((award) => (
              <li key={award.id}>
                <Item variant="muted" className="items-center">
                  <ItemContent className="min-w-0">
                    <ItemTitle>
                      {award.title}
                      {award.year ? ` · ${award.year}` : ""}
                    </ItemTitle>
                    <ItemDescription>
                      {[award.kind === "individual" ? "Individual award" : "Team title", award.detail]
                        .filter(Boolean)
                        .join(" · ")}
                    </ItemDescription>
                  </ItemContent>
                  <ItemActions>
                    <DeleteButton
                      label="Delete award"
                      disabled={remove.isExecuting}
                      onClick={() =>
                        remove.execute({ clientId, awardId: award.id })
                      }
                    />
                  </ItemActions>
                </Item>
              </li>
            ))}
          </ul>
        ) : null}
        {awards.length > 0 ? <Separator /> : null}
        <FormProvider {...methods}>
          <form
            className="flex flex-col gap-4"
            onSubmit={methods.handleSubmit((values) => add.executeAsync(values))}
            noValidate
          >
            <input type="hidden" {...methods.register("clientId")} />
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField name="kind" label="Type" options={AWARD_KINDS} disabled={add.isExecuting} />
              <TextField name="title" label="Title" placeholder="Copa VALUE Final MVP" disabled={add.isExecuting} />
              <TextField name="detail" label="Club · league (optional)" placeholder="Mineros · LNBP" disabled={add.isExecuting} />
              <TextField name="year" label="Year (optional)" placeholder="2026" disabled={add.isExecuting} />
            </div>
            <div>
              <SubmitButton label="Add award" icon={<PlusIcon />} isExecuting={add.isExecuting} />
            </div>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}

export function ClientCareer({
  clientId,
  career,
  awards,
}: {
  clientId: string;
  career: CareerEntry[];
  awards: Award[];
}) {
  return (
    <div className="flex flex-col gap-6">
      <CareerCard clientId={clientId} career={career} />
      <AwardsCard clientId={clientId} awards={awards} />
    </div>
  );
}
