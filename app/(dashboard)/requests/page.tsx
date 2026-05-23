import { RequestListClient } from "@/components/requests/request-list-client";
import { getAllClientRequests } from "@/src/server/repositories/request-repository";

export default async function RequestsPage() {
  const requests = await getAllClientRequests();
  return <RequestListClient initialRequests={requests} />;
}
