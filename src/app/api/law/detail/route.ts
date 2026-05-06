import { NextResponse } from "next/server";

import { fetchPrecedentDetail } from "@/lib/law-api";

type DetailBody = {
  id?: string;
  lawApiKey?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as DetailBody;
    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json(
        { error: "판례 ID가 없습니다. 다시 선택해주세요." },
        { status: 400 },
      );
    }

    const detail = await fetchPrecedentDetail(id, body.lawApiKey);
    return NextResponse.json({ data: detail });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
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
        error: message.includes("LAW_API_OC")
          ? "법령 API 키가 없습니다. 설정에서 LAW_API_OC를 입력해주세요."
          : "판례 본문 조회에 실패했습니다. 잠시 후 다시 시도해주세요.",
      },
      { status: 500 },
    );
  }
}
