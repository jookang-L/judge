"use client";

import { QUESTIONS } from "@/lib/constants";
import type { QuestionAnswers } from "@/types/case";

type QuestionStepperProps = {
  answers: QuestionAnswers;
  currentIndex: number;
  errorMessage: string;
  onChange: (value: string) => void;
  onPrev: () => void;
  onNext: () => void;
  onSkip: () => void;
};

export function QuestionStepper({
  answers,
  currentIndex,
  errorMessage,
  onChange,
  onPrev,
  onNext,
  onSkip,
}: QuestionStepperProps) {
  const question = QUESTIONS[currentIndex];
  const value = answers[question.key] ?? "";
  const progress = Math.round(((currentIndex + 1) / QUESTIONS.length) * 100);
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === QUESTIONS.length - 1;

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm font-semibold text-indigo-900">
          질문 {currentIndex + 1} / {QUESTIONS.length}
        </p>
        <p className="text-sm text-slate-600">진행률 {progress}%</p>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-indigo-100">
        <div
          className="h-full bg-indigo-600 transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <h2 className="mt-5 text-xl font-bold text-indigo-950">{question.title}</h2>
      <p className="mt-2 text-sm text-slate-700">{question.description}</p>
      <p className="mt-2 rounded-md bg-indigo-50 px-3 py-2 text-xs text-indigo-900">
        예시: {question.example}
      </p>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="여기에 입력하세요."
        className="mt-4 h-36 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />

      {errorMessage && (
        <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          disabled={isFirst}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          이전
        </button>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onSkip}
            className="rounded-md border border-indigo-200 px-4 py-2 text-sm text-indigo-800 hover:bg-indigo-50"
          >
            잘 모르겠어요 / 건너뛰기
          </button>
          <button
            type="button"
            onClick={onNext}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {isLast ? "AI 사건 정리하기" : "다음"}
          </button>
        </div>
      </div>
    </section>
  );
}
