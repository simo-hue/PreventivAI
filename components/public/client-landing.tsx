"use client";

import { useState } from "react";
import { UserCircle, Code2, BrainCircuit, Rocket, Lightbulb } from "lucide-react";
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
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Header */}
      <header className="w-full bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-50">
        <nav className="mx-auto flex max-w-7xl items-center justify-between p-4 sm:px-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="/home" className="-m-1.5 p-1.5 transition-transform hover:scale-105">
              <span className="sr-only">Software House</span>
              <div className="relative h-12 w-48 sm:h-14 sm:w-56">
                <Image
                  src="/logo.png"
                  alt="Logo Software House"
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
              className="gap-2 rounded-full px-6 shadow-sm hover:shadow-md transition-all"
            >
              <UserCircle className="h-4 w-4" />
              Area Utente
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1 w-full flex flex-col items-center">
        {/* Hero Section */}
        <section className="w-full max-w-7xl px-4 pt-20 pb-16 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-sm font-medium mb-8 border border-blue-100">
            <Rocket className="w-4 h-4" />
            <span>Innovazione Digitale</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-blue-800 to-slate-900">
            Trasformiamo le tue idee <br className="hidden sm:block" /> in codice.
          </h1>
          <p className="mx-auto max-w-2xl text-xl text-slate-600 mb-10 leading-relaxed">
            Siamo una software house all'avanguardia. Progettiamo e sviluppiamo soluzioni web, app e intelligenza artificiale per far crescere il tuo business.
          </p>
          <div className="flex justify-center gap-4">
            <Button 
              size="lg" 
              className="rounded-full px-8 h-14 text-lg shadow-lg hover:shadow-xl transition-all bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => {
                document.getElementById('preventivo-form')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              Richiedi Preventivo IA
            </Button>
          </div>
        </section>

        {/* Team Image Section */}
        <section className="w-full max-w-6xl px-4 pb-24 sm:px-6 lg:px-8 flex justify-center">
          <div className="relative w-full aspect-[21/9] rounded-[2rem] overflow-hidden shadow-2xl border border-slate-200 bg-white group">
            {/* The user will replace team.svg with team.jpg */}
            <Image
              src="/team.png"
              alt="Il team della nostra software house"
              fill
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 ring-1 ring-inset ring-black/10 rounded-[2rem]"></div>
            <div className="absolute bottom-6 left-8 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-white/20">
              <p className="text-sm font-semibold text-slate-900">👋 Il nostro team di esperti</p>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <section className="w-full bg-white py-24 border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
                Le nostre competenze
              </h2>
              <p className="mt-4 max-w-2xl text-lg text-slate-600 mx-auto">
                Affidati a professionisti del settore per portare il tuo progetto al livello successivo.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Code2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Sviluppo Web & Mobile</h3>
                <p className="text-slate-600 leading-relaxed">
                  Realizziamo piattaforme scalabili e app native con le tecnologie più moderne per garantirti prestazioni e design eccezionali.
                </p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <BrainCircuit className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Intelligenza Artificiale</h3>
                <p className="text-slate-600 leading-relaxed">
                  Integriamo algoritmi di Machine Learning e IA generativa per automatizzare i processi e rendere il tuo business più intelligente.
                </p>
              </div>
              <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow group">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold mb-3 text-slate-900">Consulenza IT</h3>
                <p className="text-slate-600 leading-relaxed">
                  Ti affianchiamo con la nostra esperienza per scegliere le migliori architetture software e ottimizzare i tuoi flussi di lavoro.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quote Form Section */}
        <section id="preventivo-form" className="w-full max-w-4xl px-4 py-24 sm:px-6 lg:px-8 scroll-mt-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-slate-900">
              Parlaci del tuo progetto
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-600">
              Usa il nostro sistema intelligente: descrivi la tua idea e la nostra IA analizzerà la richiesta per fornirti un preventivo accurato in pochi secondi.
            </p>
          </div>

          <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-indigo-500"></div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-slate-900">
                  Nome Azienda / Progetto
                </label>
                <input
                  id="companyName"
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Es. La tua azienda S.r.l."
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label htmlFor="projectDescription" className="block text-sm font-semibold text-slate-900">
                  Descrizione del Progetto
                </label>
                <textarea
                  id="projectDescription"
                  required
                  rows={6}
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Descrivi la tua idea, le funzionalità richieste, o qualsiasi dettaglio utile per lo sviluppo..."
                  className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all bg-slate-50 focus:bg-white resize-y"
                />
                <p className="mt-3 text-xs text-slate-500 flex items-center gap-1.5">
                  <BrainCircuit className="w-3.5 h-3.5" />
                  Più dettagli fornisci, più il preventivo dell'IA sarà preciso.
                </p>
              </div>

              <Button
                type="submit"
                className="w-full h-14 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all"
                disabled={!companyName.trim() || projectDescription.trim().length < 10}
              >
                Invia e genera preventivo IA
              </Button>
            </form>
          </div>
        </section>
      </main>

      {/* Footer minimal */}
      <footer className="bg-white border-t border-slate-200 py-8 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-500 text-sm">
          &copy; {new Date().getFullYear()} Software House. Tutti i diritti riservati.
        </div>
      </footer>

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

