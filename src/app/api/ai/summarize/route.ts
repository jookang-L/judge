import { NextResponse } from "next/server";

import { buildCaseSummaryPrompt } from "@/lib/prompts";
import {
  createGeminiClient,
  extractJsonFromResponse,
  GEMINI_DEFAULT_MODEL,
} from "@/lib/gemini";
import type { CaseType, LegalField, QuestionAnswers } from "@/types/case";

type SummarizeBody = {
  apiKey?: string;
  selectedCaseType?: CaseType;
  selectedLegalFields?: LegalField[];
  answers?: QuestionAnswers;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as SummarizeBody;
    const { apiKey, selectedCaseType, selectedLegalFields, answers } = body;

    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "Gemini API 키가 없습니다. 설정에서 먼저 입력해주세요." },
        { status: 400 },
      );
    }

    if (!selectedCaseType) {
      return NextResponse.json(
        { error: "사건 유형이 필요합니다. 먼저 사건 유형을 선택해주세요." },
        { status: 400 },
      );
    }

    if (!answers?.people || !answers?.action || !answers?.timePlace || !answers?.damage || !answers?.reason) {
      return NextResponse.json(
        { error: "필수 질문 답변이 비어 있습니다. 사건 내용을 조금 더 작성해주세요." },
        { status: 400 },
      );
    }

    const prompt = buildCaseSummaryPrompt({
      selectedCaseType,
      selectedLegalFields: selectedLegalFields ?? [],
      answers,
    });

    const ai = createGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents: prompt,
    });

    const text = response.text ?? "";
    const jsonText = extractJsonFromResponse(text);
    const parsed = JSON.parse(jsonText);

    return NextResponse.json({ data: parsed });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "AI 사건 정리 중 오류가 발생했습니다.";

    if (message.toLowerCase().includes("api key")) {
      return NextResponse.json(
        { error: "AI 연결에 실패했습니다. Gemini API 키가 올바른지 확인해주세요." },
        { status: 401 },
      );
    }

    if (message.includes("JSON")) {
      return NextResponse.json(
        { error: "AI 응답을 해석하지 못했습니다. 잠시 후 다시 시도해주세요." },
        { status: 502 },
      );
    }

    return NextResponse.json(
      { error: message || "AI 사건 정리 요청에 실패했습니다." },
      { status: 500 },
    );
  }
}
