"use client";

import type {
  AiVerdictAnalysis,
} from "@/types/case";

type VerdictPanelProps = {
  standaloneAnalysis?: AiVerdictAnalysis;
  precedentAnalysis?: AiVerdictAnalysis;
  loadingStandalone: boolean;
  loadingPrecedent: boolean;
  hasPrecedentContext: boolean;
  onGenerateStandalone: () => Promise<void>;
  onGenerateWithPrecedent: () => Promise<void>;
};

export function VerdictPanel({
  standaloneAnalysis,
  precedentAnalysis,
  loadingStandalone,
  loadingPrecedent,
  hasPrecedentContext,
  onGenerateStandalone,
  onGenerateWithPrecedent,
}: VerdictPanelProps) {
  const hasAnyResult = Boolean(standaloneAnalysis || precedentAnalysis);

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
        <div>
          <h3 className="text-lg font-bold text-indigo-950">3단계: 책임 판단 및 AI 판결문</h3>
          <p className="mt-1 text-sm text-slate-600">
            참고 판례 없이 생성한 결과와 참고 판례를 반영한 결과를 비교할 수 있습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void onGenerateStandalone()}
            disabled={loadingStandalone}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50"
          >
            {loadingStandalone ? "생성 중..." : "판례 없이 생성"}
          </button>
          <button
            type="button"
            onClick={() => void onGenerateWithPrecedent()}
            disabled={loadingPrecedent || !hasPrecedentContext}
            className="rounded-md border border-indigo-200 px-4 py-2 text-sm font-semibold text-indigo-800 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loadingPrecedent ? "생성 중..." : "판례 반영 생성"}
          </button>
        </div>
      </div>
      {!hasPrecedentContext && (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          판례 반영 생성은 먼저 유사 판례를 선택하고 상세 보기까지 완료해야 사용할 수 있습니다.
        </p>
      )}

      {!hasAnyResult && !loadingStandalone && !loadingPrecedent && (
        <p className="mt-4 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          아직 생성된 결과가 없습니다. 두 버튼으로 각각 생성한 뒤 결과를 비교해보세요.
        </p>
      )}

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ResultCard
          title="A. 판례 없이 생성한 판결문"
          analysis={standaloneAnalysis}
          loading={loadingStandalone}
          emptyMessage="아직 생성되지 않았습니다."
        />
        <ResultCard
          title="B. 참고 판례 반영 판결문"
          analysis={precedentAnalysis}
          loading={loadingPrecedent}
          emptyMessage={
            hasPrecedentContext
              ? "아직 생성되지 않았습니다."
              : "참고 판례를 선택하고 상세 보기까지 완료하면 생성할 수 있습니다."
          }
        />
      </div>
    </section>
  );
}

