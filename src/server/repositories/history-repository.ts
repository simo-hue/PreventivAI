import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { z } from "zod";
import { demoHistoricalProjects } from "@/src/lib/demo/history";
import { DEMO_ORGANIZATION_ID } from "@/src/lib/demo/rate-card";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";
import type { PromptContext } from "@/src/lib/ai/quote-agent";

const DEFAULT_CONTEXT_LIMIT = 5;
const MAX_CONTEXT_LIMIT = 10;
const MAX_SEARCH_TOKENS = 12;
const MAX_TEXT_LENGTH = 900;

const HistoricalProjectModuleRowSchema = z.object({
  module_name: z.string().min(1),
  module_description: z.string().nullable().optional(),
  complexity: z.enum(["low", "medium", "high", "unknown"]).nullable().optional(),
  actual_hours_by_role: z.unknown().optional(),
  notes: z.string().nullable().optional(),
});

const HistoricalProjectRowSchema = z.object({
  id: z.string().min(1),
  project_name: z.string().min(1),
  client_industry: z.string().nullable().optional(),
  project_type: z.string().nullable().optional(),
  description: z.string().nullable().optional(),
  initial_request: z.string().nullable().optional(),
  delivered_scope: z.string().nullable().optional(),
  total_actual_hours: z.union([z.number(), z.string()]).nullable().optional(),
  delivery_weeks: z.union([z.number(), z.string()]).nullable().optional(),
  risk_notes: z.string().nullable().optional(),
  tags: z.array(z.string()).nullable().optional(),
  created_at: z.string().nullable().optional(),
  historical_project_modules: z
    .array(HistoricalProjectModuleRowSchema)
    .nullable()
    .optional(),
});

type HistoricalProjectRow = z.infer<typeof HistoricalProjectRowSchema>;
type SimilarHistoricalProjects = PromptContext["similarHistoricalProjects"];

export type GetSimilarHistoricalProjectsArgs = {
  organizationId?: string;
  requestText?: string;
  limit?: number;
  supabase?: SupabaseClient | null;
};

type ProjectWithScore = {
  project: SimilarHistoricalProjects[number];
  score: number;
  createdAt: string;
};

export async function getSimilarHistoricalProjects(
  args: GetSimilarHistoricalProjectsArgs = {},
): Promise<SimilarHistoricalProjects> {
  const limit = resolveHistoricalProjectContextLimit(args.limit);
  const supabase =
    args.supabase === undefined ? createSupabaseAdminClient() : args.supabase;

  if (!supabase) {
    return normalizeHistoricalProjectsForPrompt(demoHistoricalProjectsAsRows(), {
      requestText: args.requestText,
      limit,
    });
  }

  const organizationId = args.organizationId ?? DEMO_ORGANIZATION_ID;
  const requestText = args.requestText ?? "";
  const rows = await fetchHistoricalProjectRows({
    supabase,
    organizationId,
    requestText,
    limit,
  });

  if (rows.length === 0) {
    return normalizeHistoricalProjectsForPrompt(demoHistoricalProjectsAsRows(), {
      requestText,
      limit,
    });
  }

  return normalizeHistoricalProjectsForPrompt(rows, {
    requestText,
    limit,
  });
}

export function resolveHistoricalProjectContextLimit(limit?: number) {
  const rawLimit =
    limit ?? Number.parseInt(process.env.HISTORICAL_PROJECT_CONTEXT_LIMIT ?? "", 10);

  if (!Number.isFinite(rawLimit) || rawLimit <= 0) {
    return DEFAULT_CONTEXT_LIMIT;
  }

  return Math.min(Math.floor(rawLimit), MAX_CONTEXT_LIMIT);
}

export function normalizeHistoricalProjectsForPrompt(
  rows: unknown[],
  args: { requestText?: string; limit?: number } = {},
): SimilarHistoricalProjects {
  const limit = resolveHistoricalProjectContextLimit(args.limit);
  const searchTokens = buildHistorySearchTokens(args.requestText ?? "");

  return rows
    .map((row) => HistoricalProjectRowSchema.safeParse(row))
    .filter(
      (result): result is z.ZodSafeParseSuccess<HistoricalProjectRow> =>
        result.success,
    )
    .map((result) => ({
      project: normalizeHistoricalProject(result.data),
      score: scoreHistoricalProject(result.data, searchTokens),
      createdAt: result.data.created_at ?? "",
    }))
    .filter(({ project }) => project.description.length > 0)
    .sort(compareProjectsByRelevance)
    .slice(0, limit)
    .map(({ project }) => project);
}

