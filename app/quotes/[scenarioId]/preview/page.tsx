import { QuotePreviewClient } from "@/components/quote/quote-preview-client";
import { getScenarioById } from "@/src/server/repositories/quote-repository";

export default async function QuotePreviewPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const scenario = await getScenarioById(scenarioId);
  return <QuotePreviewClient scenarioId={scenarioId} initialScenario={scenario} />;
}
