import { ClarificationForm } from "@/components/quote/clarification-form";

export default async function ClarificationsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Risposte cliente</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Salva le risposte bloccanti nel testo richiesta e rilancia l'analisi.
        </p>
      </div>
      <ClarificationForm requestId={id} />
    </div>
  );
}
