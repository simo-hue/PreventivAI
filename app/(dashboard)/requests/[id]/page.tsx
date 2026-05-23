import { ScenarioDashboard } from "@/components/quote/scenario-dashboard";
import { getClientRequestById } from "@/src/server/repositories/request-repository";
import { getQuoteRunForRequest } from "@/src/server/repositories/quote-repository";
import { redirect } from "next/navigation";
import { ChatBox } from "@/components/chat/chat-box";

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

  return (
    <div className="flex flex-col xl:flex-row min-h-full gap-6 p-6">
      <div className="flex-[2] overflow-x-auto">
        <ScenarioDashboard initialData={mappedRequest} />
      </div>
      <div className="flex-1 sticky top-6 h-[calc(100vh-100px)]">
        <ChatBox requestId={id} currentUserId="5d65094f-d066-423c-a7ce-ef18a0f64368" />
      </div>
    </div>
  );
}
