import type {
  ShuttleRoute,
  Booking,
  Driver,
  Vehicle,
  B2BClient,
  B2BRequest,
  EventRequest,
  HotelRequest,
  Trip,
  DriverLocation,
  AccountingEntry,
  PaymobSettlement,
  BusPartner,
  PartnerVehicle,
  PartnerDriver,
  SupportTicket,
  Dispute,
  Issue,
  PartnerTransaction,
  PassengerRequest,
  OperationalAlert,
} from "@/types/entities";

let idCounter = 100;
export function nextId(): string {
  return "x" + ++idCounter;
}

// ── Routes ──
export const routes: ShuttleRoute[] = [
  {
    id: "r1",
    name: "New Cairo → Downtown",
    pickup_area: "New Cairo - 5th Settlement",
    dropoff_area: "Downtown Cairo",
    pickup_coords: { lat: 30.0074, lng: 31.4913 },
    dropoff_coords: { lat: 30.0444, lng: 31.2357 },
    waypoints: [
      { lat: 30.0182, lng: 31.465 },
      { lat: 30.028, lng: 31.42 },
      { lat: 30.035, lng: 31.37 },
      { lat: 30.04, lng: 31.32 },
      { lat: 30.043, lng: 31.28 },
    ],
    departure_time: "07:00",
    return_time: "18:00",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    price: 85,
    capacity: 14,
    is_active: true,
    driver: "Ahmed Hassan",
    driver_phone: "+201012345678",
    partner_id: "bp1",
    stops: [
      { id: "s1-1", name: "5th Settlement Gate 3", address: "5th Settlement, New Cairo", coords: { lat: 30.0074, lng: 31.4913 }, order: 1, scheduled_time: "07:00", type: "pickup" },
      { id: "s1-2", name: "Rehab City Gate", address: "Rehab City, New Cairo", coords: { lat: 30.0582, lng: 31.4617 }, order: 2, scheduled_time: "07:15", type: "pickup" },
      { id: "s1-3", name: "Nasr City Stop", address: "Makram Ebeid, Nasr City", coords: { lat: 30.055, lng: 31.345 }, order: 3, scheduled_time: "07:40", type: "both" },
      { id: "s1-4", name: "Downtown Tahrir", address: "Tahrir Square, Downtown", coords: { lat: 30.0444, lng: 31.2357 }, order: 4, scheduled_time: "08:00", type: "dropoff" },
    ],
  },
  {
    id: "r2",
    name: "6th October → Nasr City",
    pickup_area: "6th October - Mall of Arabia",
    dropoff_area: "Nasr City - City Stars",
    pickup_coords: { lat: 29.9724, lng: 30.9448 },
    dropoff_coords: { lat: 30.0731, lng: 31.3464 },
    waypoints: [
      { lat: 29.98, lng: 31.02 },
      { lat: 29.995, lng: 31.1 },
      { lat: 30.02, lng: 31.18 },
      { lat: 30.045, lng: 31.24 },
      { lat: 30.06, lng: 31.29 },
    ],
    departure_time: "07:30",
    return_time: "17:30",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    price: 75,
    capacity: 14,
    is_active: true,
    driver: "Mohamed Ali",
    driver_phone: "+201098765432",
    partner_id: "bp2",
    stops: [
      { id: "s2-1", name: "Mall of Arabia", address: "Mall of Arabia, 6th October", coords: { lat: 29.9724, lng: 30.9448 }, order: 1, scheduled_time: "07:30", type: "pickup" },
      { id: "s2-2", name: "Mohandessin Square", address: "Mohandessin, Giza", coords: { lat: 30.055, lng: 31.2 }, order: 2, scheduled_time: "08:00", type: "both" },
      { id: "s2-3", name: "City Stars", address: "City Stars Mall, Nasr City", coords: { lat: 30.0731, lng: 31.3464 }, order: 3, scheduled_time: "08:30", type: "dropoff" },
    ],
  },
  {
    id: "r3",
    name: "Maadi → Smart Village",
    pickup_area: "Maadi - Road 9",
    dropoff_area: "Smart Village",
    pickup_coords: { lat: 29.9602, lng: 31.2569 },
    dropoff_coords: { lat: 30.0697, lng: 31.0171 },
    waypoints: [
      { lat: 29.97, lng: 31.22 },
      { lat: 29.99, lng: 31.17 },
      { lat: 30.01, lng: 31.12 },
      { lat: 30.04, lng: 31.07 },
    ],
    departure_time: "08:00",
    return_time: "",
    days: ["Sun", "Tue", "Thu"],
    price: 95,
    capacity: 10,
    is_active: false,
    driver: null,
    driver_phone: null,
    stops: [
      { id: "s3-1", name: "Road 9 Metro", address: "Road 9, Maadi", coords: { lat: 29.9602, lng: 31.2569 }, order: 1, scheduled_time: "08:00", type: "pickup" },
      { id: "s3-2", name: "Giza Square", address: "Giza Square", coords: { lat: 30.01, lng: 31.21 }, order: 2, scheduled_time: "08:25", type: "pickup" },
      { id: "s3-3", name: "Smart Village Gate", address: "Smart Village, 6th October", coords: { lat: 30.0697, lng: 31.0171 }, order: 3, scheduled_time: "09:00", type: "dropoff" },
    ],
  },
  {
    id: "r4",
    name: "Heliopolis → Sheikh Zayed",
    pickup_area: "Heliopolis - Triumph Square",
    dropoff_area: "Sheikh Zayed - Hyper One",
    pickup_coords: { lat: 30.0911, lng: 31.3225 },
    dropoff_coords: { lat: 30.0333, lng: 30.9833 },
    waypoints: [
      { lat: 30.08, lng: 31.28 },
      { lat: 30.065, lng: 31.2 },
      { lat: 30.05, lng: 31.1 },
    ],
    departure_time: "06:30",
    return_time: "17:00",
    days: ["Sun", "Mon", "Tue", "Wed", "Thu"],
    price: 90,
    capacity: 14,
    is_active: true,
    driver: "Karim Mostafa",
    driver_phone: "+201055443322",
    partner_id: "bp1",
    stops: [
      { id: "s4-1", name: "Triumph Square", address: "Triumph Square, Heliopolis", coords: { lat: 30.0911, lng: 31.3225 }, order: 1, scheduled_time: "06:30", type: "pickup" },
      { id: "s4-2", name: "Airport Road", address: "Airport Road, Cairo", coords: { lat: 30.08, lng: 31.28 }, order: 2, scheduled_time: "06:45", type: "pickup" },
      { id: "s4-3", name: "Lebanon Square", address: "Lebanon Square, Mohandessin", coords: { lat: 30.05, lng: 31.2 }, order: 3, scheduled_time: "07:10", type: "both" },
      { id: "s4-4", name: "Hyper One", address: "Hyper One, Sheikh Zayed", coords: { lat: 30.0333, lng: 30.9833 }, order: 4, scheduled_time: "07:35", type: "dropoff" },
    ],
  },
];

