import { QuotePreviewClient } from "@/components/quote/quote-preview-client";

export default async function QuotePreviewPage({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  return <QuotePreviewClient scenarioId={scenarioId} />;
}
