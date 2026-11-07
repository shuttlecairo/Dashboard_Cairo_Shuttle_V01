import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { data, error } = await supabase
    .from("bookings")
    .select("*, trips(id, departure_time, routes(id, name))")
    .eq("id", id)
    .single();

  if (error) return fail("Not found", 404);
  return ok(data);
}

export async function PATCH(req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const body = await req.json().catch(() => null);
  if (!body) return fail("Invalid JSON", 400);

  // If cancelling, decrement booked_seats
  if (body.status === "cancelled") {
    const { data: booking } = await supabase
      .from("bookings")
      .select("trip_id, status")
      .eq("id", id)
      .single();

    if (booking && booking.status !== "cancelled") {
      const { data: trip } = await supabase
        .from("trips")
        .select("booked_seats")
        .eq("id", booking.trip_id)
        .single();

      if (trip) {
        await supabase
          .from("trips")
          .update({ booked_seats: Math.max(0, trip.booked_seats - 1) })
          .eq("id", booking.trip_id);
      }
    }
    body.cancelled_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function DELETE(_req: Request, ctx: Ctx) {
  const { id } = await ctx.params;
  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return ok(null);
}
