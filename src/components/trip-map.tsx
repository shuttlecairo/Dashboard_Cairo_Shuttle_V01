"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import type { LatLng } from "@/types/entities";

interface TripMapProps {
  pickup: LatLng;
  dropoff: LatLng;
  waypoints?: LatLng[];
  routeName: string;
  onClose?: () => void;
}

// We dynamically import leaflet inside useEffect to avoid SSR issues
export function TripMap({
  pickup,
  dropoff,
  waypoints = [],
  routeName,
  onClose,
}: TripMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);
  const [progress, setProgress] = useState(0);
  const [eta, setEta] = useState("");
  const [speed] = useState(45); // km/h average Cairo traffic
  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  // Build full path: pickup -> waypoints -> dropoff
  const fullPath = [pickup, ...waypoints, dropoff];

  // Calculate total distance in km (haversine)
  const calcDistance = useCallback((a: LatLng, b: LatLng) => {
    const R = 6371;
    const dLat = ((b.lat - a.lat) * Math.PI) / 180;
    const dLng = ((b.lng - a.lng) * Math.PI) / 180;
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((a.lat * Math.PI) / 180) *
        Math.cos((b.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x));
  }, []);

  const totalDistance = fullPath.reduce((sum, p, i) => {
    if (i === 0) return 0;
    return sum + calcDistance(fullPath[i - 1], p);
  }, 0);

  // Interpolate position along path by fraction [0,1]
  const interpolate = useCallback(
    (t: number): LatLng => {
      if (t <= 0) return fullPath[0];
      if (t >= 1) return fullPath[fullPath.length - 1];

      // Find which segment we're on
      const segDistances: number[] = [];
      for (let i = 1; i < fullPath.length; i++) {
        segDistances.push(calcDistance(fullPath[i - 1], fullPath[i]));
      }
      const total = segDistances.reduce((a, b) => a + b, 0);
      let target = t * total;

      for (let i = 0; i < segDistances.length; i++) {
        if (target <= segDistances[i]) {
          const segT = target / segDistances[i];
          return {
            lat: fullPath[i].lat + (fullPath[i + 1].lat - fullPath[i].lat) * segT,
            lng: fullPath[i].lng + (fullPath[i + 1].lng - fullPath[i].lng) * segT,
          };
        }
        target -= segDistances[i];
      }
      return fullPath[fullPath.length - 1];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [fullPath, calcDistance]
  );

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Dynamically import leaflet
    import("leaflet").then((L) => {
      // Fix default marker icons
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const map = L.map(mapRef.current!, {
        zoomControl: true,
        attributionControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 18,
      }).addTo(map);

      // Draw route polyline
      const pathCoords = fullPath.map((p) => [p.lat, p.lng] as [number, number]);

      // Route shadow
      L.polyline(pathCoords, {
        color: "#000",
        weight: 7,
        opacity: 0.15,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Main route line
      L.polyline(pathCoords, {
        color: "#4361ee",
        weight: 4,
        opacity: 0.9,
        lineCap: "round",
        lineJoin: "round",
        dashArray: "12, 8",
      }).addTo(map);

      // Completed route (will update)
      const completedLine = L.polyline([], {
        color: "#06d6a0",
        weight: 5,
        opacity: 1,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      // Pickup marker (green)
      const pickupIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:#06d6a0;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,.3);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:16px;font-weight:bold;
        ">A</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([pickup.lat, pickup.lng], { icon: pickupIcon })
        .addTo(map)
        .bindPopup(
          `<strong style="font-size:13px;">Pickup</strong><br/><span style="font-size:12px;color:#666;">Starting point</span>`
        );

      // Dropoff marker (red)
      const dropoffIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:36px;height:36px;border-radius:50%;
          background:#ef476f;border:3px solid #fff;
          box-shadow:0 2px 8px rgba(0,0,0,.3);
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-size:16px;font-weight:bold;
        ">B</div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      L.marker([dropoff.lat, dropoff.lng], { icon: dropoffIcon })
        .addTo(map)
        .bindPopup(
          `<strong style="font-size:13px;">Destination</strong><br/><span style="font-size:12px;color:#666;">Drop-off point</span>`
        );

      // Driver marker (moving car)
      const driverIcon = L.divIcon({
        className: "",
        html: `<div style="
          width:44px;height:44px;border-radius:50%;
          background:#4361ee;border:3px solid #fff;
          box-shadow:0 3px 12px rgba(67,97,238,.5);
          display:flex;align-items:center;justify-content:center;
          font-size:22px;
          transition:transform .3s;
        ">🚐</div>`,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });
      const driverMarker = L.marker([pickup.lat, pickup.lng], {
        icon: driverIcon,
        zIndexOffset: 1000,
      }).addTo(map);
      driverMarkerRef.current = driverMarker;

      // Fit bounds
      const bounds = L.latLngBounds(pathCoords);
      map.fitBounds(bounds, { padding: [50, 50] });

      mapInstanceRef.current = map;

      // Animate driver
      const tripDuration = 60000; // 60 seconds for the full animation
      startTimeRef.current = Date.now();

      function animate() {
        const elapsed = Date.now() - startTimeRef.current;
        const t = Math.min(elapsed / tripDuration, 1);
        setProgress(Math.round(t * 100));

        const pos = interpolate(t);
        driverMarker.setLatLng([pos.lat, pos.lng]);

        // Update completed route line
        const completedIdx = Math.floor(t * (pathCoords.length - 1));
        const completedCoords = pathCoords.slice(0, completedIdx + 1);
        completedCoords.push([pos.lat, pos.lng]);
        completedLine.setLatLngs(completedCoords);

        // ETA
        const remaining = totalDistance * (1 - t);
        const etaMin = Math.round((remaining / speed) * 60);
        setEta(etaMin > 0 ? `${etaMin} min` : "Arriving");

        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(animate);
        } else {
          setEta("Arrived!");
        }
      }
      animFrameRef.current = requestAnimationFrame(animate);
    });

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      className="rounded-[14px] overflow-hidden mb-5"
      style={{
        border: "1px solid var(--border)",
        boxShadow: "var(--shadow)",
        background: "var(--bg-card)",
      }}
    >
      {/* Top bar */}
      <div
        className="flex justify-between items-center p-3.5 px-5"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-3 h-3 rounded-full"
            style={{
              background: progress < 100 ? "var(--success)" : "var(--brand)",
              animation: progress < 100 ? "pulse-dot 1.5s infinite" : "none",
            }}
          />
          <div>
            <strong className="text-[.9rem]">
              {progress < 100 ? "Trip In Progress" : "Trip Complete"}
            </strong>
            <span
              className="text-[.8rem] ml-2"
              style={{ color: "var(--fg-muted)" }}
            >
              {routeName}
            </span>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="px-3 py-1 rounded-lg border-none text-[.78rem] font-semibold cursor-pointer text-white"
            style={{ background: "var(--danger)" }}
          >
            ⏹ End Trip
          </button>
        )}
      </div>

      {/* Map */}
      <div ref={mapRef} style={{ height: 380, width: "100%" }} />

      {/* Bottom info bar */}
      <div
        className="flex items-center justify-between p-3.5 px-5 flex-wrap gap-3"
        style={{ borderTop: "1px solid var(--border)" }}
      >
        {/* Progress bar */}
        <div className="flex items-center gap-3 flex-1 min-w-[200px]">
          <div
            className="flex-1 h-2 rounded-full overflow-hidden"
            style={{ background: "var(--border)" }}
          >
            <div
              className="h-full rounded-full transition-all"
              style={{
                width: `${progress}%`,
                background:
                  progress < 100
                    ? "linear-gradient(90deg, var(--brand), var(--success))"
                    : "var(--success)",
              }}
            />
          </div>
          <span className="text-[.82rem] font-semibold" style={{ minWidth: 40 }}>
            {progress}%
          </span>
        </div>

        {/* Stats */}
        <div className="flex gap-5">
          <div className="text-center">
            <div
              className="text-[.68rem] uppercase tracking-wider"
              style={{ color: "var(--fg-muted)" }}
            >
              Distance
            </div>
            <div className="text-[.9rem] font-bold">{totalDistance.toFixed(1)} km</div>
          </div>
          <div className="text-center">
            <div
              className="text-[.68rem] uppercase tracking-wider"
              style={{ color: "var(--fg-muted)" }}
            >
              ETA
            </div>
            <div
              className="text-[.9rem] font-bold"
              style={{
                color: progress < 100 ? "var(--brand)" : "var(--success)",
              }}
            >
              {eta}
            </div>
          </div>
          <div className="text-center">
            <div
              className="text-[.68rem] uppercase tracking-wider"
              style={{ color: "var(--fg-muted)" }}
            >
              Speed
            </div>
            <div className="text-[.9rem] font-bold">{speed} km/h</div>
          </div>
        </div>
      </div>
    </div>
  );
}
