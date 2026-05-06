"use client";

import type { AiCaseSummary } from "@/types/case";

type AiSummaryPanelProps = {
  summary: AiCaseSummary;
  onEdit: () => void;
  onProceedToSearch: () => void;
  showProceedButton?: boolean;
};

export function AiSummaryPanel({
  summary,
  onEdit,
  onProceedToSearch,
  showProceedButton = true,
}: AiSummaryPanelProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <h2 className="text-xl font-bold text-indigo-950">AI가 사건을 이렇게 정리했어요.</h2>
      <div className="mt-4 space-y-4 text-sm">
        <div>
          <h3 className="font-semibold text-slate-900">사건 제목</h3>
          <p className="mt-1 text-slate-700">{summary.title}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">사건 개요</h3>
          <p className="mt-1 text-slate-700">{summary.summary}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">AI가 판단한 사건 유형</h3>
          <p className="mt-1 text-slate-700">{summary.caseType}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">AI가 판단한 법률 분야</h3>
          <p className="mt-1 text-slate-700">
            {summary.legalFields.length > 0
              ? summary.legalFields.join(", ")
              : "관련 법률 분야 없음"}
          </p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">판례 검색어 후보</h3>
          <p className="mt-1 text-slate-700">{summary.searchKeywords.join(", ")}</p>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">핵심 쟁점</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
            {summary.issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </div>
        <div>
          <h3 className="font-semibold text-slate-900">추가로 확인하면 좋은 사실</h3>
          <ul className="mt-1 list-disc space-y-1 pl-5 text-slate-700">
            {summary.additionalFactsToCheck.map((fact) => (
              <li key={fact}>{fact}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex gap-2">
        {showProceedButton && (
          <button
            type="button"
            onClick={onProceedToSearch}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            이 내용으로 판례 검색하기
          </button>
        )}
        <button
          type="button"
          onClick={onEdit}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          수정하기
        </button>
      </div>
    </section>
  );
}
