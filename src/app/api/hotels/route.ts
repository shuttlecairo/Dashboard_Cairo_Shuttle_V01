import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("hotel_requests")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("hotel_requests")
      .insert({
        hotel_name: body.hotel_name || body.name,
        contact_name: body.contact_name || body.contact,
        contact_phone: body.contact_phone || body.phone,
        contact_email: body.contact_email || body.email,
        pickup_location: body.pickup_location || body.pickup,
        dropoff_location: body.dropoff_location || body.dropoff,
        guest_count: body.guest_count || body.guests || 1,
        pickup_date: body.pickup_date || body.date,
        pickup_time: body.pickup_time || body.time,
        frequency: body.frequency || "one_time",
        vehicle_type: body.vehicle_type,
        notes: body.notes || null,
        status: body.status || "pending",
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
