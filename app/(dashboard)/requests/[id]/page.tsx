import { ScenarioDashboard } from "@/components/quote/scenario-dashboard";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <ScenarioDashboard requestId={id} />;
}
