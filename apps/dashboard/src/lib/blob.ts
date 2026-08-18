import { del } from "@vercel/blob";

import { env } from "@/config/env";

export async function deleteBlobs(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  await del(keys, { token: env.BLOB_READ_WRITE_TOKEN });
}
