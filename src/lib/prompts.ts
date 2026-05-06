import type {
  AiCaseSummary,
  AiPrecedentSummary,
  CaseType,
  LegalField,
  QuestionAnswers,
  PrecedentItem,
} from "@/types/case";

type SummarizePromptInput = {
  selectedCaseType: CaseType;
  selectedLegalFields: LegalField[];
  answers: QuestionAnswers;
};

export function buildCaseSummaryPrompt(input: SummarizePromptInput): string {
  const { selectedCaseType, selectedLegalFields, answers } = input;
  const legalFieldsText =
    selectedLegalFields.length > 0 ? selectedLegalFields.join(", ") : "모름";

  return `
당신은 고등학교 법과 사회 수업을 돕는 교육용 AI입니다.
학생의 사건 메모를 읽고 이해하기 쉬운 말로 사건을 정리해주세요.

반드시 지켜야 할 규칙:
1) 출력은 JSON 하나만 반환하세요.
2) JSON 밖의 설명 문장, 코드 블록, 마크다운을 쓰지 마세요.
3) 고등학생이 이해할 수 있는 쉬운 한국어를 사용하세요.
4) 한자 표기와 일본식 표현을 쓰지 마세요.
5) 어려운 법률 용어를 쓰면 괄호로 쉬운 설명을 덧붙이세요.
6) 실제 법률 자문처럼 단정하지 말고 교육용 분석 톤을 유지하세요.
7) searchKeywords는 국가법령정보 API 검색에 맞는 짧은 명사구 3~8개를 생성하세요.
8) caseType은 아래 목록 중 하나만 사용하세요:
형사 사건, 민사 사건, 학교생활 사건, 노동 사건, 인터넷 사건, 소비자 사건, 기타

학생 입력:
- 선택한 사건 유형: ${selectedCaseType}
- 선택한 법률 분야: ${legalFieldsText}
- 답변 1(누가 관련되어 있나요?): ${answers.people || "(미입력)"}
- 답변 2(무슨 일이 있었나요?): ${answers.action || "(미입력)"}
- 답변 3(언제, 어디에서 일어났나요?): ${answers.timePlace || "(미입력)"}
- 답변 4(어떤 피해나 결과가 있었나요?): ${answers.damage || "(미입력)"}
- 답변 5(왜 그런 일이 일어났다고 하나요?): ${answers.reason || "(미입력)"}
- 답변 6(서로 다투는 점은 무엇인가요?): ${answers.dispute || "(미입력)"}

반환 JSON 스키마:
{
  "title": "자동 생성된 사건 제목",
  "summary": "정리된 사건 개요",
  "caseType": "형사 사건 | 민사 사건 | 학교생활 사건 | 노동 사건 | 인터넷 사건 | 소비자 사건 | 기타",
  "legalFields": ["형법", "소년법"],
  "searchKeywords": ["절도", "소년 절도", "편의점 절도"],
  "issues": ["핵심 쟁점 1", "핵심 쟁점 2"],
  "additionalFactsToCheck": ["추가 확인하면 좋은 사실 1"]
}
`.trim();
}

type VerdictPromptInput = {
  caseType: CaseType;
  legalFields: LegalField[];
  answers: QuestionAnswers;
  aiCaseSummary: AiCaseSummary;
  selectedPrecedent?: PrecedentItem;
  selectedPrecedentAiSummary: AiPrecedentSummary;
};