async function fetchHistoricalProjectRows(args: {
  supabase: SupabaseClient;
  organizationId: string;
  requestText: string;
  limit: number;
}) {
  const tokens = buildHistorySearchTokens(args.requestText);
  const candidateLimit = Math.max(args.limit * 6, args.limit);
  const structuredRows = await fetchStructuredMatches({
    ...args,
    tokens,
    candidateLimit,
  });

  if (structuredRows.length > 0) {
    return structuredRows;
  }

  return fetchTextFallbackMatches({
    ...args,
    tokens,
    candidateLimit,
  });
}

async function fetchStructuredMatches(args: {
  supabase: SupabaseClient;
  organizationId: string;
  tokens: string[];
  candidateLimit: number;
}) {
  if (args.tokens.length === 0) {
    return [];
  }

  const [fieldRows, tagRows] = await Promise.all([
    fetchRowsWithOrFilter({
      supabase: args.supabase,
      organizationId: args.organizationId,
      fields: ["project_type", "client_industry"],
      tokens: args.tokens,
      limit: args.candidateLimit,
    }),
    fetchRowsByTags(args),
  ]);

  return dedupeRows([...fieldRows, ...tagRows]);
}

async function fetchTextFallbackMatches(args: {
  supabase: SupabaseClient;
  organizationId: string;
  tokens: string[];
  candidateLimit: number;
}) {
  if (args.tokens.length === 0) {
    return fetchRecentRows(args);
  }

  return fetchRowsWithOrFilter({
    supabase: args.supabase,
    organizationId: args.organizationId,
    fields: ["description", "initial_request", "delivered_scope"],
    tokens: args.tokens,
    limit: args.candidateLimit,
  });
}

async function fetchRowsWithOrFilter(args: {
  supabase: SupabaseClient;
  organizationId: string;
  fields: string[];
  tokens: string[];
  limit: number;
}) {
  const orFilter = buildIlikeOrFilter(args.fields, args.tokens);

  if (!orFilter) {
    return [];
  }

  const { data, error } = await baseHistoryQuery(args.supabase)
    .eq("organization_id", args.organizationId)
    .or(orFilter)
    .order("created_at", { ascending: false })
    .limit(args.limit);

  if (error || !data) {
    return [];
  }

  return data;
}

async function fetchRowsByTags(args: {
  supabase: SupabaseClient;
  organizationId: string;
  tokens: string[];
  candidateLimit: number;
}) {
  const { data, error } = await baseHistoryQuery(args.supabase)
    .eq("organization_id", args.organizationId)
    .overlaps("tags", args.tokens)
    .order("created_at", { ascending: false })
    .limit(args.candidateLimit);

  if (error || !data) {
    return [];
  }

  return data;
}

async function fetchRecentRows(args: {
  supabase: SupabaseClient;
  organizationId: string;
  candidateLimit: number;
}) {
  const { data, error } = await baseHistoryQuery(args.supabase)
    .eq("organization_id", args.organizationId)
    .order("created_at", { ascending: false })
    .limit(args.candidateLimit);

  if (error || !data) {
    return [];
  }

  return data;
}

function baseHistoryQuery(supabase: SupabaseClient) {
  return supabase.from("historical_projects").select(`
    id,
    project_name,
    client_industry,
    project_type,
    description,
    initial_request,
    delivered_scope,
    total_actual_hours,
    delivery_weeks,
    risk_notes,
    tags,
    created_at,
    historical_project_modules (
      module_name,
      module_description,
      complexity,
      actual_hours_by_role,
      notes
    )
  `);
}

function buildIlikeOrFilter(fields: string[], tokens: string[]) {
  const terms = fields.flatMap((field) =>
    tokens.map((token) => `${field}.ilike.%${token}%`),
  );

  return terms.length > 0 ? terms.join(",") : null;
}

export function buildHistorySearchTokens(value: string) {
  return Array.from(
    new Set(
      value
        .toLocaleLowerCase("it-IT")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .match(/[a-z0-9]{3,}/g) ?? [],
    ),
  )
    .filter((token) => !STOP_WORDS.has(token))
    .slice(0, MAX_SEARCH_TOKENS);
}

