"use client";

type SingleInputPanelProps = {
  value: string;
  errorMessage: string;
  onChange: (value: string) => void;
  onPrev: () => void;
  onSubmit: () => void;
};

export function SingleInputPanel({
  value,
  errorMessage,
  onChange,
  onPrev,
  onSubmit,
}: SingleInputPanelProps) {
  return (
    <section className="rounded-xl bg-white p-5 shadow-sm ring-1 ring-indigo-100">
      <h2 className="text-xl font-bold text-indigo-950">한 번에 입력하기</h2>
      <p className="mt-1 text-sm text-slate-600">
        사건 내용을 자유롭게 작성하세요. AI가 단계별 질문 형식으로 정리한 뒤 사건 요약을 생성합니다.
      </p>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="사건에 대해 아는 내용을 한 번에 입력하세요."
        className="mt-4 h-56 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
      />
      {errorMessage && <p className="mt-2 text-sm text-rose-600">{errorMessage}</p>}
      <div className="mt-4 flex justify-between gap-2">
        <button
          type="button"
          onClick={onPrev}
          className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          이전
        </button>
        <button
          type="button"
          onClick={onSubmit}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
        >
          AI 사건 정리하기
        </button>
      </div>
    </section>
  );
}
