export type CaseType =
  | "모름"
  | "형사 사건"
  | "민사 사건"
  | "학교생활 사건"
  | "노동 사건"
  | "인터넷 사건"
  | "소비자 사건"
  | "기타";

export type LegalField =
  | "모름"
  | "형법"
  | "민법"
  | "소년법"
  | "학교폭력예방법"
  | "근로기준법"
  | "정보통신망법"
  | "저작권법"
  | "기타";

export type QuestionKey =
  | "people"
  | "action"
  | "timePlace"
  | "damage"
  | "reason"
  | "dispute";

export type QuestionAnswers = Record<QuestionKey, string>;

export type InputMode = "step" | "single";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
};

export type AiCaseSummary = {
  title: string;
  summary: string;
  caseType: Exclude<CaseType, "모름"> | "기타";
  legalFields: LegalField[];
  searchKeywords: string[];
  issues: string[];
  additionalFactsToCheck: string[];
};

export type PrecedentItem = {
  id: string;
  caseName: string;
  caseNumber: string;
  courtName: string;
  decisionDate: string;
  summary: string;
  source: "국가법령정보";
};

export type PrecedentDetail = {
  id: string;
  caseName: string;
  caseNumber: string;
  courtName: string;
  decisionDate: string;
  fullText: string;
};

export type AiPrecedentSummary = {
  keyFacts: string[];
  keyIssues: string[];
  courtFocus: string[];
  conclusion: string;
  similarities: string[];
  differences: string[];
  impactfulDifferences: string[];
  hintsForOurCase: string[];
};

export type AiComparison = {
  commonPoints: string[];
  differences: string[];
  impactfulDifferences: string[];
  legalIssueFocus: string[];
};

export type AiResponsibilityAnalysis = {
  plaintiffOrVictim: string;
  defendantOrActor: string;
  schoolOrGuardian: string;
  others: string;
  notes: string[];
};

export type AiSentencingAnalysis = {
  aggravatingFactors: string[];
  mitigatingFactors: string[];
  recommendedDirection: string;
  rationale: string;
};

export type AiVerdictDraft = {
  option: "A안" | "B안" | "C안";
  title: string;
  decision: string;
  reasoning: string[];
};

export type AiVerdict = {
  verdictOptions: AiVerdictDraft[];
  classDiscussionQuestions: string[];
};

export type AiVerdictAnalysis = {
  comparison: AiComparison;
  responsibilityAnalysis: AiResponsibilityAnalysis;
  sentencingAnalysis: AiSentencingAnalysis;
  verdict: AiVerdict;
};

export type SavedCaseRecord = {
  id: string;
  createdAt: string;
  updatedAt: string;
  title: string;
  caseType: CaseType;
  legalFields: LegalField[];
  inputMode?: InputMode;
  singleInput?: string;
  answers: QuestionAnswers;
  aiSummary?: AiCaseSummary;
  searchKeywords: string[];
  precedents: PrecedentItem[];
  selectedPrecedent?: PrecedentItem;
  selectedPrecedentDetail?: PrecedentDetail;
  selectedPrecedentAiSummary?: AiPrecedentSummary;
  standaloneVerdictAnalysis?: AiVerdictAnalysis;
  precedentVerdictAnalysis?: AiVerdictAnalysis;
  comparison?: AiComparison;
  responsibilityAnalysis?: AiResponsibilityAnalysis;
  sentencingAnalysis?: AiSentencingAnalysis;
  verdict?: AiVerdict;
  chatHistory: ChatMessage[];
};
