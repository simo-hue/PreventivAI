"use client";

import { useState } from "react";
import { UserCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SignupModal } from "./signup-modal";
import { LoginModal } from "./login-modal";
import Image from "next/image";

export function ClientLanding() {
  const [companyName, setCompanyName] = useState("");
  const [projectDescription, setProjectDescription] = useState("");
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (companyName.trim() && projectDescription.trim().length >= 10) {
      setIsSignupModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col">
      {/* Header */}
      <header className="w-full bg-white border-b border-slate-200">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/home" className="-m-1.5 p-1.5">
              <span className="sr-only">Italians quote it better</span>
              <div className="relative h-12 w-48 sm:h-14 sm:w-56">
                <Image
                  src="/logo_originale.png"
                  alt="Italians quote it better Logo"
                  fill
                  className="object-contain object-left"
                  priority
                />
              </div>
            </a>
          </div>
          <div className="flex flex-1 justify-end">
            <Button 
              variant="secondary" 
              onClick={() => setIsLoginModalOpen(true)}
              className="gap-2"
            >
              <UserCircle className="h-4 w-4" />
              Area Utente
            </Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">

          <h1 className="mt-8 text-4xl font-extrabold tracking-tight sm:text-5xl">
            Dai vita al tuo progetto.
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
            Raccontaci la tua idea e riceverai un preventivo dettagliato, basato sull'Intelligenza Artificiale, in pochi secondi.
          </p>
        </div>

        <div className="mx-auto mt-12 max-w-2xl rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
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
      </main>

      <SignupModal
        isOpen={isSignupModalOpen}
        onClose={() => setIsSignupModalOpen(false)}
        companyName={companyName}
        projectDescription={projectDescription}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </div>
  );
}
