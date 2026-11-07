import { z } from "zod";

export const createVehicleSchema = z.object({
  plate: z.string().trim().min(1, "Plate number is required"),
  type: z.enum(["minibus", "bus", "microbus", "van", "sedan"]),
  capacity: z.number().int().min(1).max(100).default(14),
}).strict();

export const updateVehicleSchema = createVehicleSchema.partial().extend({
  active: z.boolean().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
