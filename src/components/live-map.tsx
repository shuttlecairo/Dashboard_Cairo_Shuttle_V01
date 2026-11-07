"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { Trip, DriverLocation } from "@/types/entities";

// Custom bus icon
function createBusIcon(status: string) {
  const color = status === "in_progress" ? "#0d7377" : status === "en_route" ? "#2980b9" : status === "at_pickup" ? "#d4a017" : "#6b6560";
  return L.divIcon({
    className: "",
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
    html: `<div style="
      width:36px;height:36px;border-radius:50%;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      color:white;font-size:14px;font-weight:bold;
    ">🚌</div>`,
  });
}

function createPointIcon(type: "origin" | "destination") {
  const color = type === "origin" ? "#27ae60" : "#c0392b";
  return L.divIcon({
    className: "",
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    html: `<div style="width:14px;height:14px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3);"></div>`,
  });
}

function FitBounds({ trips, selectedTrip }: { trips: Trip[]; selectedTrip: Trip | null }) {
  const map = useMap();

  useEffect(() => {
    if (selectedTrip) {
      const bounds = L.latLngBounds([
        [selectedTrip.origin_lat, selectedTrip.origin_lng],
        [selectedTrip.destination_lat, selectedTrip.destination_lng],
        [selectedTrip.current_lat, selectedTrip.current_lng],
      ]);
      map.fitBounds(bounds, { padding: [60, 60], maxZoom: 14 });
    } else if (trips.length > 0) {
      const allPoints = trips.flatMap((t) => [
        [t.current_lat, t.current_lng] as [number, number],
        [t.origin_lat, t.origin_lng] as [number, number],
        [t.destination_lat, t.destination_lng] as [number, number],
      ]);
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    } else {
      map.setView([30.0444, 31.2357], 11); // Cairo center
    }
  }, [map, trips, selectedTrip]);

  return null;
}

export default function LiveMap({
  trips,
  locations,
  selectedTrip,
  onSelectTrip,
}: {
  trips: Trip[];
  locations: DriverLocation[];
  selectedTrip: Trip | null;
  onSelectTrip: (t: Trip | null) => void;
}) {
  return (
    <MapContainer
      center={[30.0444, 31.2357]}
      zoom={11}
      className="w-full h-full"
      style={{ minHeight: 400, background: "#1a1a2e" }}
      zoomControl={false}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap"
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      />
      <FitBounds trips={trips} selectedTrip={selectedTrip} />

      {trips.map((trip) => {
        const isSelected = selectedTrip?.id === trip.id;
        return (
          <div key={trip.id}>
            {/* Route line */}
            <Polyline
              positions={[
                [trip.origin_lat, trip.origin_lng],
                [trip.current_lat, trip.current_lng],
                [trip.destination_lat, trip.destination_lng],
              ]}
              color={isSelected ? "#2bb5b8" : "#555"}
              weight={isSelected ? 4 : 2}
              opacity={isSelected ? 0.8 : 0.4}
              dashArray={isSelected ? undefined : "6 4"}
            />

            {/* Origin */}
            <Marker position={[trip.origin_lat, trip.origin_lng]} icon={createPointIcon("origin")}>
              <Popup>
                <strong>Origin:</strong> {trip.origin_name}
              </Popup>
            </Marker>

            {/* Destination */}
            <Marker position={[trip.destination_lat, trip.destination_lng]} icon={createPointIcon("destination")}>
              <Popup>
                <strong>Destination:</strong> {trip.destination_name}
              </Popup>
            </Marker>

            {/* Vehicle current position */}
            <Marker
              position={[trip.current_lat, trip.current_lng]}
              icon={createBusIcon(trip.status)}
              eventHandlers={{ click: () => onSelectTrip(isSelected ? null : trip) }}
            >
              <Popup>
                <div style={{ minWidth: 180, fontFamily: "system-ui" }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
                    {trip.route_name || "Trip " + trip.id}
                  </div>
                  <div style={{ fontSize: 12, color: "#666", marginBottom: 8 }}>
                    {trip.driver_name} • {trip.vehicle_plate}
                  </div>
                  <div style={{ fontSize: 12, display: "flex", flexDirection: "column", gap: 2 }}>
                    <span>📍 {trip.origin_name} → {trip.destination_name}</span>
                    <span>👥 {trip.passenger_count} passengers</span>
                    {trip.speed !== undefined && trip.speed > 0 && <span>🚗 {trip.speed} km/h</span>}
                    <span>📊 {trip.route_progress_pct}% complete</span>
                    {trip.estimated_arrival && <span>⏱ ETA {new Date(trip.estimated_arrival).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</span>}
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        );
      })}
    </MapContainer>
  );
}
