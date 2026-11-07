// "use client";

// import { useState, useMemo } from "react";
// import dynamic from "next/dynamic";
// import { Card } from "@/components/dashboard/shared";
// import { Radio, Bus, Clock, MapPin, Users, Navigation } from "lucide-react";
// import { trips as storeTrips, driverLocations as storeLocations } from "@/store/data";
// import type { Trip } from "@/types/entities";

// const LiveMap = dynamic(() => import("@/components/live-map"), { ssr: false, loading: () => <div className="w-full h-[400px] flex items-center justify-center" style={{ background: "var(--bg)", color: "var(--fg-muted)" }}>Loading map...</div> });

// export default function B2BTrackingPage() {
//   const clientName = "Vodafone Egypt";
//   const myTrips = useMemo(() => storeTrips.filter((t) => t.b2b_client_name === clientName), []);
//   const liveTrips = useMemo(() => myTrips.filter((t) => ["in_progress", "en_route", "at_pickup"].includes(t.status)), [myTrips]);
//   const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

//   return (
//     <div style={{ animation: "fadeIn .3s ease" }}>
//       <div className="flex justify-between items-start mb-5">
//         <div>
//           <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
//             <Radio size={24} style={{ color: "var(--brand)" }} />
//             Track Your Shuttles
//           </h1>
//           <p className="text-[.85rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>
//             Live tracking for {clientName} routes
//           </p>
//         </div>
//         {liveTrips.length > 0 ? (
//           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--success-light)", color: "var(--success)" }}>
//             <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)", animation: "pulse-dot 2s infinite" }} />
//             <span className="text-[.78rem] font-semibold">{liveTrips.length} Active</span>
//           </div>
//         ) : (
//           <div className="px-3 py-1.5 rounded-lg text-[.78rem] font-semibold" style={{ background: "var(--bg-card)", color: "var(--fg-muted)", border: "1px solid var(--border)" }}>
//             No active trips
//           </div>
//         )}
//       </div>

//       <Card>
//         <div className="h-[500px] rounded-[14px] overflow-hidden">
//           <LiveMap trips={liveTrips} locations={storeLocations} selectedTrip={selectedTrip} onSelectTrip={setSelectedTrip} />
//         </div>
//       </Card>

//       {/* Trip cards */}
//       {myTrips.length > 0 && (
//         <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
//           {myTrips.map((trip) => (
//             <Card key={trip.id}>
//               <div className="p-4">
//                 <div className="flex items-center justify-between mb-3">
//                   <div className="flex items-center gap-2">
//                     <Bus size={16} style={{ color: "var(--brand)" }} />
//                     <span className="text-[.88rem] font-bold">{trip.route_name || "Shuttle"}</span>
//                   </div>
//                   <span className="text-[.68rem] px-2 py-0.5 rounded-full font-semibold" style={{
//                     background: trip.status === "in_progress" ? "var(--brand-light)" : trip.status === "scheduled" ? "var(--bg)" : "var(--amber-light)",
//                     color: trip.status === "in_progress" ? "var(--brand)" : trip.status === "scheduled" ? "var(--fg-muted)" : "var(--amber)",
//                   }}>
//                     {trip.status.replace(/_/g, " ")}
//                   </span>
//                 </div>
//                 <div className="space-y-1.5 text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
//                   <div className="flex items-center gap-2"><MapPin size={12} /> {trip.origin_name} → {trip.destination_name}</div>
//                   <div className="flex items-center gap-2"><Users size={12} /> {trip.passenger_count} passengers • {trip.driver_name}</div>
//                   <div className="flex items-center gap-2">
//                     <Clock size={12} /> Departs {new Date(trip.scheduled_departure).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
//                     {trip.estimated_arrival && ` • ETA ${new Date(trip.estimated_arrival).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`}
//                   </div>
//                 </div>
//                 <div className="w-full h-1.5 rounded-full overflow-hidden mt-3" style={{ background: "var(--border)" }}>
//                   <div className="h-full rounded-full" style={{ width: `${trip.route_progress_pct}%`, background: "var(--brand)" }} />
//                 </div>
//               </div>
//             </Card>
//           ))}
//         </div>
//       )}
//     </div>
//   );
// }

