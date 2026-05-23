import { NextResponse } from "next/server";
import { z } from "zod";
import { requireUser } from "@/src/lib/auth/require-user";
import { createSupabaseAdminClient } from "@/src/lib/supabase/admin";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    
    if (!admin) {
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }

    // Verify access
    const { data: clientReq } = await admin
      .from("client_requests")
      .select("organization_id, created_by")
      .eq("id", id)
      .single();

    if (!clientReq || clientReq.organization_id !== user.organizationId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    const { data: messages, error } = await admin
      .from("chat_messages")
      .select(`
        id,
        content,
        created_at,
        sender_id,
        profiles!chat_messages_sender_id_fkey(full_name, role)
      `)
      .eq("client_request_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching messages" },
      { status: 500 }
    );
  }
}

const PostMessageSchema = z.object({
  content: z.string().min(1),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const user = await requireUser();
    const admin = createSupabaseAdminClient();
    
    if (!admin) {
      return NextResponse.json({ error: "Supabase error" }, { status: 500 });
    }

    const payload = await request.json();
    const parsed = PostMessageSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Payload non valido", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify access
    const { data: clientReq } = await admin
      .from("client_requests")
      .select("organization_id")
      .eq("id", id)
      .single();

    if (!clientReq || clientReq.organization_id !== user.organizationId) {
      return NextResponse.json({ error: "Not found or unauthorized" }, { status: 404 });
    }

    // Ensure the sender has a profile (customers signing up might not have one)
    if (user.id !== "demo-user") {
      const { data: profile } = await admin
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .maybeSingle();

      if (!profile) {
        // Fetch user metadata to get the full name
        const { data: userData } = await admin.auth.admin.getUserById(user.id);
        const fullName = userData?.user?.user_metadata?.full_name || "Cliente";

        await admin.from("profiles").insert({
          id: user.id,
          organization_id: user.organizationId,
          full_name: fullName,
          role: "viewer",
        });
      }
    }

    const { data: message, error } = await admin
      .from("chat_messages")
      .insert({
        organization_id: user.organizationId,
        client_request_id: id,
        sender_id: user.id,
        content: parsed.data.content,
      })
      .select(`
        id,
        content,
        created_at,
        sender_id,
        profiles!chat_messages_sender_id_fkey(full_name, role)
      `)
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error sending message" },
      { status: 500 }
    );
  }
}
