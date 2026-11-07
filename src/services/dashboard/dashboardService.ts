import { api } from "@/api-client";
import type {
    ShuttleRoute,
    Booking,
    Driver,
    Vehicle,
    B2BRequest,
    EventRequest,
    HotelRequest,
} from "@/types/entities";

export const dashboardService = {
    // ── Fetch all data ──
    async fetchAll() {
        const [routes, bookings, drivers, vehicles, b2bReqs, eventReqs, hotelReqs] =
            await Promise.all([
                api.get<ShuttleRoute[]>("/api/routes"),
                api.get<Booking[]>("/api/bookings"),
                api.get<Driver[]>("/api/drivers"),
                api.get<Vehicle[]>("/api/vehicles"),
                api.get<B2BRequest[]>("/api/b2b"),
                api.get<EventRequest[]>("/api/events"),
                api.get<HotelRequest[]>("/api/hotels"),
            ]);
        return { routes, bookings, drivers, vehicles, b2bReqs, eventReqs, hotelReqs };
    },

    // ── Route CRUD ──
    addRoute: (data: Record<string, unknown>) => api.post("/api/routes", data),
    updateRoute: (id: string, data: Record<string, unknown>) =>
        api.patch(`/api/routes/${id}`, data),
    deleteRoute: (id: string) => api.del(`/api/routes/${id}`),

    // ── Booking CRUD ──
    addBooking: (data: Record<string, unknown>) => api.post("/api/bookings", data),
    updateBooking: (id: string, data: Record<string, unknown>) =>
        api.patch(`/api/bookings/${id}`, data),
    deleteBooking: (id: string) => api.del(`/api/bookings/${id}`),

    // ── Driver toggle ──
    toggleDriver: (id: string, active: boolean) =>
        api.patch(`/api/drivers/${id}`, { active }),

    // ── Vehicle CRUD ──
    addVehicle: (data: Record<string, unknown>) => api.post("/api/vehicles", data),
    updateVehicle: (id: string, data: Record<string, unknown>) =>
        api.patch(`/api/vehicles/${id}`, data),
    deleteVehicle: (id: string) => api.del(`/api/vehicles/${id}`),

    // ── Request actions (B2B, Events, Hotels) ──
    addRequest: (coll: string, data: Record<string, unknown>) =>
        api.post(`/api/${coll}`, data),
    acceptRequest: (coll: string, id: string) =>
        api.patch(`/api/${coll}/${id}`, { status: "accepted" }),
    cancelRequest: (coll: string, id: string) =>
        api.patch(`/api/${coll}/${id}`, { status: "cancelled" }),

    // ── Booking status update (for driver trip end) ──
    completeBooking: (id: string) =>
        api.patch(`/api/bookings/${id}`, { status: "completed" }),
};