// ── Bookings ──
export const bookings: Booking[] = [
  { id: "b1", rider: "Nour El-Din", phone: "+201155667788", seats: 1, pickup: "5th Settlement Gate 3", status: "confirmed", route: "New Cairo → Downtown", date: "2026-11-06", fare: 85, payment_method: "cash", payment_status: "pending", trip_id: "t1", pickup_stop_id: "s1-1", dropoff_stop_id: "s1-4" },
  { id: "b2", rider: "Sara Ahmed", phone: "+201122334455", seats: 2, pickup: "Rehab City", status: "confirmed", route: "New Cairo → Downtown", date: "2026-11-06", fare: 170, payment_method: "paymob", payment_status: "paid", trip_id: "t1", pickup_stop_id: "s1-2", dropoff_stop_id: "s1-4" },
  { id: "b3", rider: "Youssef Kamal", phone: "+201199887766", seats: 1, pickup: "Mall of Arabia", status: "completed", route: "6th October → Nasr City", date: "2026-11-05", fare: 75, payment_method: "cash", payment_status: "paid" },
  { id: "b4", rider: "Layla Hassan", phone: "+201177665544", seats: 1, pickup: "", status: "cancelled", route: "New Cairo → Downtown", date: "2026-11-05", fare: 85, payment_method: "cash", payment_status: "refunded" },
  { id: "b5", rider: "Omar Farid", phone: "+201133445566", seats: 3, pickup: "Road 9 Metro", status: "confirmed", route: "Maadi → Smart Village", date: "2026-11-07", fare: 285, payment_method: "corporate", payment_status: "pending" },
  { id: "b6", rider: "Hana Mahmoud", phone: "+201166778899", seats: 1, pickup: "Triumph Square", status: "confirmed", route: "Heliopolis → Sheikh Zayed", date: "2026-11-06", fare: 90, payment_method: "wallet", payment_status: "paid", trip_id: "t2" },
  { id: "b7", rider: "Tamer Nabil", phone: "+201144332211", seats: 2, pickup: "5th Settlement Gate 1", status: "completed", route: "New Cairo → Downtown", date: "2026-11-04", fare: 170, payment_method: "paymob", payment_status: "paid" },
  { id: "b8", rider: "Dina Samir", phone: "+201188776655", seats: 1, pickup: "Mall of Arabia Main", status: "confirmed", route: "6th October → Nasr City", date: "2026-11-06", fare: 75, payment_method: "cash", payment_status: "pending", trip_id: "t3" },
  { id: "b9", rider: "Ali Mostafa", phone: "+201155443322", seats: 1, pickup: "Rehab Gate 5", status: "no_show", route: "New Cairo → Downtown", date: "2026-11-05", fare: 85, payment_method: "cash", payment_status: "pending" },
  { id: "b10", rider: "Mona Gamal", phone: "+201177889900", seats: 2, pickup: "5th Settlement Gate 2", status: "confirmed", route: "New Cairo → Downtown", date: "2026-11-06", fare: 170, payment_method: "cash", payment_status: "pending", trip_id: "t1" },
];

// ── Drivers ──
export const drivers: Driver[] = [
  { id: "d1", name: "Ahmed Hassan", email: "ahmed@cairoshuttle.com", phone: "+201012345678", active: true, vehicle_id: "v1" },
  { id: "d2", name: "Mohamed Ali", email: "mohamed@cairoshuttle.com", phone: "+201098765432", active: true, vehicle_id: "v2" },
  { id: "d3", name: "Karim Mostafa", email: "karim@cairoshuttle.com", phone: "+201055443322", active: true, vehicle_id: "v4" },
  { id: "d4", name: "Saeed Ibrahim", email: "saeed@cairoshuttle.com", phone: "+201033221100", active: false },
];

// ── Vehicles ──
export const vehicles: Vehicle[] = [
  { id: "v1", plate: "ل م ن ٤٥٦٧", type: "minibus", make: "Toyota", model: "HiAce", year: 2023, capacity: 14, color: "White", active: true, assigned_driver_id: "d1" },
  { id: "v2", plate: "ع ب ج ١٢٣٤", type: "bus", make: "Mercedes", model: "Sprinter", year: 2022, capacity: 30, color: "Silver", active: true, assigned_driver_id: "d2" },
  { id: "v3", plate: "ه و ز ٨٩٠١", type: "microbus", make: "Hyundai", model: "H350", year: 2021, capacity: 12, color: "Blue", active: false },
  { id: "v4", plate: "ص ط ع ٣٤٥٦", type: "minibus", make: "Toyota", model: "HiAce", year: 2024, capacity: 14, color: "White", active: true, assigned_driver_id: "d3" },
];

// ── B2B Clients ──
export const b2bClients: B2BClient[] = [
  { id: "c1", name: "Vodafone Egypt", contact_name: "Amr Khaled", contact_email: "amr@vodafone.eg", contact_phone: "+201000000001", address: "Smart Village, 6th October", is_active: true },
  { id: "c2", name: "Schneider Electric", contact_name: "Rania Fawzy", contact_email: "rania@schneider.eg", contact_phone: "+201000000002", address: "10th of Ramadan", is_active: true },
  { id: "c3", name: "Etisalat Misr", contact_name: "Hassan Nour", contact_email: "hassan@etisalat.eg", contact_phone: "+201000000003", address: "Katameya Heights", is_active: true },
];

