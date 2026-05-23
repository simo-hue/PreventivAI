import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

const ClarificationSchema = z.object({
  answers: z.array(
    z.object({
      question: z.string().min(1),
      answer: z.string().min(1),
    }),
  ),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const payload = await request.json();
  const parsed = ClarificationSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Risposte non valide.", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    return NextResponse.json({ error: "Supabase error" }, { status: 500 });
  }

  // 1. Update clarification_questions table
  for (const item of parsed.data.answers) {
    await admin
      .from("clarification_questions")
      .update({ answer: item.answer, answered_at: new Date().toISOString() })
      .eq("client_request_id", id)
      .eq("question", item.question);
  }

  // 2. Append to client_requests raw_text
  const { data: clientReq } = await admin
    .from("client_requests")
    .select("raw_text")
    .eq("id", id)
    .single();

  if (clientReq) {
    const appendedText = `${clientReq.raw_text}\n\nRisposte cliente:\n${parsed.data.answers
      .map((item) => `Q: ${item.question}\nA: ${item.answer}`)
      .join("\n\n")}`;
      
    await admin
      .from("client_requests")
      .update({ raw_text: appendedText, updated_at: new Date().toISOString() })
      .eq("id", id);
  }

  return NextResponse.json({
    saved: true,
  });
}
