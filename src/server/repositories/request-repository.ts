import "server-only";

import { nanoid } from "nanoid";

export async function createClientRequest(args: {
  title: string;
  rawText: string;
  sourceType: "text" | "audio" | "document" | "mixed";
}) {
  return {
    id: nanoid(12),
    title: args.title,
    rawText: args.rawText,
    sourceType: args.sourceType,
    status: "draft" as const,
    createdAt: new Date().toISOString(),
  };
}