// ── B2B Requests ──
export const b2bRequests: B2BRequest[] = [
  { id: "q1", client_id: "c1", client_name: "Vodafone Egypt", pickup: "Smart Village", dropoff: "New Cairo - Offices", schedule: "Daily 7am & 5pm", count: 25, status: "accepted", quote: 12000, notes: "Monday start", start_date: "2026-11-01", end_date: "2026-12-31" },
  { id: "q2", client_id: "c2", client_name: "Schneider Electric", pickup: "Maadi", dropoff: "6th October Industrial", schedule: "Sun-Thu 6:30am", count: 40, status: "quoted", quote: 18500, notes: "" },
  { id: "q3", client_id: "c3", client_name: "Etisalat Misr", pickup: "Nasr City", dropoff: "10th of Ramadan", schedule: "3 days/week", count: 15, status: "pending", quote: null, notes: "Need AC buses" },
  { id: "q4", client_id: "c1", client_name: "Vodafone Egypt", pickup: "Heliopolis", dropoff: "Smart Village", schedule: "Sun-Thu 8am", count: 20, status: "accepted", quote: 9500, notes: "New department", start_date: "2026-10-15" },
];

// ── Event Requests ──
export const eventRequests: EventRequest[] = [
  { id: "e1", client_name: "CICC Events", pickup: "CICC Convention Center", dropoff: "Hilton Heliopolis", schedule: "Dec 15-17, 8am & 5pm", count: 200, status: "quoted", quote: 45000, notes: "Tech conference", event_date: "2026-12-15" },
  { id: "e2", client_name: "EFA Sports", pickup: "Cairo Stadium", dropoff: "Multiple hotels", schedule: "Jan 5, 10pm", count: 500, status: "pending", quote: null, notes: "Post-match shuttle", event_date: "2027-01-05" },
  { id: "e3", client_name: "AUC Events", pickup: "AUC New Cairo", dropoff: "Tahrir Square", schedule: "Nov 20, 6pm", count: 80, status: "accepted", quote: 12000, notes: "Graduation ceremony", event_date: "2026-11-20" },
];

// ── Hotel Requests ──
export const hotelRequests: HotelRequest[] = [
  { id: "h1", hotel_name: "Nile Ritz-Carlton", pickup: "Nile Ritz-Carlton, Corniche", dropoff: "Pyramids of Giza", schedule: "Daily 9am & 2pm", count: 30, status: "accepted", quote: 8000, notes: "Tourist groups" },
  { id: "h2", hotel_name: "Nile Ritz-Carlton", pickup: "Nile Ritz-Carlton, Corniche", dropoff: "Khan el-Khalili", schedule: "Sat & Tue 10am", count: 15, status: "pending", quote: null, notes: "" },
  { id: "h3", hotel_name: "Marriott Mena House", pickup: "Marriott Mena House", dropoff: "Egyptian Museum", schedule: "Daily 10am", count: 20, status: "quoted", quote: 5500, notes: "English-speaking driver needed" },
];

// ── Active Trips (for live tracking) ──
export const trips: Trip[] = [
  {
    id: "t1",
    route_id: "r1",
    route_name: "New Cairo → Downtown",
    driver_id: "d1",
    driver_name: "Ahmed Hassan",
    vehicle_id: "v1",
    vehicle_plate: "ل م ن ٤٥٦٧",
    status: "in_progress",
    scheduled_departure: "2026-11-06T07:00:00",
    actual_departure: "2026-11-06T07:05:00",
    estimated_arrival: "2026-11-06T08:15:00",
    passenger_count: 5,
    origin_name: "New Cairo - 5th Settlement",
    origin_lat: 30.0074,
    origin_lng: 31.4913,
    destination_name: "Downtown Cairo",
    destination_lat: 30.0444,
    destination_lng: 31.2357,
    current_lat: 30.035,
    current_lng: 31.37,
    heading: 280,
    speed: 45,
    route_progress_pct: 48,
  },
  {
    id: "t2",
    route_id: "r4",
    route_name: "Heliopolis → Sheikh Zayed",
    driver_id: "d3",
    driver_name: "Karim Mostafa",
    vehicle_id: "v4",
    vehicle_plate: "ص ط ع ٣٤٥٦",
    status: "en_route",
    scheduled_departure: "2026-11-06T06:30:00",
    actual_departure: "2026-11-06T06:35:00",
    estimated_arrival: "2026-11-06T07:45:00",
    passenger_count: 1,
    origin_name: "Heliopolis - Triumph Square",
    origin_lat: 30.0911,
    origin_lng: 31.3225,
    destination_name: "Sheikh Zayed - Hyper One",
    destination_lat: 30.0333,
    destination_lng: 30.9833,
    current_lat: 30.065,
    current_lng: 31.2,
    heading: 250,
    speed: 60,
    route_progress_pct: 35,
  },
  {
    id: "t3",
    route_id: "r2",
    route_name: "6th October → Nasr City",
    driver_id: "d2",
    driver_name: "Mohamed Ali",
    vehicle_id: "v2",
    vehicle_plate: "ع ب ج ١٢٣٤",
    status: "at_pickup",
    scheduled_departure: "2026-11-06T07:30:00",
    passenger_count: 1,
    origin_name: "6th October - Mall of Arabia",
    origin_lat: 29.9724,
    origin_lng: 30.9448,
    destination_name: "Nasr City - City Stars",
    destination_lat: 30.0731,
    destination_lng: 31.3464,
    current_lat: 29.9724,
    current_lng: 30.9448,
    heading: 0,
    speed: 0,
    route_progress_pct: 0,
  },
  {
    id: "t4",
    route_id: "r1",
    route_name: "New Cairo → Downtown",
    driver_id: "d1",
    driver_name: "Ahmed Hassan",
    vehicle_id: "v1",
    vehicle_plate: "ل م ن ٤٥٦٧",
    status: "completed",
    scheduled_departure: "2026-11-05T07:00:00",
    actual_departure: "2026-11-05T07:02:00",
    actual_arrival: "2026-11-05T08:10:00",
    passenger_count: 8,
    origin_name: "New Cairo - 5th Settlement",
    origin_lat: 30.0074,
    origin_lng: 31.4913,
    destination_name: "Downtown Cairo",
    destination_lat: 30.0444,
    destination_lng: 31.2357,
    current_lat: 30.0444,
    current_lng: 31.2357,
    route_progress_pct: 100,
  },
  {
    id: "t5",
    route_id: "r2",
    route_name: "6th October → Nasr City",
    driver_id: "d2",
    driver_name: "Mohamed Ali",
    vehicle_id: "v2",
    vehicle_plate: "ع ب ج ١٢٣٤",
    status: "completed",
    scheduled_departure: "2026-11-05T07:30:00",
    actual_departure: "2026-11-05T07:35:00",
    actual_arrival: "2026-11-05T08:40:00",
    passenger_count: 12,
    origin_name: "6th October - Mall of Arabia",
    origin_lat: 29.9724,
    origin_lng: 30.9448,
    destination_name: "Nasr City - City Stars",
    destination_lat: 30.0731,
    destination_lng: 31.3464,
    current_lat: 30.0731,
    current_lng: 31.3464,
    route_progress_pct: 100,
  },
  {
    id: "t6",
    route_name: "Vodafone Shuttle",
    driver_id: "d1",
    driver_name: "Ahmed Hassan",
    vehicle_id: "v1",
    vehicle_plate: "ل م ن ٤٥٦٧",
    status: "scheduled",
    scheduled_departure: "2026-11-06T17:00:00",
    passenger_count: 25,
    origin_name: "New Cairo - Offices",
    origin_lat: 30.0074,
    origin_lng: 31.4913,
    destination_name: "Smart Village",
    destination_lat: 30.0697,
    destination_lng: 31.0171,
    current_lat: 30.0074,
    current_lng: 31.4913,
    route_progress_pct: 0,
    b2b_request_id: "q1",
    b2b_client_name: "Vodafone Egypt",
  },
];

