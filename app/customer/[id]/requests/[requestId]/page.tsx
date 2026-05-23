import { notFound } from "next/navigation";
import { getClientRequestByIdAndUserId } from "@/src/server/repositories/request-repository";
import { getScenarioById } from "@/src/server/repositories/quote-repository";
import { FileText, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChatBox } from "@/components/chat/chat-box";
import { ResizableLayout } from "@/components/layout/resizable-layout";
import { QuotePreviewClient } from "@/components/quote/quote-preview-client";

export const metadata = {
  title: "Dettaglio Progetto | Italians quote it better",
};

export default async function CustomerProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; requestId: string }>;
  searchParams: Promise<{ previewQuoteId?: string }>;
}) {
  const { id, requestId } = await params;
  const { previewQuoteId } = await searchParams;

  // Fetch the specific request making sure it belongs to the user
  const request = await getClientRequestByIdAndUserId(requestId, id);

  if (!request) return notFound();

  let previewScenario = null;
  if (previewQuoteId) {
    previewScenario = await getScenarioById(previewQuoteId);
  }

  const leftContent = previewQuoteId && previewScenario ? (
    <section className="relative h-full flex flex-col bg-slate-50">
      <div className="p-4 border-b border-slate-200 bg-white flex items-center justify-between z-10 shadow-sm relative">
        <Link 
          href="?" 
          className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Chiudi preview e torna al progetto
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <QuotePreviewClient 
           scenarioId={previewQuoteId} 
           initialScenario={previewScenario} 
           initialRequest={{
             id: request.id,
             title: request.title,
             status: request.status,
             analysis: { summary: request.normalizedText || request.rawText }
           } as any} 
        />
      </div>
    </section>
  ) : (
    <section className="bg-white p-6 sm:p-10 relative h-full overflow-y-auto">
      <Link 
        href={`/customer/${id}`}
        className="absolute top-6 left-6 sm:top-10 sm:left-10 flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna ai progetti
      </Link>
      <div className="max-w-3xl mx-auto pt-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Il tuo Progetto</h1>
          <Badge variant="info" className="capitalize">{request.status}</Badge>
        </div>
        
        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-slate-900">{request.title}</h2>
              <p className="text-sm text-slate-500">Inviato il {new Date(request.createdAt).toLocaleDateString("it-IT")}</p>
            </div>
          </div>
          <div className="prose prose-slate max-w-none text-slate-700">
            <p className="whitespace-pre-wrap">{request.rawText}</p>
          </div>
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900 mb-4">Preventivi Ricevuti</h3>
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="text-slate-500 mb-4">
              La software house sta analizzando la tua richiesta. I preventivi appariranno qui non appena saranno pronti.
            </p>
            <Button variant="secondary" disabled>Nessun preventivo disponibile</Button>
          </div>
        </div>
      </div>
    </section>
  );

  const rightContent = (
    <section className="bg-slate-50 p-6 flex flex-col h-full">
      <ChatBox requestId={requestId} currentUserId={id} />
    </section>
  );

  return (
    <main className="h-[calc(100vh-64px)] min-h-[600px] w-full">
      <ResizableLayout 
        leftContent={leftContent}
        rightContent={rightContent}
      />
    </main>
  );
}
