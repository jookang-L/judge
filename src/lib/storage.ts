import type { SavedCaseRecord } from "@/types/case";

const GEMINI_KEY_STORAGE_KEY = "aiJudge.geminiApiKey";
const LAW_API_KEY_STORAGE_KEY = "aiJudge.lawApiOc";
const CASE_HISTORY_STORAGE_KEY = "aiJudge.caseHistory";

const isBrowser = () => typeof window !== "undefined";

export function loadGeminiApiKey(): string {
  if (!isBrowser()) {
    return "";
  }
  return window.localStorage.getItem(GEMINI_KEY_STORAGE_KEY) ?? "";
}

export function saveGeminiApiKey(apiKey: string): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(GEMINI_KEY_STORAGE_KEY, apiKey.trim());
}

export function clearGeminiApiKey(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(GEMINI_KEY_STORAGE_KEY);
}

export function loadLawApiKey(): string {
  if (!isBrowser()) {
    return "";
  }
  return window.localStorage.getItem(LAW_API_KEY_STORAGE_KEY) ?? "";
}

export function saveLawApiKey(apiKey: string): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(LAW_API_KEY_STORAGE_KEY, apiKey.trim());
}

export function clearLawApiKey(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(LAW_API_KEY_STORAGE_KEY);
}

export function loadCaseHistory(): SavedCaseRecord[] {
  if (!isBrowser()) {
    return [];
  }

  const raw = window.localStorage.getItem(CASE_HISTORY_STORAGE_KEY);
  if (!raw) {
    return [];
  }

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as SavedCaseRecord[]) : [];
  } catch {
    return [];
  }
}

export function saveCaseHistory(records: SavedCaseRecord[]): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(CASE_HISTORY_STORAGE_KEY, JSON.stringify(records));
}

export function upsertCaseRecord(record: SavedCaseRecord): SavedCaseRecord[] {
  const history = loadCaseHistory();
  const nextHistory = [record, ...history.filter((item) => item.id !== record.id)];
  saveCaseHistory(nextHistory);
  return nextHistory;
}

export function removeCaseRecord(recordId: string): SavedCaseRecord[] {
  const nextHistory = loadCaseHistory().filter((item) => item.id !== recordId);
  saveCaseHistory(nextHistory);
  return nextHistory;
}

export function clearCaseHistory(): void {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(CASE_HISTORY_STORAGE_KEY);
}
