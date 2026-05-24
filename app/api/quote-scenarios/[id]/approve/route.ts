import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { revalidatePath } from "next/cache";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const admin = createSupabaseAdminClient();
    
    if (!admin) {
      return NextResponse.json({ error: "Supabase non configurato" }, { status: 500 });
    }

    // Qui in un contesto reale verificheremmo che l'utente loggato (se presente) 
    // sia il proprietario della request. Per il momento usiamo l'admin client per RLS
    // visto che i customer interagiscono in chat dal lato cliente o senza login completo in alcuni casi.
    
    const { error } = await admin
      .from("quote_scenarios")
      .update({ is_approved: true })
      .eq("id", id);

    if (error) {
      console.error("[ApproveScenario] Errore aggiornamento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    revalidatePath("/", "layout");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ApproveScenario] Eccezione:", error);
    return NextResponse.json(
      { error: "Errore interno del server" },
      { status: 500 }
    );
  }
}
