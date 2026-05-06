"use client";

import { useState } from "react";

import { GEMINI_NOTICE } from "@/lib/constants";

type SettingsModalProps = {
  initialApiKey: string;
  initialLawApiKey: string;
  onClose: () => void;
  onSave: (payload: { geminiApiKey: string; lawApiKey: string }) => void;
  onDeleteGeminiKey: () => void;
  onDeleteLawApiKey: () => void;
};

export function SettingsModal({
  initialApiKey,
  initialLawApiKey,
  onClose,
  onSave,
  onDeleteGeminiKey,
  onDeleteLawApiKey,
}: SettingsModalProps) {
  const [value, setValue] = useState(initialApiKey);
  const [lawValue, setLawValue] = useState(initialLawApiKey);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const handleTestConnection = async () => {
    if (!value.trim()) {
      setStatus("Gemini API 키를 먼저 입력해주세요.");
      return;
    }
    setLoading(true);
    setStatus("");
    try {
      const response = await fetch("/api/ai/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: value.trim() }),
      });

      const data = (await response.json()) as { message?: string; error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "연결 테스트에 실패했습니다.");
      }
      setStatus(data.message ?? "연결 테스트에 성공했습니다.");
    } catch (error) {
      setStatus(
        error instanceof Error
          ? error.message
          : "AI 연결에 실패했습니다. Gemini API 키를 확인해주세요.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-indigo-950">AI 사용 설정</h2>
            <p className="mt-1 text-sm text-slate-600">
              이 웹앱은 Gemini API를 사용해 사건을 정리하고, 판례를 요약하며, AI 판결문을 만듭니다.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-2 py-1 text-sm"
          >
            닫기
          </button>
        </div>

        <label className="mb-2 block text-sm font-semibold text-slate-700">
          Gemini API 키
        </label>
        <input
          type="password"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="AIza..."
        />
        <label className="mb-2 mt-4 block text-sm font-semibold text-slate-700">
          국가법령정보 API 키 (LAW_API_OC)
        </label>
        <input
          type="password"
          value={lawValue}
          onChange={(event) => setLawValue(event.target.value)}
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none"
          placeholder="법령 API OC 키"
        />

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onSave({ geminiApiKey: value, lawApiKey: lawValue })}
            className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            전체 저장
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={loading}
            className="rounded-md border border-indigo-200 px-3 py-2 text-sm text-indigo-800 hover:bg-indigo-50 disabled:opacity-50"
          >
            연결 테스트
          </button>
          <button
            type="button"
            onClick={onDeleteGeminiKey}
            className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
          >
            Gemini 키 삭제
          </button>
          <button
            type="button"
            onClick={onDeleteLawApiKey}
            className="rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
          >
            법령 키 삭제
          </button>
        </div>

        {status && <p className="mt-3 text-sm text-slate-700">{status}</p>}

        <ul className="mt-4 space-y-1 rounded-lg bg-indigo-50 p-3 text-xs text-indigo-900">
          {GEMINI_NOTICE.map((notice) => (
            <li key={notice}>- {notice}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
