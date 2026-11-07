import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const entityType = searchParams.get("entity_type");
  const entityId = searchParams.get("entity_id");

  let query = supabase
    .from("approval_history")
    .select("*")
    .order("created_at", { ascending: false });

  if (entityType) query = query.eq("entity_type", entityType);
  if (entityId) query = query.eq("entity_id", entityId);

  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data || []);
}
