import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const adminClient = createSupabaseAdminClient();
  
  if (supabase && adminClient) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/home");
    }

    const { data: profile } = await adminClient
      .from("profiles")
      .select("is_customer")
      .eq("id", user.id)
      .single();

    if (profile?.is_customer) {
      redirect(`/customer/${user.id}`);
    }
  } else {
    // Se non c'è supabase configurato, l'app girerà probabilmente in un ambiente mock,
    // in questo caso l'utente aveva specificato "in caso di utente non loggato volesse accedere",
    // ma gestiamo solo Supabase come backend.
  }

  return <>{children}</>;
}
