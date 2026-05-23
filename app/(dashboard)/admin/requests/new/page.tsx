import { RequestForm } from "@/components/requests/request-form";

export default function NewRequestPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Nuova richiesta</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Inserisci il testo cliente o carica un audio. Il preventivo viene
          generato con output AI validato e pricing calcolato dal codice.
        </p>
      </div>
      <RequestForm />
    </div>
  );
}
