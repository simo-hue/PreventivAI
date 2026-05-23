import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoutButton } from "@/components/auth/logout-button";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export default async function CustomerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createSupabaseServerClient();
  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      redirect("/home");
    }

    const adminClient = createSupabaseAdminClient();
    if (adminClient) {
      const { data: profile } = await adminClient
        .from("profiles")
        .select("is_customer")
        .eq("id", user.id)
        .single();

      if (profile && !profile.is_customer) {
        // Admin: reindirizza alla dashboard admin
        redirect("/admin/requests");
      } else if (user.id !== id) {
        // Customer che cerca di accedere ai dati di un altro
        redirect(`/customer/${user.id}`);
      }
    } else if (user.id !== id) {
      redirect(`/customer/${user.id}`);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="w-full bg-white border-b border-slate-200 shrink-0 sticky top-0 z-30">
        <div className="flex h-20 items-center justify-between px-6">
          <Link href={`/customer/${id}`} className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Italians quote it better Logo" className="h-14 w-auto object-contain" />
          </Link>
          <div className="flex items-center">
             <LogoutButton />
          </div>
        </div>
      </header>
      <div className="flex-1 overflow-auto">
        {children}
      </div>
    </div>
  );
}
