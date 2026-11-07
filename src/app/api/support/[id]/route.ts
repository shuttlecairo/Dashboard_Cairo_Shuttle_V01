import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return fail("Support ticket not found", 404);
  return ok(data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return fail("Invalid JSON body", 400);

  // If resolving, set resolved_at
  if (body.status === "resolved" && !body.resolved_at) {
    body.resolved_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { error } = await supabase
    .from("support_tickets")
    .delete()
    .eq("id", id);

  if (error) return fail(error.message, 500);
  return ok({ deleted: true });
}
