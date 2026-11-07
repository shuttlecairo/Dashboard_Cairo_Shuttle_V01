import { z } from "zod";

export const createRequestSchema = z.object({
  pickup: z.string().trim().min(1, "Pickup is required"),
  dropoff: z.string().trim().min(1, "Destination is required"),
  schedule: z.string().trim().default(""),
  count: z.number().int().min(1).default(20),
  notes: z.string().trim().default(""),
}).strict();

export const updateRequestSchema = z.object({
  status: z.enum(["pending", "quoted", "accepted", "rejected", "cancelled"]).optional(),
  quote: z.number().nullable().optional(),
  notes: z.string().trim().optional(),
}).strict();

export type CreateRequestInput = z.infer<typeof createRequestSchema>;
export type UpdateRequestInput = z.infer<typeof updateRequestSchema>;
