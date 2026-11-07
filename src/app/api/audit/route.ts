import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entity_type");
  const entityId = searchParams.get("entity_id");
  const action = searchParams.get("action");
  const limit = Math.min(parseInt(searchParams.get("limit") || "100"), 500);

  let query = supabase
    .from("audit_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);
  if (action) query = query.eq("action", action);

  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("audit_logs")
      .insert({
        actor_id: body.actor_id || null,
        actor_name: body.actor_name || null,
        action: body.action,
        entity_type: body.entity_type,
        entity_id: body.entity_id || null,
        details: body.details || null,
        ip_address: body.ip_address || null,
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
