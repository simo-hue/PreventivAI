import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { DEFAULT_PM_PERCENTAGE } from "@/src/lib/demo/rate-card";
import { formatPercent } from "@/src/lib/utils/format";

export default function SettingsPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Settings</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Parametri organizzazione usati dal motore deterministico.
        </p>
      </div>
      <Card>
        <CardHeader title="Pricing" />
        <CardBody className="grid gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-[var(--surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              PM percentage
            </p>
            <p className="mt-2 text-xl font-bold">
              {formatPercent(DEFAULT_PM_PERCENTAGE)}
            </p>
          </div>
          <div className="rounded-lg bg-[var(--surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              Valuta
            </p>
            <p className="mt-2 text-xl font-bold">EUR</p>
          </div>
          <div className="rounded-lg bg-[var(--surface-strong)] p-4">
            <p className="text-xs font-semibold uppercase text-[var(--muted)]">
              Risk buffer
            </p>
            <p className="mt-2 text-xl font-bold">0%</p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
