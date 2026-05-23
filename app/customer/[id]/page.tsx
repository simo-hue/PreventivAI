import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { MessageSquare, FileText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Area Personale | Italians quote it better",
};

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  if (!supabase) return notFound();

  // Fetch the user's latest request
  const { data: request, error } = await supabase
    .from("client_requests")
    .select("*")
    .eq("created_by", id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* 2/3 - Sezione Progetto / Preventivi (Left) */}
      <section className="flex-[2] border-r border-slate-200 bg-white p-6 sm:p-10">
        <div className="max-w-3xl mx-auto">
          {error || !request ? (
            <div className="text-center text-slate-500 mt-20">
              <p>Nessun progetto trovato o in fase di elaborazione...</p>
            </div>
          ) : (
            <>
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
                    <p className="text-sm text-slate-500">Inviato il {new Date(request.created_at).toLocaleDateString("it-IT")}</p>
                  </div>
                </div>
                <div className="prose prose-slate max-w-none text-slate-700">
                  <p className="whitespace-pre-wrap">{request.raw_text}</p>
                </div>
              </div>
            </>
          )}

          <div className={error || !request ? "mt-20" : ""}>
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
      <section className="flex-1 bg-slate-50 p-6 flex flex-col h-screen sticky top-0">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="h-5 w-5 text-[var(--primary)]" />
          <h2 className="text-lg font-bold text-slate-900">Chat con il Team</h2>
        </div>
        
        <div className="flex-1 rounded-2xl border border-slate-200 bg-white shadow-sm flex flex-col overflow-hidden">
          <div className="flex-1 p-4 overflow-y-auto bg-slate-50/50 flex flex-col gap-4">
            {/* Messaggio placeholder */}
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-full bg-[var(--primary)] flex items-center justify-center text-white text-xs font-bold shrink-0">
                SH
              </div>
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm p-3 shadow-sm max-w-[85%] text-sm text-slate-700">
                Ciao! Abbiamo ricevuto la tua richiesta. Il nostro team la sta analizzando e ti invierà delle proposte a breve. Usa questa chat se hai domande!
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-slate-200 bg-white">
            <div className="flex gap-2">
              <input 
                type="text" 
                placeholder="Scrivi un messaggio... (In arrivo)" 
                disabled
                className="flex-1 rounded-full border border-slate-300 px-4 py-2 text-sm focus:outline-none focus:border-[var(--primary)] disabled:bg-slate-50 disabled:text-slate-400"
              />
              <Button disabled className="rounded-full px-6">Invia</Button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
