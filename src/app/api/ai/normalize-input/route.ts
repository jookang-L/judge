import { NextResponse } from "next/server";

import {
  createGeminiClient,
  extractJsonFromResponse,
  extractProviderErrorMessage,
  generateContentWithRetry,
  isRetryableModelError,
} from "@/lib/gemini";
import { buildNormalizeSingleInputPrompt } from "@/lib/prompts";
import type { CaseType, LegalField, QuestionAnswers } from "@/types/case";

type NormalizeInputBody = {
  apiKey?: string;
  selectedCaseType?: CaseType;
  selectedLegalFields?: LegalField[];
  singleInput?: string;
};

function ensureRequiredAnswers(answers: QuestionAnswers): QuestionAnswers {
  return {
    people: answers.people?.trim() || "잘 모르겠음",
    action: answers.action?.trim() || "잘 모르겠음",
    timePlace: answers.timePlace?.trim() || "잘 모르겠음",
    damage: answers.damage?.trim() || "잘 모르겠음",
    reason: answers.reason?.trim() || "잘 모르겠음",
    dispute: answers.dispute?.trim() || "잘 모르겠음",
  };
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as NormalizeInputBody;
    const { apiKey, selectedCaseType, selectedLegalFields, singleInput } = body;

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

    if (!singleInput?.trim()) {
      return NextResponse.json({ error: "사건 내용을 입력해주세요." }, { status: 400 });
    }

    const prompt = buildNormalizeSingleInputPrompt({
      selectedCaseType,
      selectedLegalFields: selectedLegalFields ?? [],
      singleInput: singleInput.trim(),
    });

    const ai = createGeminiClient(apiKey);
    const response = await generateContentWithRetry({
      ai,
      contents: prompt,
    });

    const text = response.text ?? "";
    const jsonText = extractJsonFromResponse(text);
    const parsed = JSON.parse(jsonText) as QuestionAnswers;

    return NextResponse.json({ data: ensureRequiredAnswers(parsed) });
  } catch (error) {
    const message = extractProviderErrorMessage(error);

    if (isRetryableModelError(message)) {
      return NextResponse.json(
        {
          error:
            "현재 AI 모델 요청이 많아 응답이 지연되고 있습니다. 잠시 후 다시 시도해주세요.",
        },
        { status: 503 },
      );
    }

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
      { error: message || "한 번에 입력 정리 요청에 실패했습니다." },
      { status: 500 },
    );
  }
}
