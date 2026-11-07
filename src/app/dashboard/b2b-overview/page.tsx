// "use client";

// import { Card, StatCard } from "@/components/dashboard/shared";
// import {
//   BarChart3, TrendingUp, Bus, Users, Clock, CalendarDays, FileText,
//   CheckCircle, AlertCircle,
// } from "lucide-react";
// import { b2bRequests, trips as storeTrips, bookings as storeBookings } from "@/store/data";

// function formatEGP(n: number) {
//   return n.toLocaleString("en-EG") + " EGP";
// }

// export default function B2BOverviewPage() {
//   // Simulating a B2B client view — Vodafone Egypt (c1)
//   const clientId = "c1";
//   const clientName = "Vodafone Egypt";
//   const myRequests = b2bRequests.filter((r) => r.client_id === clientId);
//   const activeRequests = myRequests.filter((r) => r.status === "accepted");
//   const pendingRequests = myRequests.filter((r) => ["pending", "quoted"].includes(r.status));
//   const totalEmployees = myRequests.filter((r) => r.status === "accepted").reduce((s, r) => s + r.count, 0);
//   const totalSpend = myRequests.filter((r) => r.status === "accepted" && r.quote).reduce((s, r) => s + (r.quote || 0), 0);

//   // Active trips for this client
//   const myTrips = storeTrips.filter((t) => t.b2b_client_name === clientName);
//   const liveTrips = myTrips.filter((t) => ["in_progress", "en_route", "at_pickup"].includes(t.status));

//   // Recent activity
//   const activity = [
//     { time: "07:35", text: "Return shuttle departed New Cairo", icon: <Bus size={14} />, type: "trip" },
//     { time: "07:00", text: "Morning shuttle on schedule", icon: <CheckCircle size={14} />, type: "success" },
//     { time: "Nov 3", text: "New route request submitted — Heliopolis", icon: <FileText size={14} />, type: "request" },
//     { time: "Nov 1", text: "November contract active", icon: <CalendarDays size={14} />, type: "info" },
//   ];

//   return (
//     <div style={{ animation: "fadeIn .3s ease" }}>
//       <div className="flex justify-between items-start mb-6">
//         <div>
//           <h1 className="text-[1.6rem] font-bold">{clientName}</h1>
//           <p className="text-[.85rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>
//             Corporate Transportation Dashboard
//           </p>
//         </div>
//         {liveTrips.length > 0 && (
//           <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg" style={{ background: "var(--success-light)", color: "var(--success)" }}>
//             <span className="w-2 h-2 rounded-full" style={{ background: "var(--success)", animation: "pulse-dot 2s infinite" }} />
//             <span className="text-[.78rem] font-semibold">{liveTrips.length} Live Trip{liveTrips.length > 1 ? "s" : ""}</span>
//           </div>
//         )}
//       </div>

//       {/* KPIs */}
//       <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
//         <StatCard label="Active Routes" value={activeRequests.length} valueColor="var(--success)" sub={`${pendingRequests.length} pending`} />
//         <StatCard label="Employees Covered" value={totalEmployees} valueColor="var(--brand)" />
//         <StatCard label="Monthly Spend" value={formatEGP(totalSpend)} valueColor="var(--blue)" />
//         <StatCard label="Live Trips" value={liveTrips.length} valueColor="var(--amber)" />
//       </div>

