import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("bookings")
    .select("*, trips(id, departure_time, status, routes(id, name, name_ar))")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);

  const mapped = (data || []).map((b: any) => ({
    ...b,
    route_name: b.trips?.routes?.name || null,
  }));

  return ok(mapped);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { trip_id } = body;
    if (!trip_id) return fail("trip_id is required", 400);

    // Check trip exists and has capacity
    const { data: trip, error: tripErr } = await supabase
      .from("trips")
      .select("id, total_seats, booked_seats, status, price")
      .eq("id", trip_id)
      .single();

    if (tripErr || !trip) return fail("Trip not found", 404);
    if (trip.status === "cancelled") return fail("Trip is cancelled", 400);
    if (trip.booked_seats >= trip.total_seats) return fail("Trip is fully booked", 400);

    const { data: booking, error } = await supabase
      .from("bookings")
      .insert({
        trip_id,
        passenger_id: body.passenger_id || null,
        passenger_name: body.passenger_name || body.rider || null,
        passenger_phone: body.passenger_phone || body.phone || null,
        boarding_stop_id: body.boarding_stop_id || null,
        seat_number: body.seat_number || null,
        price: body.price ?? trip.price ?? 0,
        payment_method: body.payment_method || "cash",
        status: "confirmed",
        booked_for_name: body.booked_for_name || null,
        booked_for_phone: body.booked_for_phone || null,
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);

    // Increment booked_seats
    await supabase
      .from("trips")
      .update({ booked_seats: trip.booked_seats + 1 })
      .eq("id", trip_id);

    return ok(booking, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
