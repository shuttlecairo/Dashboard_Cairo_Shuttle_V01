
"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import {
  Card,
  BtnPrimary,
  BtnOutline,
  SearchInput,
  Pagination,
  EmptyState,
  TableSkeleton,
  Modal
} from "@/components/dashboard/shared";

import { useToast } from "@/components/shared/toast";
import { inputStyle } from "@/config/dashboard";

import {
  Ticket,
  Plus,
  Edit3,
  Trash2,
  Eye,
  Filter,
  Users,
  RotateCcw
} from "lucide-react";

// ==========================================
// HELPERS
// ==========================================

function formatEGP(n: number) {
  return Number(n || 0).toLocaleString("en-EG") + " EGP";
}

const statusColors: Record<string, { bg: string; fg: string }> = {
  confirmed: {
    bg: "var(--success-light)",
    fg: "var(--success)"
  },
  pending: {
    bg: "var(--amber-light)",
    fg: "var(--amber)"
  },
  cancelled: {
    bg: "var(--danger-light, #fee)",
    fg: "var(--danger)"
  },
  completed: {
    bg: "var(--blue-light, #e8f4fd)",
    fg: "var(--blue, #2563eb)"
  },
  no_show: {
    bg: "var(--danger-light, #fee)",
    fg: "var(--danger)"
  }
};

