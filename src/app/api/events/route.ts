import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("event_requests")
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
      .from("event_requests")
      .insert({
        event_name: body.event_name || body.name,
        organizer_name: body.organizer_name || body.organizer,
        organizer_phone: body.organizer_phone || body.phone,
        organizer_email: body.organizer_email || body.email,
        event_date: body.event_date || body.date,
        event_time: body.event_time || body.time,
        location: body.location,
        pickup_area: body.pickup_area || body.pickup,
        expected_guests: body.expected_guests || body.guests || 0,
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
