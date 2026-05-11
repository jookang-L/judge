import { GoogleGenAI } from "@google/genai";

export const GEMINI_DEFAULT_MODEL = "gemini-3-flash-preview";

export function createGeminiClient(apiKey: string): GoogleGenAI {
  if (!apiKey?.trim()) {
    throw new Error("Gemini API 키가 없습니다.");
  }
  return new GoogleGenAI({ apiKey: apiKey.trim() });
}

export function extractJsonFromResponse(text: string): string {
  const trimmed = text.trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fenced?.[1]) {
    return fenced[1].trim();
  }
  return trimmed;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function extractProviderErrorMessage(error: unknown): string {
  if (error instanceof Error && error.message) {
    return error.message;
  }
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

export function isRetryableModelError(message: string): boolean {
  const lower = message.toLowerCase();
  return (
    lower.includes("503") ||
    lower.includes("unavailable") ||
    lower.includes("high demand") ||
    lower.includes("temporarily") ||
    lower.includes("try again later")
  );
}

export async function generateContentWithRetry({
  ai,
  model = GEMINI_DEFAULT_MODEL,
  contents,
  maxAttempts = 3,
  baseDelayMs = 700,
}: {
  ai: GoogleGenAI;
  model?: string;
  contents: string;
  maxAttempts?: number;
  baseDelayMs?: number;
}) {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await ai.models.generateContent({
        model,
        contents,
      });
    } catch (error) {
      lastError = error;
      const message = extractProviderErrorMessage(error);
      if (!isRetryableModelError(message) || attempt === maxAttempts) {
        throw error;
      }
      await sleep(baseDelayMs * attempt);
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("AI 모델 응답을 받지 못했습니다.");
}
