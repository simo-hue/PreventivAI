import { NextResponse } from "next/server";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  
  try {
    const payload = await request.json();
    const { status } = payload;
    
    if (!status) {
      return NextResponse.json({ error: "Stato non fornito." }, { status: 400 });
    }

    const admin = createSupabaseAdminClient();
    if (!admin) {
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }

    await admin.from("client_requests").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
    
    return NextResponse.json({ saved: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
