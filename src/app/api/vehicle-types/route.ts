import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("vehicle_types")
    .select("*")
    .order("name");

  if (error) return fail(error.message, 500);
  return ok(data || []);
}
