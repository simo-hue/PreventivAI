import { RequestListClient } from "@/components/requests/request-list-client";
import { ButtonLink } from "@/components/ui/button";
import { getAllClientRequests } from "@/src/server/repositories/request-repository";

export default async function HistoryPage() {
  const requests = await getAllClientRequests({ status: "delivered" });

  const importAction = (
    <ButtonLink href="/admin/history/import" variant="secondary">
      Import JSON
    </ButtonLink>
  );

  return (
    <RequestListClient
      initialRequests={requests}
      title="Storico lavori"
      description="Elenco di tutti i preventivi approvati e consegnati al cliente."
      showNewButton={false}
      customAction={importAction}
    />
  );
}
