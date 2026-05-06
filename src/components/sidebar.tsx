"use client";

import type { SavedCaseRecord } from "@/types/case";
import { APP_NAME, STORAGE_NOTICE } from "@/lib/constants";

type SidebarProps = {
  records: SavedCaseRecord[];
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onNewCase: () => void;
  onSelectRecord: (record: SavedCaseRecord) => void;
  onDeleteRecord: (recordId: string) => void;
  onClearAll: () => void;
};

export function Sidebar({
  records,
  isCollapsed,
  onToggleCollapse,
  onNewCase,
  onSelectRecord,
  onDeleteRecord,
  onClearAll,
}: SidebarProps) {
  return (
    <aside
      className={`border-r border-indigo-100 bg-white transition-all duration-200 ${
        isCollapsed ? "w-16" : "w-80"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between border-b border-indigo-100 p-4">
          {!isCollapsed && (
            <h1 className="text-lg font-bold text-indigo-950">{APP_NAME}</h1>
          )}
          <button
            type="button"
            className="rounded-md border border-indigo-200 px-2 py-1 text-sm text-indigo-700 hover:bg-indigo-50"
            onClick={onToggleCollapse}
          >
            {isCollapsed ? ">" : "<"}
          </button>
        </div>

        <div className="border-b border-indigo-100 p-3">
          <button
            type="button"
            onClick={onNewCase}
            className="w-full rounded-lg bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            {isCollapsed ? "+" : "+ 새 사건 작성"}
          </button>
        </div>

        {!isCollapsed && (
          <>
            <div className="flex-1 overflow-y-auto p-3">
              <p className="mb-2 text-xs text-indigo-800/80">{STORAGE_NOTICE}</p>
              <ul className="space-y-2">
                {records.length === 0 && (
                  <li className="rounded-lg border border-dashed border-indigo-200 p-3 text-sm text-slate-500">
                    아직 저장된 사건이 없습니다.
                  </li>
                )}
                {records.map((record) => (
                  <li
                    key={record.id}
                    className="rounded-lg border border-indigo-100 bg-indigo-50/40 p-3"
                  >
                    <button
                      type="button"
                      className="w-full text-left"
                      onClick={() => onSelectRecord(record)}
                    >
                      <p className="truncate text-sm font-semibold text-indigo-900">
                        {record.title || "제목 없는 사건"}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {new Date(record.updatedAt).toLocaleString("ko-KR")}
                      </p>
                      <p className="mt-1 text-xs text-slate-600">
                        {record.caseType} ·{" "}
                        {record.legalFields.length > 0
                          ? record.legalFields.join(", ")
                          : "법률 분야 미선택"}
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteRecord(record.id)}
                      className="mt-2 text-xs text-rose-600 hover:underline"
                    >
                      삭제
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border-t border-indigo-100 p-3">
              <button
                type="button"
                onClick={onClearAll}
                className="w-full rounded-md border border-rose-200 px-3 py-2 text-sm text-rose-700 hover:bg-rose-50"
              >
                전체 기록 삭제
              </button>
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
