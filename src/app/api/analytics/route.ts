import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  try {
    const [
      tripsRes,
      bookingsRes,
      driversRes,
      vehiclesRes,
      partnersRes,
      ticketsRes,
    ] = await Promise.all([
      supabase.from("trips").select("id, status, booked_seats", { count: "exact" }),
      supabase.from("bookings").select("id, status, seats", { count: "exact" }),
      supabase.from("drivers").select("id, approval_status, is_active", { count: "exact" }),
      supabase.from("vehicles").select("id, approval_status, is_active", { count: "exact" }),
      supabase.from("bus_partners").select("id, status", { count: "exact" }),
      supabase.from("support_tickets").select("id, status, priority", { count: "exact" }),
    ]);

    const trips = tripsRes.data || [];
    const bookings = bookingsRes.data || [];
    const drivers = driversRes.data || [];
    const vehicles = vehiclesRes.data || [];

    // Compute revenue from accounting entries
    const { data: accountingData } = await supabase
      .from("accounting_entries")
      .select("credit");
    const totalRevenue = (accountingData || []).reduce((s: number, e: any) => s + Number(e.credit || 0), 0);

    // Count active routes
    const { count: activeRoutes } = await supabase
      .from("routes")
      .select("id", { count: "exact", head: true })
      .eq("is_active", true);

    const analytics = {
      // flat keys for overview/analytics pages
      total_revenue: totalRevenue,
      total_bookings: bookingsRes.count || 0,
      active_routes: activeRoutes || 0,
      active_drivers: drivers.filter((d) => d.is_active && d.approval_status === "approved").length,
      total_trips: tripsRes.count || 0,
      pending_vehicles: vehicles.filter((v) => v.approval_status === "pending").length,
      pending_drivers: drivers.filter((d) => d.approval_status === "pending").length,
      // nested for detailed use
      trips: {
        total: tripsRes.count || 0,
        scheduled: trips.filter((t) => t.status === "scheduled").length,
        in_progress: trips.filter((t) => t.status === "in_progress").length,
        completed: trips.filter((t) => t.status === "completed").length,
        cancelled: trips.filter((t) => t.status === "cancelled").length,
        total_booked_seats: trips.reduce((s, t) => s + (t.booked_seats || 0), 0),
      },
      bookings: {
        total: bookingsRes.count || 0,
        confirmed: bookings.filter((b) => b.status === "confirmed").length,
        cancelled: bookings.filter((b) => b.status === "cancelled").length,
        total_seats: bookings.reduce((s, b) => s + (b.seats || 0), 0),
      },
      drivers_detail: {
        total: driversRes.count || 0,
        approved: drivers.filter((d) => d.approval_status === "approved").length,
        pending: drivers.filter((d) => d.approval_status === "pending").length,
        active: drivers.filter((d) => d.is_active).length,
      },
      vehicles_detail: {
        total: vehiclesRes.count || 0,
        approved: vehicles.filter((v) => v.approval_status === "approved").length,
        pending: vehicles.filter((v) => v.approval_status === "pending").length,
        active: vehicles.filter((v) => v.is_active).length,
      },
      partners: {
        total: partnersRes.count || 0,
        active: (partnersRes.data || []).filter((p) => p.status === "active").length,
      },
      support: {
        total: ticketsRes.count || 0,
        open: (ticketsRes.data || []).filter((t) => t.status === "open").length,
        in_progress: (ticketsRes.data || []).filter((t) => t.status === "in_progress").length,
        resolved: (ticketsRes.data || []).filter((t) => t.status === "resolved").length,
      },
    };

    return ok(analytics);
  } catch {
    return fail("Failed to compute analytics", 500);
  }
}
