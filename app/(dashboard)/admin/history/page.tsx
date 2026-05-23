import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { ButtonLink } from "@/components/ui/button";
import { demoHistoricalProjects } from "@/src/lib/demo/history";

export default function HistoryPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-normal">Storico lavori</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
            Seed demo per recuperare casi simili. Nel flusso MVP lo storico viene
            passato al modello come contesto compatto, senza ricerca vettoriale.
          </p>
        </div>
        <ButtonLink href="/admin/history/import" variant="secondary">
          Import JSON
        </ButtonLink>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {demoHistoricalProjects.map((project) => (
          <Card key={project.projectName}>
            <CardHeader title={project.projectName} description={project.description} />
            <CardBody>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">Tipo</p>
                  <p className="mt-1 font-semibold">{project.projectType}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase text-[var(--muted)]">Delivery</p>
                  <p className="mt-1 font-semibold">{project.deliveryWeeks} settimane</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-6 text-[var(--muted)]">{project.riskNotes}</p>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
