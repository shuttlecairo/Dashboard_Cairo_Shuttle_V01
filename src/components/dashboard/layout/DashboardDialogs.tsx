"use client";

import { useDashboardContext } from "./DashboardContext";
import {
    RouteDialog,
    BookingDialog,
    VehicleDialog,
    RequestDialog,
    PassengersDialog,
} from "@/components/dashboard/dialogs";

export function DashboardDialogs() {
    const {
        dialog,
        editId,
        routes,
        bookings,
        drivers,
        vehicles,
        setDialog,
        setEditId,
        closeDialog,
        handleAddRoute,
        handleUpdateRoute,
        handleAddBooking,
        handleUpdateBooking,
        handleAddVehicle,
        handleUpdateVehicle,
        handleAddRequest,
    } = useDashboardContext();

    return (
        <>
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
                    onClose={closeDialog}
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
                    onClose={closeDialog}
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
                    onClose={closeDialog}
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
        </>
    );
}
