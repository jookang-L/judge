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
    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: prompt,
    });
    const text = response.text ?? "";
    const jsonText = extractJsonFromResponse(text);
    const parsed = JSON.parse(jsonText);
    return NextResponse.json({ data: parsed });
  } catch {
    return NextResponse.json(
      { error: "판례 요약 AI 분석에 실패했습니다. API 키와 네트워크를 확인해주세요." },
      { status: 500 },
    );
  }
}
