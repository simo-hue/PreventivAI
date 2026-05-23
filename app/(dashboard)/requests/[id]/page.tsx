import { ScenarioDashboard } from "@/components/quote/scenario-dashboard";
import { getClientRequestById } from "@/src/server/repositories/request-repository";
import { getQuoteRunForRequest } from "@/src/server/repositories/quote-repository";
import { redirect } from "next/navigation";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const clientReq = await getClientRequestById(id);
  if (!clientReq) {
    redirect("/requests");
  }

  const quoteRun = await getQuoteRunForRequest(id);

  // Mappiamo nel formato atteso dalla UI (StoredRequest)
  const mappedRequest = {
    id: clientReq.id,
    title: clientReq.title,
    rawText: clientReq.rawText,
    sourceType: clientReq.sourceType,
    status: clientReq.status,
    createdAt: clientReq.createdAt,
    updatedAt: clientReq.createdAt,
    analysis: quoteRun?.llm_raw_response ?? undefined,
    quoteRunId: quoteRun?.id,
    promptVersion: quoteRun?.prompt_version,
  };

  return <ScenarioDashboard initialData={mappedRequest} />;
}
