import "server-only";

import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export type DemoUser = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "pm" | "sales" | "viewer";
};

export async function requireUser(): Promise<DemoUser> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      return {
        id: user.id,
        organizationId: "00000000-0000-0000-0000-000000000001",
        email: user.email ?? "utente@preventivai.local",
        role: "admin",
      };
    }
  }

  return {
    id: "demo-user",
    organizationId: "00000000-0000-0000-0000-000000000001",
    email: "demo@preventivai.local",
    role: "admin",
  };
}
