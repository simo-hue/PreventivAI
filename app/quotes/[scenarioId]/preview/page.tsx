import { QuotePreviewClient } from "@/components/quote/quote-preview-client";
import { getScenarioById } from "@/src/server/repositories/quote-repository";
import { getClientRequestById } from "@/src/server/repositories/request-repository";

export default async function QuotePreviewPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const scenario = await getScenarioById(scenarioId);
  
  let request = null;
  if (scenario?.clientRequestId) {
    request = await getClientRequestById(scenario.clientRequestId);
  }

  return (
    <QuotePreviewClient 
      scenarioId={scenarioId} 
      initialScenario={scenario} 
      initialRequest={request as unknown as import("@/src/lib/demo/storage").StoredRequest} 
      backUrl={request ? `/admin/requests/${request.id}/scenarios/${scenarioId}` : undefined}
    />
  );
}
