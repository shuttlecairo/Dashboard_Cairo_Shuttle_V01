"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, EmptyState, CardSkeleton } from "@/components/dashboard/shared";
import { useToast } from "@/components/shared/toast";
import { MapPin, Navigation, Clock, Users, CheckCircle, Circle } from "lucide-react";

const statusColors: Record<string, { bg: string; fg: string }> = {
  scheduled: { bg: "var(--blue-light, #e8f4fd)", fg: "var(--blue, #2563eb)" },
  in_progress: { bg: "var(--amber-light)", fg: "var(--amber)" },
  completed: { bg: "var(--success-light)", fg: "var(--success)" },
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || { bg: "var(--bg)", fg: "var(--fg-muted)" };
  return <span className="inline-flex rounded-full px-2.5 py-1 text-[.68rem] font-semibold capitalize" style={{ background: c.bg, color: c.fg }}>{status.replace(/_/g, " ")}</span>;
}

export default function LiveTrackingPage() {
  const { show } = useToast();
  const [loading, setLoading] = useState(true);
  const [trips, setTrips] = useState<any[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<any>(null);
  const [stops, setStops] = useState<any[]>([]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/trips").then(r => r.json());
      const active = res.success ? res.data.filter((t: any) => ["in_progress", "scheduled"].includes(t.status)) : [];
      setTrips(active);
      if (active.length > 0 && !selectedTrip) setSelectedTrip(active[0]);
    } catch { show("Failed to load trips", "danger"); }
    setLoading(false);
  }, [show, selectedTrip]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    if (!selectedTrip) { setStops([]); return; }
    fetch(`/api/routes?id=${selectedTrip.route_id}`).then(r => r.json()).then(json => {
      if (json.success && json.data?.stops) setStops(json.data.stops);
      else setStops([]);
    }).catch(() => setStops([]));
  }, [selectedTrip]);

  if (loading) return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><Navigation size={24} style={{ color: "var(--brand)" }} /> Live Tracking</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <CardSkeleton key={i} />)}</div>
    </div>
  );

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      <h1 className="text-[1.6rem] font-bold mb-6 flex items-center gap-2"><Navigation size={24} style={{ color: "var(--brand)" }} /> Live Tracking</h1>

      {trips.length === 0 ? <EmptyState title="No active trips" description="There are no trips currently in progress or scheduled" /> : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Trip List */}
          <div className="space-y-3">
            <h2 className="text-[.95rem] font-bold" style={{ color: "var(--fg-muted)" }}>Active Trips ({trips.length})</h2>
            {trips.map(t => (
              <Card key={t.id}>
                <button onClick={() => setSelectedTrip(t)} className="w-full text-left p-4" style={{ background: selectedTrip?.id === t.id ? "var(--brand-light)" : undefined }}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-semibold text-[.85rem]">{t.route_name || "Route"}</span>
                    <StatusPill status={t.status} />
                  </div>
                  <div className="text-[.72rem] space-y-1" style={{ color: "var(--fg-muted)" }}>
                    <div className="flex items-center gap-1"><Users size={12} /> {t.driver_name || "No driver"}</div>
                    <div className="flex items-center gap-1"><Clock size={12} /> {t.departure_time ? new Date(t.departure_time).toLocaleString("en-EG", { hour: "2-digit", minute: "2-digit" }) : "—"}</div>
                    <div className="flex items-center gap-1"><MapPin size={12} /> {t.booked_seats}/{t.total_seats} seats</div>
                  </div>
                </button>
              </Card>
            ))}
          </div>

          {/* Trip Detail + Stop Timeline */}
          <div className="lg:col-span-2">
            {selectedTrip ? (
              <Card>
                <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
                  <div className="flex justify-between items-center">
                    <h2 className="text-[.95rem] font-bold flex items-center gap-2"><MapPin size={17} style={{ color: "var(--brand)" }} /> {selectedTrip.route_name}</h2>
                    <StatusPill status={selectedTrip.status} />
                  </div>
                  <div className="flex flex-wrap gap-4 mt-2 text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
                    <span>Driver: <strong style={{ color: "var(--fg)" }}>{selectedTrip.driver_name || "—"}</strong></span>
                    <span>Vehicle: <strong style={{ color: "var(--fg)" }}>{selectedTrip.vehicle_plate || "—"}</strong></span>
                    <span>Departure: <strong style={{ color: "var(--fg)" }}>{selectedTrip.departure_time ? new Date(selectedTrip.departure_time).toLocaleString("en-EG") : "—"}</strong></span>
                  </div>
                </div>

                {/* Stop Timeline */}
                <div className="p-4">
                  <h3 className="text-[.85rem] font-bold mb-4">Route Stops</h3>
                  {stops.length === 0 ? (
                    <p className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>No stops configured for this route</p>
                  ) : (
                    <div className="space-y-0">
                      {stops.sort((a: any, b: any) => a.sequence - b.sequence).map((stop: any, i: number) => {
                        const isFirst = i === 0;
                        const isLast = i === stops.length - 1;
                        const isPassed = selectedTrip.status === "completed" || (selectedTrip.status === "in_progress" && i === 0);
                        return (
                          <div key={stop.id} className="flex gap-3">
                            {/* Timeline line */}
                            <div className="flex flex-col items-center" style={{ width: 24 }}>
                              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: isPassed ? "var(--brand)" : isFirst ? "var(--brand)" : "var(--bg)", border: `2px solid ${isPassed || isFirst ? "var(--brand)" : "var(--border)"}` }}>
                                {isPassed ? <CheckCircle size={12} style={{ color: "#fff" }} /> : <Circle size={8} style={{ color: isFirst ? "#fff" : "var(--fg-muted)" }} />}
                              </div>
                              {!isLast && <div className="w-0.5 flex-1 min-h-[30px]" style={{ background: isPassed ? "var(--brand)" : "var(--border)" }} />}
                            </div>
                            {/* Stop info */}
                            <div className="pb-4 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-[.82rem] font-semibold">{stop.name}</span>
                                {stop.stop_type === "pickup" && <span className="text-[.62rem] px-1.5 py-0.5 rounded" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>Pickup</span>}
                                {stop.stop_type === "destination" && <span className="text-[.62rem] px-1.5 py-0.5 rounded" style={{ background: "var(--success-light)", color: "var(--success)" }}>Destination</span>}
                              </div>
                              {stop.address && <div className="text-[.72rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>{stop.address}</div>}
                              {stop.estimated_minutes != null && <div className="text-[.68rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>~{stop.estimated_minutes} min from start</div>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            ) : (
              <Card><div className="p-8 text-center" style={{ color: "var(--fg-muted)" }}>Select a trip to view details</div></Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
