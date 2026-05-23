"use client";

import { useState } from "react";
import { ArrowRight, FileText, Plus, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardBody } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/src/lib/supabase/client";

const statusLabel: Record<string, string> = {
  draft: "Bozza",
  analyzing: "In analisi",
  needs_clarification: "Richiede chiarimenti",
  quoted: "Preventivato",
  delivered: "Consegnato",
  error: "Errore",
};

export function CustomerRequestList({
  requests,
  userId,
}: {
  requests: any[];
  userId: string;
}) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description) return;
    
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          rawText: description,
          sourceType: "text",
          customerId: userId,
        }),
      });

      if (!response.ok) {
        throw new Error("Errore durante la creazione");
      }

      setIsModalOpen(false);
      setTitle("");
      setDescription("");
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Si è verificato un errore. Riprova.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">I tuoi Progetti</h1>
          <p className="mt-1 text-slate-500">Visualizza o aggiungi nuove richieste di preventivo.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Nuovo Progetto
        </Button>
      </div>

      {requests.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 mb-4">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-900">Nessun progetto trovato</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Non hai ancora inviato nessuna richiesta. Crea un nuovo progetto per iniziare a ricevere preventivi dal team.
          </p>
          <Button onClick={() => setIsModalOpen(true)} className="mt-6">
            <Plus className="mr-2 h-4 w-4" />
            Crea il tuo primo progetto
          </Button>
        </div>
      ) : (
        <div className="grid gap-4">
          {requests.map((request) => (
            <Card key={request.id}>
              <CardBody className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="font-semibold text-lg text-slate-900">{request.title}</h2>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge
                          variant={
                            request.status === "delivered" || request.status === "quoted"
                              ? "success"
                              : request.status === "needs_clarification"
                                ? "warning"
                                : "info"
                          }
                        >
                          {statusLabel[request.status] || request.status}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {new Date(request.createdAt).toLocaleDateString("it-IT")}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 line-clamp-2 text-sm text-slate-600">
                    {request.rawText}
                  </p>
                </div>
                <div className="flex shrink-0 items-center sm:pl-4">
                  <ButtonLink href={`/customer/${userId}/requests/${request.id}`} variant="secondary">
                    Apri
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </ButtonLink>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Nuovo Progetto */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl sm:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Nuovo Progetto</h2>
            <p className="mt-2 text-sm text-slate-500">
              Descrivi la tua nuova richiesta. Il team la prenderà in carico al più presto.
            </p>
            <form onSubmit={handleCreateRequest} className="mt-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Titolo del progetto
                </label>
                <input
                  required
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Es. E-commerce B2B"
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Descrizione
                </label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descrivi di cosa hai bisogno..."
                  rows={5}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none resize-none"
                />
              </div>
              <div className="mt-6 flex justify-end gap-3">
                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>
                  Annulla
                </Button>
                <Button type="submit" disabled={isSubmitting || !title || !description}>
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Invia richiesta
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
