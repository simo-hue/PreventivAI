import { NextResponse } from "next/server";
import { z } from "zod";

const ClarificationSchema = z.object({
  answers: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  ),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = ClarificationSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Risposte non valide.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  return NextResponse.json({
    saved: true,
    answers: parsed.data.answers,
    nextStep: "Rilancia l'analisi con il testo aggiornato.",
  });
}