// ── Driver Locations (for live tracking simulation) ──
export const driverLocations: DriverLocation[] = [
  { driver_id: "d1", lat: 30.035, lng: 31.37, heading: 280, speed: 45, recorded_at: "2026-11-06T07:45:00", trip_id: "t1" },
  { driver_id: "d2", lat: 29.9724, lng: 30.9448, heading: 0, speed: 0, recorded_at: "2026-11-06T07:28:00", trip_id: "t3" },
  { driver_id: "d3", lat: 30.065, lng: 31.2, heading: 250, speed: 60, recorded_at: "2026-11-06T07:10:00", trip_id: "t2" },
];

// ── Accounting Entries (immutable journal) ──
export const accountingEntries: AccountingEntry[] = [
  // October revenue entries
  { id: "a1", entry_date: "2026-10-01", description: "Fare revenue - New Cairo → Downtown", category: "fare_revenue", debit: 0, credit: 8500, account: "revenue", reference_type: "booking", is_posted: true, created_at: "2026-10-01T08:00:00" },
  { id: "a2", entry_date: "2026-10-01", description: "Cash collection - morning routes", category: "fare_revenue", debit: 8500, credit: 0, account: "cash", reference_type: "booking", is_posted: true, created_at: "2026-10-01T08:00:00" },
  { id: "a3", entry_date: "2026-10-05", description: "B2B invoice - Vodafone Egypt Oct", category: "b2b_revenue", debit: 12000, credit: 0, account: "accounts_receivable", reference_type: "b2b_request", is_posted: true, created_at: "2026-10-05T10:00:00" },
  { id: "a4", entry_date: "2026-10-05", description: "B2B revenue - Vodafone Egypt Oct", category: "b2b_revenue", debit: 0, credit: 12000, account: "revenue", reference_type: "b2b_request", is_posted: true, created_at: "2026-10-05T10:00:00" },
  { id: "a5", entry_date: "2026-10-10", description: "Driver payment - Ahmed Hassan", category: "driver_payment", debit: 3500, credit: 0, account: "expenses", driver_id: "d1", reference_type: "driver", is_posted: true, created_at: "2026-10-10T12:00:00" },
  { id: "a6", entry_date: "2026-10-10", description: "Driver payment - Ahmed Hassan", category: "driver_payment", debit: 0, credit: 3500, account: "cash", driver_id: "d1", reference_type: "driver", is_posted: true, created_at: "2026-10-10T12:00:00" },
  { id: "a7", entry_date: "2026-10-10", description: "Driver payment - Mohamed Ali", category: "driver_payment", debit: 3200, credit: 0, account: "expenses", driver_id: "d2", reference_type: "driver", is_posted: true, created_at: "2026-10-10T12:00:00" },
  { id: "a8", entry_date: "2026-10-10", description: "Driver payment - Mohamed Ali", category: "driver_payment", debit: 0, credit: 3200, account: "cash", driver_id: "d2", reference_type: "driver", is_posted: true, created_at: "2026-10-10T12:00:00" },
  { id: "a9", entry_date: "2026-10-15", description: "Fuel expense - fleet", category: "fuel", debit: 2800, credit: 0, account: "expenses", reference_type: "manual", is_posted: true, created_at: "2026-10-15T14:00:00" },
  { id: "a10", entry_date: "2026-10-15", description: "Fuel expense - fleet", category: "fuel", debit: 0, credit: 2800, account: "cash", reference_type: "manual", is_posted: true, created_at: "2026-10-15T14:00:00" },
  { id: "a11", entry_date: "2026-10-20", description: "Paymob settlement Oct 1-15", category: "paymob_settlement", debit: 5200, credit: 0, account: "bank", reference_type: "settlement", is_posted: true, created_at: "2026-10-20T10:00:00" },
  { id: "a12", entry_date: "2026-10-20", description: "Paymob settlement Oct 1-15", category: "paymob_settlement", debit: 0, credit: 5200, account: "paymob", reference_type: "settlement", is_posted: true, created_at: "2026-10-20T10:00:00" },
  { id: "a13", entry_date: "2026-10-25", description: "Vehicle maintenance - v1", category: "maintenance", debit: 1500, credit: 0, account: "expenses", reference_type: "manual", is_posted: true, created_at: "2026-10-25T11:00:00" },
  { id: "a14", entry_date: "2026-10-25", description: "Vehicle maintenance - v1", category: "maintenance", debit: 0, credit: 1500, account: "cash", reference_type: "manual", is_posted: true, created_at: "2026-10-25T11:00:00" },
  { id: "a15", entry_date: "2026-10-28", description: "B2B payment received - Vodafone", category: "b2b_revenue", debit: 12000, credit: 0, account: "bank", reference_type: "b2b_request", is_posted: true, created_at: "2026-10-28T09:00:00" },
  { id: "a16", entry_date: "2026-10-28", description: "B2B AR cleared - Vodafone", category: "b2b_revenue", debit: 0, credit: 12000, account: "accounts_receivable", reference_type: "b2b_request", is_posted: true, created_at: "2026-10-28T09:00:00" },
  // November entries
  { id: "a17", entry_date: "2026-11-01", description: "Fare revenue - Nov 1 all routes", category: "fare_revenue", debit: 0, credit: 4250, account: "revenue", reference_type: "booking", is_posted: true, created_at: "2026-11-01T08:00:00" },
  { id: "a18", entry_date: "2026-11-01", description: "Cash collection - Nov 1", category: "fare_revenue", debit: 2550, credit: 0, account: "cash", reference_type: "booking", is_posted: true, created_at: "2026-11-01T08:00:00" },
  { id: "a19", entry_date: "2026-11-01", description: "Paymob collection - Nov 1", category: "fare_revenue", debit: 1700, credit: 0, account: "paymob", reference_type: "booking", is_posted: true, created_at: "2026-11-01T08:00:00" },
  { id: "a20", entry_date: "2026-11-03", description: "B2B invoice - Vodafone Nov", category: "b2b_revenue", debit: 12000, credit: 0, account: "accounts_receivable", reference_type: "b2b_request", is_posted: true, created_at: "2026-11-03T10:00:00" },
  { id: "a21", entry_date: "2026-11-03", description: "B2B revenue - Vodafone Nov", category: "b2b_revenue", debit: 0, credit: 12000, account: "revenue", reference_type: "b2b_request", is_posted: true, created_at: "2026-11-03T10:00:00" },
  { id: "a22", entry_date: "2026-11-03", description: "B2B invoice - Vodafone Helio shuttle", category: "b2b_revenue", debit: 9500, credit: 0, account: "accounts_receivable", reference_type: "b2b_request", is_posted: true, created_at: "2026-11-03T10:00:00" },
  { id: "a23", entry_date: "2026-11-03", description: "B2B revenue - Vodafone Helio shuttle", category: "b2b_revenue", debit: 0, credit: 9500, account: "revenue", reference_type: "b2b_request", is_posted: true, created_at: "2026-11-03T10:00:00" },
  { id: "a24", entry_date: "2026-11-05", description: "Driver payment - Ahmed Hassan", category: "driver_payment", debit: 3500, credit: 0, account: "expenses", driver_id: "d1", reference_type: "driver", is_posted: true, created_at: "2026-11-05T12:00:00" },
  { id: "a25", entry_date: "2026-11-05", description: "Driver payment - Ahmed Hassan", category: "driver_payment", debit: 0, credit: 3500, account: "cash", driver_id: "d1", reference_type: "driver", is_posted: true, created_at: "2026-11-05T12:00:00" },
  { id: "a26", entry_date: "2026-11-05", description: "Event revenue - AUC Graduation", category: "event_revenue", debit: 12000, credit: 0, account: "accounts_receivable", reference_type: "event_request", is_posted: true, created_at: "2026-11-05T14:00:00" },
  { id: "a27", entry_date: "2026-11-05", description: "Event revenue - AUC Graduation", category: "event_revenue", debit: 0, credit: 12000, account: "revenue", reference_type: "event_request", is_posted: true, created_at: "2026-11-05T14:00:00" },
  { id: "a28", entry_date: "2026-11-05", description: "Hotel revenue - Ritz Pyramids shuttle", category: "hotel_revenue", debit: 8000, credit: 0, account: "accounts_receivable", reference_type: "hotel_request", is_posted: true, created_at: "2026-11-05T15:00:00" },
  { id: "a29", entry_date: "2026-11-05", description: "Hotel revenue - Ritz Pyramids shuttle", category: "hotel_revenue", debit: 0, credit: 8000, account: "revenue", reference_type: "hotel_request", is_posted: true, created_at: "2026-11-05T15:00:00" },
  { id: "a30", entry_date: "2026-11-06", description: "Fare revenue - Nov 6 morning", category: "fare_revenue", debit: 0, credit: 1870, account: "revenue", reference_type: "booking", is_posted: true, created_at: "2026-11-06T08:00:00" },
  { id: "a31", entry_date: "2026-11-06", description: "Cash collection - Nov 6", category: "fare_revenue", debit: 1020, credit: 0, account: "cash", reference_type: "booking", is_posted: true, created_at: "2026-11-06T08:00:00" },
  { id: "a32", entry_date: "2026-11-06", description: "Paymob collection - Nov 6", category: "fare_revenue", debit: 850, credit: 0, account: "paymob", reference_type: "booking", is_posted: true, created_at: "2026-11-06T08:00:00" },
];

