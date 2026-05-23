"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupModal } from "./signup-modal";

export function ClientLanding() {
  const [companyName, setCompanyName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && projectDescription.trim().length >= 10) {
      setIsModalOpen(true);
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg">
            <Sparkles className="h-8 w-8" />
          </div>
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Dai vita al tuo progetto.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Raccontaci la tua idea e riceverai un preventivo dettagliato, basato sull'Intelligenza Artificiale, in pochi secondi.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="companyName" className="block text-sm font-semibold text-slate-900">
                Nome Azienda
              </label>
              <input
                id="companyName"
                type="text"
                required
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="La tua azienda S.r.l."
                className="mt-2 block w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
            </div>

            <div>
              <label htmlFor="projectDescription" className="block text-sm font-semibold text-slate-900">
                Progetto
              </label>
              <textarea
                id="projectDescription"
                required
                rows={6}
                value={projectDescription}
                onChange={(e) => setProjectDescription(e.target.value)}
                placeholder="Descrivi la tua idea, le funzionalità richieste, o qualsiasi dettaglio utile per il progetto..."
                className="mt-2 block w-full rounded-md border border-slate-300 px-4 py-3 text-sm focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
              />
              <p className="mt-2 text-xs text-slate-500">
                Cerca di inserire almeno 2-3 frasi per permettere all'IA di fare un'analisi accurata.
              </p>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={!companyName.trim() || projectDescription.trim().length < 10}
            >
              Invia e genera preventivo
            </Button>
          </form>
        </div>
      </div>

      <SignupModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        companyName={companyName}
        projectDescription={projectDescription}
      />
    </main>
  );
}
