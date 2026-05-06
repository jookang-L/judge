import { NextResponse } from "next/server";

import { createGeminiClient, GEMINI_DEFAULT_MODEL } from "@/lib/gemini";

type TestBody = {
  apiKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as TestBody;
    const apiKey = body.apiKey?.trim();

    if (!apiKey) {
      return NextResponse.json(
        { error: "Gemini API 키를 입력해주세요." },
        { status: 400 },
      );
    }

    const ai = createGeminiClient(apiKey);
    const response = await ai.models.generateContent({
      model: GEMINI_DEFAULT_MODEL,
      contents:
        "다음 문장을 그대로 출력하세요: 연결 테스트가 완료되었습니다.",
    });

    const text = response.text ?? "";
    return NextResponse.json({
      ok: true,
      message: text.trim() || "연결 테스트가 완료되었습니다.",
    });
  } catch {
    return NextResponse.json(
      { error: "AI 연결에 실패했습니다. Gemini API 키가 올바른지 확인해주세요." },
      { status: 401 },
    );
  }
}
