import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("routes")
    .select("*, route_stops(*)")
    .eq("id", id)
    .single();

  if (error) return fail("Not found", 404);
  return ok(data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return fail("Invalid JSON", 400);

  const { stops, ...routeData } = body;

  const { data: route, error } = await supabase
    .from("routes")
    .update(routeData)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(error.message, 500);

  // If stops provided, replace them
  if (stops && Array.isArray(stops)) {
    await supabase.from("route_stops").delete().eq("route_id", id);

    if (stops.length > 0) {
      const stopsToInsert = stops.map(
        (s: Record<string, unknown>, i: number) => ({
          route_id: id,
          name: s.name,
          name_ar: s.name_ar || null,
          address: s.address || null,
          lat: s.lat || null,
          lng: s.lng || null,
          sequence: s.sequence ?? i + 1,
          stop_type: s.stop_type || "intermediate",
          estimated_minutes: s.estimated_minutes || 0,
        })
      );
      await supabase.from("route_stops").insert(stopsToInsert);
    }
  }

  const { data: full } = await supabase
    .from("routes")
    .select("*, route_stops(*)")
    .eq("id", id)
    .single();

  return ok(full);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { error } = await supabase.from("routes").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return ok(null);
}