function StatusPill({ status }: { status: string }) {
  const c = statusColors[status] || {
    bg: "var(--bg)",
    fg: "var(--fg-muted)"
  };

  return (
    <span
      className="inline-flex items-center rounded-full px-3 py-1.5 text-xs font-semibold capitalize whitespace-nowrap"
      style={{
        background: c.bg,
        color: c.fg
      }}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

const EMPTY: any = {
  trip_id: "",
  passenger_name: "",
  passenger_phone: "",
  seat_number: "",
  price: "",
  payment_method: "cash",
  status: "confirmed",
  booked_for_name: "",
  booked_for_phone: ""
};

// ==========================================
// MAIN PAGE
// ==========================================

export default function BookingsPage() {
  const { show } = useToast();

  const [loading, setLoading] = useState(true);

  const [bookings, setBookings] = useState<any[]>([]);
  const [trips, setTrips] = useState<any[]>([]);

  const [search, setSearch] = useState("");
  const [routeFilter, setRouteFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");

  const [page, setPage] = useState(1);

  const [modal, setModal] = useState<
    null | "add" | "edit" | "view"
  >(null);

  const [form, setForm] = useState<any>({ ...EMPTY });
  const [selected, setSelected] = useState<any>(null);

  const perPage = 10;

  // ==========================================
  // LOAD DATA
  // ==========================================

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const [bRes, tRes] = await Promise.all([
        fetch("/api/bookings").then(r => r.json()),
        fetch("/api/trips").then(r => r.json())
      ]);

      setBookings(bRes.success ? bRes.data : []);
      setTrips(tRes.success ? tRes.data : []);

    } catch {
      show("Failed to load bookings", "danger");
    }

    setLoading(false);
  }, [show]);

  useEffect(() => {
    load();
  }, [load]);

  // ==========================================
  // ROUTES
  // ==========================================

  const routes = useMemo(() => {
    const uniqueRoutes = new Set<string>();

    trips.forEach(t => {
      if (t.route_name) {
        uniqueRoutes.add(t.route_name);
      }
    });

    // Also include routes found in existing bookings.
    bookings.forEach(b => {
      if (b.route_name) {
        uniqueRoutes.add(b.route_name);
      }
    });

    return Array.from(uniqueRoutes).sort();
  }, [trips, bookings]);

  // ==========================================
  // FILTER BOOKINGS
  // ==========================================

  const filtered = useMemo(() => {
    return bookings.filter(b => {
      const searchTerm = search.toLowerCase();

      const matchesSearch = [
        b.passenger_name,
        b.passenger_phone,
        b.route_name
      ].some(v =>
        String(v || "").toLowerCase().includes(searchTerm)
      );

      const matchesRoute =
        routeFilter === "all" ||
        b.route_name === routeFilter;

      const matchesStatus =
        statusFilter === "all" ||
        b.status === statusFilter;

      return (
        matchesSearch &&
        matchesRoute &&
        matchesStatus
      );
    });
  }, [bookings, search, routeFilter, statusFilter]);

  // ==========================================
  // PAGINATION
  // ==========================================

  const totalPages = Math.ceil(filtered.length / perPage);

  const paged = filtered.slice(
    (page - 1) * perPage,
    page * perPage
  );

  // ==========================================
  // STATISTICS
  // ==========================================

  const confirmedCount = filtered.filter(
    b => b.status === "confirmed"
  ).length;

  const pendingCount = filtered.filter(
    b => b.status === "pending"
  ).length;

  const totalRevenue = filtered
    .filter(b =>
      ["confirmed", "completed"].includes(b.status)
    )
    .reduce(
      (sum, b) => sum + Number(b.price || 0),
      0
    );

  // ==========================================
  // FILTER ACTIONS
  // ==========================================

  const hasFilters =
    search !== "" ||
    routeFilter !== "all" ||
    statusFilter !== "all";

  function resetFilters() {
    setSearch("");
    setRouteFilter("all");
    setStatusFilter("all");
    setPage(1);
  }

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateRoute(value: string) {
    setRouteFilter(value);
    setPage(1);
  }

  function updateStatus(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  // ==========================================
  // SAVE BOOKING
  // ==========================================

  async function save() {
    if (!form.trip_id || !form.passenger_name || !form.passenger_phone) {
      show("Please fill in the required fields", "danger");
      return;
    }

    const method = modal === "edit" ? "PATCH" : "POST";

    const url = modal === "edit"
      ? `/api/bookings?id=${selected.id}`
      : "/api/bookings";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...form,
          price: Number(form.price),
          seat_number: form.seat_number
            ? Number(form.seat_number)
            : null
        })
      });

      const json = await res.json();

      if (json.success) {
        show(
          modal === "edit"
            ? "Booking updated"
            : "Booking created",
          "success"
        );

        setModal(null);
        load();

      } else {
        show(json.error || "Failed", "danger");
      }

    } catch {
      show("Network error", "danger");
    }
  }

  // ==========================================
  // CANCEL BOOKING
  // ==========================================

  async function remove(id: string) {
    if (!confirm("Cancel this booking?")) return;

    try {
      const res = await fetch(`/api/bookings?id=${id}`, {
        method: "DELETE"
      });

      const json = await res.json();

      if (json.success) {
        show("Booking cancelled", "success");
        load();
      } else {
        show(json.error || "Failed", "danger");
      }

    } catch {
      show("Network error", "danger");
    }
  }

  // ==========================================
  // EDIT BOOKING
  // ==========================================

  function openEdit(b: any) {
    setSelected(b);

    setForm({
      trip_id: b.trip_id,
      passenger_name: b.passenger_name,
      passenger_phone: b.passenger_phone,
      seat_number: b.seat_number || "",
      price: b.price,
      payment_method: b.payment_method,
      status: b.status,
      booked_for_name: b.booked_for_name || "",
      booked_for_phone: b.booked_for_phone || ""
    });

    setModal("edit");
  }

  // ==========================================
  // PAGE UI
  // ==========================================

  return (
    <div
      className="w-full min-w-0 px-4 py-6 sm:px-6 lg:px-8"
      style={{ animation: "fadeIn .3s ease" }}
    >

      {/* ======================================
          HEADER
      ====================================== */}

      <div className="flex flex-wrap justify-between items-center gap-4 mb-8">

        <div className="flex items-center gap-3">
          <div
            className="flex items-center justify-center rounded-xl p-3"
            style={{
              background: "var(--brand-light, var(--bg))",
              color: "var(--brand)"
            }}
          >
            <Ticket size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              Bookings Management
            </h1>

            <p
              className="text-sm mt-1"
              style={{ color: "var(--fg-muted)" }}
            >
              Manage passengers, routes and reservations
            </p>
          </div>
        </div>

        <BtnPrimary
          onClick={() => {
            setForm({ ...EMPTY });
            setModal("add");
          }}
        >
          <Plus size={15} />
          New Booking
        </BtnPrimary>

      </div>

      {/* ======================================
          STATISTICS
      ====================================== */}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 mb-8">

        {/* Total Bookings */}
        <Card>
          <div className="p-5 sm:p-6 flex items-center gap-4 min-h-[110px]">

            <div
              className="rounded-xl p-3 shrink-0"
              style={{
                background: "var(--brand-light, var(--bg))",
                color: "var(--brand)"
              }}
            >
              <Users size={23} />
            </div>

            <div className="min-w-0">
              <p
                className="text-sm mb-2"
                style={{ color: "var(--fg-muted)" }}
              >
                Filtered Bookings
              </p>

              <p className="text-2xl font-bold">
                {filtered.length}
              </p>
            </div>

          </div>
        </Card>

        {/* Confirmed Bookings */}
        <Card>
          <div className="p-5 sm:p-6 flex items-center gap-4 min-h-[110px]">

            <div
              className="rounded-xl p-3 shrink-0"
              style={{
                background: "var(--success-light)",
                color: "var(--success)"
              }}
            >
              <Ticket size={23} />
            </div>

            <div className="min-w-0">
              <p
                className="text-sm mb-2"
                style={{ color: "var(--fg-muted)" }}
              >
                Confirmed Bookings
              </p>

              <p className="text-2xl font-bold">
                {confirmedCount}
              </p>
            </div>

          </div>
        </Card>

        {/* Revenue */}
        <Card>
          <div className="p-5 sm:p-6 flex items-center gap-4 min-h-[110px]">

            <div
              className="rounded-xl p-3 shrink-0"
              style={{
                background: "var(--blue-light, #e8f4fd)",
                color: "var(--blue, #2563eb)"
              }}
            >
              <Ticket size={23} />
            </div>

            <div className="min-w-0">
              <p
                className="text-sm mb-2"
                style={{ color: "var(--fg-muted)" }}
              >
                Filtered Revenue
              </p>

              <p className="text-xl sm:text-2xl font-bold break-words">
                {formatEGP(totalRevenue)}
              </p>
            </div>

          </div>
        </Card>

      </div>

      {/* ======================================
          FILTERS
      ====================================== */}

      <Card>
        <div className="p-5 sm:p-7">

          {/* Filter Header */}
          <div className="flex flex-wrap justify-between items-center gap-3 mb-7">

            <div className="flex items-center gap-3">

              <div
                className="rounded-lg p-2.5"
                style={{
                  background: "var(--brand-light, var(--bg))",
                  color: "var(--brand)"
                }}
              >
                <Filter size={19} />
              </div>

              <div>
                <h2 className="font-bold text-base">
                  Filter Bookings
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Find bookings by passenger, route or status
                </p>
              </div>

            </div>

            {hasFilters && (
              <button
                onClick={resetFilters}
                className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-opacity hover:opacity-75"
                style={{
                  background: "var(--bg)",
                  color: "var(--brand)",
                  border: "1px solid var(--border)"
                }}
              >
                <RotateCcw size={14} />
                Reset Filters
              </button>
            )}

          </div>

          {/* Filter Inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">

            {/* Search */}
            <div className="min-w-0">

              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--fg-muted)" }}
              >
                Search Passenger
              </label>

              <SearchInput
                value={search}
                onChange={updateSearch}
                placeholder="Name or phone number..."
              />

            </div>

            {/* Route */}
            <div className="min-w-0">

              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--fg-muted)" }}
              >
                Filter by Route
              </label>

              <select
                style={inputStyle}
                className="w-full min-w-0"
                value={routeFilter}
                onChange={e => updateRoute(e.target.value)}
              >
                <option value="all">All Routes</option>

                {routes.map(route => (
                  <option key={route} value={route}>
                    {route}
                  </option>
                ))}

              </select>

            </div>

            {/* Status */}
            <div className="min-w-0">

              <label
                className="block text-sm font-semibold mb-3"
                style={{ color: "var(--fg-muted)" }}
              >
                Filter by Status
              </label>

              <select
                style={inputStyle}
                className="w-full min-w-0"
                value={statusFilter}
                onChange={e => updateStatus(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
                <option value="no_show">No Show</option>
              </select>

            </div>

          </div>

          {/* Selected Route Summary */}
          {routeFilter !== "all" && (
            <div
              className="mt-7 p-5 rounded-xl flex flex-wrap justify-between items-center gap-4"
              style={{
                background: "var(--bg)",
                border: "1px solid var(--border)"
              }}
            >

              <div className="min-w-0">
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Selected Route
                </p>

                <p className="font-semibold text-sm break-words">
                  {routeFilter}
                </p>
              </div>

              <div className="text-right">
                <p
                  className="text-xs mb-2"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Matching Passengers
                </p>

                <p className="text-2xl font-bold">
                  {filtered.length}
                </p>
              </div>

            </div>
          )}

        </div>
      </Card>

      {/* ======================================
          BOOKINGS TABLE
      ====================================== */}

      <div className="mt-8">

        {loading ? (

          <TableSkeleton rows={6} cols={8} />

        ) : filtered.length === 0 ? (

          <Card>
            <div className="p-8 sm:p-12">
              <EmptyState
                title="No bookings found"
                description="Try changing your search or filters."
              />
            </div>
          </Card>

        ) : (

          <Card>

            {/* Table Header */}
            <div className="p-5 sm:p-6 flex flex-wrap justify-between items-center gap-3">

              <div>
                <h2 className="font-bold text-base">
                  Booking Records
                </h2>

                <p
                  className="text-xs mt-1"
                  style={{ color: "var(--fg-muted)" }}
                >
                  View and manage all passenger bookings
                </p>
              </div>

              <div
                className="rounded-lg px-4 py-2 text-sm font-medium"
                style={{
                  background: "var(--bg)",
                  color: "var(--fg-muted)"
                }}
              >
                {filtered.length} Records
              </div>

            </div>

            {/* Table */}
            <div className="overflow-x-auto">

              <table className="w-full text-sm border-separate border-spacing-0">

                <thead>
                  <tr style={{ background: "var(--bg)" }}>

                    {[
                      "Passenger",
                      "Phone",
                      "Route",
                      "Seat",
                      "Price",
                      "Payment",
                      "Status",
                      "Actions"
                    ].map(h => (

                      <th
                        key={h}
                        className="px-5 py-4 text-left text-xs font-semibold whitespace-nowrap"
                        style={{
                          color: "var(--fg-muted)",
                          borderTop: "1px solid var(--border)",
                          borderBottom: "1px solid var(--border)"
                        }}
                      >
                        {h}
                      </th>

                    ))}

                  </tr>
                </thead>

                <tbody>

                  {paged.map(b => (

                    <tr
                      key={b.id}
                      className="transition-colors"
                      style={{
                        borderBottom: "1px solid var(--border)"
                      }}
                    >

                      <td className="px-5 py-5 font-semibold whitespace-nowrap">
                        {b.passenger_name}
                      </td>

                      <td className="px-5 py-5 whitespace-nowrap">
                        {b.passenger_phone}
                      </td>

                      <td className="px-5 py-5 whitespace-nowrap">
                        {b.route_name || "—"}
                      </td>

                      <td className="px-5 py-5">
                        {b.seat_number || "—"}
                      </td>

                      <td className="px-5 py-5 whitespace-nowrap font-medium">
                        {formatEGP(b.price)}
                      </td>

                      <td className="px-5 py-5 capitalize whitespace-nowrap">
                        {b.payment_method?.replace(/_/g, " ") || "—"}
                      </td>

                      <td className="px-5 py-5">
                        <StatusPill status={b.status} />
                      </td>

                      <td className="px-5 py-5">

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() => {
                              setSelected(b);
                              setModal("view");
                            }}
                            className="p-2.5 rounded-lg transition-colors hover:opacity-70"
                            style={{
                              color: "var(--brand)",
                              background: "var(--bg)"
                            }}
                            title="View booking"
                          >
                            <Eye size={16} />
                          </button>

                          {/* <button
                            onClick={() => openEdit(b)}
                            className="p-2.5 rounded-lg transition-colors hover:opacity-70"
                            style={{
                              color: "var(--amber)",
                              background: "var(--bg)"
                            }}
                            title="Edit booking"
                          >
                            <Edit3 size={16} />
                          </button> */}

                          {/* <button
                            onClick={() => remove(b.id)}
                            className="p-2.5 rounded-lg transition-colors hover:opacity-70"
                            style={{
                              color: "var(--danger)",
                              background: "var(--bg)"
                            }}
                            title="Cancel booking"
                          >
                            <Trash2 size={16} />
                          </button> */}

                        </div>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

            {/* Pagination */}
            {totalPages > 1 && (

              <div
                className="p-5 sm:px-6 flex justify-center"
                style={{
                  borderTop: "1px solid var(--border)"
                }}
              >
                <Pagination
                  current={page}
                  total={totalPages}
                  onChange={setPage}
                />
              </div>

            )}

          </Card>

        )}

      </div>

      {/* ======================================
          VIEW BOOKING MODAL
      ====================================== */}

      {modal === "view" && selected && (

        <Modal
          title="Booking Details"
          onClose={() => setModal(null)}
        >

          <div className="p-3 space-y-5">

            {[
              ["Passenger", selected.passenger_name],
              ["Phone", selected.passenger_phone],
              ["Route", selected.route_name],
              ["Seat", selected.seat_number],
              ["Price", formatEGP(selected.price)],
              ["Payment", selected.payment_method],
              ["Status", selected.status],
              ["Booked For", selected.booked_for_name],
              ["Booked For Phone", selected.booked_for_phone]
            ].map(([label, value]) => (

              <div
                key={label as string}
                className="flex justify-between items-start gap-5 pb-3"
                style={{
                  borderBottom: "1px solid var(--border)"
                }}
              >

                <span
                  className="text-sm shrink-0"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {label}
                </span>

                <span className="font-semibold text-sm text-right break-words">
                  {value || "—"}
                </span>

              </div>

            ))}

          </div>

        </Modal>

      )}

      {/* ======================================
          ADD / EDIT BOOKING MODAL
      ====================================== */}

      {(modal === "add" || modal === "edit") && (

        <Modal
          title={modal === "edit" ? "Edit Booking" : "New Booking"}
          onClose={() => setModal(null)}
        >

          <div className="p-3 space-y-5">

            {/* Trip */}
            <div className="space-y-2">

              <label
                className="block text-sm font-semibold"
                style={{ color: "var(--fg-muted)" }}
              >
                Trip
              </label>

              <select
                style={inputStyle}
                value={form.trip_id}
                onChange={e =>
                  setForm({
                    ...form,
                    trip_id: e.target.value
                  })
                }
                className="w-full"
              >

                <option value="">Select trip...</option>

                {trips.map((t: any) => (

                  <option key={t.id} value={t.id}>
                    {t.route_name} — {new Date(
                      t.departure_time
                    ).toLocaleDateString("en-EG")}
                  </option>

                ))}

              </select>

            </div>

            {/* Passenger Information */}
            {[
              ["passenger_name", "Passenger Name"],
              ["passenger_phone", "Phone"],
              ["seat_number", "Seat Number"],
              ["price", "Price (EGP)"]
            ].map(([key, label]) => (

              <div key={key} className="space-y-2">

                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--fg-muted)" }}
                >
                  {label}
                </label>

                <input
                  style={inputStyle}
                  className="w-full"
                  value={form[key]}
                  onChange={e =>
                    setForm({
                      ...form,
                      [key]: e.target.value
                    })
                  }
                />

              </div>

            ))}

            {/* Payment */}
            <div className="space-y-2">

              <label
                className="block text-sm font-semibold"
                style={{ color: "var(--fg-muted)" }}
              >
                Payment Method
              </label>

              <select
                style={inputStyle}
                className="w-full"
                value={form.payment_method}
                onChange={e =>
                  setForm({
                    ...form,
                    payment_method: e.target.value
                  })
                }
              >

                {[
                  "cash",
                  "card",
                  "wallet",
                  "bank_transfer"
                ].map(p => (

                  <option key={p} value={p}>
                    {p.replace(/_/g, " ")}
                  </option>

                ))}

              </select>

            </div>

            {/* Status */}
            {modal === "edit" && (

              <div className="space-y-2">

                <label
                  className="block text-sm font-semibold"
                  style={{ color: "var(--fg-muted)" }}
                >
                  Booking Status
                </label>

                <select
                  style={inputStyle}
                  className="w-full"
                  value={form.status}
                  onChange={e =>
                    setForm({
                      ...form,
                      status: e.target.value
                    })
                  }
                >

                  {[
                    "confirmed",
                    "pending",
                    "cancelled",
                    "completed",
                    "no_show"
                  ].map(s => (

                    <option key={s} value={s}>
                      {s.replace(/_/g, " ")}
                    </option>

                  ))}

                </select>

              </div>

            )}

            {/* Actions */}
            <div
              className="flex flex-wrap gap-3 pt-5 mt-3"
              style={{
                borderTop: "1px solid var(--border)"
              }}
            >

              <BtnPrimary onClick={save}>
                {modal === "edit" ? "Update Booking" : "Create Booking"}
              </BtnPrimary>

              <BtnOutline onClick={() => setModal(null)}>
                Cancel
              </BtnOutline>

            </div>

          </div>

        </Modal>

      )}

    </div>
  );
}
