import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("driver_locations")
    .select("*, drivers(id, name, name_ar, phone)")
    .order("updated_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("driver_locations")
      .upsert(
        {
          driver_id: body.driver_id,
          latitude: body.latitude || body.lat,
          longitude: body.longitude || body.lng,
          heading: body.heading || null,
          speed: body.speed || null,
          status: body.status || "online",
        },
        { onConflict: "driver_id" }
      )
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data);
  } catch {
    return fail("Internal server error", 500);
  }
}
