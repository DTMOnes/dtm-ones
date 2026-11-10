"use client";

import { FormProvider, useForm, type Resolver } from "react-hook-form";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import type { z } from "zod";

import {
  ArrowCounterClockwiseIcon,
  BasketballIcon,
  ChartBarIcon,
  FloppyDiskIcon,
  IdentificationCardIcon,
  UserIcon,
} from "@phosphor-icons/react";

import { updatePlayerAction } from "@/actions/players/updatePlayer";
import { ProfileSection } from "@/components/clients/editor-layout";
import OptionsField from "@/components/form/options-field";
import TextareaField from "@/components/form/textarea-field";
import TextField from "@/components/form/text-field";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { updatePlayerSchema } from "@/lib/validation/players";
import type { PlayerDetail } from "@/types/player";

const STAT_FIELDS = [
  { key: "ppg", label: "PPG" },
  { key: "rpg", label: "RPG" },
  { key: "apg", label: "APG" },
  { key: "mpg", label: "MPG" },
  { key: "spg", label: "SPG" },
  { key: "bpg", label: "BPG" },
  { key: "fgPct", label: "FG%" },
  { key: "threePct", label: "3PT%" },
  { key: "ftPct", label: "FT%" },
] as const;

type StatKey = (typeof STAT_FIELDS)[number]["key"];

type FormValues = {
  id: string;
  name: string;
  nationality: string;
  lastClub: string;
  heightCm: string;
  categoryId: string;
  eurobasketLink: string;
  birthDate: string;
  league: string;
  bio: string;
  strengths: string;
  instagramHashtag: string;
  seasonStats: { season: string } & Record<StatKey, string>;
};

function statValue(value: number | null | undefined): string {
  return value == null ? "" : String(value);
}

export function EditPlayerForm({
  player,
  categories,
}: {
  player: PlayerDetail;
  categories: Array<{ id: string; name: string }>;
}) {
  const router = useRouter();

  const methods = useForm<FormValues, unknown, z.output<typeof updatePlayerSchema>>({
    resolver: zodResolver(updatePlayerSchema) as Resolver<
      FormValues,
      unknown,
      z.output<typeof updatePlayerSchema>
    >,
    defaultValues: {
      id: player.id,
      name: player.name ?? "",
      nationality: player.nationality ?? "",
      lastClub: player.lastClub ?? "",
      heightCm: player.heightCm == null ? "" : String(player.heightCm),
      categoryId: player.categoryId ?? "",
      eurobasketLink: player.eurobasketLink ?? "",
      birthDate: player.birthDate ?? "",
      league: player.league ?? "",
      bio: player.bio ?? "",
      strengths: (player.strengths ?? []).join("\n"),
      instagramHashtag: player.instagramHashtag ?? "",
      seasonStats: {
        season: player.seasonStats?.season ?? "",
        ...(Object.fromEntries(
          STAT_FIELDS.map(({ key }) => [
            key,
            statValue(player.seasonStats?.[key]),
          ]),
        ) as Record<StatKey, string>),
      },
    },
  });

  const { executeAsync, isExecuting } = useAction(updatePlayerAction, {
    onSuccess: () => {
      toast.success("Player updated successfully.");
      router.refresh();
    },
    onError: ({ error }) => {
      if (error.serverError) {
        toast.error(error.serverError.message);
      }
    },
  });

  return (
    <FormProvider {...methods}>
      <form
        className="flex flex-col gap-6"
        onSubmit={methods.handleSubmit((values) => executeAsync(values))}
        noValidate
      >
        <input type="hidden" {...methods.register("id")} />
        <div className="grid gap-6 2xl:grid-cols-2">
          <ProfileSection
            id="identity"
            number={1}
            title="Identity"
            icon={<IdentificationCardIcon />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="name"
                label="Name"
                placeholder="Full name"
                disabled={isExecuting}
              />
              <TextField
                name="nationality"
                label="Nationality"
                placeholder="Country"
                disabled={isExecuting}
              />
              <TextField
                name="birthDate"
                label="Birth date (YYYY-MM-DD)"
                placeholder="YYYY-MM-DD"
                disabled={isExecuting}
              />
              <TextField
                name="heightCm"
                label="Height (cm)"
                placeholder="Height"
                disabled={isExecuting}
              />
            </div>
          </ProfileSection>
          <ProfileSection
            id="basketball"
            number={2}
            title="Basketball"
            icon={<BasketballIcon />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <TextField
                name="lastClub"
                label="Last club"
                placeholder="Club"
                disabled={isExecuting}
              />
              <TextField
                name="league"
                label="Last league"
                placeholder="League - Country"
                disabled={isExecuting}
              />
              <OptionsField
                name="categoryId"
                label="Category"
                options={categories}
                emptyMessage="No categories created yet"
                disabled={isExecuting}
              />
              <TextField
                name="eurobasketLink"
                label="Eurobasket link"
                placeholder="https://basketball.eurobasket.com/..."
                disabled={isExecuting}
              />
            </div>
          </ProfileSection>
        </div>
        <ProfileSection id="about" number={3} title="About" icon={<UserIcon />}>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
            <TextareaField
              name="bio"
              label="About"
              placeholder={"Title\n\nDescription"}
              disabled={isExecuting}
            />
            <div className="flex flex-col gap-4">
              <TextareaField
                name="strengths"
                label="Strengths"
                placeholder={"Scorer\nPlaymaker"}
                description="One per line, up to 8."
                disabled={isExecuting}
              />
              <TextField
                name="instagramHashtag"
                label="Instagram hashtag (for NEWS)"
                placeholder="NameLastname"
                disabled={isExecuting}
              />
            </div>
          </div>
        </ProfileSection>
        <ProfileSection
          id="stats"
          number={4}
          title="Season statistics"
          icon={<ChartBarIcon />}
        >
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            <TextField
              name="seasonStats.season"
              label="Season"
              placeholder="2025-26"
              disabled={isExecuting}
            />
            {STAT_FIELDS.map(({ key, label }) => (
              <TextField
                key={key}
                name={`seasonStats.${key}`}
                label={label}
                placeholder="0.0"
                disabled={isExecuting}
              />
            ))}
          </div>
        </ProfileSection>
        <div className="bg-card ring-foreground/10 sticky bottom-4 z-10 flex flex-wrap items-center justify-end gap-2 px-4 py-3 ring-1 shadow-[0_8px_24px_-12px_oklch(0_0_0/0.35)]">
          <p className="text-muted-foreground mr-auto text-sm">
            Sections 1 to 4 save together.
          </p>
          <Button
            type="button"
            variant="outline"
            disabled={isExecuting}
            onClick={() => methods.reset()}
          >
            <ArrowCounterClockwiseIcon />
            Reset
          </Button>
          <Button type="submit" disabled={isExecuting}>
            {isExecuting ? (
              <Spinner />
            ) : (
              <>
                <FloppyDiskIcon />
                Save profile
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
}
