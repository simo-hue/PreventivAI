import { Badge } from "@/components/ui/badge";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { officialRateCards } from "@/src/lib/demo/rate-card";
import { formatCurrency } from "@/src/lib/utils/format";

export default function RateCardPage() {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-normal">Tariffario ufficiale</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-[var(--muted)]">
          Il pricing usa queste tariffe come input. In produzione vengono lette
          da Supabase e salvate come snapshot negli effort del preventivo.
        </p>
      </div>
      <Card>
        <CardHeader title="Tariffario" description="Seed iniziale estratto dalle specifiche." />
        <CardBody className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead className="border-b border-[var(--border)] text-xs uppercase text-[var(--muted)]">
              <tr>
                <th className="py-3">Ruolo</th>
                <th className="py-3">Seniority</th>
                <th className="py-3">Tariffa</th>
                <th className="py-3">Ambito</th>
                <th className="py-3">Stato</th>
              </tr>
            </thead>
            <tbody>
              {officialRateCards.map((rate) => (
                <tr key={rate.id} className="border-b border-[var(--border)]">
                  <td className="py-3 font-semibold">{rate.roleName}</td>
                  <td className="py-3">{rate.seniority}</td>
                  <td className="py-3 font-semibold">
                    {formatCurrency(rate.hourlyRateEur)}/h
                  </td>
                  <td className="py-3 text-[var(--muted)]">{rate.competenceScope}</td>
                  <td className="py-3">
                    <Badge variant="success">Attivo</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardBody>
      </Card>
    </div>
  );
}
