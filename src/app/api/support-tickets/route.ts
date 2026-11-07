import { supabase } from "@/lib/supabase";
import { ok, fail } from "@/lib/api-response";
import { NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  const partnerId = req.nextUrl.searchParams.get("partner_id");

  let query = supabase
    .from("support_tickets")
    .select("*")
    .order("created_at", { ascending: false });

  if (partnerId) {
    query = query.eq("created_by", partnerId);
  }

  const { data, error } = await query;
  if (error) return fail(error.message, 500);
  return ok(data);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { subject, description, priority, partner_id } = body;

  if (!subject || !description) {
    return fail("Subject and description are required", 400);
  }

  const { data, error } = await supabase
    .from("support_tickets")
    .insert({
      subject,
      description,
      priority: priority || "medium",
      status: "open",
      created_by: partner_id,
    })
    .select()
    .single();

  if (error) return fail(error.message, 500);
  return ok(data);
}
