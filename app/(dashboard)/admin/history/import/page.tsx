import { Alert } from "@/components/ui/alert";

export default function HistoryImportPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Import storico</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Endpoint e ingestion reale sono predisposti a livello schema. Per il
          demo locale lo storico viene letto da fixture TypeScript.
        </p>
      </div>
      <Alert title="Formato supportato" variant="info">
        Usa JSON con project_name, description, modules e actual_hours_by_role
        come descritto in specifiche.md. Il prossimo passo e' collegare questa
        pagina a Supabase Storage e alla funzione di chunking.
      </Alert>
    </div>
  );
}
