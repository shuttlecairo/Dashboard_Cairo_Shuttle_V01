// import { supabase } from "@/lib/supabase";
// import { ok, fail } from "@/lib/api-response";
// import { NextRequest } from "next/server";

// export async function GET(
//   _req: NextRequest,
//   { params }: { params: Promise<{ id: string }> }
// ) {
//   const { id } = await params;
//   const { data, error } = await supabase
//     .from("support_tickets")
//     .select("*")
//     .eq("partner_id", id)
//     .eq("ticket_type", "issue")
//     .order("created_at", { ascending: false });

//   if (error) {
//     // If ticket_type column doesn't exist, fall back to fetching all partner tickets
//     const fallback = await supabase
//       .from("support_tickets")
//       .select("*")
//       .or(`created_by.eq.${id},description.ilike.%issue%`)
//       .order("created_at", { ascending: false });

//     if (fallback.error) return fail(fallback.error.message, 500);
//     return ok(fallback.data);
//   }
//   return ok(data);
// }
import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { data, error } = await supabase
    .from("support_tickets")
    .select("*")
    .eq("partner_id", id)
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data);
}