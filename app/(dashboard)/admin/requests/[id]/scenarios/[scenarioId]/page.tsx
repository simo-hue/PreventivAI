import { ScenarioDetailClient } from "@/components/quote/scenario-detail-client";
import { getScenarioById } from "@/src/server/repositories/quote-repository";
import { getClientRequestById } from "@/src/server/repositories/request-repository";

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ id: string; scenarioId: string }>;
}) {
  const { id, scenarioId } = await params;

  // Carica scenario e richiesta in parallelo dal DB (fonte di verità)
  const [scenario, clientReq] = await Promise.all([
    getScenarioById(scenarioId),
    getClientRequestById(id),
  ]);

  return (
    <ScenarioDetailClient
      scenarioId={scenarioId}
      requestId={id}
      initialScenario={scenario}
      requestInfo={
        clientReq
          ? { id: clientReq.id, title: clientReq.title }
          : null
      }
    />
  );
}
