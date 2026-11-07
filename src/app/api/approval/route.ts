import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { entity_type, entity_id, action, reason, reviewer_name } = body;

    if (!entity_type || !entity_id || !action) {
      return fail("entity_type, entity_id, and action are required", 400);
    }

    if (!["approved", "rejected", "suspended"].includes(action)) {
      return fail("action must be approved, rejected, or suspended", 400);
    }

    // Determine table from entity_type
    const table = entity_type === "driver" ? "drivers" : entity_type === "vehicle" ? "vehicles" : null;
    if (!table) return fail("entity_type must be driver or vehicle", 400);

    // Insert approval history entry
    const { error: histError } = await supabase
      .from("approval_history")
      .insert({
        entity_type,
        entity_id,
        action,
        reason: reason || null,
        reviewer_name: reviewer_name || null,
      });

    if (histError) return fail(histError.message, 500);

    // Update entity approval_status
    const updatePayload: Record<string, string | null> = {
      approval_status: action,
    };
    if (action === "rejected") {
      updatePayload.rejection_reason = reason || null;
    }

    const { data, error } = await supabase
      .from(table)
      .update(updatePayload)
      .eq("id", entity_id)
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data);
  } catch {
    return fail("Internal server error", 500);
  }
}
