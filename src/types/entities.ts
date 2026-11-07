export type DayOfWeek = "Sun" | "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat";

export interface LatLng {
  lat: number;
  lng: number;
}

// ── Route Stop (multi-stop support) ──
export interface RouteStop {
  id: string;
  name: string;
  address: string;
  coords: LatLng;
  order: number;
  scheduled_time?: string;
  type: "pickup" | "dropoff" | "both";
}

export interface ShuttleRoute {
  id: string;
  name: string;
  pickup_area: string;
  dropoff_area: string;
  pickup_coords: LatLng;
  dropoff_coords: LatLng;
  waypoints?: LatLng[];
  departure_time: string;
  return_time: string;
  days: DayOfWeek[];
  price: number;
  capacity: number;
  is_active: boolean;
  driver: string | null;
  driver_phone: string | null;
  // Multi-stop extensions
  stops?: RouteStop[];
  partner_id?: string;
  multiple_departures?: string[];
  schedules_by_day?: Record<string, string[]>;
}

export interface Booking {
  id: string;
  rider: string;
  phone: string;
  seats: number;
  pickup: string;
  status: "confirmed" | "completed" | "cancelled" | "no_show";
  route: string;
  date: string;
  fare?: number;
  payment_method?: "cash" | "paymob" | "wallet" | "corporate";
  payment_status?: "pending" | "paid" | "refunded";
  trip_id?: string;
  // Stop-level booking
  pickup_stop_id?: string;
  dropoff_stop_id?: string;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  vehicle_id?: string;
}

export interface Vehicle {
  id: string;
  plate: string;
  type: "minibus" | "bus" | "microbus" | "van" | "sedan";
  make?: string;
  model?: string;
  year?: number;
  capacity: number;
  color?: string;
  active: boolean;
  assigned_driver_id?: string;
}

export type RequestStatus = "pending" | "quoted" | "accepted" | "rejected" | "cancelled" | "completed";

export interface B2BClient {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  is_active: boolean;
}

export interface B2BRequest {
  id: string;
  client_id?: string;
  client_name?: string;
  pickup: string;
  dropoff: string;
  schedule: string;
  count: number;
  status: RequestStatus;
  quote: number | null;
  notes: string;
  start_date?: string;
  end_date?: string;
}

export interface EventRequest {
  id: string;
  client_name?: string;
  pickup: string;
  dropoff: string;
  schedule: string;
  count: number;
  status: RequestStatus;
  quote: number | null;
  notes: string;
  event_date?: string;
}

export interface HotelRequest {
  id: string;
  hotel_name?: string;
  pickup: string;
  dropoff: string;
  schedule: string;
  count: number;
  status: RequestStatus;
  quote: number | null;
  notes: string;
}

export type TripStatus = "scheduled" | "en_route" | "at_pickup" | "in_progress" | "completed" | "cancelled" | "delayed";

export interface Trip {
  id: string;
  route_id?: string;
  route_name?: string;
  driver_id?: string;
  driver_name?: string;
  vehicle_id?: string;
  vehicle_plate?: string;
  status: TripStatus;
  scheduled_departure: string;
  actual_departure?: string;
  actual_arrival?: string;
  estimated_arrival?: string;
  passenger_count: number;
  origin_name: string;
  origin_lat: number;
  origin_lng: number;
  destination_name: string;
  destination_lat: number;
  destination_lng: number;
  current_lat: number;
  current_lng: number;
  heading?: number;
  speed?: number;
  route_progress_pct: number;
  b2b_request_id?: string;
  b2b_client_name?: string;
}

export interface DriverLocation {
  driver_id: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  recorded_at: string;
  trip_id?: string;
}

export type AccountCategory =
  | "fare_revenue" | "b2b_revenue" | "event_revenue" | "hotel_revenue"
  | "driver_payment" | "fuel" | "maintenance" | "insurance" | "salary" | "office"
  | "paymob_settlement" | "cash_deposit" | "wallet_topup" | "refund"
  | "other_income" | "other_expense";

export type AccountName =
  | "cash" | "bank" | "paymob" | "rider_wallets" | "accounts_receivable"
  | "prepaid_fares" | "revenue" | "driver_payable" | "expenses" | "equity";

export interface AccountingEntry {
  id: string;
  entry_date: string;
  description: string;
  category: AccountCategory;
  debit: number;
  credit: number;
  account: AccountName;
  reference_type?: string;
  reference_id?: string;
  driver_id?: string;
  is_posted: boolean;
  created_at: string;
}

export interface PaymobSettlement {
  id: string;
  settlement_date: string;
  amount: number;
  reference?: string;
  status: "pending" | "confirmed" | "disputed";
}

export type Role = "admin" | "b2b" | "partner" | "driver";

export interface RoleConfig {
  label: string;
  items: { key: string; icon: string; label: string }[];
}

// ── Bus Partner ──
export type VerificationStatus = "draft" | "submitted" | "under_review" | "approved" | "rejected" | "expired";

