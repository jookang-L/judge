"use client";

import type {
  AiComparison,
  AiResponsibilityAnalysis,
  AiSentencingAnalysis,
  AiVerdict,
} from "@/types/case";

type VerdictPanelProps = {
  comparison?: AiComparison;
  responsibilityAnalysis?: AiResponsibilityAnalysis;
  sentencingAnalysis?: AiSentencingAnalysis;
  verdict?: AiVerdict;
  loading: boolean;
  onGenerate: () => Promise<void>;
};

export function VerdictPanel({
  comparison,
  responsibilityAnalysis,
  sentencingAnalysis,
  verdict,
  loading,
  onGenerate,
}: VerdictPanelProps) {
  const hasResult = Boolean(comparison || responsibilityAnalysis || sentencingAnalysis || verdict);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-bold text-indigo-950">3단계: 책임 판단 및 AI 판결문</h3>
          <p className="mt-1 text-sm text-slate-600">
            판례 비교를 바탕으로 책임 판단 기준과 판결문 3안을 생성합니다.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void onGenerate()}
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
        >
          {loading ? "생성 중..." : "AI 판결문 3안 생성"}
        </button>
      </div>

      {!hasResult && !loading && (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          아직 생성된 결과가 없습니다. 먼저 위 버튼을 눌러주세요.
        </p>
      )}

      {comparison && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoList title="우리 사건과 공통점" items={comparison.commonPoints} />
          <InfoList title="우리 사건과 차이점" items={comparison.differences} />
          <InfoList title="판단에 중요한 차이" items={comparison.impactfulDifferences} />
          <InfoList title="집중할 법적 쟁점" items={comparison.legalIssueFocus} />
        </div>
      )}

      {responsibilityAnalysis && (
        <div className="mt-4 rounded-lg border border-slate-200 p-4 text-sm text-slate-800">
          <p className="font-semibold text-slate-900">책임 판단 기준</p>
          <div className="mt-2 space-y-2">
            <p>
              <span className="font-medium">피해자/원고 관점:</span>{" "}
              {responsibilityAnalysis.plaintiffOrVictim}
            </p>
            <p>
              <span className="font-medium">행위자/피고 관점:</span>{" "}
              {responsibilityAnalysis.defendantOrActor}
            </p>
            <p>
              <span className="font-medium">학교/보호자 관점:</span>{" "}
              {responsibilityAnalysis.schoolOrGuardian}
            </p>
            <p>
              <span className="font-medium">기타 관점:</span> {responsibilityAnalysis.others}
            </p>
          </div>
          <InfoList title="책임 판단 메모" items={responsibilityAnalysis.notes} className="mt-3" />
        </div>
      )}

      {sentencingAnalysis && (
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
          <InfoList title="가중 요소" items={sentencingAnalysis.aggravatingFactors} />
          <InfoList title="감경 요소" items={sentencingAnalysis.mitigatingFactors} />
          <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950 md:col-span-2">
            <p className="font-semibold">권장 판단/처분 방향</p>
            <p className="mt-1">{sentencingAnalysis.recommendedDirection}</p>
            <p className="mt-2 text-xs">{sentencingAnalysis.rationale}</p>
          </div>
        </div>
      )}

      {verdict && (
        <div className="mt-4 space-y-3">
          {verdict.verdictOptions.map((option) => (
            <div key={option.option} className="rounded-lg border border-slate-200 p-4">
              <p className="text-sm font-semibold text-indigo-900">
                {option.option} · {option.title}
              </p>
              <p className="mt-2 text-sm text-slate-800">{option.decision}</p>
              <InfoList title="판단 근거" items={option.reasoning} className="mt-3" />
              <p className="mt-3 rounded-md bg-indigo-50 px-3 py-2 text-sm text-indigo-950">
                <span className="font-medium">수업 포인트:</span> {option.educationalMessage}
              </p>
            </div>
          ))}
          <InfoList title="수업 토론 질문" items={verdict.classDiscussionQuestions} />
        </div>
      )}
    </section>
  );
}

function InfoList({
  title,
  items,
  className = "",
}: {
  title: string;
  items: string[];
  className?: string;
}) {
  return (
    <div className={`rounded-lg border border-slate-200 p-3 ${className}`.trim()}>
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.length === 0 ? (
          <li>분석 결과가 없습니다.</li>
        ) : (
          items.map((item) => <li key={`${title}-${item}`}>{item}</li>)
        )}
      </ul>
    </div>
  );
}