function ResultCard({
  title,
  analysis,
  loading,
  emptyMessage,
}: {
  title: string;
  analysis?: AiVerdictAnalysis;
  loading: boolean;
  emptyMessage: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-sm font-semibold text-indigo-900">{title}</p>
      {loading && (
        <p className="mt-2 text-sm text-indigo-700">AI가 판결문 초안을 생성하고 있어요.</p>
      )}
      {!loading && !analysis && (
        <p className="mt-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {emptyMessage}
        </p>
      )}
      {analysis && (
        <div className="mt-3 space-y-3">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoList title="우리 사건과 공통점" items={analysis.comparison.commonPoints} />
            <InfoList title="우리 사건과 차이점" items={analysis.comparison.differences} />
            <InfoList title="판단에 중요한 차이" items={analysis.comparison.impactfulDifferences} />
            <InfoList title="집중할 법적 쟁점" items={analysis.comparison.legalIssueFocus} />
          </div>

          <div className="rounded-lg border border-slate-200 p-4 text-sm text-slate-800">
            <p className="font-semibold text-slate-900">책임 판단 기준</p>
            <div className="mt-2 space-y-2">
              <p>
                <span className="font-medium">피해자/원고 관점:</span>{" "}
                {analysis.responsibilityAnalysis.plaintiffOrVictim}
              </p>
              <p>
                <span className="font-medium">행위자/피고 관점:</span>{" "}
                {analysis.responsibilityAnalysis.defendantOrActor}
              </p>
              <p>
                <span className="font-medium">학교/보호자 관점:</span>{" "}
                {analysis.responsibilityAnalysis.schoolOrGuardian}
              </p>
              <p>
                <span className="font-medium">기타 관점:</span> {analysis.responsibilityAnalysis.others}
              </p>
            </div>
            <InfoList title="책임 판단 메모" items={analysis.responsibilityAnalysis.notes} className="mt-3" />
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <InfoList title="가중 요소" items={analysis.sentencingAnalysis.aggravatingFactors} />
            <InfoList title="감경 요소" items={analysis.sentencingAnalysis.mitigatingFactors} />
            <div className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 text-sm text-indigo-950 md:col-span-2">
              <p className="font-semibold">권장 판단/처분 방향</p>
              <p className="mt-1">{analysis.sentencingAnalysis.recommendedDirection}</p>
              <p className="mt-2 text-xs">{analysis.sentencingAnalysis.rationale}</p>
            </div>
          </div>

          <div className="space-y-3">
            {analysis.verdict.verdictOptions.map((option) => (
              <div key={option.option} className={`rounded-lg border p-4 shadow-sm ${getVerdictOptionTheme(option.option).container}`}>
                {(() => {
                  const theme = getVerdictOptionTheme(option.option);
                  const highlights = extractOutcomeHighlights(option.decision);
                  return (
                    <>
                      <p
                        className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-bold ${theme.badge}`}
                      >
                        {option.option}
                      </p>
                      <p className={`mt-2 text-sm font-semibold ${theme.title}`}>{option.title}</p>
                      <div className={`mt-3 rounded-md border px-3 py-3 ${theme.summary}`}>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                          최종 결론
                        </p>
                        <p className={`mt-1 text-base font-bold ${theme.decision}`}>
                          {option.decision}
                        </p>
                        {highlights.length > 0 && (
                          <div className="mt-2 flex flex-wrap gap-1.5">
                            {highlights.map((item) => (
                              <span
                                key={`${option.option}-${item}`}
                                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${theme.chip}`}
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <InfoList title="판단 근거" items={option.reasoning} className="mt-3" />
                    </>
                  );
                })()}
              </div>
            ))}
            <InfoList title="수업 토론 질문" items={analysis.verdict.classDiscussionQuestions} />
          </div>
        </div>
      )}
    </div>
  );
}

function getVerdictOptionTheme(option: "A안" | "B안" | "C안") {
  if (option === "A안") {
    return {
      container: "border-indigo-200 bg-indigo-50/60",
      badge: "bg-indigo-600 text-white",
      title: "text-indigo-950",
      summary: "border-indigo-200 bg-white/80",
      decision: "text-indigo-950",
      chip: "bg-indigo-100 text-indigo-900",
    };
  }
  if (option === "B안") {
    return {
      container: "border-emerald-200 bg-emerald-50/70",
      badge: "bg-emerald-600 text-white",
      title: "text-emerald-950",
      summary: "border-emerald-200 bg-white/85",
      decision: "text-emerald-950",
      chip: "bg-emerald-100 text-emerald-900",
    };
  }
  return {
    container: "border-amber-200 bg-amber-50/80",
    badge: "bg-amber-600 text-white",
    title: "text-amber-950",
    summary: "border-amber-200 bg-white/90",
    decision: "text-amber-950",
    chip: "bg-amber-100 text-amber-900",
  };
}

function extractOutcomeHighlights(decision: string): string[] {
  const tokens: string[] = [];
  const add = (value: string) => {
    const trimmed = value.trim();
    if (trimmed && !tokens.includes(trimmed)) {
      tokens.push(trimmed);
    }
  };

  const regexes = [
    /\d+\s*년/g,
    /\d+\s*개월/g,
    /\d+\s*월/g,
    /\d+\s*만\s*원/g,
    /\d+\s*원/g,
  ];
  for (const regex of regexes) {
    const matched = decision.match(regex) ?? [];
    for (const item of matched) {
      add(item);
    }
  }

  const keywords = [
    "유죄",
    "무죄",
    "징역",
    "금고",
    "벌금",
    "집행유예",
    "선고유예",
    "보호관찰",
    "사회봉사",
    "수강명령",
    "보호처분",
    "접근금지",
    "손해배상",
    "기각",
    "인용",
    "합의 권고",
  ];
  for (const keyword of keywords) {
    if (decision.includes(keyword)) {
      add(keyword);
    }
  }

  return tokens.slice(0, 5);
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
