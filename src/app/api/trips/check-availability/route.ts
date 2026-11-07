import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { driver_id, vehicle_id, departure_time, arrival_time, exclude_trip_id } = body;

    if (!driver_id || !vehicle_id || !departure_time || !arrival_time) {
      return fail("driver_id, vehicle_id, departure_time, and arrival_time are required", 400);
    }

    const conflicts: string[] = [];

    // Check driver conflicts
    let driverQuery = supabase
      .from("trips")
      .select("id, departure_time, arrival_time, routes(name)")
      .eq("driver_id", driver_id)
      .in("status", ["scheduled", "in_progress"])
      .lt("departure_time", arrival_time)
      .gt("arrival_time", departure_time);

    if (exclude_trip_id) {
      driverQuery = driverQuery.neq("id", exclude_trip_id);
    }

    const { data: driverConflicts } = await driverQuery;

    if (driverConflicts && driverConflicts.length > 0) {
      conflicts.push(
        `Driver is already assigned to ${driverConflicts.length} overlapping trip(s)`
      );
    }

    // Check vehicle conflicts
    let vehicleQuery = supabase
      .from("trips")
      .select("id, departure_time, arrival_time, routes(name)")
      .eq("vehicle_id", vehicle_id)
      .in("status", ["scheduled", "in_progress"])
      .lt("departure_time", arrival_time)
      .gt("arrival_time", departure_time);

    if (exclude_trip_id) {
      vehicleQuery = vehicleQuery.neq("id", exclude_trip_id);
    }

    const { data: vehicleConflicts } = await vehicleQuery;

    if (vehicleConflicts && vehicleConflicts.length > 0) {
      conflicts.push(
        `Vehicle is already assigned to ${vehicleConflicts.length} overlapping trip(s)`
      );
    }

    return ok({
      available: conflicts.length === 0,
      conflicts,
    });
  } catch {
    return fail("Internal server error", 500);
  }
}
