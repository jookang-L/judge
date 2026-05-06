"use client";

import { useEffect, useMemo, useState } from "react";

import { AiSummaryPanel } from "@/components/ai-summary-panel";
import { CaseTypeSelector } from "@/components/case-type-selector";
import { LegalFieldSelector } from "@/components/legal-field-selector";
import { PrecedentSearchPanel } from "@/components/precedent-search-panel";
import { QuestionStepper } from "@/components/question-stepper";
import { SettingsModal } from "@/components/settings-modal";
import { Sidebar } from "@/components/sidebar";
import { EMPTY_ANSWERS, QUESTIONS, SAFETY_NOTICES } from "@/lib/constants";
import {
  clearCaseHistory,
  clearGeminiApiKey,
  clearLawApiKey,
  loadCaseHistory,
  loadGeminiApiKey,
  loadLawApiKey,
  removeCaseRecord,
  saveGeminiApiKey,
  saveLawApiKey,
  upsertCaseRecord,
} from "@/lib/storage";
import type {
  AiCaseSummary,
  AiComparison,
  AiPrecedentSummary,
  AiResponsibilityAnalysis,
  AiSentencingAnalysis,
  AiVerdict,
  CaseType,
  LegalField,
  PrecedentDetail,
  PrecedentItem,
  QuestionAnswers,
  SavedCaseRecord,
} from "@/types/case";

type MainStep =
  | "caseType"
  | "legalFields"
  | "questions"
  | "summary"
  | "precedentSearch";

function createEmptyRecord(): SavedCaseRecord {
  const now = new Date().toISOString();
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  return {
    id,
    createdAt: now,
    updatedAt: now,
    title: "새 사건",
    caseType: "모름",
    legalFields: ["모름"],
    answers: { ...EMPTY_ANSWERS },
    searchKeywords: [],
    precedents: [],
    chatHistory: [],
  };
}

