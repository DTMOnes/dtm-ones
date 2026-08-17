"use server";

import { revalidatePath } from "next/cache";

import {
  NOT_FOUND,
  UNAVAILABLE,
  type ActionResult,
} from "@/lib/action-result";
import { createInsforgeServer } from "@/lib/insforge-server";
import { requireStaff } from "@/utils/auth/require-staff";
import { softDeletePlayerSchema } from "@/lib/validation/players";

export async function softDeletePlayerAction(input: {
  id: string;
}): Promise<ActionResult<{ id: string }>> {
  const gate = await requireStaff();
  if (gate.error) {
    return gate;
  }

  const parsed = softDeletePlayerSchema.safeParse(input);
  if (!parsed.success) {
    return {
      data: null,
      error: {
        message: "The player could not be validated. Please try again.",
      },
    };
  }

  const insforge = await createInsforgeServer();
  const deletedAt = new Date().toISOString();

  const { data, error } = await insforge.database
    .from("players")
    .update({ deleted_at: deletedAt })
    .eq("id", parsed.data.id)
    .is("deleted_at", null)
    .select("id");

  if (error) {
    console.error("[softDeletePlayer]", error);
    return { data: null, error: { message: UNAVAILABLE } };
  }

  if (!Array.isArray(data) || data.length === 0) {
    return { data: null, error: { message: NOT_FOUND } };
  }

  const id =
    typeof data[0] === "object" &&
    data[0] !== null &&
    "id" in data[0] &&
    typeof (data[0] as { id: unknown }).id === "string"
      ? (data[0] as { id: string }).id
      : parsed.data.id;

  revalidatePath("/players");
  revalidatePath(`/players/${id}`);
  return { data: { id }, error: null };
}
