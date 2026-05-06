import { NextResponse } from "next/server";

import {
  createGeminiClient,
  extractJsonFromResponse,
  GEMINI_DEFAULT_MODEL,
} from "@/lib/gemini";
import type { AiCaseSummary, CaseType, PrecedentDetail } from "@/types/case";

type Body = {
  apiKey?: string;
  caseType?: CaseType;
  aiCaseSummary?: AiCaseSummary;
  precedentDetail?: PrecedentDetail;
};

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function extractErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function isRetryableProviderError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("temporarily") ||
    lower.includes("try again later")
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const { apiKey, caseType, aiCaseSummary, precedentDetail } = body;
    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "Gemini API 키가 없습니다. 설정에서 먼저 입력해주세요." },
        { status: 400 },
      );
    }
    if (!precedentDetail) {
      return NextResponse.json(
        { error: "판례 본문 정보가 없습니다." },
        { status: 400 },
      );
    }

    const prompt = `
당신은 고등학생 대상 교육용 법 수업 도우미입니다.
다음 사건과 실제 판례 본문을 비교해 쉬운 말로 요약하세요.

규칙:
- JSON 하나만 반환
- 고등학생이 이해 가능한 쉬운 한국어
- 한자와 일본식 표현 금지
- 법률 자문처럼 단정하지 않기
- 7개 항목은 각각 2~4개 bullet 수준으로 작성

입력 사건 요약:
${aiCaseSummary?.summary ?? "(없음)"}

사건 유형:
${caseType ?? "모름"}

판례 정보:
- 사건명: ${precedentDetail.caseName}
- 사건번호: ${precedentDetail.caseNumber}
- 법원: ${precedentDetail.courtName}
- 선고일: ${precedentDetail.decisionDate}

판례 본문:
${precedentDetail.fullText}

반환 JSON:
{
  "keyFacts": ["사건의 핵심 사실"],
  "keyIssues": ["핵심 쟁점"],
  "courtFocus": ["법원이 중요하게 본 점"],
  "conclusion": "결론",
  "similarities": ["우리 사건과 같은 점"],
  "differences": ["우리 사건과 다른 점"],
  "impactfulDifferences": ["판단에 영향을 줄 수 있는 차이"],
  "hintsForOurCase": ["이 판례가 우리 사건에 주는 힌트"]
}
`.trim();

    const ai = createGeminiClient(apiKey);
    let lastErrorMessage = "";
    let parsed: unknown = null;

    for (let attempt = 1; attempt <= 3; attempt += 1) {
      try {
        const response = await ai.models.generateContent({
          model: GEMINI_DEFAULT_MODEL,
          contents: prompt,
        });
        const text = response.text ?? "";
        const jsonText = extractJsonFromResponse(text);
        parsed = JSON.parse(jsonText);
        break;
      } catch (error) {
        const message = extractErrorMessage(error);
        lastErrorMessage = message;
        if (!isRetryableProviderError(message) || attempt === 3) {
          throw error;
        }
        await sleep(800 * attempt);
      }
    }

    if (!parsed) {
      throw new Error(lastErrorMessage || "판례 요약 AI 분석 결과가 비어 있습니다.");
    }

    return NextResponse.json({ data: parsed });
  } catch (error) {
    const message = extractErrorMessage(error);
    if (isRetryableProviderError(message)) {
      return NextResponse.json(
        {
          error:
            "현재 AI 모델 요청이 많아 잠시 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 503 },
      );
    }
    if (message.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "Gemini API 키가 올바르지 않거나 만료되었습니다. 설정에서 다시 확인해주세요." },
        { status: 401 },
      );
    }
    if (message.includes("JSON")) {
      return NextResponse.json(
        { error: "AI 응답 형식을 읽지 못했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      {
        error:
          "판례 요약 AI 분석에 실패했습니다. 네트워크 상태를 확인하고 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}
