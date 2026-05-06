"use client";

import { CASE_TYPE_OPTIONS } from "@/lib/constants";
import type { CaseType } from "@/types/case";

type CaseTypeSelectorProps = {
  value: CaseType;
  onChange: (value: CaseType) => void;
  onNext: () => void;
};

export function CaseTypeSelector({ value, onChange, onNext }: CaseTypeSelectorProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <h2 className="text-xl font-bold text-indigo-950">1단계: 사건 유형 선택</h2>
      <p className="mt-1 text-sm text-slate-600">
        사건의 성격에 가장 가까운 항목을 선택하세요.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {CASE_TYPE_OPTIONS.map((option) => {
          const selected = value === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={`rounded-lg border p-4 text-left transition ${
                selected
                  ? "border-indigo-500 bg-indigo-50"
                  : "border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40"
              }`}
            >
              <p className="font-semibold text-slate-900">{option.value}</p>
              <p className="mt-1 text-sm text-slate-600">{option.description}</p>
              <p className="mt-2 text-xs text-indigo-800">예시: {option.example}</p>
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={onNext}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          다음
        </button>
      </div>
    </section>
  );
}
