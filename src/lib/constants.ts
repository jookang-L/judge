import type { CaseType, LegalField, QuestionKey } from "@/types/case";

export const APP_NAME = "AI 법정";

export const SAFETY_NOTICES = [
  "이 서비스는 교육용 참고 자료입니다.",
  "AI 판결은 실제 판결과 다를 수 있습니다.",
  "실제 법률 문제는 전문가 상담이 필요합니다.",
];

export const STORAGE_NOTICE =
  "검색 기록은 현재 사용하는 기기에만 저장됩니다. 공용 컴퓨터를 사용했다면 수업 후 기록을 삭제해주세요.";

export const GEMINI_NOTICE = [
  "입력한 Gemini API 키는 현재 브라우저에 저장됩니다.",
  "API 키는 비밀번호처럼 관리해야 합니다.",
  "공용 컴퓨터에서는 수업이 끝난 뒤 API 키와 검색 기록을 삭제해주세요.",
];

export const CASE_TYPE_OPTIONS: Array<{
  value: CaseType;
  description: string;
  example: string;
}> = [
  {
    value: "모름",
    description: "잘 모르겠으면 선택하세요. AI가 사건 내용을 보고 유형을 추정합니다.",
    example: "사건 성격을 아직 판단하기 어렵다면 모름을 선택하세요.",
  },
  {
    value: "형사 사건",
    description: "누군가 법을 어겨 처벌을 받을 수 있는 사건입니다.",
    example: "절도, 폭행, 사기",
  },
  {
    value: "민사 사건",
    description: "사람 사이의 돈, 계약, 손해 배상 다툼 사건입니다.",
    example: "돈을 빌려주고 못 받음, 계약 위반",
  },
  {
    value: "학교생활 사건",
    description: "학교 안에서 일어난 다툼이나 규칙 위반 사건입니다.",
    example: "학교폭력, 교칙 위반",
  },
  {
    value: "노동 사건",
    description: "일하는 사람과 고용한 사람 사이의 권리 분쟁입니다.",
    example: "임금 체불, 부당 해고",
  },
  {
    value: "인터넷 사건",
    description: "온라인 글, 댓글, 사진, 개인정보와 관련된 사건입니다.",
    example: "악성 댓글, 허위 글 게시",
  },
  {
    value: "소비자 사건",
    description: "물건 구매, 환불, 서비스 이용 중 생긴 다툼입니다.",
    example: "환불 거부, 하자 있는 물건",
  },
  {
    value: "기타",
    description: "위 항목으로 나누기 어려운 사건입니다.",
    example: "복합적인 상황이 섞여 있는 사건",
  },
];

export const LEGAL_FIELD_OPTIONS: Array<{
  value: LegalField;
  description: string;
  example: string;
}> = [
  {
    value: "모름",
    description: "잘 모르겠으면 선택하세요. AI가 사건 내용을 보고 관련 법을 추정합니다.",
    example: "법 이름이 떠오르지 않으면 모름을 선택하세요.",
  },
  {
    value: "형법",
    description: "범죄가 되는 행동과 처벌을 정한 법입니다.",
    example: "절도, 폭행, 사기",
  },
  {
    value: "민법",
    description: "개인 사이의 권리, 계약, 손해 배상을 다루는 법입니다.",
    example: "계약 위반, 손해 배상",
  },
  {
    value: "소년법",
    description: "잘못을 한 청소년을 보호하고 지도하는 기준을 정한 법입니다.",
    example: "청소년 사건의 보호 처분",
  },
  {
    value: "학교폭력예방법",
    description: "학교폭력의 예방, 조사, 조치 절차를 정한 법입니다.",
    example: "학교폭력 조치",
  },
  {
    value: "근로기준법",
    description: "임금, 근무 시간, 해고 등 노동자의 기본 권리를 정한 법입니다.",
    example: "임금 체불, 부당 해고",
  },
  {
    value: "정보통신망법",
    description: "인터넷 명예훼손, 개인정보 침해 등을 다루는 법입니다.",
    example: "온라인 명예훼손",
  },
  {
    value: "저작권법",
    description: "글, 그림, 음악, 영상 같은 창작물을 보호하는 법입니다.",
    example: "무단 복제, 무단 업로드",
  },
  {
    value: "기타",
    description: "특정 법을 고르기 어려울 때 선택합니다.",
    example: "다양한 법이 함께 걸린 사건",
  },
];

export const QUESTIONS: Array<{
  key: QuestionKey;
  title: string;
  description: string;
  example: string;
}> = [
  {
    key: "people",
    title: "누가 관련되어 있나요?",
    description: "사건에 등장하는 사람이나 단체를 적어주세요.",
    example: "고등학생 A, 친구 B, 편의점 점원",
  },
  {
    key: "action",
    title: "무슨 일이 있었나요?",
    description: "가장 중요한 행동을 짧게 적어주세요.",
    example: "A가 편의점에서 과자와 음료수를 몰래 가져갔다.",
  },
  {
    key: "timePlace",
    title: "언제, 어디에서 일어났나요?",
    description: "정확하지 않아도 됩니다. 장소와 시점을 적어주세요.",
    example: "2025년 3월, 학교 근처 편의점",
  },
  {
    key: "damage",
    title: "어떤 피해나 결과가 있었나요?",
    description: "다친 사람, 잃어버린 돈, 망가진 물건 등을 적어주세요.",
    example: "5천 원어치를 가져갔고 바로 점원에게 적발되었다.",
  },
  {
    key: "reason",
    title: "왜 그런 일이 일어났다고 하나요?",
    description: "실수인지, 고의인지, 이유나 배경을 적어주세요.",
    example: "A는 배가 고파서 그랬고 훔칠 마음은 약했다고 주장했다.",
  },
  {
    key: "dispute",
    title: "서로 다투는 점은 무엇인가요?",
    description: "양쪽 주장이 다르면 적어주세요. 모르겠으면 건너뛰어도 됩니다.",
    example: "A는 실수라고 하지만 점원은 고의로 숨겼다고 주장한다.",
  },
];

export const EMPTY_ANSWERS = {
  people: "",
  action: "",
  timePlace: "",
  damage: "",
  reason: "",
  dispute: "",
};
