import { NextResponse } from "next/server";

import { searchPrecedentsByKeyword } from "@/lib/law-api";
import type { PrecedentItem } from "@/types/case";

type SearchBody = {
  keywords?: string[];
  lawApiKey?: string;
};

function buildFallbackKeywords(keywords: string[]): string[] {
  const normalized = keywords
    .flatMap((keyword) =>
      keyword
        .replace(/[^\p{L}\p{N}\s]/gu, " ")
        .split(/\s+/)
        .map((part) => part.trim())
        .filter((part) => part.length >= 2),
    )
    .slice(0, 8);

  return Array.from(new Set([...keywords, ...normalized])).slice(0, 8);
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SearchBody;
    const keywords = (body.keywords ?? []).map((item) => item.trim()).filter(Boolean);
    if (keywords.length === 0) {
      return NextResponse.json(
        { error: "검색어가 없습니다. 검색어를 입력한 뒤 다시 시도해주세요." },
        { status: 400 },
      );
    }

    const expandedKeywords = buildFallbackKeywords(keywords);
    const all = await Promise.all(
      expandedKeywords.map((keyword) => searchPrecedentsByKeyword(keyword, body.lawApiKey)),
    );
    let merged = all.flat();

    if (merged.length === 0) {
      // Fallback query to avoid empty UI when keyword quality is poor.
      merged = await searchPrecedentsByKeyword("*", body.lawApiKey);
    }

    const dedupMap = new Map<string, PrecedentItem>();
    for (const item of merged) {
      if (!dedupMap.has(item.id)) {
        dedupMap.set(item.id, item);
      }
    }

    const precedents = Array.from(dedupMap.values()).slice(0, 30);
    return NextResponse.json({ data: precedents });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "판례 검색 중 오류가 발생했습니다.";
    if (message.includes("사용자 정보 검증")) {
      return NextResponse.json(
        {
          error:
            "법령 API 사용자 검증에 실패했습니다. 국가법령정보 공동활용 사이트에서 현재 서버 IP 또는 도메인(localhost 포함)을 등록해주세요.",
        },
        { status: 500 },
      );
    }
    if (message.includes("필수입력요소")) {
      return NextResponse.json(
        {
          error:
            "법령 API 요청값 검증에 실패했습니다. 설정의 LAW_API_OC 값을 다시 확인하고 앞뒤 공백 없이 입력해주세요.",
        },
        { status: 500 },
      );
    }
    return NextResponse.json(
      {
        error:
          message.includes("LAW_API_OC")
            ? "법령 API 키가 없습니다. 설정에서 LAW_API_OC를 입력해주세요."
            : message || "비슷한 판례를 찾지 못했습니다. 검색어를 바꿔 다시 시도해보세요.",
      },
      { status: 500 },
    );
  }
}
