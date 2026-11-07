import { z } from "zod";

export const createBookingSchema = z.object({
  rider: z.string().trim().min(1, "Rider name is required"),
  phone: z.string().trim().default(""),
  seats: z.number().int().min(1).max(50).default(1),
  pickup: z.string().trim().default(""),
  route: z.string().trim().min(1),
  date: z.string().trim().min(1),
}).strict();

export const updateBookingSchema = createBookingSchema.partial().extend({
  status: z.enum(["confirmed", "completed", "cancelled", "no_show"]).optional(),
});

export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type UpdateBookingInput = z.infer<typeof updateBookingSchema>;
