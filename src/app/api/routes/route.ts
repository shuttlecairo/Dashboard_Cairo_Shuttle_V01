import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (id) {
    const { data, error } = await supabase
      .from("routes")
      .select("*, route_stops(*)")
      .eq("id", id)
      .single();
    if (error) return fail(error.message, 500);
    const stops = ((data?.route_stops as any[]) || []).sort((a: any, b: any) => a.sequence - b.sequence);
    return ok({ ...data, stops, route_stops: stops });
  }

  const { data, error } = await supabase
    .from("routes")
    .select("*, route_stops(*)")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);

  const routes = (data || []).map((r: Record<string, unknown>) => ({
    ...r,
    route_stops: ((r.route_stops as Record<string, unknown>[]) || []).sort(
      (a: Record<string, unknown>, b: Record<string, unknown>) =>
        (a.sequence as number) - (b.sequence as number)
    ),
  }));
  return ok(routes);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { stops, ...routeData } = body;

    const { data: route, error: routeErr } = await supabase
      .from("routes")
      .insert({
        name: routeData.name,
        name_ar: routeData.name_ar || null,
        description: routeData.description || null,
        default_price: routeData.default_price || 0,
        duration_minutes: routeData.duration_minutes || null,
        distance_km: routeData.distance_km || null,
        is_active: routeData.is_active ?? true,
      })
      .select()
      .single();

    if (routeErr) return fail(routeErr.message, 500);

    if (stops && Array.isArray(stops) && stops.length > 0) {
      const stopsToInsert = stops.map(
        (s: Record<string, unknown>, i: number) => ({
          route_id: route.id,
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

      const { error: stopsErr } = await supabase
        .from("route_stops")
        .insert(stopsToInsert);

      if (stopsErr) return fail(stopsErr.message, 500);
    }

    const { data: full } = await supabase
      .from("routes")
      .select("*, route_stops(*)")
      .eq("id", route.id)
      .single();

    return ok(full, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
