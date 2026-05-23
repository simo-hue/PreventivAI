import "server-only";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { requireUser } from "@/src/lib/auth/require-user";
import type { RateCard } from "@/src/lib/quotes/types";

export type EditableRateCard = RateCard & { status: "Attivo" | "Inattivo" };

export async function getActiveRateCards(): Promise<EditableRateCard[]> {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const user = await requireUser();
  
  const { data, error } = await admin
    .from("role_rate_cards")
    .select("id, role_name, seniority, hourly_rate_eur, competence_scope, active")
    .eq("organization_id", user.organizationId)
    .order("hourly_rate_eur", { ascending: false });

  if (error) {
    console.error("[RateCardRepo] Errore fetch rate cards:", error.message);
    return [];
  }

  return (data || []).map((row) => ({
    id: row.id,
    roleName: row.role_name,
    seniority: row.seniority,
    hourlyRateEur: Number(row.hourly_rate_eur),
    competenceScope: row.competence_scope || "",
    status: row.active ? "Attivo" : "Inattivo"
  }));
}

export async function updateRateCards(cards: EditableRateCard[]) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase non configurato");

  const user = await requireUser();

  const updates = cards.map(c => ({
    id: c.id,
    organization_id: user.organizationId,
    role_name: c.roleName,
    seniority: c.seniority,
    hourly_rate_eur: c.hourlyRateEur,
    competence_scope: c.competenceScope,
    active: c.status === "Attivo",
  }));

  const { error } = await admin
    .from("role_rate_cards")
    .upsert(updates, { onConflict: "id" });

  if (error) {
    throw new Error(`Errore durante l'aggiornamento del tariffario: ${error.message}`);
  }
}
