import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("trips")
    .select("*, routes(id, name, name_ar, duration_minutes, distance_km), drivers(id, name, phone, approval_status), vehicles(id, model, license_plate, total_seats, approval_status)")
    .order("departure_time", { ascending: false });

  if (error) return fail(error.message, 500);

  const mapped = (data || []).map((t: any) => ({
    ...t,
    route_name: t.routes?.name || null,
    driver_name: t.drivers?.name || null,
    vehicle_plate: t.vehicles?.license_plate || null,
    vehicle_model: t.vehicles?.model || null,
  }));

  return ok(mapped);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { route_id, driver_id, vehicle_id, departure_time } = body;
    if (!route_id || !departure_time) {
      return fail("route_id and departure_time are required", 400);
    }

    // Validate driver is approved and active
    if (driver_id) {
      const { data: driver } = await supabase
        .from("drivers")
        .select("id, approval_status, is_active")
        .eq("id", driver_id)
        .single();

      if (!driver) return fail("Driver not found", 404);
      if (driver.approval_status !== "approved") return fail("Driver is not approved for assignments", 400);
      if (!driver.is_active) return fail("Driver is not active", 400);
    }

    // Validate vehicle is approved and active
    if (vehicle_id) {
      const { data: vehicle } = await supabase
        .from("vehicles")
        .select("id, approval_status, is_active, partner_id, bus_partners(status)")
        .eq("id", vehicle_id)
        .single();

      if (!vehicle) return fail("Vehicle not found", 404);
      if (vehicle.approval_status !== "approved") return fail("Vehicle is not approved for assignments", 400);
      if (!vehicle.is_active) return fail("Vehicle is not active", 400);
    }

    // Get route duration for overlap check
    const { data: route } = await supabase
      .from("routes")
      .select("duration_minutes, default_price, name")
      .eq("id", route_id)
      .single();

    const durationMin = route?.duration_minutes || 60;
    const depTime = new Date(departure_time);
    const endTime = new Date(depTime.getTime() + durationMin * 60 * 1000);

    // Check driver availability (no overlapping trips)
    if (driver_id) {
      const { data: overlapping } = await supabase
        .from("trips")
        .select("id, departure_time, routes(duration_minutes)")
        .eq("driver_id", driver_id)
        .in("status", ["scheduled", "in_progress"]);

      const conflict = (overlapping || []).find((t: Record<string, unknown>) => {
        const tDep = new Date(t.departure_time as string);
        const tDur = ((t.routes as Record<string, unknown>)?.duration_minutes as number) || 60;
        const tEnd = new Date(tDep.getTime() + tDur * 60 * 1000);
        return depTime < tEnd && endTime > tDep;
      });

      if (conflict) return fail(`Driver has a conflicting trip (ID: ${conflict.id})`, 400);
    }

    // Check vehicle availability
    if (vehicle_id) {
      const { data: overlapping } = await supabase
        .from("trips")
        .select("id, departure_time, routes(duration_minutes)")
        .eq("vehicle_id", vehicle_id)
        .in("status", ["scheduled", "in_progress"]);

      const conflict = (overlapping || []).find((t: Record<string, unknown>) => {
        const tDep = new Date(t.departure_time as string);
        const tDur = ((t.routes as Record<string, unknown>)?.duration_minutes as number) || 60;
        const tEnd = new Date(tDep.getTime() + tDur * 60 * 1000);
        return depTime < tEnd && endTime > tDep;
      });

      if (conflict) return fail(`Vehicle has a conflicting trip (ID: ${conflict.id})`, 400);
    }

    const { data: trip, error } = await supabase
      .from("trips")
      .insert({
        route_id,
        driver_id: driver_id || null,
        vehicle_id: vehicle_id || null,
        departure_time,
        arrival_time: body.arrival_time || endTime.toISOString(),
        price: body.price ?? route?.default_price ?? 0,
        total_seats: body.total_seats || 14,
        booked_seats: 0,
        status: "scheduled",
        notes: body.notes || null,
      })
      .select("*, routes(id, name, name_ar, duration_minutes), drivers(id, name, phone), vehicles(id, model, license_plate)")
      .single();

    if (error) return fail(error.message, 500);
    return ok(trip, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
