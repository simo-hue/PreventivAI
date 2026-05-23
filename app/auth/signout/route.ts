import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createSupabaseServerClient();

  if (supabase) {
    await supabase.auth.signOut();
  }

  const requestUrl = new URL(request.url);
  const referer = request.headers.get("referer");

  // Determine where to redirect based on where they logged out from
  if (referer && referer.includes("/customer")) {
    return NextResponse.redirect(`${requestUrl.origin}/home`, { status: 302 });
  }

  // Fallback default redirect to login
  return NextResponse.redirect(`${requestUrl.origin}/login`, { status: 302 });
}