// ── Paymob Settlements ──
export const paymobSettlements: PaymobSettlement[] = [
  { id: "ps1", settlement_date: "2026-10-20", amount: 5200, reference: "PMB-2026-1020", status: "confirmed" },
  { id: "ps2", settlement_date: "2026-11-05", amount: 3400, reference: "PMB-2026-1105", status: "confirmed" },
  { id: "ps3", settlement_date: "2026-11-06", amount: 850, reference: "PMB-2026-1106", status: "pending" },
];

// ── Bus Partners ──
export const busPartners: BusPartner[] = [
  { id: "bp1", name: "Nile Transport Co.", contact_name: "Hassan El-Sayed", contact_email: "hassan@niletransport.eg", contact_phone: "+201001112233", address: "Nasr City, Cairo", is_active: true, verification_status: "approved", created_at: "2026-06-15", commission_rate: 15, total_vehicles: 4, total_drivers: 4 },
  { id: "bp2", name: "Delta Express", contact_name: "Fatma Nour", contact_email: "fatma@deltaexpress.eg", contact_phone: "+201004445566", address: "6th October City", is_active: true, verification_status: "approved", created_at: "2026-08-01", commission_rate: 12, total_vehicles: 2, total_drivers: 2 },
  { id: "bp3", name: "Sahara Mobility", contact_name: "Yasser Mahmoud", contact_email: "yasser@saharamobility.eg", contact_phone: "+201007778899", address: "Heliopolis, Cairo", is_active: false, verification_status: "under_review", created_at: "2026-10-20", commission_rate: 18, total_vehicles: 0, total_drivers: 0 },
];

