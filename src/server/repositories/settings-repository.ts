import "server-only";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export type AppSettings = {
  organizationId: string;
  pmPercentage: number;
  currency: string;
  riskBufferPercentage: number;
};

const DEFAULT_SETTINGS = {
  pmPercentage: 0.10,
  currency: "EUR",
  riskBufferPercentage: 0,
};

export async function getAppSettings(organizationId: string): Promise<AppSettings> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client non inizializzato.");
  }

  const { data, error } = await supabase
    .from("app_settings")
    .select("*")
    .eq("organization_id", organizationId)
    .maybeSingle();

  if (error) {
    console.error("Errore durante il recupero di app_settings:", error);
    throw error;
  }

  if (!data) {
    return {
      organizationId,
      ...DEFAULT_SETTINGS,
    };
  }

  return {
    organizationId: data.organization_id,
    pmPercentage: Number(data.pm_percentage),
    currency: data.currency,
    riskBufferPercentage: Number(data.risk_buffer_percentage),
  };
}

export async function updateAppSettings(
  organizationId: string,
  settings: Omit<AppSettings, "organizationId">,
): Promise<AppSettings> {
  const supabase = createSupabaseAdminClient();
  if (!supabase) {
    throw new Error("Supabase admin client non inizializzato.");
  }

  const { data, error } = await supabase
    .from("app_settings")
    .upsert({
      organization_id: organizationId,
      pm_percentage: settings.pmPercentage,
      currency: settings.currency,
      risk_buffer_percentage: settings.riskBufferPercentage,
      updated_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("Errore durante l'aggiornamento di app_settings:", error);
    throw new Error(error?.message ?? "Impossibile aggiornare i parametri di pricing.");
  }

  return {
    organizationId: data.organization_id,
    pmPercentage: Number(data.pm_percentage),
    currency: data.currency,
    riskBufferPercentage: Number(data.risk_buffer_percentage),
  };
}
