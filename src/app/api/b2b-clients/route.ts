import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET() {
  const { data, error } = await supabase
    .from("b2b_clients")
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
      .from("b2b_clients")
      .insert({
        company_name: body.company_name,
        contact_name: body.contact_name,
        contact_email: body.contact_email,
        contact_phone: body.contact_phone,
        address: body.address || null,
        contract_type: body.contract_type || null,
        monthly_budget: body.monthly_budget || null,
        status: body.status || "prospect",
      })
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data, 201);
  } catch {
    return fail("Internal server error", 500);
  }
}

export async function PATCH(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return fail("Missing id", 400);

    const body = await req.json().catch(() => null);
    if (!body) return fail("Invalid JSON body", 400);

    const { data, error } = await supabase
      .from("b2b_clients")
      .update(body)
      .eq("id", id)
      .select()
      .single();

    if (error) return fail(error.message, 500);
    return ok(data);
  } catch {
    return fail("Internal server error", 500);
  }
}

export async function DELETE(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return fail("Missing id", 400);

  const { error } = await supabase.from("b2b_clients").delete().eq("id", id);
  if (error) return fail(error.message, 500);
  return ok({ deleted: true });
}