export interface VehicleDocument {
  id: string;
  type: "registration" | "insurance" | "license" | "photo_front" | "photo_rear" | "photo_side" | "photo_interior";
  name: string;
  url?: string;
  uploaded_at: string;
  status: VerificationStatus;
  notes?: string;
}

export interface DriverDocument {
  id: string;
  type: "driving_license" | "national_id" | "criminal_record" | "photo";
  name: string;
  url?: string;
  uploaded_at: string;
  status: VerificationStatus;
  notes?: string;
}

export interface BusPartner {
  id: string;
  name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  address?: string;
  is_active: boolean;
  verification_status: VerificationStatus;
  created_at: string;
  commission_rate: number;
  total_vehicles: number;
  total_drivers: number;
}

export interface PartnerVehicle extends Vehicle {
  partner_id: string;
  verification_status: VerificationStatus;
  documents: VehicleDocument[];
  insurance_expiry?: string;
  license_expiry?: string;
}

export interface PartnerDriver extends Driver {
  partner_id: string;
  verification_status: VerificationStatus;
  documents: DriverDocument[];
  license_number?: string;
  license_expiry?: string;
  employment_type?: "full_time" | "part_time" | "contract";
  national_id?: string;
}

// ── Support & Disputes ──
export type TicketCategory = "payments" | "bookings" | "complaints" | "drivers" | "vehicles" | "trips" | "documents" | "contracts" | "general";
export type TicketPriority = "low" | "medium" | "high" | "urgent";
export type TicketStatus = "open" | "in_progress" | "waiting" | "resolved" | "closed";

export interface TicketMessage {
  id: string;
  sender: string;
  sender_role: "admin" | "partner" | "b2b" | "system";
  message: string;
  created_at: string;
}

export interface SupportTicket {
  id: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  created_by: string;
  created_by_role: "partner" | "b2b" | "admin";
  partner_id?: string;
  b2b_client_id?: string;
  related_trip_id?: string;
  related_booking_id?: string;
  related_driver_id?: string;
  related_vehicle_id?: string;
  messages: TicketMessage[];
  created_at: string;
  updated_at: string;
  assigned_to?: string;
}

export type DisputeStatus = "submitted" | "under_review" | "info_requested" | "resolved" | "rejected" | "escalated";

export interface DisputeEvidence {
  id: string;
  type: "document" | "screenshot" | "receipt" | "note";
  description: string;
  submitted_by: string;
  submitted_at: string;
}

export interface Dispute {
  id: string;
  ticket_id?: string;
  title: string;
  description: string;
  status: DisputeStatus;
  type: "financial" | "operational" | "service";
  amount?: number;
  partner_id?: string;
  partner_name?: string;
  b2b_client_id?: string;
  evidence: DisputeEvidence[];
  resolution?: string;
  resolution_date?: string;
  created_at: string;
  updated_at: string;
}

// ── Driver & Vehicle Issues ──
export type IssueType = "absence" | "delay" | "misconduct" | "complaint" | "performance" | "breakdown" | "repair" | "maintenance" | "cleanliness" | "expired_docs";
export type IssuePriority = "low" | "medium" | "high" | "critical";
export type IssueStatus = "open" | "in_progress" | "resolved" | "closed";

export interface Issue {
  id: string;
  type: IssueType;
  category: "driver" | "vehicle";
  priority: IssuePriority;
  status: IssueStatus;
  title: string;
  description: string;
  partner_id: string;
  related_driver_id?: string;
  related_vehicle_id?: string;
  related_trip_id?: string;
  reported_by: string;
  created_at: string;
  updated_at: string;
  resolution?: string;
}

// ── Partner Transactions ──
export type TransactionType = "trip_revenue" | "commission" | "payout" | "refund" | "bonus" | "fuel" | "maintenance" | "expense";

export interface PartnerTransaction {
  id: string;
  partner_id: string;
  type: TransactionType;
  amount: number;
  description: string;
  date: string;
  related_trip_id?: string;
  related_driver_id?: string;
  related_vehicle_id?: string;
  status: "completed" | "pending" | "failed";
}

// ── Passenger Requests ──
export interface PassengerRequest {
  id: string;
  booking_id?: string;
  trip_id?: string;
  passenger_name: string;
  passenger_phone: string;
  request_type: "pickup_change" | "dropoff_change" | "special_location";
  requested_location: string;
  requested_coords?: LatLng;
  status: "pending" | "approved" | "rejected";
  notes?: string;
  created_at: string;
}

// ── Operational Alerts ──
export type AlertType = "expiring_license" | "missing_document" | "unassigned_driver" | "scheduling_conflict" | "overbooked" | "unresolved_issue";

export interface OperationalAlert {
  id: string;
  type: AlertType;
  severity: "info" | "warning" | "critical";
  title: string;
  description: string;
  related_entity_type?: "driver" | "vehicle" | "trip" | "route" | "partner";
  related_entity_id?: string;
  created_at: string;
  is_read: boolean;
}
