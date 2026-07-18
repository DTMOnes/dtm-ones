export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; c?: string | string[] }>;
}) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q : "";
  const rawC = sp.c === undefined ? [] : Array.isArray(sp.c) ? sp.c : [sp.c];
  const c = normalizePlayerCategoryIds(rawC);

  return "Roster";
}
