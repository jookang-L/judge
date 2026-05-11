import { NextResponse } from "next/server";

import {
  createGeminiClient,
  extractJsonFromResponse,
  extractProviderErrorMessage,
  generateContentWithRetry,
  isRetryableModelError,
} from "@/lib/gemini";
import { buildVerdictPrompt } from "@/lib/prompts";
import type { AiCaseSummary, AiPrecedentSummary, CaseType, LegalField, QuestionAnswers } from "@/types/case";

type Body = {
  apiKey?: string;
  caseType?: CaseType;
  legalFields?: LegalField[];
  answers?: QuestionAnswers;
  aiCaseSummary?: AiCaseSummary;
  selectedPrecedent?: {
    id?: string;
    caseName?: string;
    caseNumber?: string;
    courtName?: string;
    decisionDate?: string;
  };
  selectedPrecedentAiSummary?: AiPrecedentSummary;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Body;
    const {
      apiKey,
      caseType,
      legalFields,
      answers,
      aiCaseSummary,
      selectedPrecedent,
      selectedPrecedentAiSummary,
    } = body;

    if (!apiKey?.trim()) {
      return NextResponse.json(
        { error: "Gemini API 키가 없습니다. 설정에서 먼저 입력해주세요." },
        { status: 400 },
      );
    }

    if (!aiCaseSummary) {
      return NextResponse.json(
        { error: "AI 사건 정리 데이터가 없습니다. 먼저 사건 정리를 완료해주세요." },
        { status: 400 },
      );
    }

    const prompt = buildVerdictPrompt({
      caseType: caseType ?? "모름",
      legalFields: legalFields ?? [],
      answers: answers ?? {
        people: "",
        action: "",
        timePlace: "",
        damage: "",
        reason: "",
        dispute: "",
      },
      aiCaseSummary,
      selectedPrecedent: selectedPrecedent
        ? {
            id: selectedPrecedent.id ?? "",
            caseName: selectedPrecedent.caseName ?? "",
            caseNumber: selectedPrecedent.caseNumber ?? "",
            courtName: selectedPrecedent.courtName ?? "",
            decisionDate: selectedPrecedent.decisionDate ?? "",
            summary: "",
            source: "국가법령정보",
          }
        : undefined,
      selectedPrecedentAiSummary,
    });

    const ai = createGeminiClient(apiKey);
    const response = await generateContentWithRetry({
      ai,
      contents: prompt,
    });

    const text = response.text ?? "";
    const jsonText = extractJsonFromResponse(text);
    const parsed = JSON.parse(jsonText);

    return NextResponse.json({ data: parsed });
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
      { error: message || "AI 판결문 생성 요청에 실패했습니다." },
      { status: 500 },
    );
  }
}