//       <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
//         {/* Active Routes */}
//         <div className="lg:col-span-2">
//           <Card>
//             <div className="p-4 pb-3 flex justify-between items-center" style={{ borderBottom: "1px solid var(--border)" }}>
//               <h2 className="text-[.95rem] font-bold flex items-center gap-2">
//                 <Bus size={16} style={{ color: "var(--brand)" }} />
//                 Your Routes
//               </h2>
//               <a href="/dashboard/b2b" className="text-[.78rem] font-semibold no-underline" style={{ color: "var(--brand)" }}>
//                 View All →
//               </a>
//             </div>
//             <div className="divide-y" style={{ borderColor: "var(--border)" }}>
//               {myRequests.map((req) => (
//                 <div key={req.id} className="p-4 flex items-center gap-4">
//                   <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{
//                     background: req.status === "accepted" ? "var(--success-light)" : "var(--amber-light)",
//                     color: req.status === "accepted" ? "var(--success)" : "var(--amber)",
//                   }}>
//                     <Bus size={18} />
//                   </div>
//                   <div className="flex-1 min-w-0">
//                     <div className="text-[.85rem] font-semibold">{req.pickup} → {req.dropoff}</div>
//                     <div className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
//                       {req.schedule} • {req.count} employees
//                     </div>
//                   </div>
//                   <div className="text-right flex-shrink-0">
//                     <span className="text-[.68rem] px-2 py-0.5 rounded-full font-semibold" style={{
//                       background: req.status === "accepted" ? "var(--success-light)" : req.status === "quoted" ? "var(--blue-light)" : "var(--amber-light)",
//                       color: req.status === "accepted" ? "var(--success)" : req.status === "quoted" ? "var(--blue)" : "var(--amber)",
//                     }}>
//                       {req.status}
//                     </span>
//                     {req.quote && <div className="text-[.75rem] mt-1 font-semibold">{formatEGP(req.quote)}/mo</div>}
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </Card>
//         </div>

//         {/* Activity Feed */}
//         <Card>
//           <div className="p-4 pb-3" style={{ borderBottom: "1px solid var(--border)" }}>
//             <h2 className="text-[.95rem] font-bold flex items-center gap-2">
//               <Clock size={16} style={{ color: "var(--brand)" }} />
//               Activity
//             </h2>
//           </div>
//           <div className="p-3">
//             {activity.map((a, i) => (
//               <div key={i} className="flex gap-3 py-2.5" style={{ borderBottom: i < activity.length - 1 ? "1px solid var(--border)" : "none" }}>
//                 <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: "var(--brand-light)", color: "var(--brand)" }}>
//                   {a.icon}
//                 </div>
//                 <div>
//                   <div className="text-[.78rem]">{a.text}</div>
//                   <div className="text-[.68rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>{a.time}</div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </Card>
//       </div>
//     </div>
//   );
// }



"use client";

import { Card, StatCard } from "@/components/dashboard/shared";
import {
  BarChart3,
  TrendingUp,
  Bus,
  Users,
  Clock,
  CalendarDays,
  FileText,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  b2bRequests,
  trips as storeTrips,
  bookings as storeBookings,
} from "@/store/data";

function formatEGP(n: number) {
  return n.toLocaleString("en-EG") + " EGP";
}

