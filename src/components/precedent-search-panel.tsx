"use client";

import { useMemo, useState } from "react";

import { VerdictPanel } from "@/components/verdict-panel";
import type {
  AiComparison,
  AiPrecedentSummary,
  AiResponsibilityAnalysis,
  AiSentencingAnalysis,
  AiVerdict,
  PrecedentDetail,
  PrecedentItem,
} from "@/types/case";

type Props = {
  keywords: string[];
  precedents: PrecedentItem[];
  selectedPrecedent?: PrecedentItem;
  selectedPrecedentDetail?: PrecedentDetail;
  selectedPrecedentAiSummary?: AiPrecedentSummary;
  comparison?: AiComparison;
  responsibilityAnalysis?: AiResponsibilityAnalysis;
  sentencingAnalysis?: AiSentencingAnalysis;
  verdict?: AiVerdict;
  loadingSearch: boolean;
  loadingDetail: boolean;
  loadingVerdict: boolean;
  errorMessage: string;
  onSearch: (keywords: string[]) => Promise<void>;
  onViewDetail: (item: PrecedentItem) => Promise<void>;
  onGenerateVerdict: () => Promise<void>;
  onSelect: (item: PrecedentItem) => void;
};

export function PrecedentSearchPanel({
  keywords,
  precedents,
  selectedPrecedent,
  selectedPrecedentDetail,
  selectedPrecedentAiSummary,
  comparison,
  responsibilityAnalysis,
  sentencingAnalysis,
  verdict,
  loadingSearch,
  loadingDetail,
  loadingVerdict,
  errorMessage,
  onSearch,
  onViewDetail,
  onGenerateVerdict,
  onSelect,
}: Props) {
  const [keywordText, setKeywordText] = useState(keywords.join(", "));

  const parsedKeywords = useMemo(
    () =>
      keywordText
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    [keywordText],
  );

  return (
    <section className="mt-4 space-y-4">
      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
        <h3 className="text-lg font-bold text-indigo-950">판례 검색</h3>
        <p className="mt-1 text-sm text-slate-600">
          검색어를 쉼표로 구분해 입력하고 유사 판례를 찾아보세요.
        </p>
        <div className="mt-3 flex flex-col gap-2 md:flex-row">
          <input
            value={keywordText}
            onChange={(event) => setKeywordText(event.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            placeholder="예: 절도, 소년 절도, 편의점 절도"
          />
          <button
            type="button"
            disabled={loadingSearch}
            onClick={() => onSearch(parsedKeywords)}
            className="shrink-0 whitespace-nowrap rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loadingSearch ? "검색 중..." : "판례 검색"}
          </button>
        </div>
      </div>

      <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
        <h3 className="text-lg font-bold text-indigo-950">유사 판례 목록</h3>
        {precedents.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">
            아직 검색된 판례가 없습니다. 검색어를 바꿔 다시 시도해보세요.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {precedents.map((item) => {
              const isSelected = selectedPrecedent?.id === item.id;
              return (
                <li key={item.id} className="rounded-lg border border-slate-200 p-4">
                  <p className="font-semibold text-slate-900">{item.caseName}</p>
                  <p className="mt-1 text-xs text-slate-600">
                    {item.caseNumber || "사건번호 없음"} ·{" "}
                    {item.decisionDate || "선고일 없음"} · {item.courtName || "법원명 없음"}
                  </p>
                  <p className="mt-2 text-sm text-slate-700">
                    {item.summary || "요지 정보가 없어 상세 보기를 통해 확인이 필요합니다."}
                  </p>
                  <p className="mt-2 text-xs text-indigo-700">
                    우리 사건과 비슷해 보이는 이유: 사건 유형이나 쟁점 키워드가 유사합니다.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => onViewDetail(item)}
                      className="rounded-md border border-indigo-200 px-3 py-1 text-sm text-indigo-800 hover:bg-indigo-50"
                    >
                      상세 보기
                    </button>
                    <button
                      type="button"
                      onClick={() => onSelect(item)}
                      className={`rounded-md px-3 py-1 text-sm font-semibold ${
                        isSelected
                          ? "bg-indigo-100 text-indigo-900"
                          : "bg-indigo-600 text-white hover:bg-indigo-500"
                      }`}
                    >
                      {isSelected ? "선택됨" : "참고 판례로 선택"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {(loadingDetail || selectedPrecedentDetail) && (
        <div className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
          <h3 className="text-lg font-bold text-indigo-950">판례 상세 및 AI 요약</h3>
          {loadingDetail && (
            <p className="mt-2 text-sm text-indigo-700">
              판례 본문을 불러오고 AI가 비교 요약을 작성하고 있어요.
            </p>
          )}
          {selectedPrecedentDetail && (
            <>
              <p className="mt-2 text-sm font-semibold text-slate-900">
                {selectedPrecedentDetail.caseName}
              </p>
              <p className="mt-1 text-xs text-slate-600">
                {selectedPrecedentDetail.caseNumber} · {selectedPrecedentDetail.decisionDate} ·{" "}
                {selectedPrecedentDetail.courtName}
              </p>
              <details className="mt-3 rounded-md border border-slate-200 p-3">
                <summary className="cursor-pointer text-sm font-medium text-slate-800">
                  판례 본문 보기
                </summary>
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {selectedPrecedentDetail.fullText}
                </p>
              </details>
            </>
          )}
          {selectedPrecedentAiSummary && (
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
              <InfoList title="사건의 핵심 사실" items={selectedPrecedentAiSummary.keyFacts} />
              <InfoList title="핵심 쟁점" items={selectedPrecedentAiSummary.keyIssues} />
              <InfoList title="법원이 중요하게 본 점" items={selectedPrecedentAiSummary.courtFocus} />
              <InfoList title="우리 사건과 같은 점" items={selectedPrecedentAiSummary.similarities} />
              <InfoList title="우리 사건과 다른 점" items={selectedPrecedentAiSummary.differences} />
              <InfoList
                title="판단에 영향을 줄 수 있는 차이"
                items={selectedPrecedentAiSummary.impactfulDifferences}
              />
              <InfoList title="우리 사건에 주는 힌트" items={selectedPrecedentAiSummary.hintsForOurCase} />
              <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950">
                <p className="font-semibold">결론</p>
                <p className="mt-1">{selectedPrecedentAiSummary.conclusion}</p>
                <p className="mt-2 text-xs">교육용 해설이며 실제 법률 자문이 아닙니다.</p>
              </div>
            </div>
          )}
        </div>
      )}

      <VerdictPanel
        comparison={comparison}
        responsibilityAnalysis={responsibilityAnalysis}
        sentencingAnalysis={sentencingAnalysis}
        verdict={verdict}
        loading={loadingVerdict}
        onGenerate={onGenerateVerdict}
      />

      {errorMessage && (
        <p className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">
          {errorMessage}
        </p>
      )}
    </section>
  );
}

function InfoList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
