import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("vehicles")
    .select("*, vehicle_types(id, name, name_ar), documents(*)")
    .eq("partner_id", id)
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data || []);
}
