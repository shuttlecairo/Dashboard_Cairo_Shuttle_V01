import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const approvalStatus = url.searchParams.get("approval_status");

  let query = supabase
    .from("drivers")
    .select("*, bus_partners(id, name, name_ar), documents(*)")
    .order("created_at", { ascending: false });

  if (approvalStatus) {
    query = query.eq("approval_status", approvalStatus);
  }

  const { data, error } = await query;
  if (error) return fail(error.message, 500);

  const mapped = (data || []).map((d: any) => ({
    ...d,
    partner_name: d.bus_partners?.name || null,
  }));

  return ok(mapped);
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    console.log("heree");
    
    const { data, error } = await supabase
      .from("drivers")
      .insert({
        partner_id: body.partner_id,
        name: body.full_name || body.name,
        phone: body.phone || null,
        email: body.email || null,
        license_number: body.license_number || null,
        license_expiry: body.license_expiry || null,
        national_id: body.national_id || null,
        photo_url: body.photo_url || null,
        speaks_english: body.speaks_english ?? false,
        english_level: body.english_level || null,
        date_of_birth: body.date_of_birth || null,
        address: body.address || null,
        city: body.city || null,
        emergency_contact: body.emergency_contact || null,
        emergency_phone: body.emergency_phone || null,
        approval_status: "pending",
        is_active: true,
      })
      .select("*, bus_partners(id, name, name_ar)")
      .single();
        console.log(error);

    if (error) return fail(error.message, 500);
        console.log(error);

    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}
