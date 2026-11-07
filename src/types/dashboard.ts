import type {
    ShuttleRoute,
    Booking,
    Driver,
    Vehicle,
    B2BRequest,
    EventRequest,
    HotelRequest,
} from "@/types/entities";

export interface DashboardData {
    routes: ShuttleRoute[];
    bookings: Booking[];
    drivers: Driver[];
    vehicles: Vehicle[];
    b2bReqs: B2BRequest[];
    eventReqs: EventRequest[];
    hotelReqs: HotelRequest[];
}

export interface DashboardActions {
    loadData: () => Promise<void>;
    // Route CRUD
    handleAddRoute: (data: Record<string, unknown>) => Promise<void>;
    handleUpdateRoute: (id: string, data: Record<string, unknown>) => Promise<void>;
    handleDeleteRoute: (id: string) => Promise<void>;
    // Booking CRUD
    handleAddBooking: (data: Record<string, unknown>) => Promise<void>;
    handleUpdateBooking: (id: string, data: Record<string, unknown>) => Promise<void>;
    handleDeleteBooking: (id: string) => Promise<void>;
    // Driver toggle
    handleToggleDriver: (id: string) => Promise<void>;
    // Vehicle CRUD
    handleAddVehicle: (data: Record<string, unknown>) => Promise<void>;
    handleUpdateVehicle: (id: string, data: Record<string, unknown>) => Promise<void>;
    handleDeleteVehicle: (id: string) => Promise<void>;
    // Request actions
    handleAddRequest: (coll: string, data: Record<string, unknown>) => Promise<void>;
    handleAcceptRequest: (coll: string, id: string) => Promise<void>;
    handleCancelRequest: (coll: string, id: string) => Promise<void>;
    // Driver dashboard
    handleStartTrip: (name: string) => void;
    handleEndTrip: () => Promise<void>;
}

export interface DashboardDialogState {
    dialog: string | null;
    editId: string | null;
    setDialog: (d: string | null) => void;
    setEditId: (id: string | null) => void;
    openEditDialog: (dialogName: string, id: string) => void;
    closeDialog: () => void;
}

export interface DashboardTripState {
    activeTrip: string | null;
}

export type UseDashboardReturn = DashboardData &
    DashboardActions &
    DashboardDialogState &
    DashboardTripState;
