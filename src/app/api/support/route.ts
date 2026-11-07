import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");
  const priority = searchParams.get("priority");
  const category = searchParams.get("category");

  let query = supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);
  if (priority) query = query.eq("priority", priority);
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
      .from("support_tickets")
      .insert({
        subject: body.subject,
        description: body.description || null,
        category: body.category || "general",
        priority: body.priority || "medium",
        status: body.status || "open",
        reporter_id: body.reporter_id || null,
        reporter_name: body.reporter_name || null,
        reporter_role: body.reporter_role || null,
        assignee_id: body.assignee_id || null,
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
