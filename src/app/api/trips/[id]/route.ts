import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const updates: Record<string, unknown> = {};
    const allowed = [
      "route_id", "driver_id", "vehicle_id", "departure_time",
      "arrival_time", "price", "total_seats", "status", "notes",
    ];
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (updates.status === "completed") updates.completed_at = new Date().toISOString();
    if (updates.status === "cancelled") {
      updates.cancelled_at = new Date().toISOString();
      updates.cancel_reason = body.cancel_reason || null;
    }

    const { data, error } = await supabase
      .from("trips")
      .update(updates)
      .eq("id", id)
      .select("*, routes(id, name), drivers(id, name), vehicles(id, model, license_plate)")
      .single();

    if (error) return fail(error.message, 500);
    return ok(data);
  } catch {
    return fail("Internal server error", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { error } = await supabase.from("trips").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return ok({ deleted: true });
}
