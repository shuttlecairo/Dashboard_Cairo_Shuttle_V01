import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("drivers")
    .select("*, bus_partners(id, name, name_ar), documents(*), approval_history(*)")
    .eq("id", id)
    .single();

  if (error) return fail("Not found", 404);
  return ok(data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return fail("Invalid JSON", 400);

  // If changing approval_status, create approval_history entry
  if (body.approval_status) {
    const { error: histErr } = await supabase
      .from("approval_history")
      .insert({
        entity_type: "driver",
        entity_id: id,
        action: body.approval_status === "pending" ? "resubmitted" : body.approval_status,
        // action: body.approval_status === "approved" ? "approved" : body.approval_status === "rejected" ? "rejected" : body.approval_status,
        reason: body.rejection_reason || body.reason || null,
        reviewer_name: body.reviewer_name || "Admin",
      });
    if (histErr) return fail(histErr.message, 500);
  }

  // Remove non-column fields
  const { rejection_reason, reason, reviewer_name, reviewer_id, ...updateData } = body;

  const { data, error } = await supabase
    .from("drivers")
    .update(updateData)
    .eq("id", id)
    .select("*, bus_partners(id, name, name_ar)")
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { error } = await supabase.from("drivers").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return ok(null);
}