"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { Card } from "@/components/dashboard/shared";
import {
  Radio,
  Bus,
  Clock,
  MapPin,
  Users,
  Navigation,
} from "lucide-react";
import {
  trips as storeTrips,
  driverLocations as storeLocations,
} from "@/store/data";
import type { Trip } from "@/types/entities";

const LiveMap = dynamic(() => import("@/components/live-map"), {
  ssr: false,
  loading: () => (
    <div
      className="w-full h-[400px] flex items-center justify-center"
      style={{
        background: "#FFFFFF",
        color: "#777777",
      }}
    >
      Loading map...
    </div>
  ),
});

export default function B2BTrackingPage() {
  const clientName = "Vodafone Egypt";

  const myTrips = useMemo(
    () => storeTrips.filter((t) => t.b2b_client_name === clientName),
    []
  );

  const liveTrips = useMemo(
    () =>
      myTrips.filter((t) =>
        ["in_progress", "en_route", "at_pickup"].includes(t.status)
      ),
    [myTrips]
  );

  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Header */}

      <div className="flex justify-between items-start mb-5">
        <div>
          <h1 className="text-[1.6rem] font-bold flex items-center gap-2">
            <Radio size={24} style={{ color: "#E60000" }} />
            Track Your Shuttles
          </h1>

          <p
            className="text-[.85rem] mt-0.5"
            style={{ color: "#777777" }}
          >
            Live tracking for {clientName} routes
          </p>
        </div>

        {liveTrips.length > 0 ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "#FCE8E8",
              color: "#E60000",
            }}
          >
            <span
              className="w-2 h-2 rounded-full"
              style={{
                background: "#E60000",
                animation: "pulse-dot 2s infinite",
              }}
            />

            <span className="text-[.78rem] font-semibold">
              {liveTrips.length} Active
            </span>
          </div>
        ) : (
          <div
            className="px-3 py-1.5 rounded-lg text-[.78rem] font-semibold"
            style={{
              background: "#FFFFFF",
              color: "#777777",
              border: "1px solid #EEEEEE",
            }}
          >
            No active trips
          </div>
        )}
      </div>

      {/* Live Map */}

      <Card>
        <div className="h-[500px] rounded-[14px] overflow-hidden">
          <LiveMap
            trips={liveTrips}
            locations={storeLocations}
            selectedTrip={selectedTrip}
            onSelectTrip={setSelectedTrip}
          />
        </div>
      </Card>

      {/* Trip Cards */}

      {myTrips.length > 0 && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {myTrips.map((trip) => (
            <Card key={trip.id}>
              <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bus
                      size={16}
                      style={{ color: "#E60000" }}
                    />

                    <span className="text-[.88rem] font-bold">
                      {trip.route_name || "Shuttle"}
                    </span>
                  </div>

                  <span
                    className="text-[.68rem] px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background:
                        trip.status === "in_progress"
                          ? "#FCE8E8"
                          : trip.status === "scheduled"
                          ? "#F5F5F5"
                          : "#EEEEEE",
                      color:
                        trip.status === "in_progress"
                          ? "#E60000"
                          : trip.status === "scheduled"
                          ? "#777777"
                          : "#555555",
                    }}
                  >
                    {trip.status.replace(/_/g, " ")}
                  </span>
                </div>

                <div
                  className="space-y-1.5 text-[.78rem]"
                  style={{ color: "#777777" }}
                >
                  <div className="flex items-center gap-2">
                    <MapPin size={12} />
                    {trip.origin_name} → {trip.destination_name}
                  </div>

                  <div className="flex items-center gap-2">
                    <Users size={12} />
                    {trip.passenger_count} passengers • {trip.driver_name}
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock size={12} />

                    Departs{" "}
                    {new Date(trip.scheduled_departure).toLocaleTimeString(
                      "en-US",
                      {
                        hour: "2-digit",
                        minute: "2-digit",
                      }
                    )}

                    {trip.estimated_arrival &&
                      ` • ETA ${new Date(
                        trip.estimated_arrival
                      ).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}`}
                  </div>
                </div>

                {/* Trip Progress */}

                <div
                  className="w-full h-1.5 rounded-full overflow-hidden mt-3"
                  style={{ background: "#EEEEEE" }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${trip.route_progress_pct}%`,
                      background: "#E60000",
                    }}
                  />
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
