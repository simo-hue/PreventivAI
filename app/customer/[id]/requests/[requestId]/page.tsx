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
  const isUUID = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);

  if (previewQuoteId && isUUID(previewQuoteId)) {
    previewScenario = await getScenarioById(previewQuoteId);
  }

  const leftContent = previewQuoteId ? (
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
    <section className="bg-slate-50/50 p-6 sm:p-10 relative h-full overflow-y-auto @container">
      <Link
        href={`/customer/${id}`}
        className="inline-flex items-center text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors mb-8"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Torna ai progetti
      </Link>
      <div className="w-full max-w-[1400px] mx-auto">
        {/* Header and Description */}
        <div className="mb-12">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">{request.title}</h1>
            <Badge variant="info" className="capitalize shrink-0">{request.status}</Badge>
          </div>
          <p className="max-w-4xl text-slate-700 leading-relaxed whitespace-pre-wrap">
            {request.normalizedText || request.rawText}
          </p>
          <div className="mt-4 text-sm text-slate-500">
            Inviato il {new Date(request.createdAt).toLocaleDateString("it-IT")}
          </div>
        </div>

        {/* Separator */}
        <hr className="border-slate-200 mb-12" />

        {/* Quotes Panel */}
        <div className="flex flex-col">
          <h3 className="text-2xl font-bold text-slate-900 mb-6 px-1">Preventivi Ricevuti</h3>
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 sm:p-14 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-6 border border-slate-100">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <p className="text-slate-500 mb-6 max-w-sm leading-relaxed">
              La software house sta analizzando la tua richiesta. I preventivi appariranno qui non appena saranno pronti.
            </p>
            <Button variant="secondary" disabled className="min-w-[200px]">Nessun preventivo disponibile</Button>
          </div>
        </div>
      </div>
    </section>
  );

  const rightContent = (
    <section className="bg-slate-50 p-6 flex flex-col h-full">
      <ChatBox requestId={requestId} currentUserId={id} chatTitle="Chat Con il Team Quote It Better" />
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
