import { z } from "zod";

const daySchema = z.enum(["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]);

const latLngSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
});

export const createRouteSchema = z.object({
  pickup_area: z.string().trim().min(1, "Pickup area is required"),
  dropoff_area: z.string().trim().min(1, "Drop-off area is required"),
  pickup_coords: latLngSchema.optional(),
  dropoff_coords: latLngSchema.optional(),
  waypoints: z.array(latLngSchema).optional(),
  departure_time: z.string().trim().min(1),
  return_time: z.string().default(""),
  days: z.array(daySchema).min(1, "Select at least one day"),
  price: z.number().int().min(0),
  capacity: z.number().int().min(1).max(100),
  driver: z.string().nullable().default(null),
}).strict();

export const updateRouteSchema = createRouteSchema.partial().extend({
  is_active: z.boolean().optional(),
});

export type CreateRouteInput = z.infer<typeof createRouteSchema>;
export type UpdateRouteInput = z.infer<typeof updateRouteSchema>;
