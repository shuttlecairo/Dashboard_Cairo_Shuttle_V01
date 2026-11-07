"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  ShuttleRoute,
  Booking,
  Driver,
  Vehicle,
  B2BRequest,
  EventRequest,
  HotelRequest,
  Role,
  DayOfWeek,
} from "@/types/entities";
import { api } from "@/api-client";
import { Badge } from "@/components/shared/badge";
import { Dialog } from "@/components/shared/dialog";
import { ToastProvider, useToast } from "@/components/shared/toast";
import { ICONS } from "@/components/icons";
import dynamic from "next/dynamic";

const TripMap = dynamic(
  () => import("@/components/trip-map").then((m) => m.TripMap),
  { ssr: false, loading: () => <div className="h-[380px] rounded-[14px] flex items-center justify-center" style={{ background: "var(--bg-card)", border: "1px solid var(--border)" }}>Loading map...</div> }
);

import {
  Bus,
  Crosshair,
  CalendarDays,
  Users,
  Truck,
  Briefcase,
  MapPin,
  Building,
  Navigation,
} from "lucide-react";

// ── Role config ──
const ROLES: Record<Role, { label: string; items: { key: string; icon: string; label: string }[] }> = {
  admin: {
    label: "Super Admin",
    items: [
      { key: "routes", icon: "route", label: "Routes" },
      { key: "bookings", icon: "booking", label: "Bookings" },
      { key: "drivers", icon: "driver", label: "Drivers" },
    ],
  },
  b2b: { label: "B2B Client", items: [{ key: "b2b", icon: "b2b", label: "Requests" }] },
  partner: { label: "Bus Partner", items: [{ key: "fleet", icon: "fleet", label: "Fleet" }] },
  driver: { label: "Driver", items: [{ key: "driver-dash", icon: "nav", label: "Dashboard" }] },
  // event: { label: "Event Partner", items: [{ key: "events", icon: "event", label: "Dashboard" }] },
  // hotel: { label: "Hotel Partner", items: [{ key: "hotel-dash", icon: "hotel", label: "Dashboard" }] },
};

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; size?: number }>> = {
  route: Crosshair,
  booking: CalendarDays,
  driver: Users,
  fleet: Truck,
  b2b: Briefcase,
  event: MapPin,
  hotel: Building,
  nav: Navigation,
};

export function Dashboard() {
  return (
    <ToastProvider>
      <DashboardInner />
    </ToastProvider>
  );
}

