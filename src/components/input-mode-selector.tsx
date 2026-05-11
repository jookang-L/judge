"use client";

import type { InputMode } from "@/types/case";

type InputModeSelectorProps = {
  value: InputMode;
  onSelect: (value: InputMode) => void;
  onPrev: () => void;
};

const OPTIONS: Array<{
  value: InputMode;
  title: string;
  description: string;
  example: string;
}> = [
  {
    value: "single",
    title: "사건 내용을 한 번에 입력",
    description: "사건을 자유롭게 길게 적으면 AI가 항목별로 정리해줍니다.",
    example: "예) 누가, 무엇을, 언제/어디서, 피해, 배경, 다툼점을 한 문단으로 작성",
  },
  {
    value: "step",
    title: "단계별로 입력",
    description: "6개 질문에 따라 차근차근 입력합니다.",
    example: "예) 질문 1~6을 순서대로 답변",
  },
];

export function InputModeSelector({ value, onSelect, onPrev }: InputModeSelectorProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <h2 className="text-xl font-bold text-indigo-950">3단계: 입력 방식 선택</h2>
      <p className="mt-1 text-sm text-slate-600">
        편한 방식을 선택하세요. 어떤 방식을 선택해도 AI 정리 결과는 동일하게 제공됩니다.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onSelect(option.value)}
              className={`rounded-lg border p-4 text-left transition ${
                selected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
              }`}
            >
              <p className="font-semibold text-slate-900">{option.title}</p>
              <p className="mt-1 text-sm text-slate-600">{option.description}</p>
              <p className="mt-2 text-xs text-indigo-800">{option.example}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          이전
        </button>
      </div>
    </section>
  );
}
