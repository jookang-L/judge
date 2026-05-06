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