export function buildVerdictPrompt(input: VerdictPromptInput): string {
  const {
    caseType,
    legalFields,
    answers,
    aiCaseSummary,
    selectedPrecedent,
    selectedPrecedentAiSummary,
  } = input;

  return `
당신은 고등학교 법과 사회 수업용 교육 도우미 AI입니다.
학생 사건과 판례 비교 요약을 바탕으로 책임 판단 기준, 양형 방향, 교육용 AI 판결문 3안을 작성하세요.

반드시 지켜야 할 규칙:
1) JSON 하나만 반환하세요.
2) JSON 밖의 문장, 코드 블록, 마크다운을 쓰지 마세요.
3) 고등학생이 이해할 수 있는 쉬운 한국어를 사용하세요.
4) 한자 표기와 일본식 표현을 쓰지 마세요.
5) 실제 확정 판결처럼 단정하지 말고, 교육용 참고 분석 톤을 유지하세요.
6) verdictOptions는 반드시 A안/B안/C안 3개를 모두 작성하세요.
7) 각 verdictOptions.reasoning은 3~5개 항목으로 작성하세요.

학생 입력 사건:
- 사건 유형: ${caseType}
- 법률 분야: ${legalFields.join(", ") || "모름"}
- 사건 개요: ${aiCaseSummary.summary}
- 핵심 쟁점: ${aiCaseSummary.issues.join(", ") || "없음"}
- 답변(등장인물): ${answers.people || "(미입력)"}
- 답변(행동): ${answers.action || "(미입력)"}
- 답변(시간/장소): ${answers.timePlace || "(미입력)"}
- 답변(피해/결과): ${answers.damage || "(미입력)"}
- 답변(이유/배경): ${answers.reason || "(미입력)"}
- 답변(다툼점): ${answers.dispute || "(미입력)"}

참고 판례:
- 사건명: ${selectedPrecedent?.caseName ?? "(없음)"}
- 사건번호: ${selectedPrecedent?.caseNumber ?? "(없음)"}
- 법원: ${selectedPrecedent?.courtName ?? "(없음)"}
- 선고일: ${selectedPrecedent?.decisionDate ?? "(없음)"}
- 같은 점: ${selectedPrecedentAiSummary.similarities.join(", ") || "없음"}
- 다른 점: ${selectedPrecedentAiSummary.differences.join(", ") || "없음"}
- 판단 영향 차이: ${selectedPrecedentAiSummary.impactfulDifferences.join(", ") || "없음"}
- 우리 사건 힌트: ${selectedPrecedentAiSummary.hintsForOurCase.join(", ") || "없음"}

반환 JSON 스키마:
{
  "comparison": {
    "commonPoints": ["공통점 1"],
    "differences": ["차이점 1"],
    "impactfulDifferences": ["판단에 중요한 차이 1"],
    "legalIssueFocus": ["집중할 법적 쟁점 1"]
  },
  "responsibilityAnalysis": {
    "plaintiffOrVictim": "피해자/원고 관점 책임 판단",
    "defendantOrActor": "행위자/피고 관점 책임 판단",
    "schoolOrGuardian": "학교/보호자 관점 책임 판단",
    "others": "기타 당사자 관점 책임 판단",
    "notes": ["책임 판단 참고 메모 1"]
  },
  "sentencingAnalysis": {
    "aggravatingFactors": ["가중 요소 1"],
    "mitigatingFactors": ["감경 요소 1"],
    "recommendedDirection": "처분/판결 방향",
    "rationale": "왜 이런 방향인지"
  },
  "verdict": {
    "verdictOptions": [
      {
        "option": "A안",
        "title": "판결문 제목",
        "decision": "핵심 결론",
        "reasoning": ["근거 1", "근거 2", "근거 3"],
        "educationalMessage": "학생이 배울 점"
      },
      {
        "option": "B안",
        "title": "판결문 제목",
        "decision": "핵심 결론",
        "reasoning": ["근거 1", "근거 2", "근거 3"],
        "educationalMessage": "학생이 배울 점"
      },
      {
        "option": "C안",
        "title": "판결문 제목",
        "decision": "핵심 결론",
        "reasoning": ["근거 1", "근거 2", "근거 3"],
        "educationalMessage": "학생이 배울 점"
      }
    ],
    "classDiscussionQuestions": ["수업 토론 질문 1", "수업 토론 질문 2"]
  }
}
`.trim();
}
