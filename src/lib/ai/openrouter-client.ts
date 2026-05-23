import "server-only";

import OpenAI from "openai";

export function createOpenRouterClient() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    return null;
  }

  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
    defaultHeaders: {
      "HTTP-Referer": process.env.APP_PUBLIC_URL ?? "http://localhost:3000",
      "X-Title": "PreventivAI",
    },
  });
}
