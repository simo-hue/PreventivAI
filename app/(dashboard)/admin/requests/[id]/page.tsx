import { ScenarioDashboard } from "@/components/quote/scenario-dashboard";
import { getClientRequestById } from "@/src/server/repositories/request-repository";
import { getQuoteRunForRequest } from "@/src/server/repositories/quote-repository";
import { redirect } from "next/navigation";
import { ChatBox } from "@/components/chat/chat-box";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

import { ResizableLayout } from "@/components/layout/resizable-layout";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  const clientReq = await getClientRequestById(id);
  if (!clientReq) {
    redirect("/admin/requests");
  }

  const quoteRun = await getQuoteRunForRequest(id);

  let chatTitle = "Chat con il Cliente";
  if (clientReq.userId) {
    const admin = createSupabaseAdminClient();
    if (admin) {
      const { data: profile } = await admin.from('profiles').select('email').eq('id', clientReq.userId).maybeSingle();
      if (profile?.email) {
        chatTitle = `Chat con ${profile.email}`;
      }
    }
  }

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
    <div className="h-[calc(100vh-100px)] min-h-[600px] w-full pt-6 px-6">
      {clientReq.isManualCreation ? (
        <div className="w-full h-full pb-6">
          <ScenarioDashboard initialData={mappedRequest} />
        </div>
      ) : (
        <ResizableLayout 
          leftContent={<ScenarioDashboard initialData={mappedRequest} />}
          rightContent={<ChatBox requestId={id} currentUserId="5d65094f-d066-423c-a7ce-ef18a0f64368" isAdminView={true} chatTitle={chatTitle} />}
        />
      )}
    </div>
  );
}
