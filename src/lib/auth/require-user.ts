import "server-only";

import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export type DemoUser = {
  id: string;
  organizationId: string;
  email: string;
  role: "admin" | "pm" | "sales" | "viewer";
};

const UserProfileSchema = z.object({
  organization_id: z.string().uuid(),
  role: z.enum(["admin", "pm", "sales", "viewer"]),
});

export async function requireUser(): Promise<DemoUser> {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const admin = createSupabaseAdminClient();
      const { data: profile } = admin
        ? await admin
            .from("profiles")
            .select("organization_id, role")
            .eq("id", user.id)
            .maybeSingle()
        : { data: null };
      const parsedProfile = UserProfileSchema.safeParse(profile);

      return {
        id: user.id,
        organizationId: parsedProfile.success
          ? parsedProfile.data.organization_id
          : "00000000-0000-0000-0000-000000000001",
        email: user.email ?? "utente@italiansquoteitbetter.local",
        role: parsedProfile.success ? parsedProfile.data.role : "admin",
      };
    }
  }

  return {
    id: "demo-user",
    organizationId: "00000000-0000-0000-0000-000000000001",
    email: "demo@italiansquoteitbetter.local",
    role: "admin",
  };
}
