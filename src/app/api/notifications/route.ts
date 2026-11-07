import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("user_id");
  const unreadOnly = searchParams.get("unread") === "true";

  let query = supabase
    .from("notifications")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  if (userId) query = query.eq("user_id", userId);
  if (unreadOnly) query = query.is("read_at", null);

  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("notifications")
      .insert({
        user_id: body.user_id,
        title: body.title,
        body: body.body || null,
        type: body.type || "info",
        data: body.data || null,
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    // Mark notifications as read
    if (body.mark_read && Array.isArray(body.ids)) {
      const { error } = await supabase
        .from("notifications")
        .update({ read_at: new Date().toISOString() })
        .in("id", body.ids);

      if (error) return fail(error.message, 500);
      return ok({ updated: body.ids.length });
    }

    return fail("Provide mark_read:true and ids array", 400);
  } catch {
    return fail("Internal server error", 500);
  }
}
