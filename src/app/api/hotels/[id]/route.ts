import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("hotel_requests")
    .select("*")
    .eq("id", id)
    .single();

  if (error) return fail("Hotel request not found", 404);
  return ok(data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return fail("Invalid JSON body", 400);

  const { data, error } = await supabase
    .from("hotel_requests")
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
    .from("hotel_requests")
    .delete()
    .eq("id", id);

  if (error) return fail(error.message, 500);
  return ok({ deleted: true });
}