function normalizeHistoricalProject(
  row: HistoricalProjectRow,
): SimilarHistoricalProjects[number] {
  return {
    projectName: compactText(row.project_name),
    clientIndustry: compactOptionalText(row.client_industry),
    projectType: compactOptionalText(row.project_type),
    description: compactText(row.description),
    initialRequest: compactOptionalText(row.initial_request),
    deliveredScope: compactOptionalText(row.delivered_scope),
    tags: row.tags?.map(compactText).filter(Boolean).slice(0, 12) ?? [],
    modules: (row.historical_project_modules ?? [])
      .map((module) => ({
        moduleName: compactText(module.module_name),
        description: compactOptionalText(module.module_description),
        complexity: module.complexity ?? undefined,
        actualHoursByRole: normalizeHoursByRole(module.actual_hours_by_role),
        notes: compactOptionalText(module.notes),
      }))
      .filter((module) => module.moduleName.length > 0),
    totalActualHours: normalizeNumber(row.total_actual_hours),
    deliveryWeeks: normalizeNumber(row.delivery_weeks),
    riskNotes: compactOptionalText(row.risk_notes),
  };
}

function demoHistoricalProjectsAsRows() {
  return demoHistoricalProjects.map((project, index) => ({
    id: `demo-history-${index}`,
    project_name: project.projectName,
    client_industry: project.clientIndustry,
    project_type: project.projectType,
    description: project.description,
    total_actual_hours: project.totalActualHours,
    delivery_weeks: project.deliveryWeeks,
    risk_notes: project.riskNotes,
    tags: [],
    created_at: "",
    historical_project_modules: project.modules.map((module) => ({
      module_name: module.moduleName,
      complexity: module.complexity,
      actual_hours_by_role: module.actualHoursByRole,
      notes: module.notes,
    })),
  }));
}

function normalizeHoursByRole(value: unknown): Record<string, number> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value)
      .map(([role, hours]) => [compactText(role), normalizeNumber(hours)] as const)
      .filter(
        (entry): entry is readonly [string, number] =>
          entry[0].length > 0 && entry[1] !== undefined && entry[1] >= 0,
      ),
  );
}

function scoreHistoricalProject(row: HistoricalProjectRow, tokens: string[]) {
  if (tokens.length === 0) {
    return 0;
  }

  const structuredText = [
    row.project_type,
    row.client_industry,
    ...(row.tags ?? []),
  ].join(" ");
  const fallbackText = [
    row.project_name,
    row.description,
    row.initial_request,
    row.delivered_scope,
    row.risk_notes,
  ].join(" ");

  return (
    countTokenMatches(structuredText, tokens) * 3 +
    countTokenMatches(fallbackText, tokens)
  );
}

function countTokenMatches(value: string, tokens: string[]) {
  const normalizedValue = value
    .toLocaleLowerCase("it-IT")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");

  return tokens.reduce(
    (count, token) => count + (normalizedValue.includes(token) ? 1 : 0),
    0,
  );
}

function compareProjectsByRelevance(a: ProjectWithScore, b: ProjectWithScore) {
  if (a.score !== b.score) {
    return b.score - a.score;
  }

  return b.createdAt.localeCompare(a.createdAt);
}

function dedupeRows(rows: unknown[]) {
  const seen = new Set<string>();
  const deduped: unknown[] = [];

  for (const row of rows) {
    const parsed = HistoricalProjectRowSchema.safeParse(row);
    if (!parsed.success || seen.has(parsed.data.id)) {
      continue;
    }

    seen.add(parsed.data.id);
    deduped.push(row);
  }

  return deduped;
}

function compactText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  const compacted = value.replace(/\s+/g, " ").trim();

  return compacted.length > MAX_TEXT_LENGTH
    ? `${compacted.slice(0, MAX_TEXT_LENGTH).trim()}...`
    : compacted;
}

function compactOptionalText(value: unknown) {
  const compacted = compactText(value);

  return compacted.length > 0 ? compacted : undefined;
}

function normalizeNumber(value: unknown) {
  const numberValue =
    typeof value === "number"
      ? value
      : typeof value === "string"
        ? Number.parseFloat(value)
        : Number.NaN;

  return Number.isFinite(numberValue) ? numberValue : undefined;
}

const STOP_WORDS = new Set([
  "abbiamo",
  "anche",
  "area",
  "cliente",
  "clienti",
  "come",
  "con",
  "dati",
  "del",
  "della",
  "delle",
  "deve",
  "devono",
  "gli",
  "per",
  "piu",
  "progetto",
  "richiesta",
  "sistema",
  "una",
  "uno",
  "utente",
  "utenti",
  "vogliamo",
]);