// ── Partner Vehicles ──
export const partnerVehicles: PartnerVehicle[] = [
  { id: "pv1", partner_id: "bp1", plate: "ق ر س ١١٢٢", type: "minibus", make: "Toyota", model: "HiAce", year: 2023, capacity: 14, color: "White", active: true, verification_status: "approved", insurance_expiry: "2027-06-15", license_expiry: "2027-03-20", documents: [
    { id: "pvd1", type: "registration", name: "Vehicle Registration", uploaded_at: "2026-06-15", status: "approved" },
    { id: "pvd2", type: "insurance", name: "Insurance Certificate", uploaded_at: "2026-06-15", status: "approved" },
    { id: "pvd3", type: "photo_front", name: "Front Photo", uploaded_at: "2026-06-16", status: "approved" },
  ]},
  { id: "pv2", partner_id: "bp1", plate: "ف غ ه ٣٣٤٤", type: "bus", make: "Mercedes", model: "Sprinter", year: 2022, capacity: 30, color: "Silver", active: true, verification_status: "approved", insurance_expiry: "2027-04-10", license_expiry: "2027-01-15", documents: [
    { id: "pvd4", type: "registration", name: "Vehicle Registration", uploaded_at: "2026-07-01", status: "approved" },
    { id: "pvd5", type: "insurance", name: "Insurance Certificate", uploaded_at: "2026-07-01", status: "approved" },
  ]},
  { id: "pv3", partner_id: "bp1", plate: "ج ح خ ٥٥٦٦", type: "minibus", make: "Hyundai", model: "H350", year: 2024, capacity: 16, color: "Blue", active: true, verification_status: "under_review", insurance_expiry: "2027-09-01", license_expiry: "2027-08-10", documents: [
    { id: "pvd6", type: "registration", name: "Vehicle Registration", uploaded_at: "2026-10-15", status: "under_review" },
    { id: "pvd7", type: "insurance", name: "Insurance Certificate", uploaded_at: "2026-10-15", status: "submitted" },
  ]},
  { id: "pv4", partner_id: "bp1", plate: "ث ذ ض ٧٧٨٨", type: "van", make: "Toyota", model: "HiAce", year: 2021, capacity: 10, color: "White", active: false, verification_status: "expired", insurance_expiry: "2026-10-01", license_expiry: "2026-09-15", documents: [
    { id: "pvd8", type: "registration", name: "Vehicle Registration", uploaded_at: "2026-03-01", status: "expired" },
    { id: "pvd9", type: "insurance", name: "Insurance Certificate", uploaded_at: "2026-03-01", status: "expired" },
  ]},
  { id: "pv5", partner_id: "bp2", plate: "ط ظ ع ٩٩٠٠", type: "bus", make: "Mercedes", model: "Tourismo", year: 2023, capacity: 45, color: "White", active: true, verification_status: "approved", insurance_expiry: "2027-05-20", license_expiry: "2027-02-28", documents: [
    { id: "pvd10", type: "registration", name: "Vehicle Registration", uploaded_at: "2026-08-01", status: "approved" },
    { id: "pvd11", type: "insurance", name: "Insurance Certificate", uploaded_at: "2026-08-01", status: "approved" },
  ]},
  { id: "pv6", partner_id: "bp2", plate: "ب ت ث ١٢٣٤", type: "minibus", make: "Toyota", model: "Coaster", year: 2022, capacity: 22, color: "Silver", active: true, verification_status: "approved", insurance_expiry: "2027-07-15", license_expiry: "2027-06-01", documents: [
    { id: "pvd12", type: "registration", name: "Vehicle Registration", uploaded_at: "2026-08-05", status: "approved" },
  ]},
];

// ── Partner Drivers ──
export const partnerDrivers: PartnerDriver[] = [
  { id: "pd1", partner_id: "bp1", name: "Mahmoud Fathy", email: "mahmoud@niletransport.eg", phone: "+201112223344", active: true, verification_status: "approved", license_number: "DL-2023-44521", license_expiry: "2028-03-15", employment_type: "full_time", documents: [
    { id: "pdd1", type: "driving_license", name: "Driving License", uploaded_at: "2026-06-15", status: "approved" },
    { id: "pdd2", type: "national_id", name: "National ID", uploaded_at: "2026-06-15", status: "approved" },
  ]},
  { id: "pd2", partner_id: "bp1", name: "Tarek Adel", email: "tarek@niletransport.eg", phone: "+201223334455", active: true, verification_status: "approved", license_number: "DL-2022-33210", license_expiry: "2027-11-20", employment_type: "full_time", documents: [
    { id: "pdd3", type: "driving_license", name: "Driving License", uploaded_at: "2026-07-01", status: "approved" },
    { id: "pdd4", type: "national_id", name: "National ID", uploaded_at: "2026-07-01", status: "approved" },
  ]},
  { id: "pd3", partner_id: "bp1", name: "Amr Salah", email: "amr@niletransport.eg", phone: "+201334445566", active: true, verification_status: "under_review", license_number: "DL-2024-55678", license_expiry: "2029-01-10", employment_type: "part_time", documents: [
    { id: "pdd5", type: "driving_license", name: "Driving License", uploaded_at: "2026-10-20", status: "under_review" },
  ]},
  { id: "pd4", partner_id: "bp1", name: "Waleed Hossam", email: "waleed@niletransport.eg", phone: "+201445556677", active: false, verification_status: "rejected", license_number: "DL-2020-11234", license_expiry: "2026-08-30", employment_type: "contract", documents: [
    { id: "pdd6", type: "driving_license", name: "Driving License", uploaded_at: "2026-09-01", status: "rejected", notes: "License expired" },
  ]},
  { id: "pd5", partner_id: "bp2", name: "Khaled Nasser", email: "khaled@deltaexpress.eg", phone: "+201556667788", active: true, verification_status: "approved", license_number: "DL-2023-78900", license_expiry: "2028-06-01", employment_type: "full_time", documents: [
    { id: "pdd7", type: "driving_license", name: "Driving License", uploaded_at: "2026-08-01", status: "approved" },
    { id: "pdd8", type: "national_id", name: "National ID", uploaded_at: "2026-08-01", status: "approved" },
  ]},
  { id: "pd6", partner_id: "bp2", name: "Sami Fouad", email: "sami@deltaexpress.eg", phone: "+201667778899", active: true, verification_status: "approved", license_number: "DL-2022-45678", license_expiry: "2027-09-15", employment_type: "full_time", documents: [
    { id: "pdd9", type: "driving_license", name: "Driving License", uploaded_at: "2026-08-05", status: "approved" },
  ]},
];

