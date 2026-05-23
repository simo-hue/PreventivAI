import { notFound } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { getAllClientRequestsByUserId } from "@/src/server/repositories/request-repository";
import { CustomerRequestList } from "@/components/customer/customer-request-list";

export const metadata = {
  title: "Area Personale | Italians quote it better",
};

export default async function CustomerDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Verify user is valid
  const supabase = await createSupabaseServerClient();
  if (!supabase) return notFound();

  // Fetch all user requests
  const requests = await getAllClientRequestsByUserId(id);

  return (
    <main className="p-6 sm:p-10">
      <div className="max-w-5xl mx-auto">
        <CustomerRequestList requests={requests} userId={id} />
      </div>
    </main>
  );
}