export default function B2BOverviewPage() {
  // Simulating a B2B client view — Vodafone Egypt (c1)
  const clientId = "c1";
  const clientName = "Vodafone Egypt";

  const myRequests = b2bRequests.filter(
    (r) => r.client_id === clientId
  );

  const activeRequests = myRequests.filter(
    (r) => r.status === "accepted"
  );

  const pendingRequests = myRequests.filter(
    (r) => ["pending", "quoted"].includes(r.status)
  );

  const totalEmployees = myRequests
    .filter((r) => r.status === "accepted")
    .reduce((s, r) => s + r.count, 0);

  const totalSpend = myRequests
    .filter((r) => r.status === "accepted" && r.quote)
    .reduce((s, r) => s + (r.quote || 0), 0);

  // Active trips for this client
  const myTrips = storeTrips.filter(
    (t) => t.b2b_client_name === clientName
  );

  const liveTrips = myTrips.filter((t) =>
    ["in_progress", "en_route", "at_pickup"].includes(t.status)
  );

  // Recent activity
  const activity = [
    {
      time: "07:35",
      text: "Return shuttle departed New Cairo",
      icon: <Bus size={14} />,
      type: "trip",
    },
    {
      time: "07:00",
      text: "Morning shuttle on schedule",
      icon: <CheckCircle size={14} />,
      type: "success",
    },
    {
      time: "Nov 3",
      text: "New route request submitted — Heliopolis",
      icon: <FileText size={14} />,
      type: "request",
    },
    {
      time: "Nov 1",
      text: "November contract active",
      icon: <CalendarDays size={14} />,
      type: "info",
    },
  ];

  return (
    <div style={{ animation: "fadeIn .3s ease" }}>
      {/* Header */}

      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-[1.6rem] font-bold">
            {clientName}
          </h1>

          <p
            className="text-[.85rem] mt-0.5"
            style={{ color: "#777777" }}
          >
            Corporate Transportation Dashboard
          </p>
        </div>

        {liveTrips.length > 0 && (
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
              {liveTrips.length} Live Trip
              {liveTrips.length > 1 ? "s" : ""}
            </span>
          </div>
        )}
      </div>

      {/* KPIs */}

      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <StatCard
          label="Active Routes"
          value={activeRequests.length}
          valueColor="#E60000"
          sub={`${pendingRequests.length} pending`}
        />

        <StatCard
          label="Employees Covered"
          value={totalEmployees}
          valueColor="#C40000"
        />

        <StatCard
          label="Monthly Spend"
          value={formatEGP(totalSpend)}
          valueColor="#E60000"
        />

        <StatCard
          label="Live Trips"
          value={liveTrips.length}
          valueColor="#A80000"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Active Routes */}

        <div className="lg:col-span-2">
          <Card>
            <div
              className="p-4 pb-3 flex justify-between items-center"
              style={{ borderBottom: "1px solid #EEEEEE" }}
            >
              <h2 className="text-[.95rem] font-bold flex items-center gap-2">
                <Bus size={16} style={{ color: "#E60000" }} />
                Your Routes
              </h2>

              <a
                href="/dashboard/b2b"
                className="text-[.78rem] font-semibold no-underline"
                style={{ color: "#E60000" }}
              >
                View All →
              </a>
            </div>

            <div
              className="divide-y"
              style={{ borderColor: "#EEEEEE" }}
            >
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 flex items-center gap-4"
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background:
                        req.status === "accepted"
                          ? "#FCE8E8"
                          : "#F5F5F5",
                      color:
                        req.status === "accepted"
                          ? "#E60000"
                          : "#777777",
                    }}
                  >
                    <Bus size={18} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[.85rem] font-semibold">
                      {req.pickup} → {req.dropoff}
                    </div>

                    <div
                      className="text-[.75rem]"
                      style={{ color: "#777777" }}
                    >
                      {req.schedule} • {req.count} employees
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <span
                      className="text-[.68rem] px-2 py-0.5 rounded-full font-semibold"
                      style={{
                        background:
                          req.status === "accepted"
                            ? "#FCE8E8"
                            : req.status === "quoted"
                            ? "#EEEEEE"
                            : "#F5F5F5",
                        color:
                          req.status === "accepted"
                            ? "#E60000"
                            : req.status === "quoted"
                            ? "#555555"
                            : "#777777",
                      }}
                    >
                      {req.status}
                    </span>

                    {req.quote && (
                      <div className="text-[.75rem] mt-1 font-semibold">
                        {formatEGP(req.quote)}/mo
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Activity Feed */}

        <Card>
          <div
            className="p-4 pb-3"
            style={{ borderBottom: "1px solid #EEEEEE" }}
          >
            <h2 className="text-[.95rem] font-bold flex items-center gap-2">
              <Clock size={16} style={{ color: "#E60000" }} />
              Activity
            </h2>
          </div>

          <div className="p-3">
            {activity.map((a, i) => (
              <div
                key={i}
                className="flex gap-3 py-2.5"
                style={{
                  borderBottom:
                    i < activity.length - 1
                      ? "1px solid #EEEEEE"
                      : "none",
                }}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "#FCE8E8",
                    color: "#E60000",
                  }}
                >
                  {a.icon}
                </div>

                <div>
                  <div className="text-[.78rem]">
                    {a.text}
                  </div>

                  <div
                    className="text-[.68rem] mt-0.5"
                    style={{ color: "#777777" }}
                  >
                    {a.time}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
