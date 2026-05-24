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
      .select("organization_id, created_by, status")
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
        metadata,
        created_at,
        sender_id,
        profiles!chat_messages_sender_id_fkey(full_name, role)
      `)
      .eq("client_request_id", id)
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ messages, status: clientReq.status });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error fetching messages" },
      { status: 500 }
    );
  }
}

const PostMessageSchema = z.object({
  content: z.string(),
  metadata: z.any().optional(),
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

    const ADMIN_USER_ID = "5d65094f-d066-423c-a7ce-ef18a0f64368";

    // Ensure the sender has a profile
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) {
      let fullName = "Cliente";
      let role = "viewer";

      if (user.id === ADMIN_USER_ID) {
        fullName = "System Admin";
        role = "admin";
      } else {
        const { data: userData } = await admin.auth.admin.getUserById(user.id);
        fullName = userData?.user?.user_metadata?.full_name || "Cliente";
      }

      await admin.from("profiles").insert({
        id: user.id,
        organization_id: user.organizationId,
        full_name: fullName,
        role: role,
      });
    }

    const { data: message, error } = await admin
      .from("chat_messages")
      .insert({
        organization_id: user.organizationId,
        client_request_id: id,
        sender_id: user.id,
        content: parsed.data.content,
        metadata: parsed.data.metadata || null,
      })
      .select(`
        id,
        content,
        metadata,
        created_at,
        sender_id,
        profiles!chat_messages_sender_id_fkey(full_name, role)
      `)
      .single();

    if (error) {
      console.error("Insert error in chat:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message });
  } catch (error) {
    console.error("Chat POST Exception:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Error sending message" },
      { status: 500 }
    );
  }
}
