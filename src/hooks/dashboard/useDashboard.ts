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
} from "@/types/entities";
import type { UseDashboardReturn } from "@/types/dashboard";
import { dashboardService } from "@/services/dashboard/dashboardService";
import { useToast } from "@/components/shared/toast";

export function useDashboard(): UseDashboardReturn {
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

    const loadData = useCallback(async () => {
        try {
            const data = await dashboardService.fetchAll();
            setRoutes(data.routes);
            setBookings(data.bookings);
            setDrivers(data.drivers);
            setVehicles(data.vehicles);
            setB2bReqs(data.b2bReqs);
            setEventReqs(data.eventReqs);
            setHotelReqs(data.hotelReqs);
        } catch (e) {
            console.error("Failed to load data", e);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Dialog helpers
    function openEditDialog(dialogName: string, id: string) {
        setEditId(id);
        setDialog(dialogName);
    }

    function closeDialog() {
        setDialog(null);
        setEditId(null);
    }

    // ── ROUTE CRUD ──
    async function handleAddRoute(data: Record<string, unknown>) {
        try {
            await dashboardService.addRoute(data);
            toast("Route added");
            setDialog(null);
            loadData();
        } catch {
            toast("Failed to add route", "danger");
        }
    }

    async function handleUpdateRoute(id: string, data: Record<string, unknown>) {
        try {
            await dashboardService.updateRoute(id, data);
            toast("Route updated");
            closeDialog();
            loadData();
        } catch {
            toast("Failed to update route", "danger");
        }
    }

    async function handleDeleteRoute(id: string) {
        if (!confirm("Delete this route?")) return;
        try {
            await dashboardService.deleteRoute(id);
            toast("Route deleted", "danger");
            loadData();
        } catch {
            toast("Failed to delete route", "danger");
        }
    }

    // ── BOOKING CRUD ──
    async function handleAddBooking(data: Record<string, unknown>) {
        try {
            await dashboardService.addBooking(data);
            toast("Booking added");
            setDialog(null);
            loadData();
        } catch {
            toast("Failed to add booking", "danger");
        }
    }

    async function handleUpdateBooking(id: string, data: Record<string, unknown>) {
        try {
            await dashboardService.updateBooking(id, data);
            toast("Booking updated");
            closeDialog();
            loadData();
        } catch {
            toast("Failed to update booking", "danger");
        }
    }

    async function handleDeleteBooking(id: string) {
        if (!confirm("Delete this booking?")) return;
        try {
            await dashboardService.deleteBooking(id);
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
            await dashboardService.toggleDriver(id, !d.active);
            toast(d.name + (d.active ? " deactivated" : " activated"));
            loadData();
        } catch {
            toast("Failed to update driver", "danger");
        }
    }

    // ── VEHICLE CRUD ──
    async function handleAddVehicle(data: Record<string, unknown>) {
        try {
            await dashboardService.addVehicle(data);
            toast("Vehicle added");
            setDialog(null);
            loadData();
        } catch {
            toast("Failed to add vehicle", "danger");
        }
    }

    async function handleUpdateVehicle(id: string, data: Record<string, unknown>) {
        try {
            await dashboardService.updateVehicle(id, data);
            toast("Vehicle updated");
            closeDialog();
            loadData();
        } catch {
            toast("Failed to update vehicle", "danger");
        }
    }

    async function handleDeleteVehicle(id: string) {
        if (!confirm("Delete this vehicle?")) return;
        try {
            await dashboardService.deleteVehicle(id);
            toast("Vehicle deleted", "danger");
            loadData();
        } catch {
            toast("Failed to delete vehicle", "danger");
        }
    }

    // ── REQUEST ACTIONS (B2B, Events, Hotels) ──
    async function handleAddRequest(coll: string, data: Record<string, unknown>) {
        try {
            await dashboardService.addRequest(coll, data);
            toast("Request submitted!");
            setDialog(null);
            loadData();
        } catch {
            toast("Failed to submit request", "danger");
        }
    }

    async function handleAcceptRequest(coll: string, id: string) {
        try {
            await dashboardService.acceptRequest(coll, id);
            toast("Request accepted!");
            loadData();
        } catch {
            toast("Failed to accept request", "danger");
        }
    }

    async function handleCancelRequest(coll: string, id: string) {
        if (!confirm("Cancel this request?")) return;
        try {
            await dashboardService.cancelRequest(coll, id);
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
            await dashboardService.completeBooking(b.id);
        }
        toast("Trip ended — bookings marked completed");
        setActiveTrip(null);
        loadData();
    }

    return {
        // Data
        routes,
        bookings,
        drivers,
        vehicles,
        b2bReqs,
        eventReqs,
        hotelReqs,
        // Actions
        loadData,
        handleAddRoute,
        handleUpdateRoute,
        handleDeleteRoute,
        handleAddBooking,
        handleUpdateBooking,
        handleDeleteBooking,
        handleToggleDriver,
        handleAddVehicle,
        handleUpdateVehicle,
        handleDeleteVehicle,
        handleAddRequest,
        handleAcceptRequest,
        handleCancelRequest,
        handleStartTrip,
        handleEndTrip,
        // Dialog state
        dialog,
        editId,
        setDialog,
        setEditId,
        openEditDialog,
        closeDialog,
        // Trip state
        activeTrip,
    };
}
