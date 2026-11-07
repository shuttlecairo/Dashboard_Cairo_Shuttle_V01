import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const category = searchParams.get("category");

  let query = supabase
    .from("accounting_entries")
    .select("*")
    .order("date", { ascending: false });

  if (from) query = query.gte("date", from);
  if (to) query = query.lte("date", to);
  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("accounting_entries")
      .insert({
        date: body.date || new Date().toISOString().split("T")[0],
        account: body.account,
        description: body.description || null,
        debit: body.debit || 0,
        credit: body.credit || 0,
        category: body.category || null,
        reference_type: body.reference_type || null,
        reference_id: body.reference_id || null,
        driver_id: body.driver_id || null,
        partner_id: body.partner_id || null,
        trip_id: body.trip_id || null,
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