export default function Home() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [lawApiKey, setLawApiKey] = useState("");
  const [history, setHistory] = useState<SavedCaseRecord[]>([]);
  const [record, setRecord] = useState<SavedCaseRecord>(createEmptyRecord);
  const [mainStep, setMainStep] = useState<MainStep>("caseType");
  const [questionIndex, setQuestionIndex] = useState(0);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [loadingPrecedentSearch, setLoadingPrecedentSearch] = useState(false);
  const [loadingPrecedentDetail, setLoadingPrecedentDetail] = useState(false);
  const [loadingVerdict, setLoadingVerdict] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const hydrateFromStorage = () => {
    setGeminiApiKey(loadGeminiApiKey());
    setLawApiKey(loadLawApiKey());
    setHistory(loadCaseHistory());
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      hydrateFromStorage();
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const questionAnswers = useMemo(
    () => record.answers ?? ({ ...EMPTY_ANSWERS } as QuestionAnswers),
    [record.answers],
  );

  const updateRecord = (next: Partial<SavedCaseRecord>) => {
    setRecord((prev) => ({
      ...prev,
      ...next,
      updatedAt: new Date().toISOString(),
    }));
  };

  const saveCurrentRecord = (nextRecord: SavedCaseRecord) => {
    try {
      const nextHistory = upsertCaseRecord(nextRecord);
      setHistory(nextHistory);
    } catch {
      setErrorMessage("기록 저장에 실패했습니다. 브라우저 저장 공간을 확인해주세요.");
    }
  };

  const handleSaveApiKey = (payload: { geminiApiKey: string; lawApiKey: string }) => {
    saveGeminiApiKey(payload.geminiApiKey);
    saveLawApiKey(payload.lawApiKey);
    setGeminiApiKey(payload.geminiApiKey.trim());
    setLawApiKey(payload.lawApiKey.trim());
    setIsSettingsOpen(false);
  };

  const handleDeleteApiKey = () => {
    clearGeminiApiKey();
    setGeminiApiKey("");
  };

  const handleDeleteLawApiKey = () => {
    clearLawApiKey();
    setLawApiKey("");
  };

  const handleNewCase = () => {
    setRecord(createEmptyRecord());
    setMainStep("caseType");
    setQuestionIndex(0);
    setErrorMessage("");
  };

  const handleQuestionNext = async () => {
    const key = QUESTIONS[questionIndex].key;
    const currentAnswer = questionAnswers[key] ?? "";
    const requiredQuestionIndexes = [0, 1, 2, 3, 4];
    if (!currentAnswer.trim() && requiredQuestionIndexes.includes(questionIndex)) {
      setErrorMessage("이 질문은 필수입니다. 잘 모르겠다면 상황을 짧게라도 적어주세요.");
      return;
    }

    setErrorMessage("");
    if (questionIndex < 5) {
      setQuestionIndex((prev) => prev + 1);
      return;
    }
    await requestAiSummary();
  };

  const requestAiSummary = async (overrideAnswers?: QuestionAnswers) => {
    if (!geminiApiKey.trim()) {
      setErrorMessage("AI 기능을 사용하려면 Gemini API 키를 먼저 입력해주세요.");
      setIsSettingsOpen(true);
      return;
    }

    const answersForRequest = overrideAnswers ?? record.answers;

    setLoadingSummary(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          selectedCaseType: record.caseType,
          selectedLegalFields: record.legalFields,
          answers: answersForRequest,
        }),
      });

      const payload = (await response.json()) as {
        data?: AiCaseSummary;
        error?: string;
      };

      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "AI 사건 정리에 실패했습니다.");
      }

      const nextRecord: SavedCaseRecord = {
        ...record,
        answers: answersForRequest,
        title: payload.data.title || record.title,
        aiSummary: payload.data,
        searchKeywords: payload.data.searchKeywords ?? [],
        updatedAt: new Date().toISOString(),
      };

      setRecord(nextRecord);
      saveCurrentRecord(nextRecord);
      setMainStep("summary");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "AI 사건 정리에 실패했습니다.",
      );
    } finally {
      setLoadingSummary(false);
    }
  };

  const loadRecord = (saved: SavedCaseRecord) => {
    setRecord(saved);
    setQuestionIndex(0);
    if (saved.precedents?.length) {
      setMainStep("precedentSearch");
    } else {
      setMainStep(saved.aiSummary ? "summary" : "caseType");
    }
    setErrorMessage("");
  };

  const handleSearchPrecedents = async (keywords: string[]) => {
    if (!record.aiSummary) {
      setErrorMessage("먼저 AI 사건 정리를 완료해주세요.");
      return;
    }
    if (keywords.length === 0) {
      setErrorMessage("검색어를 1개 이상 입력해주세요.");
      return;
    }

    setLoadingPrecedentSearch(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/law/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, lawApiKey }),
      });

      const payload = (await response.json()) as {
        data?: PrecedentItem[];
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "판례 검색에 실패했습니다.");
      }
      if (payload.data.length === 0) {
        throw new Error("비슷한 판례를 찾지 못했습니다. 검색어를 바꿔 다시 시도해보세요.");
      }

      const nextRecord: SavedCaseRecord = {
        ...record,
        precedents: payload.data,
        searchKeywords: keywords,
        comparison: undefined,
        responsibilityAnalysis: undefined,
        sentencingAnalysis: undefined,
        verdict: undefined,
        updatedAt: new Date().toISOString(),
      };
      setRecord(nextRecord);
      saveCurrentRecord(nextRecord);
      setMainStep("precedentSearch");
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "판례 검색에 실패했습니다.",
      );
    } finally {
      setLoadingPrecedentSearch(false);
    }
  };

  const handleLoadPrecedentDetail = async (item: PrecedentItem) => {
    if (!geminiApiKey.trim()) {
      setErrorMessage("AI 분석을 위해 Gemini API 키가 필요합니다.");
      setIsSettingsOpen(true);
      return;
    }

    setLoadingPrecedentDetail(true);
    setErrorMessage("");
    try {
      const detailResponse = await fetch("/api/law/detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: item.id, lawApiKey }),
      });
      const detailPayload = (await detailResponse.json()) as {
        data?: PrecedentDetail;
        error?: string;
      };
      if (!detailResponse.ok || !detailPayload.data) {
        throw new Error(detailPayload.error ?? "판례 본문 조회에 실패했습니다.");
      }

      const summaryResponse = await fetch("/api/ai/precedent-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          caseType: record.caseType,
          aiCaseSummary: record.aiSummary,
          precedentDetail: detailPayload.data,
        }),
      });
      const summaryPayload = (await summaryResponse.json()) as {
        data?: AiPrecedentSummary;
        error?: string;
      };
      if (!summaryResponse.ok || !summaryPayload.data) {
        throw new Error(summaryPayload.error ?? "판례 요약에 실패했습니다.");
      }

      const nextRecord: SavedCaseRecord = {
        ...record,
        selectedPrecedent: item,
        selectedPrecedentDetail: detailPayload.data,
        selectedPrecedentAiSummary: summaryPayload.data,
        comparison: undefined,
        responsibilityAnalysis: undefined,
        sentencingAnalysis: undefined,
        verdict: undefined,
        updatedAt: new Date().toISOString(),
      };
      setRecord(nextRecord);
      saveCurrentRecord(nextRecord);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "판례 상세 조회에 실패했습니다.",
      );
    } finally {
      setLoadingPrecedentDetail(false);
    }
  };

  const handleGenerateVerdict = async () => {
    if (!geminiApiKey.trim()) {
      setErrorMessage("AI 판결문 생성을 위해 Gemini API 키가 필요합니다.");
      setIsSettingsOpen(true);
      return;
    }
    if (!record.aiSummary || !record.selectedPrecedentAiSummary) {
      setErrorMessage("먼저 판례 상세 분석을 완료해주세요.");
      return;
    }

    setLoadingVerdict(true);
    setErrorMessage("");
    try {
      const response = await fetch("/api/ai/verdict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          apiKey: geminiApiKey,
          caseType: record.caseType,
          legalFields: record.legalFields,
          answers: record.answers,
          aiCaseSummary: record.aiSummary,
          selectedPrecedent: record.selectedPrecedent,
          selectedPrecedentAiSummary: record.selectedPrecedentAiSummary,
        }),
      });
      const payload = (await response.json()) as {
        data?: {
          comparison?: AiComparison;
          responsibilityAnalysis?: AiResponsibilityAnalysis;
          sentencingAnalysis?: AiSentencingAnalysis;
          verdict?: AiVerdict;
        };
        error?: string;
      };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "AI 판결문 생성에 실패했습니다.");
      }
      if (
        !payload.data.comparison ||
        !payload.data.responsibilityAnalysis ||
        !payload.data.sentencingAnalysis ||
        !payload.data.verdict
      ) {
        throw new Error("AI 응답 형식이 올바르지 않습니다. 다시 시도해주세요.");
      }

      const nextRecord: SavedCaseRecord = {
        ...record,
        comparison: payload.data.comparison,
        responsibilityAnalysis: payload.data.responsibilityAnalysis,
        sentencingAnalysis: payload.data.sentencingAnalysis,
        verdict: payload.data.verdict,
        updatedAt: new Date().toISOString(),
      };
      setRecord(nextRecord);
      saveCurrentRecord(nextRecord);
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "AI 판결문 생성에 실패했습니다.",
      );
    } finally {
      setLoadingVerdict(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      <Sidebar
        records={history}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        onNewCase={handleNewCase}
        onSelectRecord={loadRecord}
        onDeleteRecord={(id) => setHistory(removeCaseRecord(id))}
        onClearAll={() => {
          clearCaseHistory();
          setHistory([]);
        }}
      />

      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-4 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ring-1 ring-indigo-100">
            <div>
              <h1 className="text-xl font-bold text-indigo-950">AI 법정 / 인공지능 판사</h1>
              <p className="text-sm text-slate-600">
                학생 입력 → AI 사건 정리 → 판례 탐색 순서로 진행됩니다.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsSettingsOpen(true)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm hover:bg-slate-50"
            >
              설정
            </button>
          </div>

          <div className="mb-4 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-950">
            <ul className="space-y-1">
              {SAFETY_NOTICES.map((notice) => (
                <li key={notice}>- {notice}</li>
              ))}
            </ul>
          </div>

          {mainStep === "caseType" && (
            <CaseTypeSelector
              value={record.caseType as CaseType}
              onChange={(caseType) => updateRecord({ caseType })}
              onNext={() => setMainStep("legalFields")}
            />
          )}

          {mainStep === "legalFields" && (
            <LegalFieldSelector
              values={record.legalFields as LegalField[]}
              onChange={(legalFields) => updateRecord({ legalFields })}
              onPrev={() => setMainStep("caseType")}
              onNext={() => setMainStep("questions")}
            />
          )}

          {mainStep === "questions" && (
            <QuestionStepper
              answers={questionAnswers}
              currentIndex={questionIndex}
              errorMessage={errorMessage}
              onChange={(value) => {
                const key = QUESTIONS[questionIndex].key;
                updateRecord({
                  answers: {
                    ...questionAnswers,
                    [key]: value,
                  },
                });
              }}
              onPrev={() => {
                setErrorMessage("");
                if (questionIndex > 0) {
                  setQuestionIndex((prev) => prev - 1);
                } else {
                  setMainStep("legalFields");
                }
              }}
              onNext={handleQuestionNext}
              onSkip={() => {
                setErrorMessage("");
                const key = QUESTIONS[questionIndex].key;
                const currentValue = (questionAnswers[key] ?? "").trim();
                const nextAnswers = currentValue
                  ? questionAnswers
                  : { ...questionAnswers, [key]: "잘 모르겠음" };

                if (!currentValue) {
                  updateRecord({ answers: nextAnswers });
                }

                if (questionIndex < 5) {
                  setQuestionIndex((prev) => prev + 1);
                } else {
                  void requestAiSummary(nextAnswers);
                }
              }}
            />
          )}

          {mainStep === "summary" && record.aiSummary && (
            <AiSummaryPanel
              summary={record.aiSummary}
              onProceedToSearch={() => {
                setMainStep("precedentSearch");
                setErrorMessage("");
              }}
              onEdit={() => {
                setMainStep("questions");
                setQuestionIndex(0);
              }}
            />
          )}

          {mainStep === "precedentSearch" && record.aiSummary && (
            <>
              <AiSummaryPanel
                summary={record.aiSummary}
                onProceedToSearch={() => undefined}
                showProceedButton={false}
                onEdit={() => {
                  setMainStep("questions");
                  setQuestionIndex(0);
                }}
              />
              <PrecedentSearchPanel
                keywords={record.searchKeywords}
                aiKeywordTerms={record.aiSummary.searchKeywords ?? []}
                issueTerms={record.aiSummary.issues ?? []}
                precedents={record.precedents}
                selectedPrecedent={record.selectedPrecedent}
                selectedPrecedentDetail={record.selectedPrecedentDetail}
                selectedPrecedentAiSummary={record.selectedPrecedentAiSummary}
                comparison={record.comparison}
                responsibilityAnalysis={record.responsibilityAnalysis}
                sentencingAnalysis={record.sentencingAnalysis}
                verdict={record.verdict}
                loadingSearch={loadingPrecedentSearch}
                loadingDetail={loadingPrecedentDetail}
                loadingVerdict={loadingVerdict}
                errorMessage={errorMessage}
                onSearch={handleSearchPrecedents}
                onViewDetail={handleLoadPrecedentDetail}
                onGenerateVerdict={handleGenerateVerdict}
                onSelect={(item) => {
                  const nextRecord: SavedCaseRecord = {
                    ...record,
                    selectedPrecedent: item,
                    comparison: undefined,
                    responsibilityAnalysis: undefined,
                    sentencingAnalysis: undefined,
                    verdict: undefined,
                    updatedAt: new Date().toISOString(),
                  };
                  setRecord(nextRecord);
                  saveCurrentRecord(nextRecord);
                }}
              />
            </>
          )}

          {loadingSummary && (
            <p className="mt-4 text-sm text-indigo-700">
              AI가 사건을 정리하고 있어요. 잠시만 기다려주세요.
            </p>
          )}

          {errorMessage &&
            mainStep !== "questions" &&
            mainStep !== "precedentSearch" && (
            <p className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
              {errorMessage}
            </p>
            )}
        </div>
      </main>

      {isSettingsOpen && (
        <SettingsModal
          key={`settings-${geminiApiKey}-${lawApiKey}`}
          initialApiKey={geminiApiKey}
          initialLawApiKey={lawApiKey}
          onClose={() => setIsSettingsOpen(false)}
          onSave={handleSaveApiKey}
          onDeleteGeminiKey={handleDeleteApiKey}
          onDeleteLawApiKey={handleDeleteLawApiKey}
        />
      )}
    </div>
  );
}
