import { NextRequest, NextResponse } from "next/server";

interface AbilityDetail {
  name: string;
  effect_entries?: Array<{
    language: { name: string };
    short_effect: string;
  }>;
}

interface AbilityResult {
  name: string;
  effect: string;
}

const ALLOWED_PREFIX = "https://pokeapi.co/api/v2/ability/";
const MAX_URLS = 50;

export async function POST(req: NextRequest) {
  let body: { abilityUrls?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { abilityUrls } = body;

  if (!Array.isArray(abilityUrls) || abilityUrls.length === 0) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }
  if (abilityUrls.length > MAX_URLS) {
    return NextResponse.json({ error: `Too many URLs (max ${MAX_URLS})` }, { status: 413 });
  }
  if (abilityUrls.some((u) => typeof u !== "string" || !u.startsWith(ALLOWED_PREFIX))) {
    return NextResponse.json({ error: "Invalid ability URL" }, { status: 400 });
  }

  const urls = abilityUrls as string[];

  const results = await Promise.allSettled(
    urls.map(async (url) => {
      const res = await fetch(url, { next: { revalidate: 86400 } });
      if (!res.ok) return null;
      const data: AbilityDetail = await res.json();
      return data;
    }),
  );

  const data: AbilityResult[] = results
    .filter((r) => r.status === "fulfilled" && r.value)
    .map((r) => {
      const detail = (r as PromiseFulfilledResult<AbilityDetail>).value;
      const effectEntry =
        detail.effect_entries?.find((e) => e.language.name === "vi") ||
        detail.effect_entries?.find((e) => e.language.name === "en");
      const rawEffect = effectEntry?.short_effect || "";

      return {
        name: detail.name,
        effect: rawEffect || "Không có mô tả.",
      };
    });

  return NextResponse.json({ results: data });
}
