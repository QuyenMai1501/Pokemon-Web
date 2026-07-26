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

export async function POST(req: NextRequest) {
  const { abilityUrls }: { abilityUrls: string[] } = await req.json();

  if (!Array.isArray(abilityUrls) || abilityUrls.length === 0) {
    return NextResponse.json({ results: [] }, { status: 400 });
  }

  const results = await Promise.allSettled(
    abilityUrls.map(async (url) => {
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

      return {
        name: detail.name,
        effect: effectEntry?.short_effect || "Không có mô tả.",
      };
    });

  return NextResponse.json({ results: data });
}
