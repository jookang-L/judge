import { XMLParser } from "fast-xml-parser";

import type { PrecedentDetail, PrecedentItem } from "@/types/case";

const parser = new XMLParser({
  ignoreAttributes: false,
  trimValues: true,
});

const LAW_API_BASE_URL = "https://www.law.go.kr/DRF";

function pickText(record: Record<string, unknown>, keys: string[]): string {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
    if (typeof value === "number" || typeof value === "bigint") {
      return String(value);
    }
    if (typeof value === "boolean") {
      return value ? "true" : "false";
    }
  }
  return "";
}

function toArray<T>(value: T | T[] | undefined): T[] {
  if (!value) {
    return [];
  }
  return Array.isArray(value) ? value : [value];
}

function normalizeDate(raw: string): string {
  if (!raw) {
    return "";
  }
  const cleaned = raw.replaceAll("-", "").trim();
  if (cleaned.length === 8) {
    return `${cleaned.slice(0, 4)}-${cleaned.slice(4, 6)}-${cleaned.slice(6, 8)}`;
  }
  return raw;
}

function parseLawApiError(parsed: Record<string, unknown>): string | null {
  const responseNode = parsed["Response"] as Record<string, unknown> | undefined;
  if (!responseNode) {
    return null;
  }
  const result = pickText(responseNode, ["result", "Result"]);
  const msg = pickText(responseNode, ["msg", "Msg", "message"]);
  if (!result && !msg) {
    return null;
  }
  return [result, msg].filter(Boolean).join(" - ");
}

export function getLawApiKeyFromEnv(): string {
  return process.env.LAW_API_OC ?? "";
}

function resolveLawApiKey(override?: string): string {
  const trimmedOverride = override?.trim();
  if (trimmedOverride) {
    return trimmedOverride;
  }
  return getLawApiKeyFromEnv();
}

export async function searchPrecedentsByKeyword(
  keyword: string,
  lawApiKey?: string,
): Promise<PrecedentItem[]> {
  const apiKey = resolveLawApiKey(lawApiKey);
  if (!apiKey) {
    throw new Error("서버 환경 변수 LAW_API_OC가 설정되지 않았습니다.");
  }

  const url = new URL(`${LAW_API_BASE_URL}/lawSearch.do`);
  url.searchParams.set("OC", apiKey);
  url.searchParams.set("target", "prec");
  url.searchParams.set("type", "XML");
  url.searchParams.set("query", keyword);
  url.searchParams.set("display", "20");

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("국가법령정보 API 검색 응답에 실패했습니다.");
  }
  const xmlText = await response.text();
  const parsed = parser.parse(xmlText) as Record<string, unknown>;
  const apiError = parseLawApiError(parsed);
  if (apiError) {
    throw new Error(apiError);
  }

  const root =
    (parsed["PrecSearch"] as Record<string, unknown> | undefined) ??
    (parsed["LawSearch"] as Record<string, unknown> | undefined) ??
    parsed;

  const records = toArray(
    (root["prec"] as Record<string, unknown> | Record<string, unknown>[] | undefined) ??
      (root["Prec"] as Record<string, unknown> | Record<string, unknown>[] | undefined) ??
      (root["판례"] as Record<string, unknown> | Record<string, unknown>[] | undefined),
  );

  return records
    .map((item) => {
      const id = pickText(item, [
        "판례정보일련번호",
        "판례일련번호",
        "판례ID",
        "판례id",
        "MST",
        "mst",
        "ID",
        "id",
      ]);
      const caseName = pickText(item, ["사건명", "판례명", "caseNm"]);
      const caseNumber = pickText(item, ["사건번호", "caseNo"]);
      const courtName = pickText(item, ["법원명", "courtNm"]);
      const decisionDate = normalizeDate(pickText(item, ["선고일자", "선고일", "선고일자_원본", "date"]));
      const summary = pickText(item, ["판결요지", "판례요지", "요약", "판시사항", "판시사항내용"]);
      if (!id || !caseName) {
        return null;
      }
      return {
        id,
        caseName,
        caseNumber,
        courtName,
        decisionDate,
        summary,
        source: "국가법령정보" as const,
      };
    })
    .filter((item): item is PrecedentItem => Boolean(item));
}

export async function fetchPrecedentDetail(id: string, lawApiKey?: string): Promise<PrecedentDetail> {
  const apiKey = resolveLawApiKey(lawApiKey);
  if (!apiKey) {
    throw new Error("서버 환경 변수 LAW_API_OC가 설정되지 않았습니다.");
  }

  const url = new URL(`${LAW_API_BASE_URL}/lawService.do`);
  url.searchParams.set("OC", apiKey);
  url.searchParams.set("target", "prec");
  url.searchParams.set("type", "XML");
  url.searchParams.set("ID", id);

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error("판례 본문 조회에 실패했습니다.");
  }
  const xmlText = await response.text();
  const parsed = parser.parse(xmlText) as Record<string, unknown>;
  const apiError = parseLawApiError(parsed);
  if (apiError) {
    throw new Error(apiError);
  }

  const root =
    (parsed["PrecService"] as Record<string, unknown> | undefined) ??
    (parsed["판례정보"] as Record<string, unknown> | undefined) ??
    parsed;

  const body = pickText(root, ["판시사항", "판결요지", "판결내용", "판결문", "본문", "내용"]);
  const caseName = pickText(root, ["사건명", "caseNm"]);
  const caseNumber = pickText(root, ["사건번호", "caseNo"]);
  const courtName = pickText(root, ["법원명", "courtNm"]);
  const decisionDate = normalizeDate(pickText(root, ["선고일자", "선고일", "date"]));

  return {
    id,
    caseName,
    caseNumber,
    courtName,
    decisionDate,
    fullText: body || "본문을 불러왔지만 내용을 찾지 못했습니다.",
  };
}