// ── Support Tickets ──
export const supportTickets: SupportTicket[] = [
  { id: "tk1", subject: "Late payment for October trips", category: "payments", priority: "high", status: "open", created_by: "Hassan El-Sayed", created_by_role: "partner", partner_id: "bp1", messages: [
    { id: "tm1", sender: "Hassan El-Sayed", sender_role: "partner", message: "We haven't received payment for October completed trips. Total outstanding is 18,500 EGP.", created_at: "2026-11-04T10:00:00" },
    { id: "tm2", sender: "Admin", sender_role: "admin", message: "We're processing the October batch now. Expected settlement by Nov 8.", created_at: "2026-11-04T14:30:00" },
  ], created_at: "2026-11-04T10:00:00", updated_at: "2026-11-04T14:30:00", assigned_to: "Admin" },
  { id: "tk2", subject: "Driver complaint on route R1", category: "complaints", priority: "medium", status: "in_progress", created_by: "Nour El-Din", created_by_role: "admin", related_trip_id: "t4", related_driver_id: "d1", messages: [
    { id: "tm3", sender: "System", sender_role: "system", message: "Passenger complaint received: Driver was 15 minutes late to pickup point.", created_at: "2026-11-05T09:00:00" },
    { id: "tm4", sender: "Admin", sender_role: "admin", message: "Investigating with driver Ahmed Hassan. Will follow up.", created_at: "2026-11-05T11:00:00" },
  ], created_at: "2026-11-05T09:00:00", updated_at: "2026-11-05T11:00:00", assigned_to: "Admin" },
  { id: "tk3", subject: "Vehicle document renewal needed", category: "documents", priority: "urgent", status: "open", created_by: "Hassan El-Sayed", created_by_role: "partner", partner_id: "bp1", related_vehicle_id: "pv4", messages: [
    { id: "tm5", sender: "Hassan El-Sayed", sender_role: "partner", message: "Vehicle pv4 insurance and registration have expired. Need guidance on renewal process.", created_at: "2026-11-06T08:00:00" },
  ], created_at: "2026-11-06T08:00:00", updated_at: "2026-11-06T08:00:00" },
  { id: "tk4", subject: "Booking cancellation refund delay", category: "bookings", priority: "medium", status: "resolved", created_by: "Admin", created_by_role: "admin", related_booking_id: "b4", messages: [
    { id: "tm6", sender: "Admin", sender_role: "admin", message: "Passenger Layla Hassan requested refund for cancelled booking b4. Processing.", created_at: "2026-11-05T13:00:00" },
    { id: "tm7", sender: "Admin", sender_role: "admin", message: "Refund of 85 EGP processed successfully.", created_at: "2026-11-05T16:00:00" },
  ], created_at: "2026-11-05T13:00:00", updated_at: "2026-11-05T16:00:00", assigned_to: "Admin" },
  { id: "tk5", subject: "AC not working on morning shuttle", category: "vehicles", priority: "high", status: "in_progress", created_by: "Fatma Nour", created_by_role: "partner", partner_id: "bp2", related_vehicle_id: "pv5", messages: [
    { id: "tm8", sender: "Fatma Nour", sender_role: "partner", message: "Passengers complaining about AC on bus pv5 during the 6th October → Nasr City morning route.", created_at: "2026-11-06T09:30:00" },
    { id: "tm9", sender: "Admin", sender_role: "admin", message: "Please schedule maintenance ASAP. Can you use a backup vehicle for tomorrow?", created_at: "2026-11-06T10:15:00" },
  ], created_at: "2026-11-06T09:30:00", updated_at: "2026-11-06T10:15:00", assigned_to: "Admin" },
];

// ── Disputes ──
export const disputes: Dispute[] = [
  { id: "dp1", ticket_id: "tk1", title: "October payment discrepancy", description: "Partner claims 18,500 EGP outstanding but our records show 15,200 EGP.", status: "under_review", type: "financial", amount: 3300, partner_id: "bp1", partner_name: "Nile Transport Co.", evidence: [
    { id: "de1", type: "document", description: "Partner invoice for October trips", submitted_by: "Hassan El-Sayed", submitted_at: "2026-11-04T10:30:00" },
    { id: "de2", type: "receipt", description: "Platform trip completion records", submitted_by: "Admin", submitted_at: "2026-11-04T15:00:00" },
  ], created_at: "2026-11-04T10:30:00", updated_at: "2026-11-04T15:00:00" },
  { id: "dp2", title: "Passenger refund dispute", description: "Passenger claims full refund but cancellation was within 1hr of departure.", status: "resolved", type: "financial", amount: 85, partner_id: "bp1", partner_name: "Nile Transport Co.", evidence: [
    { id: "de3", type: "screenshot", description: "Booking cancellation timestamp", submitted_by: "Admin", submitted_at: "2026-11-02T12:00:00" },
  ], resolution: "Partial refund of 50 EGP issued per cancellation policy.", resolution_date: "2026-11-03", created_at: "2026-11-02T12:00:00", updated_at: "2026-11-03T10:00:00" },
  { id: "dp3", title: "Trip completion disagreement", description: "Partner logged trip as completed but GPS shows early termination.", status: "submitted", type: "operational", partner_id: "bp2", partner_name: "Delta Express", evidence: [
    { id: "de4", type: "note", description: "GPS log showing trip ended 3km before destination", submitted_by: "Admin", submitted_at: "2026-11-05T14:00:00" },
  ], created_at: "2026-11-05T14:00:00", updated_at: "2026-11-05T14:00:00" },
];

