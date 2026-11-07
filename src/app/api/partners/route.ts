import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("bus_partners")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) return fail(error.message, 500);
  return ok(data || []);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("bus_partners")
      .insert({
        name: body.name,
        name_ar: body.name_ar || null,
        contact_name: body.contact_name || null,
        contact_phone: body.contact_phone || null,
        contact_email: body.contact_email || null,
        address: body.address || null,
        city: body.city || null,
        status: body.status || "active",
        notes: body.notes || null,
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