function DashboardInner() {
  const [role, setRole] = useState<Role>("admin");
  const [page, setPage] = useState("routes");
  const { show: toast } = useToast();

  // Data states
  const [routes, setRoutes] = useState<ShuttleRoute[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [b2bReqs, setB2bReqs] = useState<B2BRequest[]>([]);
  const [eventReqs, setEventReqs] = useState<EventRequest[]>([]);
  const [hotelReqs, setHotelReqs] = useState<HotelRequest[]>([]);

  // Dialog state
  const [dialog, setDialog] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);

  // Driver dashboard state
  const [activeTrip, setActiveTrip] = useState<string | null>(null);

  // Booking filter
  const [bookingFilter, setBookingFilter] = useState("all");

  const loadData = useCallback(async () => {
    try {
      const [r, b, v, b2b] = await Promise.all([
        api.get<ShuttleRoute[]>("/api/routes"),
        api.get<Booking[]>("/api/bookings"),
        api.get<Vehicle[]>("/api/vehicles"),
        api.get<B2BRequest[]>("/api/b2b"),
      ]);
      setRoutes(r);
      setBookings(b);
      setVehicles(v);
      setB2bReqs(b2b);
      // setHotelReqs(h);
    } catch (e) {
      console.error("Failed to load data", e);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Ensure current page is valid for role
  const roleConfig = ROLES[role];
  const validPage = roleConfig.items.find((i) => i.key === page)
    ? page
    : roleConfig.items[0].key;
  if (validPage !== page) setPage(validPage);

  function switchRole(r: Role) {
    setRole(r);
    setPage(ROLES[r].items[0].key);
    setDialog(null);
    setEditId(null);
    setBookingFilter("all");
  }

  // ── ROUTE CRUD ──
  async function handleAddRoute(data: Record<string, unknown>) {
    try {
      await api.post("/api/routes", data);
      toast("Route added");
      setDialog(null);
      loadData();
    } catch {
      toast("Failed to add route", "danger");
    }
  }

  async function handleUpdateRoute(id: string, data: Record<string, unknown>) {
    try {
      await api.patch(`/api/routes/${id}`, data);
      toast("Route updated");
      setDialog(null);
      setEditId(null);
      loadData();
    } catch {
      toast("Failed to update route", "danger");
    }
  }

  async function handleDeleteRoute(id: string) {
    if (!confirm("Delete this route?")) return;
    try {
      await api.del(`/api/routes/${id}`);
      toast("Route deleted", "danger");
      loadData();
    } catch {
      toast("Failed to delete route", "danger");
    }
  }

  // ── BOOKING CRUD ──
  async function handleAddBooking(data: Record<string, unknown>) {
    try {
      await api.post("/api/bookings", data);
      toast("Booking added");
      setDialog(null);
      loadData();
    } catch {
      toast("Failed to add booking", "danger");
    }
  }

  async function handleUpdateBooking(id: string, data: Record<string, unknown>) {
    try {
      await api.patch(`/api/bookings/${id}`, data);
      toast("Booking updated");
      setDialog(null);
      setEditId(null);
      loadData();
    } catch {
      toast("Failed to update booking", "danger");
    }
  }

  async function handleDeleteBooking(id: string) {
    if (!confirm("Delete this booking?")) return;
    try {
      await api.del(`/api/bookings/${id}`);
      toast("Booking deleted", "danger");
      loadData();
    } catch {
      toast("Failed to delete booking", "danger");
    }
  }

  // ── DRIVER TOGGLE ──
  async function handleToggleDriver(id: string) {
    const d = drivers.find((x) => x.id === id);
    if (!d) return;
    try {
      await api.patch(`/api/drivers/${id}`, { active: !d.active });
      toast(d.name + (d.active ? " deactivated" : " activated"));
      loadData();
    } catch {
      toast("Failed to update driver", "danger");
    }
  }

  // ── VEHICLE CRUD ──
  async function handleAddVehicle(data: Record<string, unknown>) {
    try {
      await api.post("/api/vehicles", data);
      toast("Vehicle added");
      setDialog(null);
      loadData();
    } catch {
      toast("Failed to add vehicle", "danger");
    }
  }

  async function handleUpdateVehicle(id: string, data: Record<string, unknown>) {
    try {
      await api.patch(`/api/vehicles/${id}`, data);
      toast("Vehicle updated");
      setDialog(null);
      setEditId(null);
      loadData();
    } catch {
      toast("Failed to update vehicle", "danger");
    }
  }

  async function handleDeleteVehicle(id: string) {
    if (!confirm("Delete this vehicle?")) return;
    try {
      await api.del(`/api/vehicles/${id}`);
      toast("Vehicle deleted", "danger");
      loadData();
    } catch {
      toast("Failed to delete vehicle", "danger");
    }
  }

  // ── REQUEST ACTIONS (B2B, Events, Hotels) ──
  async function handleAddRequest(coll: string, data: Record<string, unknown>) {
    try {
      await api.post(`/api/${coll}`, data);
      toast("Request submitted!");
      setDialog(null);
      loadData();
    } catch {
      toast("Failed to submit request", "danger");
    }
  }

  async function handleAcceptRequest(coll: string, id: string) {
    try {
      await api.patch(`/api/${coll}/${id}`, { status: "accepted" });
      toast("Request accepted!");
      loadData();
    } catch {
      toast("Failed to accept request", "danger");
    }
  }

  async function handleCancelRequest(coll: string, id: string) {
    if (!confirm("Cancel this request?")) return;
    try {
      await api.patch(`/api/${coll}/${id}`, { status: "cancelled" });
      toast("Request cancelled", "danger");
      loadData();
    } catch {
      toast("Failed to cancel request", "danger");
    }
  }

  // ── DRIVER DASHBOARD ──
  function handleStartTrip(name: string) {
    setActiveTrip(name);
    toast("Trip started: " + name);
  }

  async function handleEndTrip() {
    if (!confirm("End this trip?")) return;
    // Mark confirmed bookings on this route as completed
    const toComplete = bookings.filter(
      (b) => b.route === activeTrip && b.status === "confirmed"
    );
    for (const b of toComplete) {
      await api.patch(`/api/bookings/${b.id}`, { status: "completed" });
    }
    toast("Trip ended — bookings marked completed");
    setActiveTrip(null);
    loadData();
  }

  // ── RENDER ──
  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <nav
        className="w-[220px] flex-shrink-0 flex flex-col overflow-y-auto border-r max-md:hidden"
        style={{
          background: "var(--bg-card)",
          borderColor: "var(--border)",
          padding: "20px 0",
        }}
      >
        <div
          className="flex items-center gap-2 px-5 pb-4 text-lg font-bold"
          style={{ color: "var(--brand)" }}
        >
          <Bus size={22} />
          Cairo Shuttle
        </div>

        <div
          className="px-3 py-2 text-[.65rem] uppercase tracking-widest font-semibold"
          style={{ color: "var(--fg-muted)" }}
        >
          Role
        </div>
        {(Object.entries(ROLES) as [Role, typeof ROLES.admin][]).map(([key, val]) => (
          <button
            key={key}
            onClick={() => switchRole(key)}
            className="flex items-center gap-2.5 py-2 px-5 text-[.85rem] cursor-pointer transition-all text-left border-l-[3px]"
            style={{
              color: role === key ? "var(--brand)" : "var(--fg-muted)",
              background: role === key ? "var(--brand-light)" : "transparent",
              borderColor: role === key ? "var(--brand)" : "transparent",
              fontWeight: role === key ? 600 : 400,
            }}
          >
            {val.label}
          </button>
        ))}

        <div
          className="px-3 py-2 mt-4 text-[.65rem] uppercase tracking-widest font-semibold"
          style={{ color: "var(--fg-muted)" }}
        >
          Pages
        </div>
        {roleConfig.items.map((item) => {
          const Icon = ICON_MAP[item.icon] || Crosshair;
          return (
            <button
              key={item.key}
              onClick={() => {
                setPage(item.key);
                setDialog(null);
                setEditId(null);
              }}
              className="flex items-center gap-2.5 py-2 px-5 text-[.85rem] cursor-pointer transition-all text-left border-l-[3px]"
              style={{
                color: page === item.key ? "var(--brand)" : "var(--fg-muted)",
                background: page === item.key ? "var(--brand-light)" : "transparent",
                borderColor: page === item.key ? "var(--brand)" : "transparent",
                fontWeight: page === item.key ? 600 : 400,
              }}
            >
              <Icon size={16} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-7 max-md:p-4" style={{ background: "var(--bg)" }}>
        {page === "routes" && (
          <RoutesPage
            routes={routes}
            drivers={drivers}
            onAdd={() => setDialog("addRoute")}
            onEdit={(id) => {
              setEditId(id);
              setDialog("editRoute");
            }}
            onDelete={handleDeleteRoute}
          />
        )}
        {page === "bookings" && (
          <BookingsPage
            bookings={bookings}
            routes={routes}
            filter={bookingFilter}
            onFilterChange={setBookingFilter}
            onAdd={() => setDialog("addBooking")}
            onEdit={(id) => {
              setEditId(id);
              setDialog("editBooking");
            }}
            onDelete={handleDeleteBooking}
          />
        )}
        {page === "drivers" && (
          <DriversPage drivers={drivers} onToggle={handleToggleDriver} />
        )}
        {page === "fleet" && (
          <FleetPage
            vehicles={vehicles}
            onAdd={() => setDialog("addVehicle")}
            onEdit={(id) => {
              setEditId(id);
              setDialog("editVehicle");
            }}
            onDelete={handleDeleteVehicle}
          />
        )}
        {page === "b2b" && (
          <RequestsPage
            title="Route Requests"
            subtitle="Manage your corporate shuttle requests"
            items={b2bReqs}
            onAdd={() => setDialog("addB2B")}
            onAccept={(id) => handleAcceptRequest("b2b", id)}
            onCancel={(id) => handleCancelRequest("b2b", id)}
            countLabel="Employees"
          />
        )}
        {/* {page === "driverdash" && (
          <DriverDashPage
            routes={routes}
            bookings={bookings}
            activeTrip={activeTrip}
            onStartTrip={handleStartTrip}
            onEndTrip={handleEndTrip}
            onShowPassengers={(routeId) => setDialog(`passengers_${routeId}`)}
          />
        )} */}
        {/* {page === "events" && (
          <RequestsPage
            title="Event Shuttle Dashboard"
            subtitle="Request shuttle services for your events"
            items={eventReqs}
            onAdd={() => setDialog("addEvent")}
            onAccept={(id) => handleAcceptRequest("events", id)}
            onCancel={(id) => handleCancelRequest("events", id)}
            countLabel="Attendees"
          />
        )}
        {page === "hoteldash" && (
          <HotelDashPage
            items={hotelReqs}
            onAdd={() => setDialog("addHotel")}
            onAccept={(id) => handleAcceptRequest("hotels", id)}
            onCancel={(id) => handleCancelRequest("hotels", id)}
          />
        )} */}
      </main>

      {/* Dialogs */}
      {dialog === "addRoute" && (
        <RouteDialog
          drivers={drivers}
          onClose={() => setDialog(null)}
          onSubmit={handleAddRoute}
        />
      )}
      {dialog === "editRoute" && editId && (
        <RouteDialog
          route={routes.find((r) => r.id === editId)}
          drivers={drivers}
          onClose={() => {
            setDialog(null);
            setEditId(null);
          }}
          onSubmit={(data) => handleUpdateRoute(editId, data)}
        />
      )}
      {dialog === "addBooking" && (
        <BookingDialog
          routes={routes}
          onClose={() => setDialog(null)}
          onSubmit={handleAddBooking}
        />
      )}
      {dialog === "editBooking" && editId && (
        <BookingDialog
          booking={bookings.find((b) => b.id === editId)}
          routes={routes}
          onClose={() => {
            setDialog(null);
            setEditId(null);
          }}
          onSubmit={(data) => handleUpdateBooking(editId, data)}
        />
      )}
      {dialog === "addVehicle" && (
        <VehicleDialog
          onClose={() => setDialog(null)}
          onSubmit={handleAddVehicle}
        />
      )}
      {dialog === "editVehicle" && editId && (
        <VehicleDialog
          vehicle={vehicles.find((v) => v.id === editId)}
          onClose={() => {
            setDialog(null);
            setEditId(null);
          }}
          onSubmit={(data) => handleUpdateVehicle(editId, data)}
        />
      )}
      {dialog === "addB2B" && (
        <RequestDialog
          title="Submit Route Request"
          labels={{ pickup: "Pickup Area", dropoff: "Drop-off Area", count: "Employee Count" }}
          defaultCount={25}
          onClose={() => setDialog(null)}
          onSubmit={(data) => handleAddRequest("b2b", data)}
        />
      )}
      {dialog === "addEvent" && (
        <RequestDialog
          title="Request Event Shuttle"
          labels={{ pickup: "Pickup Area", dropoff: "Drop-off Area", count: "Expected Attendees" }}
          defaultCount={50}
          onClose={() => setDialog(null)}
          onSubmit={(data) => handleAddRequest("events", data)}
        />
      )}
      {dialog === "addHotel" && (
        <RequestDialog
          title="Request Guest Shuttle"
          labels={{
            pickup: "Pickup Location (Hotel)",
            dropoff: "Destination",
            count: "Number of Guests",
          }}
          defaultCount={20}
          onClose={() => setDialog(null)}
          onSubmit={(data) => handleAddRequest("hotels", data)}
        />
      )}
      {dialog?.startsWith("passengers_") && (
        <PassengersDialog
          routeId={dialog.replace("passengers_", "")}
          routes={routes}
          bookings={bookings}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}

// ════════════════════════════════════════
// STAT CARD
// ════════════════════════════════════════
function StatCard({
  label,
  value,
  sub,
  valueColor,
}: {
  label: string;
  value: string | number;
  sub?: string;
  valueColor?: string;
}) {
  return (
    <div
      className="rounded-[14px] p-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
      }}
    >
      <div className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
        {label}
      </div>
      <div
        className="text-[1.8rem] font-bold mt-1"
        style={{ color: valueColor }}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[.72rem] mt-0.5" style={{ color: "var(--fg-muted)" }}>
          {sub}
        </div>
      )}
    </div>
  );
}

// ════════════════════════════════════════
// CARD WRAPPER
// ════════════════════════════════════════
function Card({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-[14px] overflow-hidden mb-5"
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
      }}
    >
      {children}
    </div>
  );
}

// ════════════════════════════════════════
// BUTTON COMPONENTS
// ════════════════════════════════════════
function BtnPrimary({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer transition-all text-white ${className}`}
      style={{ background: "var(--brand)" }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function BtnOutline({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[.75rem] font-semibold cursor-pointer transition-all ${className}`}
      style={{
        background: "transparent",
        border: "1px solid var(--border)",
        color: "var(--fg)",
      }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function BtnSuccess({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border-none text-[.75rem] font-semibold cursor-pointer transition-all text-white ${className}`}
      style={{ background: "var(--success)" }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function BtnDanger({
  children,
  onClick,
  className = "",
}: {
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      className={`inline-flex items-center gap-1.5 px-3.5 py-[7px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer transition-all text-white ${className}`}
      style={{ background: "var(--danger)" }}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

function IconBtn({
  children,
  onClick,
  title,
  danger = false,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  danger?: boolean;
}) {
  return (
    <button
      className="inline-flex items-center justify-center w-[30px] h-[30px] rounded-md border-none cursor-pointer transition-all"
      style={{
        background: "transparent",
        color: "var(--fg-muted)",
      }}
      title={title}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = danger
          ? "var(--danger-light)"
          : "var(--brand-light)";
        e.currentTarget.style.color = danger ? "var(--danger)" : "var(--brand)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.color = "var(--fg-muted)";
      }}
    >
      {children}
    </button>
  );
}

// ════════════════════════════════════════
// FORM COMPONENTS
// ════════════════════════════════════════
function FormGroup({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-3.5">
      <label
        className="block text-[.78rem] font-semibold mb-1"
        style={{ color: "var(--fg-muted)" }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "8px 12px",
  border: "1px solid var(--border)",
  borderRadius: "var(--radius-sm)",
  background: "var(--bg)",
  color: "var(--fg)",
  fontSize: ".85rem",
  fontFamily: "inherit",
  outline: "none",
};

// ════════════════════════════════════════
// ROUTES PAGE
// ════════════════════════════════════════
function RoutesPage({
  routes,
  drivers,
  onAdd,
  onEdit,
  onDelete,
}: {
  routes: ShuttleRoute[];
  drivers: Driver[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const active = routes.filter((r) => r.is_active).length;
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[1.4rem] font-bold">Shuttle Routes</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            {active} active of {routes.length} routes
          </p>
        </div>
        <BtnPrimary onClick={onAdd}>
          <ICONS.plus size={14} /> Add Route
        </BtnPrimary>
      </div>
      <Card>
        <table className="w-full border-collapse text-[.85rem]">
          <thead style={{ background: "var(--bg)" }}>
            <tr>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Time</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Days</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Price</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Cap.</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Driver</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
              <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {routes.map((r) => (
              <tr key={r.id} className="hover:bg-brand-light" style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3 px-4">
                  <strong>{r.name}</strong>
                  <br />
                  <span className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                    {r.pickup_area} → {r.dropoff_area}
                  </span>
                </td>
                <td className="p-3 px-4 whitespace-nowrap">
                  {r.departure_time}
                  {r.return_time ? ` – ${r.return_time}` : ""}
                </td>
                <td className="p-3 px-4">
                  {r.days.map((d) => d.slice(0, 2)).join(" ")}
                </td>
                <td className="p-3 px-4">{r.price} EGP</td>
                <td className="p-3 px-4">{r.capacity}</td>
                <td className="p-3 px-4">
                  {r.driver || (
                    <span style={{ color: "var(--fg-muted)" }}>—</span>
                  )}
                </td>
                <td className="p-3 px-4">
                  <Badge status={r.is_active ? "active" : "inactive"} />
                </td>
                <td className="p-3 px-4 text-right">
                  <IconBtn title="Edit" onClick={() => onEdit(r.id)}>
                    <ICONS.edit size={14} />
                  </IconBtn>
                  <IconBtn title="Delete" danger onClick={() => onDelete(r.id)}>
                    <ICONS.trash size={14} />
                  </IconBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ════════════════════════════════════════
// BOOKINGS PAGE
// ════════════════════════════════════════
function BookingsPage({
  bookings,
  routes,
  filter,
  onFilterChange,
  onAdd,
  onEdit,
  onDelete,
}: {
  bookings: Booking[];
  routes: ShuttleRoute[];
  filter: string;
  onFilterChange: (f: string) => void;
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const counts = {
    all: bookings.length,
    confirmed: bookings.filter((b) => b.status === "confirmed").length,
    completed: bookings.filter((b) => b.status === "completed").length,
    cancelled: bookings.filter((b) => b.status === "cancelled").length,
  };
  const filtered =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[1.4rem] font-bold">Bookings</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            {counts.confirmed} confirmed today
          </p>
        </div>
        <BtnPrimary onClick={onAdd}>
          <ICONS.plus size={14} /> Add Booking
        </BtnPrimary>
      </div>
      <div className="flex gap-2 mb-4 flex-wrap">
        {(["all", "confirmed", "completed", "cancelled"] as const).map((f) => (
          <button
            key={f}
            className="px-3.5 py-1 rounded-full text-[.78rem] font-medium cursor-pointer transition-all"
            style={{
              background: filter === f ? "var(--brand)" : "var(--bg)",
              color: filter === f ? "#fff" : "var(--fg-muted)",
              border: `1px solid ${filter === f ? "var(--brand)" : "var(--border)"}`,
              fontFamily: "inherit",
            }}
            onClick={() => onFilterChange(f)}
          >
            {f === "all" ? "All" : f[0].toUpperCase() + f.slice(1)} (
            {counts[f] || 0})
          </button>
        ))}
      </div>
      <Card>
        <table className="w-full border-collapse text-[.85rem]">
          <thead style={{ background: "var(--bg)" }}>
            <tr>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Rider</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Date</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Seats</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Pickup</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
              <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => (
              <tr key={b.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3 px-4">
                  <strong>{b.rider}</strong>
                  <br />
                  <span className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                    {b.phone}
                  </span>
                </td>
                <td className="p-3 px-4">{b.route}</td>
                <td className="p-3 px-4">{b.date}</td>
                <td className="p-3 px-4">{b.seats}</td>
                <td className="p-3 px-4">
                  {b.pickup || (
                    <span style={{ color: "var(--fg-muted)" }}>—</span>
                  )}
                </td>
                <td className="p-3 px-4">
                  <Badge status={b.status} />
                </td>
                <td className="p-3 px-4 text-right">
                  <IconBtn title="Edit" onClick={() => onEdit(b.id)}>
                    <ICONS.edit size={14} />
                  </IconBtn>
                  <IconBtn title="Delete" danger onClick={() => onDelete(b.id)}>
                    <ICONS.trash size={14} />
                  </IconBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ════════════════════════════════════════
// DRIVERS PAGE
// ════════════════════════════════════════
function DriversPage({
  drivers,
  onToggle,
}: {
  drivers: Driver[];
  onToggle: (id: string) => void;
}) {
  const active = drivers.filter((d) => d.active).length;
  return (
    <>
      <div className="mb-5">
        <h1 className="text-[1.4rem] font-bold">Drivers</h1>
        <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
          {active} active, {drivers.length - active} pending
        </p>
      </div>
      <Card>
        <table className="w-full border-collapse text-[.85rem]">
          <thead style={{ background: "var(--bg)" }}>
            <tr>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Name</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Email</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Phone</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
              <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3 px-4 font-semibold">{d.name}</td>
                <td className="p-3 px-4" style={{ color: "var(--fg-muted)" }}>
                  {d.email}
                </td>
                <td
                  className="p-3 px-4 text-[.8rem]"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {d.phone}
                </td>
                <td className="p-3 px-4">
                  <Badge status={d.active ? "active" : "pending"} />
                </td>
                <td className="p-3 px-4 text-right">
                  {d.active ? (
                    <BtnOutline onClick={() => onToggle(d.id)}>
                      Deactivate
                    </BtnOutline>
                  ) : (
                    <BtnSuccess onClick={() => onToggle(d.id)}>
                      Activate
                    </BtnSuccess>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ════════════════════════════════════════
// FLEET PAGE
// ════════════════════════════════════════
function FleetPage({
  vehicles,
  onAdd,
  onEdit,
  onDelete,
}: {
  vehicles: Vehicle[];
  onAdd: () => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const active = vehicles.filter((v) => v.active).length;
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[1.4rem] font-bold">Fleet Management</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            {active} active of {vehicles.length} vehicles
          </p>
        </div>
        <BtnPrimary onClick={onAdd}>
          <ICONS.plus size={14} /> Add Vehicle
        </BtnPrimary>
      </div>
      <Card>
        <table className="w-full border-collapse text-[.85rem]">
          <thead style={{ background: "var(--bg)" }}>
            <tr>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Plate</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Type</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Capacity</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
              <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td
                  className="p-3 px-4 font-semibold"
                  style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                >
                  {v.plate}
                </td>
                <td className="p-3 px-4 capitalize">{v.type}</td>
                <td className="p-3 px-4">{v.capacity} seats</td>
                <td className="p-3 px-4">
                  <Badge status={v.active ? "active" : "inactive"} />
                </td>
                <td className="p-3 px-4 text-right">
                  <IconBtn title="Edit" onClick={() => onEdit(v.id)}>
                    <ICONS.edit size={14} />
                  </IconBtn>
                  <IconBtn title="Delete" danger onClick={() => onDelete(v.id)}>
                    <ICONS.trash size={14} />
                  </IconBtn>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ════════════════════════════════════════
// REQUESTS PAGE (B2B, Events)
// ════════════════════════════════════════
function RequestsPage({
  title,
  subtitle,
  items,
  onAdd,
  onAccept,
  onCancel,
  countLabel,
}: {
  title: string;
  subtitle: string;
  items: (B2BRequest | EventRequest)[];
  onAdd: () => void;
  onAccept: (id: string) => void;
  onCancel: (id: string) => void;
  countLabel: string;
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[1.4rem] font-bold">{title}</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            {subtitle}
          </p>
        </div>
        <BtnPrimary onClick={onAdd}>
          <ICONS.plus size={14} /> {title.includes("Event") ? "Request Shuttle" : "New Request"}
        </BtnPrimary>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <StatCard label="Total" value={items.length} />
        <StatCard
          label="Pending"
          value={items.filter((r) => r.status === "pending").length}
          valueColor="var(--amber)"
        />
        <StatCard
          label="Active"
          value={
            items.filter((r) =>
              ["accepted", "quoted"].includes(r.status)
            ).length
          }
          valueColor="var(--success)"
        />
      </div>
      <Card>
        <table className="w-full border-collapse text-[.85rem]">
          <thead style={{ background: "var(--bg)" }}>
            <tr>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Schedule</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>{countLabel}</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Quote</th>
              <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3 px-4">
                  <strong>
                    {r.pickup} → {r.dropoff}
                  </strong>
                  {r.notes && (
                    <>
                      <br />
                      <span className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>
                        {r.notes}
                      </span>
                    </>
                  )}
                </td>
                <td className="p-3 px-4">{r.schedule}</td>
                <td className="p-3 px-4">{r.count}</td>
                <td className="p-3 px-4">
                  <Badge status={r.status} />
                </td>
                <td className="p-3 px-4">
                  {r.quote ? (
                    `${r.quote.toLocaleString()} EGP`
                  ) : (
                    <span style={{ color: "var(--fg-muted)" }}>—</span>
                  )}
                </td>
                <td className="p-3 px-4 text-right">
                  {r.status === "quoted" && (
                    <BtnSuccess onClick={() => onAccept(r.id)}>
                      <ICONS.check size={12} /> Accept
                    </BtnSuccess>
                  )}
                  {["pending", "quoted"].includes(r.status) && (
                    <IconBtn
                      title="Cancel"
                      danger
                      onClick={() => onCancel(r.id)}
                    >
                      <ICONS.trash size={14} />
                    </IconBtn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ════════════════════════════════════════
// DRIVER DASHBOARD PAGE
// ════════════════════════════════════════
function DriverDashPage({
  routes,
  bookings,
  activeTrip,
  onStartTrip,
  onEndTrip,
  onShowPassengers,
}: {
  routes: ShuttleRoute[];
  bookings: Booking[];
  activeTrip: string | null;
  onStartTrip: (name: string) => void;
  onEndTrip: () => void;
  onShowPassengers: (routeId: string) => void;
}) {
  const myRoutes = routes.filter((r) => r.driver === "Ahmed Hassan");
  const myBookings = bookings.filter(
    (b) => b.route === "New Cairo → Downtown" && b.status === "confirmed"
  );
  const totalRiders = myBookings.reduce((s, b) => s + b.seats, 0);
  const activeRoute = activeTrip
    ? routes.find((r) => r.name === activeTrip)
    : null;

  return (
    <>
      <div className="mb-5">
        <h1 className="text-[1.4rem] font-bold">Welcome back, Ahmed</h1>
        <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
          Your driver dashboard
        </p>
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(180px,1fr))] gap-4 mb-6">
        <div
          className="rounded-[14px] p-5"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            boxShadow: "var(--shadow)",
          }}
        >
          <div className="text-[.78rem]" style={{ color: "var(--fg-muted)" }}>
            Your Status
          </div>
          <div className="flex items-center gap-2 mt-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ background: activeTrip ? "var(--success)" : "var(--amber)" }}
            />
            <span
              className="text-[1.1rem] font-semibold"
              style={{ color: activeTrip ? "var(--success)" : "var(--amber)" }}
            >
              {activeTrip ? "On Trip" : "Available"}
            </span>
          </div>
        </div>
        <StatCard
          label="Today's Riders"
          value={totalRiders}
          sub={`${myBookings.length} bookings confirmed`}
        />
        <StatCard label="Routes Assigned" value={myRoutes.length} />
      </div>

      {/* ═══ LIVE MAP when trip is active ═══ */}
      {activeTrip && activeRoute && (
        <TripMap
          pickup={activeRoute.pickup_coords}
          dropoff={activeRoute.dropoff_coords}
          waypoints={activeRoute.waypoints}
          routeName={activeRoute.name}
          onClose={onEndTrip}
        />
      )}

      {/* Passengers bar during active trip */}
      {activeTrip && activeRoute && (
        <div
          className="p-3.5 px-5 rounded-[14px] mb-5 flex justify-between items-center"
          style={{
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
          }}
        >
          <div className="flex items-center gap-3">
            <ICONS.users size={16} style={{ color: "var(--brand)" }} />
            <div>
              <strong className="text-[.85rem]">
                {bookings.filter(
                  (b) => b.route === activeTrip && b.status === "confirmed"
                ).length}{" "}
                passengers
              </strong>
              <span
                className="text-[.78rem] ml-2"
                style={{ color: "var(--fg-muted)" }}
              >
                on this trip
              </span>
            </div>
          </div>
          <BtnOutline onClick={() => onShowPassengers(activeRoute.id)}>
            <ICONS.users size={12} /> View All
          </BtnOutline>
        </div>
      )}

      <div className="pb-3">
        <strong className="text-[.95rem]">Your Routes</strong>
      </div>
      {myRoutes.map((r) => {
        const rb = bookings.filter(
          (b) => b.route === r.name && b.status === "confirmed"
        );
        const isTripActive = activeTrip === r.name;
        return (
          <div
            key={r.id}
            className="p-4 rounded-[14px] mb-3 transition-all"
            style={{
              border: `1px solid ${isTripActive ? "var(--success)" : "var(--border)"}`,
              background: isTripActive ? "var(--success-light)" : "transparent",
            }}
          >
            <div className="flex justify-between items-start">
              <div>
                <strong>{r.name}</strong>
                <div className="text-[.82rem] mt-0.5 flex items-center gap-1" style={{ color: "var(--fg-muted)" }}>
                  <ICONS.pin size={12} /> {r.pickup_area} → {r.dropoff_area}
                </div>
                <div className="text-[.78rem] mt-1" style={{ color: "var(--fg-muted)" }}>
                  {r.departure_time}
                  {r.return_time ? ` – ${r.return_time}` : ""} ·{" "}
                  {rb.reduce((s, b) => s + b.seats, 0)}/{r.capacity} seats ·{" "}
                  {r.days.map((d) => d.slice(0, 2)).join(" ")}
                </div>
              </div>
              <div className="flex gap-1.5 items-center">
                <BtnOutline onClick={() => onShowPassengers(r.id)}>
                  <ICONS.users size={12} /> {rb.length}
                </BtnOutline>
                {!activeTrip && (
                  <BtnSuccess onClick={() => onStartTrip(r.name)}>
                    <ICONS.play size={12} /> Start
                  </BtnSuccess>
                )}
                {isTripActive && (
                  <BtnDanger onClick={onEndTrip}>
                    <ICONS.stop size={12} /> End
                  </BtnDanger>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

// ════════════════════════════════════════
// HOTEL DASHBOARD PAGE
// ════════════════════════════════════════
function HotelDashPage({
  items,
  onAdd,
  onAccept,
  onCancel,
}: {
  items: HotelRequest[];
  onAdd: () => void;
  onAccept: (id: string) => void;
  onCancel: (id: string) => void;
}) {
  const steps = [
    { s: "1", t: "Submit a Request", d: "Pickup, destination, guests, timing." },
    { s: "2", t: "Get a Quote", d: "Priced by distance and vehicle." },
    { s: "3", t: "Confirm & Track", d: "Guests track the shuttle live." },
  ];

  return (
    <>
      <div className="flex justify-between items-center mb-5">
        <div>
          <h1 className="text-[1.4rem] font-bold">Hotel Shuttle Dashboard</h1>
          <p className="text-[.85rem]" style={{ color: "var(--fg-muted)" }}>
            Arrange shuttle services for your guests
          </p>
        </div>
        <BtnPrimary onClick={onAdd}>
          <ICONS.plus size={14} /> Request Shuttle
        </BtnPrimary>
      </div>

      <div
        className="p-4 px-5 rounded-[14px] mb-5 flex gap-6 flex-wrap"
        style={{
          background: "var(--bg-card)",
          border: "1px solid var(--border)",
        }}
      >
        {steps.map((x) => (
          <div key={x.s} className="flex gap-2.5 flex-1 min-w-[180px]">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-[.78rem] flex-shrink-0"
              style={{ background: "var(--brand-light)", color: "var(--brand)" }}
            >
              {x.s}
            </div>
            <div>
              <strong className="text-[.82rem]">{x.t}</strong>
              <br />
              <span className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                {x.d}
              </span>
            </div>
          </div>
        ))}
      </div>

      <Card>
        <table className="w-full border-collapse text-[.85rem]">
          <thead style={{ background: "var(--bg)" }}>
            <tr>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Route</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Schedule</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Guests</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Status</th>
              <th className="text-left p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Quote</th>
              <th className="text-right p-2.5 px-4 font-medium text-[.78rem]" style={{ color: "var(--fg-muted)" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((r) => (
              <tr key={r.id} style={{ borderTop: "1px solid var(--border)" }}>
                <td className="p-3 px-4">
                  <strong>
                    {r.pickup} → {r.dropoff}
                  </strong>
                  {r.notes && (
                    <>
                      <br />
                      <span className="text-[.72rem]" style={{ color: "var(--fg-muted)" }}>
                        {r.notes}
                      </span>
                    </>
                  )}
                </td>
                <td className="p-3 px-4">{r.schedule}</td>
                <td className="p-3 px-4">{r.count}</td>
                <td className="p-3 px-4">
                  <Badge status={r.status} />
                </td>
                <td className="p-3 px-4">
                  {r.quote ? (
                    `${r.quote.toLocaleString()} EGP`
                  ) : (
                    <span style={{ color: "var(--fg-muted)" }}>—</span>
                  )}
                </td>
                <td className="p-3 px-4 text-right">
                  {r.status === "quoted" && (
                    <BtnSuccess onClick={() => onAccept(r.id)}>
                      <ICONS.check size={12} /> Accept
                    </BtnSuccess>
                  )}
                  {["pending", "quoted"].includes(r.status) && (
                    <IconBtn
                      title="Cancel"
                      danger
                      onClick={() => onCancel(r.id)}
                    >
                      <ICONS.trash size={14} />
                    </IconBtn>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}

// ════════════════════════════════════════
// DIALOGS
// ════════════════════════════════════════
function RouteDialog({
  route,
  drivers,
  onClose,
  onSubmit,
}: {
  route?: ShuttleRoute;
  drivers: Driver[];
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [pickup, setPickup] = useState(route?.pickup_area ?? "");
  const [dropoff, setDropoff] = useState(route?.dropoff_area ?? "");
  const [dep, setDep] = useState(route?.departure_time ?? "07:00");
  const [ret, setRet] = useState(route?.return_time ?? "18:00");
  const [days, setDays] = useState<DayOfWeek[]>(
    route?.days ?? ["Sun", "Mon", "Tue", "Wed", "Thu"]
  );
  const [price, setPrice] = useState(route?.price ?? 85);
  const [cap, setCap] = useState(route?.capacity ?? 14);
  const [driver, setDriver] = useState(route?.driver ?? "");

  const allDays: DayOfWeek[] = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  function toggleDay(d: DayOfWeek) {
    setDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]
    );
  }

  return (
    <Dialog title={route ? "Edit Route" : "Add Shuttle Route"} onClose={onClose}>
      <div className="flex gap-3">
        <FormGroup label="Pickup Area">
          <input
            style={inputStyle}
            placeholder="New Cairo - 5th Settlement"
            value={pickup}
            onChange={(e) => setPickup(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Drop-off Area">
          <input
            style={inputStyle}
            placeholder="Downtown Cairo"
            value={dropoff}
            onChange={(e) => setDropoff(e.target.value)}
          />
        </FormGroup>
      </div>
      <div className="flex gap-3">
        <FormGroup label="Departure">
          <input
            style={inputStyle}
            type="time"
            value={dep}
            onChange={(e) => setDep(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Return">
          <input
            style={inputStyle}
            type="time"
            value={ret}
            onChange={(e) => setRet(e.target.value)}
          />
        </FormGroup>
      </div>
      <FormGroup label="Days of Week">
        <div className="flex gap-1.5 flex-wrap">
          {allDays.map((d) => (
            <button
              key={d}
              onClick={() => toggleDay(d)}
              className="px-2.5 py-1 rounded-full text-[.72rem] font-semibold cursor-pointer transition-all"
              style={{
                background: days.includes(d) ? "var(--brand)" : "var(--bg)",
                color: days.includes(d) ? "#fff" : "var(--fg-muted)",
                border: `1px solid ${days.includes(d) ? "var(--brand)" : "var(--border)"}`,
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </FormGroup>
      <div className="flex gap-3">
        <FormGroup label="Price (EGP)">
          <input
            style={inputStyle}
            type="number"
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup label="Capacity">
          <input
            style={inputStyle}
            type="number"
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
          />
        </FormGroup>
      </div>
      <FormGroup label="Assign Driver">
        <select
          style={inputStyle}
          value={driver}
          onChange={(e) => setDriver(e.target.value)}
        >
          <option value="">— Select Driver —</option>
          {drivers
            .filter((d) => d.active)
            .map((d) => (
              <option key={d.id}>{d.name}</option>
            ))}
        </select>
      </FormGroup>
      <button
        className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
        style={{ background: "var(--brand)" }}
        onClick={() =>
          onSubmit({
            pickup_area: pickup,
            dropoff_area: dropoff,
            departure_time: dep,
            return_time: ret,
            days,
            price,
            capacity: cap,
            driver: driver || null,
          })
        }
      >
        {route ? "Update Route" : "Add Route"}
      </button>
    </Dialog>
  );
}

function BookingDialog({
  booking,
  routes,
  onClose,
  onSubmit,
}: {
  booking?: Booking;
  routes: ShuttleRoute[];
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const activeRoutes = routes.filter((r) => r.is_active);
  const [route, setRoute] = useState(
    booking?.route ?? activeRoutes[0]?.name ?? ""
  );
  const [rider, setRider] = useState(booking?.rider ?? "");
  const [phone, setPhone] = useState(booking?.phone ?? "");
  const [seats, setSeats] = useState(booking?.seats ?? 1);
  const [date, setDate] = useState(booking?.date ?? "2026-11-04");
  const [pickup, setPickup] = useState(booking?.pickup ?? "");
  const [status, setStatus] = useState(booking?.status ?? "confirmed");

  return (
    <Dialog title={booking ? "Edit Booking" : "Add Booking"} onClose={onClose}>
      <FormGroup label="Route">
        <select
          style={inputStyle}
          value={route}
          onChange={(e) => setRoute(e.target.value)}
        >
          {activeRoutes.map((r) => (
            <option key={r.id}>{r.name}</option>
          ))}
        </select>
      </FormGroup>
      <div className="flex gap-3">
        <FormGroup label="Rider Name">
          <input
            style={inputStyle}
            placeholder="Full name"
            value={rider}
            onChange={(e) => setRider(e.target.value)}
          />
        </FormGroup>
        <FormGroup label="Phone">
          <input
            style={inputStyle}
            placeholder="+201xxxxxxxxx"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </FormGroup>
      </div>
      <div className="flex gap-3">
        <FormGroup label="Seats">
          <input
            style={inputStyle}
            type="number"
            min="1"
            value={seats}
            onChange={(e) => setSeats(Number(e.target.value))}
          />
        </FormGroup>
        <FormGroup label="Date">
          <input
            style={inputStyle}
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </FormGroup>
      </div>
      <FormGroup label="Pickup Point">
        <input
          style={inputStyle}
          placeholder="Specific pickup"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
      </FormGroup>
      {booking && (
        <FormGroup label="Status">
          <select
            style={inputStyle}
            value={status}
            onChange={(e) => setStatus(e.target.value as Booking["status"])}
          >
            {["confirmed", "completed", "cancelled", "no_show"].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </FormGroup>
      )}
      <button
        className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
        style={{ background: "var(--brand)" }}
        onClick={() =>
          onSubmit({
            route,
            rider,
            phone,
            seats,
            date,
            pickup,
            ...(booking ? { status } : {}),
          })
        }
      >
        {booking ? "Update Booking" : "Add Booking"}
      </button>
    </Dialog>
  );
}

function VehicleDialog({
  vehicle,
  onClose,
  onSubmit,
}: {
  vehicle?: Vehicle;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [plate, setPlate] = useState(vehicle?.plate ?? "");
  const [type, setType] = useState(vehicle?.type ?? "minibus");
  const [cap, setCap] = useState(vehicle?.capacity ?? 14);

  return (
    <Dialog title={vehicle ? "Edit Vehicle" : "Add Vehicle"} onClose={onClose}>
      <FormGroup label="Plate Number">
        <input
          style={{ ...inputStyle, fontFamily: "'IBM Plex Mono', monospace" }}
          placeholder="أ ب ج ١٢٣٤"
          value={plate}
          onChange={(e) => setPlate(e.target.value)}
        />
      </FormGroup>
      <div className="flex gap-3">
        <FormGroup label="Type">
          <select
            style={inputStyle}
            value={type}
            onChange={(e) => setType(e.target.value as Vehicle["type"])}
          >
            {["minibus", "bus", "microbus", "van", "sedan"].map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </FormGroup>
        <FormGroup label="Capacity">
          <input
            style={inputStyle}
            type="number"
            value={cap}
            onChange={(e) => setCap(Number(e.target.value))}
          />
        </FormGroup>
      </div>
      <button
        className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
        style={{ background: "var(--brand)" }}
        onClick={() => onSubmit({ plate, type, capacity: cap })}
      >
        {vehicle ? "Update Vehicle" : "Add Vehicle"}
      </button>
    </Dialog>
  );
}

function RequestDialog({
  title,
  labels,
  defaultCount,
  onClose,
  onSubmit,
}: {
  title: string;
  labels: { pickup: string; dropoff: string; count: string };
  defaultCount: number;
  onClose: () => void;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");
  const [schedule, setSchedule] = useState("");
  const [count, setCount] = useState(defaultCount);
  const [notes, setNotes] = useState("");

  return (
    <Dialog title={title} onClose={onClose}>
      <FormGroup label={labels.pickup}>
        <input
          style={inputStyle}
          placeholder="Enter location"
          value={pickup}
          onChange={(e) => setPickup(e.target.value)}
        />
      </FormGroup>
      <FormGroup label={labels.dropoff}>
        <input
          style={inputStyle}
          placeholder="Enter destination"
          value={dropoff}
          onChange={(e) => setDropoff(e.target.value)}
        />
      </FormGroup>
      <FormGroup label="Schedule">
        <input
          style={inputStyle}
          placeholder="e.g. Daily 7am & 5pm"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
        />
      </FormGroup>
      <FormGroup label={labels.count}>
        <input
          style={inputStyle}
          type="number"
          value={count}
          onChange={(e) => setCount(Number(e.target.value))}
        />
      </FormGroup>
      <FormGroup label="Notes">
        <input
          style={inputStyle}
          placeholder="Any special requirements..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </FormGroup>
      <button
        className="w-full px-3.5 py-[9px] rounded-lg border-none text-[.82rem] font-semibold cursor-pointer text-white"
        style={{ background: "var(--brand)" }}
        onClick={() => onSubmit({ pickup, dropoff, schedule, count, notes })}
      >
        Submit Request
      </button>
    </Dialog>
  );
}

function PassengersDialog({
  routeId,
  routes,
  bookings,
  onClose,
}: {
  routeId: string;
  routes: ShuttleRoute[];
  bookings: Booking[];
  onClose: () => void;
}) {
  const route = routes.find((r) => r.id === routeId);
  const rb = bookings.filter(
    (b) => b.route === route?.name && b.status === "confirmed"
  );

  return (
    <Dialog title={`Passengers — ${route?.name ?? ""}`} onClose={onClose}>
      {rb.length ? (
        rb.map((b) => (
          <div
            key={b.id}
            className="flex justify-between items-center p-2.5 px-3.5 rounded-lg mb-1.5"
            style={{ background: "var(--bg)" }}
          >
            <div>
              <strong className="text-[.85rem]">{b.rider}</strong>
              <br />
              <span className="text-[.75rem]" style={{ color: "var(--fg-muted)" }}>
                {b.seats} seat{b.seats > 1 ? "s" : ""}
                {b.pickup ? ` · ${b.pickup}` : ""}
              </span>
            </div>
            <span style={{ color: "var(--brand)" }} title={b.phone}>
              <ICONS.phone size={16} />
            </span>
          </div>
        ))
      ) : (
        <div className="p-6 text-center" style={{ color: "var(--fg-muted)" }}>
          No bookings for this route today.
        </div>
      )}
    </Dialog>
  );
}