// ── Issues ──
export const issues: Issue[] = [
  { id: "is1", type: "delay", category: "driver", priority: "medium", status: "open", title: "Repeated late departures", description: "Driver pd1 has been 10+ minutes late on 3 of the last 5 trips.", partner_id: "bp1", related_driver_id: "pd1", reported_by: "Admin", created_at: "2026-11-05T10:00:00", updated_at: "2026-11-05T10:00:00" },
  { id: "is2", type: "breakdown", category: "vehicle", priority: "high", status: "in_progress", title: "Engine warning light on pv2", description: "Check engine light appeared during morning route. Vehicle pulled over safely.", partner_id: "bp1", related_vehicle_id: "pv2", related_trip_id: "t4", reported_by: "Hassan El-Sayed", created_at: "2026-11-05T08:30:00", updated_at: "2026-11-05T12:00:00", resolution: "Scheduled for garage visit Nov 7" },
  { id: "is3", type: "expired_docs", category: "vehicle", priority: "critical", status: "open", title: "Expired insurance - Vehicle pv4", description: "Insurance expired on Oct 1. Vehicle must not be assigned to any trips.", partner_id: "bp1", related_vehicle_id: "pv4", reported_by: "System", created_at: "2026-10-01T00:00:00", updated_at: "2026-10-01T00:00:00" },
  { id: "is4", type: "complaint", category: "driver", priority: "low", status: "resolved", title: "Passenger complaint about music volume", description: "Passenger reported driver pd2 playing loud music during the trip.", partner_id: "bp1", related_driver_id: "pd2", reported_by: "Admin", created_at: "2026-11-03T15:00:00", updated_at: "2026-11-04T09:00:00", resolution: "Spoke with driver. Reminder about passenger comfort guidelines issued." },
];

// ── Partner Transactions ──
export const partnerTransactions: PartnerTransaction[] = [
  { id: "pt1", partner_id: "bp1", type: "trip_revenue", amount: 4250, description: "Route R1 - Week 44 revenue", date: "2026-11-01", related_trip_id: "t4", status: "completed" },
  { id: "pt2", partner_id: "bp1", type: "commission", amount: -637.5, description: "15% commission - Week 44", date: "2026-11-01", status: "completed" },
  { id: "pt3", partner_id: "bp1", type: "payout", amount: -3612.5, description: "Weekly payout - Week 44", date: "2026-11-03", status: "completed" },
  { id: "pt4", partner_id: "bp1", type: "fuel", amount: -1200, description: "Fuel reimbursement - Oct", date: "2026-10-31", status: "completed" },
  { id: "pt5", partner_id: "bp1", type: "maintenance", amount: -800, description: "Vehicle pv2 brake service", date: "2026-10-28", related_vehicle_id: "pv2", status: "completed" },
  { id: "pt6", partner_id: "bp1", type: "bonus", amount: 500, description: "Perfect attendance bonus - pd1", date: "2026-10-31", related_driver_id: "pd1", status: "completed" },
  { id: "pt7", partner_id: "bp1", type: "trip_revenue", amount: 3825, description: "Route R4 - Week 44 revenue", date: "2026-11-01", status: "completed" },
  { id: "pt8", partner_id: "bp1", type: "trip_revenue", amount: 5100, description: "Route R1 - Week 45 revenue", date: "2026-11-06", status: "pending" },
  { id: "pt9", partner_id: "bp2", type: "trip_revenue", amount: 3750, description: "Route R2 - Week 44 revenue", date: "2026-11-01", status: "completed" },
  { id: "pt10", partner_id: "bp2", type: "commission", amount: -450, description: "12% commission - Week 44", date: "2026-11-01", status: "completed" },
  { id: "pt11", partner_id: "bp2", type: "payout", amount: -3300, description: "Weekly payout - Week 44", date: "2026-11-03", status: "completed" },
  { id: "pt12", partner_id: "bp2", type: "trip_revenue", amount: 2625, description: "Route R2 - Week 45 revenue", date: "2026-11-06", status: "pending" },
];

// ── Passenger Requests ──
export const passengerRequests: PassengerRequest[] = [
  { id: "pr1", booking_id: "b5", trip_id: "t1", passenger_name: "Omar Farid", passenger_phone: "+201133445566", request_type: "pickup_change", requested_location: "Degla Square, Maadi instead of Road 9", status: "pending", created_at: "2026-11-06T06:30:00" },
  { id: "pr2", booking_id: "b6", passenger_name: "Hana Mahmoud", passenger_phone: "+201166778899", request_type: "special_location", requested_location: "Drop me at October Bridge exit instead of Hyper One", status: "approved", notes: "Driver confirmed OK", created_at: "2026-11-06T06:00:00" },
  { id: "pr3", passenger_name: "Mona Gamal", passenger_phone: "+201177889900", request_type: "dropoff_change", requested_location: "Ramses Station instead of Downtown Tahrir", status: "rejected", notes: "Too far from route — would delay other passengers", created_at: "2026-11-06T06:45:00" },
];

// ── Operational Alerts ──
export const operationalAlerts: OperationalAlert[] = [
  { id: "oa1", type: "expiring_license", severity: "critical", title: "Vehicle license expiring", description: "Vehicle pv4 (ث ذ ض ٧٧٨٨) license expired on Sep 15. Remove from active duty.", related_entity_type: "vehicle", related_entity_id: "pv4", created_at: "2026-09-15T00:00:00", is_read: false },
  { id: "oa2", type: "missing_document", severity: "warning", title: "Missing insurance document", description: "Driver pd3 (Amr Salah) has not uploaded national ID.", related_entity_type: "driver", related_entity_id: "pd3", created_at: "2026-10-20T00:00:00", is_read: false },
  { id: "oa3", type: "unassigned_driver", severity: "info", title: "Route without driver", description: "Route R3 (Maadi → Smart Village) has no assigned driver.", related_entity_type: "route", related_entity_id: "r3", created_at: "2026-11-01T00:00:00", is_read: true },
  { id: "oa4", type: "scheduling_conflict", severity: "warning", title: "Driver double-booked", description: "Driver d1 (Ahmed Hassan) assigned to T1 and T6 on Nov 6 — overlapping times.", related_entity_type: "driver", related_entity_id: "d1", created_at: "2026-11-06T00:00:00", is_read: false },
  { id: "oa5", type: "unresolved_issue", severity: "warning", title: "Critical issue unresolved", description: "Issue IS3 (expired insurance for pv4) has been open for 36 days.", related_entity_type: "vehicle", related_entity_id: "pv4", created_at: "2026-11-06T00:00:00", is_read: false },
  { id: "oa6", type: "overbooked", severity: "critical", title: "Trip approaching capacity", description: "Trip T6 (Vodafone Shuttle) has 25 passengers against 14-seat vehicle capacity.", related_entity_type: "trip", related_entity_id: "t6", created_at: "2026-11-06T00:00:00", is_read: false },
];
