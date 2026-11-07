import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("partner_transactions")
    .select("*")
    .eq("partner_id", id)
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}
