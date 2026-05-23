import { notFound } from "next/navigation";
import { getClientRequestByIdAndUserId } from "@/src/server/repositories/request-repository";
import { FileText, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ChatBox } from "@/components/chat/chat-box";

export const metadata = {
  title: "Dettaglio Progetto | Italians quote it better",
};

export default async function CustomerProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string; requestId: string }>;
}) {
  const { id, requestId } = await params;

  // Fetch the specific request making sure it belongs to the user
  const request = await getClientRequestByIdAndUserId(requestId, id);

  if (!request) return notFound();

  return (
    <main className="flex flex-col xl:flex-row min-h-full">
      {/* 2/3 - Sezione Progetto / Preventivi (Left) */}
      <section className="flex-[2] border-r border-slate-200 bg-white p-6 sm:p-10 relative">
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

      {/* 1/3 - Sezione Chat (Right) */}
      <section className="flex-1 bg-slate-50 p-6 flex flex-col h-[calc(100vh-64px)] sticky top-0">
        <ChatBox requestId={requestId} currentUserId={id} />
      </section>
    </main>
  );
}
