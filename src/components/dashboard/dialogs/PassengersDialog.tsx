import type { ShuttleRoute, Booking } from "@/types/entities";
import { Dialog } from "@/components/shared/dialog";
import { ICONS } from "@/components/icons";

interface PassengersDialogProps {
    routeId: string;
    routes: ShuttleRoute[];
    bookings: Booking[];
    onClose: () => void;
}

export function PassengersDialog({
    routeId,
    routes,
    bookings,
    onClose,
}: PassengersDialogProps) {
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
