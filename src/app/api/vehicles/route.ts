import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const approvalStatus = url.searchParams.get("approval_status");

  let query = supabase
    .from("vehicles")
    .select("*, bus_partners(id, name, name_ar), vehicle_types(id, name, seat_capacity), documents(*)")
    .order("created_at", { ascending: false });

  if (approvalStatus) {
    query = query.eq("approval_status", approvalStatus);
  }

  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  const mapped = (data || []).map((v: any) => ({
    ...v,
    partner_name: v.bus_partners?.name || null,
    vehicle_type_name: v.vehicle_types?.name || null,
  }));

  return ok(mapped);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("vehicles")
      .insert({
        partner_id: body.partner_id,
        vehicle_type_id: body.vehicle_type_id || null,
        model: body.model,
        year: body.year || null,
        license_plate: body.license_plate,
        color: body.color || null,
        total_seats: body.total_seats || 14,
        vin: body.vin || null,
        registration_expiry: body.registration_expiry || null,
        insurance_expiry: body.insurance_expiry || null,
        photo_url: body.photo_url || null,
        approval_status: "pending",
        is_active: true,
      })
      .select("*, bus_partners(id, name, name_ar), vehicle_types(id, name, seat_capacity)")
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
