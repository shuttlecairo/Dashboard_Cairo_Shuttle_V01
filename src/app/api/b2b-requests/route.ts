import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("b2b_requests")
    .select("*, b2b_clients(id, company_name)")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);

  const mapped = (data || []).map((r: any) => ({
    ...r,
    client_name: r.b2b_clients?.company_name || null,
  }));

  return ok(mapped);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("b2b_requests")
      .insert({
        client_id: body.client_id || null,
        route_description: body.route_description || null,
        pickup_area: body.pickup_area || null,
        dropoff_area: body.dropoff_area || null,
        passengers: body.passengers || 1,
        preferred_date: body.preferred_date || null,
        preferred_time: body.preferred_time || null,
        frequency: body.frequency || "one_time",
        quote: body.quote || null,
        status: body.status || "pending",
      })
      .select("*, b2b_clients(id, company_name)")
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);

    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("b2b_requests")
      .update(body)
      .eq("id", id)
      .select("*, b2b_clients(id, company_name)")
      .single();

    if (error) return fail(error.message, 500);
    return ok(data);
  } catch {
    return fail("Internal server error", 500);
  }
}
