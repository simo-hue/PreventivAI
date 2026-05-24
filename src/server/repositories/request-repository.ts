/* eslint-disable @typescript-eslint/no-explicit-any */
import "server-only";

import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import { requireUser } from "@/src/lib/auth/require-user";

export async function createClientRequest(args: {
  title: string;
  rawText: string;
  sourceType: "text" | "audio" | "document" | "mixed";
  customerId?: string;
  isManualCreation?: boolean;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase non configurato");

  const user = await requireUser();
  const createdBy = args.customerId || (user.id === "demo-user" ? null : user.id);

  const { data, error } = await admin
    .from("client_requests")
    .insert({
      organization_id: user.organizationId,
      created_by: createdBy,
      title: args.title,
      raw_text: args.rawText,
      source_type: args.sourceType,
      status: "draft",
      is_manual_creation: args.isManualCreation ?? false,
    })
    .select()
    .single();

  if (error) {
    console.error("[RequestRepo] insert error:", error);
    throw new Error("Errore durante la creazione della richiesta.");
  }

  return {
    id: data.id,
    title: data.title,
    rawText: data.raw_text,
    sourceType: data.source_type,
    status: data.status,
    createdAt: data.created_at,
    isManualCreation: data.is_manual_creation,
  };
}

export async function getClientRequestById(id: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("client_requests")
    .select("*, quote_runs(id, llm_raw_response, quote_scenarios(id, is_approved))")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;

  const quoteRun = data.quote_runs?.[data.quote_runs.length - 1];

  let analysis = quoteRun?.llm_raw_response ?? undefined;
  
  // Controlla robustamente se C'E' ALMENO UNO scenario approvato in TUTTI i quote runs
  const isApproved = data.quote_runs?.some((qr: any) => 
    qr.quote_scenarios?.some((qs: any) => qs.is_approved)
  ) || false;

  if (analysis && quoteRun?.quote_scenarios) {
    analysis = {
      ...analysis,
      scenarios: analysis.scenarios?.map((s: any) => {
        const dbScenario = quoteRun.quote_scenarios.find((qs: any) => qs.id === s.id);
        return {
          ...s,
          isApproved: dbScenario ? dbScenario.is_approved : s.isApproved
        };
      })
    };
  }

  return {
    id: data.id,
    title: data.title,
    rawText: data.raw_text,
    sourceType: data.source_type,
    status: data.status,
    createdAt: data.created_at,
    isManualCreation: data.is_manual_creation,
    userId: data.created_by,
    analysis,
    isApproved,
  };
}

export async function getAllClientRequests(options?: {
  status?: string;
  excludeStatus?: string;
}) {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  let query = admin
    .from("client_requests")
    .select("*, quote_runs(id, llm_raw_response, quote_scenarios(id, is_approved))")
    .order("created_at", { ascending: false });

  if (options?.status) {
    query = query.eq("status", options.status);
  }
  if (options?.excludeStatus) {
    query = query.neq("status", options.excludeStatus);
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row: any) => {
    // Ordiniamo le quote runs per ottenere l'ultima generata
    const quoteRun = row.quote_runs?.[row.quote_runs.length - 1];
    
    // Inject isApproved from quote_scenarios if available
    let analysis = quoteRun?.llm_raw_response ?? undefined;
    
    // Controlla robustamente se C'E' ALMENO UNO scenario approvato in TUTTI i quote runs
    const isApproved = row.quote_runs?.some((qr: any) => 
      qr.quote_scenarios?.some((qs: any) => qs.is_approved)
    ) || false;

    if (analysis && quoteRun?.quote_scenarios) {
      analysis = {
        ...analysis,
        scenarios: analysis.scenarios?.map((s: any) => {
          const dbScenario = quoteRun.quote_scenarios.find((qs: any) => qs.id === s.id);
          return {
            ...s,
            isApproved: dbScenario ? dbScenario.is_approved : s.isApproved
          };
        })
      };
    }

    return {
      id: row.id,
      title: row.title,
      rawText: row.raw_text,
      sourceType: row.source_type,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isManualCreation: row.is_manual_creation,
      analysis,
      isApproved,
    };
  });
}

export async function deleteClientRequest(id: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) throw new Error("Supabase non configurato");

  // TODO: Verificare che l'utente loggato possa cancellare questa risorsa se necessario.
  // Al momento lo eliminiamo con i privilegi di admin.

  const { error } = await admin.from("client_requests").delete().eq("id", id);

  if (error) {
    console.error("[RequestRepo] delete error:", error);
    throw new Error("Errore durante l'eliminazione della richiesta.");
  }

  return true;
}

export async function getAllClientRequestsByUserId(userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return [];

  const { data, error } = await admin
    .from("client_requests")
    .select("*, quote_runs(id, llm_raw_response, quote_scenarios(id, is_approved))")
    .eq("created_by", userId)
    .order("created_at", { ascending: false });

  if (error || !data) return [];

  return data.map((row: any) => {
    // Ordiniamo le quote runs per ottenere l'ultima generata
    const quoteRun = row.quote_runs?.[row.quote_runs.length - 1];

    // Inject isApproved from quote_scenarios if available
    let analysis = quoteRun?.llm_raw_response ?? undefined;
    
    // Controlla robustamente se C'E' ALMENO UNO scenario approvato in TUTTI i quote runs
    const isApproved = row.quote_runs?.some((qr: any) => 
      qr.quote_scenarios?.some((qs: any) => qs.is_approved)
    ) || false;

    if (analysis && quoteRun?.quote_scenarios) {
      analysis = {
        ...analysis,
        scenarios: analysis.scenarios?.map((s: any) => {
          const dbScenario = quoteRun.quote_scenarios.find((qs: any) => qs.id === s.id);
          return {
            ...s,
            isApproved: dbScenario ? dbScenario.is_approved : s.isApproved
          };
        })
      };
    }

    return {
      id: row.id,
      title: row.title,
      rawText: row.raw_text,
      sourceType: row.source_type,
      status: row.status,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      isManualCreation: row.is_manual_creation,
      analysis,
      isApproved,
    };
  });
}

export async function getClientRequestByIdAndUserId(requestId: string, userId: string) {
  const admin = createSupabaseAdminClient();
  if (!admin) return null;

  const { data, error } = await admin
    .from("client_requests")
    .select("*")
    .eq("id", requestId)
    .eq("created_by", userId)
    .maybeSingle();

  if (error || !data) return null;

  return {
    id: data.id,
    title: data.title,
    rawText: data.raw_text,
    sourceType: data.source_type,
    status: data.status,
    createdAt: data.created_at,
    isManualCreation: data.is_manual_creation,
    normalizedText: data.normalized_text,
  };
}
