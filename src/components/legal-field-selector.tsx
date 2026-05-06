"use client";

import { LEGAL_FIELD_OPTIONS } from "@/lib/constants";
import type { LegalField } from "@/types/case";

type LegalFieldSelectorProps = {
  values: LegalField[];
  onChange: (values: LegalField[]) => void;
  onPrev: () => void;
  onNext: () => void;
};

export function LegalFieldSelector({
  values,
  onChange,
  onPrev,
  onNext,
}: LegalFieldSelectorProps) {
  const toggle = (field: LegalField) => {
    if (field === "모름") {
      onChange(["모름"]);
      return;
    }
    const withoutUnknown = values.filter((item) => item !== "모름");
    const isSelected = withoutUnknown.includes(field);
    const next = isSelected
      ? withoutUnknown.filter((item) => item !== field)
      : [...withoutUnknown, field];
    onChange(next.length > 0 ? next : ["모름"]);
  };

  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <h2 className="text-xl font-bold text-indigo-950">2단계: 법률 분야 선택</h2>
      <p className="mt-1 text-sm text-slate-600">
        여러 개를 선택할 수 있습니다. 잘 모르겠다면 모름을 선택하세요.
      </p>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        {LEGAL_FIELD_OPTIONS.map((option) => {
          const selected = values.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => toggle(option.value)}
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
      <div className="mt-4 flex justify-between">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          이전
        </button>
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
