"use server";

import { revalidatePath } from "next/cache";

import { db } from "@/lib/db";
import { staffActionClient } from "@/lib/safe-action";
import {
  addAwardSchema,
  addCareerEntrySchema,
  removeAwardSchema,
  removeCareerEntrySchema,
  setCurrentCareerEntrySchema,
} from "@/lib/validation/career";
import {
  addAward,
  addCareerEntry,
  removeAward,
  removeCareerEntry,
  setCurrentCareerEntry,
} from "@/utils/career";

export const addCareerEntryAction = staffActionClient
  .metadata({ actionName: "addCareerEntry" })
  .inputSchema(addCareerEntrySchema)
  .action(async ({ parsedInput }) => {
    const { clientId, ...entry } = parsedInput;
    await addCareerEntry(db, clientId, entry);

    revalidatePath(`/clients/${clientId}`);

    return { ok: true as const };
  });

export const removeCareerEntryAction = staffActionClient
  .metadata({ actionName: "removeCareerEntry" })
  .inputSchema(removeCareerEntrySchema)
  .action(async ({ parsedInput }) => {
    await removeCareerEntry(db, parsedInput.clientId, parsedInput.entryId);

    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const };
  });

export const setCurrentCareerEntryAction = staffActionClient
  .metadata({ actionName: "setCurrentCareerEntry" })
  .inputSchema(setCurrentCareerEntrySchema)
  .action(async ({ parsedInput }) => {
    await setCurrentCareerEntry(db, parsedInput.clientId, parsedInput.entryId);

    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const };
  });

export const addAwardAction = staffActionClient
  .metadata({ actionName: "addAward" })
  .inputSchema(addAwardSchema)
  .action(async ({ parsedInput }) => {
    const { clientId, ...award } = parsedInput;
    await addAward(db, clientId, award);

    revalidatePath(`/clients/${clientId}`);

    return { ok: true as const };
  });

export const removeAwardAction = staffActionClient
  .metadata({ actionName: "removeAward" })
  .inputSchema(removeAwardSchema)
  .action(async ({ parsedInput }) => {
    await removeAward(db, parsedInput.clientId, parsedInput.awardId);

    revalidatePath(`/clients/${parsedInput.clientId}`);

    return { ok: true as const };
  });
