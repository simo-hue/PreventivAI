import { NextResponse } from "next/server";
import { z } from "zod";
import { createClientRequest } from "@/src/server/repositories/request-repository";

const CreateRequestSchema = z.object({
  title: z.string().min(3),
  rawText: z.string().min(20),
  sourceType: z.enum(["text", "audio", "document", "mixed"]).default("text"),
  customerId: z.string().optional(),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = CreateRequestSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Dati richiesta non validi.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const clientRequest = await createClientRequest(parsed.data);

  return NextResponse.json(clientRequest, { status: 201 });
}
