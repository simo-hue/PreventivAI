import { ScenarioDetailClient } from "@/components/quote/scenario-detail-client";

export default async function ScenarioDetailPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <ScenarioDetailClient scenarioId={scenarioId} />;
}
