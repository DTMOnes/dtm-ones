import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

import { env } from "@/config/env";
import { db } from "@/lib/db";
import { playerBlobClientPayloadSchema } from "@/lib/validation/players";
import { getSession } from "@/utils/auth/get-session";
import {
  PLAYER_IMAGE_CONTENT_TYPES,
  PLAYER_IMAGE_MAX_BYTES,
  isPlayerBlobPathname,
} from "@/utils/player-blob-path";
import { getPlayer } from "@/utils/players";

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      token: env.BLOB_READ_WRITE_TOKEN,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        let payload: unknown;
        try {
          payload = JSON.parse(clientPayload ?? "{}");
        } catch {
          throw new Error("Invalid upload.");
        }

        const parsed = playerBlobClientPayloadSchema.safeParse(payload);
        if (!parsed.success) {
          throw new Error("Invalid upload.");
        }

        if (
          !isPlayerBlobPathname(
            parsed.data.playerId,
            parsed.data.slot,
            pathname,
          )
        ) {
          throw new Error("Invalid upload path.");
        }

        const player = await getPlayer(db, parsed.data.playerId);
        if (!player) {
          throw new Error("Player not found.");
        }

        return {
          allowedContentTypes: [...PLAYER_IMAGE_CONTENT_TYPES],
          maximumSizeInBytes: PLAYER_IMAGE_MAX_BYTES,
          addRandomSuffix: true,
          allowOverwrite: false,
        };
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Upload failed." },
      { status: 400 },
    );
  }
}
