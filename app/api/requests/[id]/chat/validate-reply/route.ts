import { NextResponse } from "next/server";
import { streamObject } from "ai";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { requireUser } from "@/src/lib/auth/require-user";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { validateReplyPrompt } from "@/src/lib/ai/prompts/validate-reply";
import { ValidateReplySchema } from "@/src/lib/ai/schemas";

// Admin user ID is used when the system/AI speaks
const ADMIN_USER_ID = "5d65094f-d066-423c-a7ce-ef18a0f64368";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    
    if (!admin) {
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }

    // Verify access
    const { data: clientReq } = await admin
      .from("client_requests")
      .select("organization_id")
      .eq("id", id)
      .single();

    if (!clientReq || clientReq.organization_id !== user.organizationId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Fetch chat history
    const { data: messages, error } = await admin
      .from("chat_messages")
      .select("content, sender_id, created_at, profiles!chat_messages_sender_id_fkey(full_name)")
      .eq("client_request_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const chatTranscript = messages
      ?.map((m) => {
        const isSystemOrAdmin = m.sender_id === ADMIN_USER_ID;
        const role = isSystemOrAdmin ? "Assistente AI/Admin" : "Cliente";
        return `[${role}]: ${m.content}`;
      })
      .join("\n\n") || "Nessun messaggio nella chat.";

    const google = createGoogleGenerativeAI({
      apiKey: process.env.GEMINI_API_KEY || "",
    });
    
    const model = google("gemini-2.5-flash");

    const result = streamObject({
      model,
      system: validateReplyPrompt,
      prompt: `Cronologia della chat:\n\n${chatTranscript}\n\nValuta l'ultimo messaggio del cliente.`,
      schema: ValidateReplySchema,
      maxRetries: 2,
      onFinish: async ({ object }) => {
        if (object?.aiResponse) {
          // Insert AI response into chat
          const { error: insertError } = await admin
            .from("chat_messages")
            .insert({
              organization_id: user.organizationId,
              client_request_id: id,
              sender_id: ADMIN_USER_ID,
              content: object.aiResponse,
            });

          if (insertError) {
            console.error("Failed to save AI response to chat:", insertError);
          }
        }
      }
    });

    return result.toTextStreamResponse();
  } catch (error) {
    console.error("Validation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Error validating reply" }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
